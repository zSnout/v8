import { createEventListener } from "@/components/create-event-listener"
import { error } from "@/components/result"
import { Error } from "@/learn/el/Error"
import { Layers, useLayers } from "@/learn/el/Layers"
import { createLoadingBase } from "@/learn/el/Loading"
import { createSignal, JSX, onMount, Show } from "solid-js"
import { Worker } from "./db"
import { Toasts } from "./el/Toast"
import { ShortcutManager } from "./lib/shortcuts"
import { Home } from "./views/Home"

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

function UndoManager(worker: Worker) {
  // TODO: make undos work again
  // const undoFn = async () => {
  //   const undoData = db.undo()
  //   if (!undoData) {
  //     toasts.create({ body: "Nothing to undo." })
  //     return
  //   }

  //   const { last, done } = undoData
  //   const detail = { redo: last.redo, reason: last.reason }
  //   dispatchEvent(new CustomEvent("z-db-beforeundo", { detail }))
  //   await done
  //   toasts.create({
  //     body: `${last.redo ? "Redoed" : "Undid"} "${last.reason}"`,
  //   })
  //   dispatchEvent(new CustomEvent("z-db-undo", { detail }))
  // }

  // const toasts = useToasts()
  const layers = useLayers()
  const shortcuts = new ShortcutManager()
  // TODO: no pop when modal is active
  shortcuts.scoped(
    { key: "Escape" },
    () => {
      let dialog
      if (
        (document.activeElement instanceof HTMLElement ||
          document.activeElement instanceof SVGElement) &&
        document.activeElement != document.body
      ) {
        document.activeElement.blur()
      } else if (
        (dialog = document.querySelector<HTMLDialogElement>("dialog[open]"))
      ) {
        dialog.dispatchEvent(new Event("cancel"))
      } else if (document.activeElement == document.body) {
        layers.popLatest()
      }
    },
    true,
  )
  // manager.scoped({ key: "Z" }, undoFn)
  // manager.scoped({ key: "Z", mod: "macctrl" }, undoFn)

  // TODO: remove this once <Stats /> is done
  // if (import.meta.env.DEV) {
  // return Stats(worker, () => {})
  // } else {
  return Home(worker)
  // }
}

const InsideErrorHandler = createLoadingBase<void, Worker>(
  async () => {
    const worker = new Worker()
    await worker.post("ready")
    return worker
  },
  (_, worker) => {
    return <Toasts.Root>{Layers.Root(UndoManager, worker)}</Toasts.Root>
  },
  "Opening database...",
)

export function Main() {
  onMount(() => {
    document.getElementById("needsjavascript")?.remove()
  })

  return <ErrorHandler>{InsideErrorHandler().el}</ErrorHandler>
}
