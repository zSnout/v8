import { createEventListener } from "@/components/create-event-listener"
import { error } from "@/components/result"
import { DB, open } from "@/learn/db"
import { Error } from "@/learn/el/Error"
import { Layers } from "@/learn/el/Layers"
import { createLoadingBase } from "@/learn/el/Loading"
import { Home } from "@/learn/views/Home"
import { createSignal, JSX, onMount, Show } from "solid-js"
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

function UndoManager(db: DB) {
  const toasts = useToasts()
  new ShortcutManager().scoped({ key: "Z" }, undo)
  new ShortcutManager().scoped({ key: "Z", mod: "macctrl" }, undo)

  return Home(db)

  function undo() {
    const last = db.undo()
    if (!last) {
      toasts.create({ body: "Nothing to undo." })
    } else if (last.redo) {
      toasts.create({ body: `Redid "${last.reason}"` })
    } else {
      toasts.create({ body: `Undid "${last.reason}"` })
    }
  }
}

const InsideErrorHandler = createLoadingBase<void, DB>(
  () => open("learn:Main", Date.now()),
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
