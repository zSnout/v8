import { Fa } from "@/components/Fa"
import { notNull } from "@/components/pray"
import { faClose } from "@fortawesome/free-solid-svg-icons"
import {
  createContext,
  createSignal,
  For,
  getOwner,
  runWithOwner,
  Show,
  untrack,
  useContext,
  type JSX,
  type Owner,
} from "solid-js"
import { Portal } from "solid-js/web"

const ToastContext = createContext<Toasts>()

export class Toasts {
  static Root(props: { children: JSX.Element }) {
    const toasts = new Toasts(getOwner())

    return (
      <ToastContext.Provider value={toasts}>
        <Portal>
          <div class="pointer-events-none fixed bottom-0 left-0 right-0 max-h-screen">
            <div class="mx-2 my-2 flex flex-col">
              <For each={toasts.toasts()}>{(el) => el}</For>
            </div>
          </div>
        </Portal>

        {props.children}
      </ToastContext.Provider>
    )
  }

  private toasts
  private setToasts

  constructor(private owner: Owner | null) {
    ;[this.toasts, this.setToasts] = createSignal<JSX.Element[]>([])
  }

  private of(Fn: (closeNow: () => void, hiding: () => boolean) => JSX.Element) {
    const [shown, setShown] = createSignal(true)
    const [hiding, setHiding] = createSignal(true)

    function closeNow() {
      setShown(false)
    }

    function hide() {
      setHiding(true)
      setTimeout(() => setShown(false), 150)
    }

    this.setToasts((toasts) =>
      toasts.concat(
        runWithOwner(this.owner, () => (
          <Show when={shown()}>{untrack(() => Fn(closeNow, hiding))}</Show>
        )),
      ),
    )

    setTimeout(hide, 6000)
    setTimeout(() => setHiding(false), 10)

    return closeNow
  }

  create(props: { title?: string; readonly body: JSX.Element }) {
    return this.of((closeNow, hiding) => (
      <div
        class="pointer-events-auto w-64 max-w-full transform transition-[opacity,transform,max-height,margin]"
        classList={{
          "opacity-0": hiding(),
          "translate-y-2": hiding(),
          "scale-95": hiding(),
          "max-h-0": hiding(),
          "max-h-20": !hiding(),
        }}
      >
        <div class="h-1" />
        <div class="flex w-full gap-1 rounded-lg border border-z bg-z-body py-2 pl-3 pr-2 text-z shadow-lg">
          <div class="flex flex-1 flex-col">
            <p>{props.body}</p>
          </div>
          <button
            class="-mr-1 -mt-1 h-full rounded p-1 transition hover:bg-z-body-selected [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:[:hover>&]:opacity-100"
            onClick={closeNow}
          >
            <Fa class="size-4" icon={faClose} title="close" />
          </button>
        </div>
      </div>
    ))
  }
}

export function useToasts() {
  return notNull(useContext(ToastContext), "Only callable in a `ToastContext`.")
}
