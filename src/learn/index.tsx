import { createEventListener } from "@/components/create-event-listener"
import { error } from "@/components/result"
import { DB, open } from "@/learn/db"
import { Error } from "@/learn/el/Error"
import { Layers } from "@/learn/el/Layers"
import { createLoadingBase } from "@/learn/el/Loading"
import { Home } from "@/learn/views/Home"
import { createSignal, JSX, onMount, Show } from "solid-js"
import { SQL } from "./db/sqlite"
import { Toasts, useToasts } from "./el/Toast"
import { ShortcutManager } from "./lib/shortcuts"

function ErrorHandler(props: { children: JSX.Element }) {
  const [reason, setError] = createSignal<unknown>()

  createEventListener(window, "unhandledrejection", (event) => {
    setError(event.reason)
  })

  createEventListener(window, "error", (event) => {
    setError(event.error)
  })

  return (
    <>
      {props.children}

      <Show when={reason() != null}>
        <Error message={error(reason()).reason} onClose={() => setError()} />
      </Show>
    </>
  )
}

function UndoManager([db, sql]: [DB, SQL]) {
  const undoFn = async () => {
    const undoData = db.undo()
    if (!undoData) {
      toasts.create({ body: "Nothing to undo." })
      return
    }

    const { last, done } = undoData
    const detail = { redo: last.redo, reason: last.reason }
    dispatchEvent(new CustomEvent("z-db-beforeundo", { detail }))
    await done
    toasts.create({
      body: `${last.redo ? "Redoed" : "Undid"} "${last.reason}"`,
    })
    dispatchEvent(new CustomEvent("z-db-undo", { detail }))
  }

  const toasts = useToasts()
  const manager = new ShortcutManager()
  manager.scoped({ key: "Z" }, undoFn)
  manager.scoped({ key: "Z", mod: "macctrl" }, undoFn)

  return Home([db, sql])
}

const InsideErrorHandler = createLoadingBase(
  (_: void) => {
    const sql = new SQL()
    return Promise.all([
      open("learn:Main", Date.now()),
      sql.post("ready").then(() => sql),
    ] as const)
  },
  (_, db) => {
    return <Toasts.Root>{Layers.Root(UndoManager, db)}</Toasts.Root>
  },
  "Opening database...",
)

export function Main() {
  onMount(() => {
    document.getElementById("needsjavascript")?.remove()
  })

  return <ErrorHandler>{InsideErrorHandler().el}</ErrorHandler>
}
