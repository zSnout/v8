import { createEventListener } from "@/components/create-event-listener"
import { MatchResult } from "@/components/MatchResult"
import { error, type Result } from "@/components/result"
import { Error } from "@/learn/el/Error"
import { Layers, useLayers } from "@/learn/el/Layers"
import { createLoadingBase } from "@/learn/el/Loading"
import { createSignal, JSX, onMount, Show } from "solid-js"
import { Worker } from "./db"
import type { Reason } from "./db/reason"
import { Toasts, useToasts } from "./el/Toast"
import { ROOT_LAYER_HOME } from "./layers/Home"
import { ShortcutManager } from "./lib/shortcuts"
import type { UndoType } from "./shared"

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

  const toasts = useToasts()
  const layers = useLayers()
  const shortcuts = new ShortcutManager()

  shortcuts.scoped({ key: "Escape" }, escapeFn, true)

  shortcuts.scoped({ key: "Z", shift: false }, undoFn("undo"))
  shortcuts.scoped({ key: "Z", mod: "macctrl", shift: false }, undoFn("undo"))
  shortcuts.scoped({ key: "Z", shift: true }, undoFn("redo"))
  shortcuts.scoped({ key: "Z", mod: "macctrl", shift: true }, undoFn("redo"))
  shortcuts.scoped({ key: "Y" }, undoFn("redo"))
  shortcuts.scoped({ key: "Y", mod: "macctrl" }, undoFn("redo"))

  return ROOT_LAYER_HOME(worker)

  function escapeFn() {
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
  }

  function undoFn(type: UndoType) {
    return async () => {
      const [state, setState] = createSignal<Result<Reason | null>>()
      toasts.create({
        get body() {
          return (
            <Show when={state()} fallback={`Attempting to ${type}...`}>
              {(x) => (
                <MatchResult
                  result={x()}
                  fallback={() => "Nothing left to " + type}
                >
                  {(x) =>
                    `${type == "undo" ? "Undid" : "Redid"} '${x() ?? "<unknown action>"}'`
                  }
                </MatchResult>
              )}
            </Show>
          )
        },
      })
      setState(await worker.post("undo", type))
    }
  }
}

const InsideErrorHandler = createLoadingBase<void, Worker>(
  () => new Worker().ready,
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
