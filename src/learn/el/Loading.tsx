import { Fa } from "@/components/Fa"
import {
  faRightFromBracket,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { createResource, createSignal, JSX, Setter, Show } from "solid-js"
import { Action } from "./BottomButtons"
import { ForcePopHandler, Layerable, LayerOutput } from "./Layers"

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

export function createLoading<T, U>(
  load: (props: T, setMessage: Setter<string>) => Promise<U>,
  render: (props: T, data: NonNullable<U>, pop: () => void) => LayerOutput,
  initialMessage = "Loading...",
): Layerable<T> {
  return (props, pop) => {
    const [message, setMessage] = createSignal(initialMessage)
    const [data] = createResource(() => load(props, setMessage))
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
            ;({ el, onForcePop } = render(props, data, pop))
            return el
          }}
        </Show>
      ),
      onForcePop: () => (onForcePop ? onForcePop() : true),
    }
  }
}

export function createLoadingBase<T, U>(
  load: (props: T, setMessage: Setter<string>) => Promise<U>,
  render: (props: T, data: NonNullable<U>) => JSX.Element,
  initialMessage = "Loading...",
): (props: T) => JSX.Element {
  return (props) => {
    const [message, setMessage] = createSignal(initialMessage)
    const [data] = createResource(() => load(props, setMessage))

    return (
      <Show
        when={data()}
        keyed
        fallback={<Loading message={message()} pop={undefined} />}
      >
        {(data) => render(props, data)}
      </Show>
    )
  }
}
