import { Fa } from "@/components/Fa"
import {
  faRightFromBracket,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import {
  createResource,
  createSignal,
  JSX,
  Setter,
  Show,
  untrack,
} from "solid-js"
import { Action } from "./BottomButtons"
import {
  ForcePopHandler,
  Layerable,
  LayerOutput,
  RootLayerable,
} from "./Layers"

function Loading(props: { message: string; pop: (() => void) | undefined }) {
  return (
    <div class="flex min-h-full w-full flex-1 flex-col items-center justify-center gap-8">
      <Fa
        class="size-12 animate-[faspinner_1s_linear_infinite]"
        icon={faSpinner}
        title={false}
      />

      <p class="text-center text-xl text-z transition">{props.message}</p>

      <p class="-mt-4 w-full max-w-96 text-balance text-center text-sm text-z-subtitle">
        This page needs some external data in order to work. Please wait a
        moment for the page to load.
        <Show when={props.pop}>
          {" "}
          You may also press "Cancel" to go back to the previous page.
        </Show>
      </p>

      <Show when={props.pop}>
        <div class="mx-auto w-full max-w-72">
          <Action
            icon={faRightFromBracket}
            label="Cancel"
            center
            onClick={props.pop}
          />
        </div>
      </Show>
    </div>
  )
}

export function createLoading<T, U extends {}, S>(
  load: (props: T, setMessage: Setter<string>, state: Partial<S>) => Promise<U>,
  render: (
    props: T,
    data: U,
    pop: () => void,
    state: Partial<S>,
  ) => LoadingLayerOutput,
  initialMessage = "Loading...",
  reload?: (
    props: T,
    lastData: U,
    setMessage: Setter<string>,
    state: Partial<S>,
  ) => Promise<U>,
): Layerable<T> {
  return (props, pop) => {
    const state: Partial<S> = Object.create(null)
    const [message, setMessage] = createSignal(initialMessage)
    const [data, { refetch, mutate }] = createResource(() =>
      load(props, setMessage, state),
    )
    let onForcePop: ForcePopHandler | undefined

    return {
      el: (
        <Show
          when={data()}
          keyed
          fallback={<Loading message={message()} pop={pop} />}
        >
          {(data) => {
            let el
            ;({ el, onForcePop } = render(props, data, pop, state))
            return el
          }}
        </Show>
      ),
      onForcePop() {
        if (onForcePop) {
          return onForcePop()
        } else {
          return true
        }
      },
      async onReturn() {
        const d = untrack(data)

        mutate()
        setMessage(initialMessage)
        if (d != null && reload) {
          const next = await reload(props, d, setMessage, state)
          mutate(() => next)
        } else {
          refetch()
        }
      },
    }
  }
}

type LoadingLayerExtend = Omit<LayerOutput, "onReturn">
export interface LoadingLayerOutput extends LoadingLayerExtend {
  onReturn?: undefined
}

export function createLoadingBase<T, U extends {}>(
  load: (props: T, setMessage: Setter<string>) => Promise<U>,
  render: (props: T, data: U) => JSX.Element,
  initialMessage = "Loading...",
  reload?: (props: T, data: U, setMessage: Setter<string>) => Promise<U>,
): RootLayerable<T> {
  const layerable = createLoading(
    load,
    (props, data) => ({
      el: render(props, data),
      onForcePop: () => true,
    }),
    initialMessage,
    reload,
  )

  return (props) => layerable(props, () => {})
}
