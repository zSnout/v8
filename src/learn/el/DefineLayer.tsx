import {
  createResource,
  createSignal,
  getOwner,
  Show,
  untrack,
  type JSX,
  type Owner,
} from "solid-js"
import { useLayers, type Awaitable, type Layerable } from "./Layers"
import { Loading } from "./Loading"

/** Data passed to the `load()` function on a layer. */
export interface LayerLoadInfo<Props, State> {
  /** The props passed to this layer. */
  props: Props

  /** The state created by `init`. Not reactive. */
  state: State

  /** Whether this is reloading. */
  readonly reloading: boolean

  /** Sets the message shown in the loading screen. */
  setMessage(message: string): void

  /** Pops the current layer. If `force` is called, ignores `onPop` handlers. */
  pop(force?: boolean): Promise<void>
}

/** A value which can be returned from an `onPop` handler. */
export type LayerOnPopRetVal = "stop" | undefined

/** A value which can be returned from an `onReturn` handler. */
export type LayerOnReturnRetVal = "preserve-data" | undefined

/** Called when a layer is popped. */
export type LayerOnPop = () => Awaitable<LayerOnPopRetVal>

/** Called when a layer is returned to. */
export type LayerOnReturn = () => Awaitable<LayerOnReturnRetVal>

/** Data passed to the `render()` function on a layer. */
export interface LayerRenderInfo<Props, State, AsyncData> {
  /** The props passed to this layer. Passed as-is, so likely reactive. */
  props: Props

  /** The state created by `init`. Reactive getter and setter. */
  state: State

  /** The async data. Reactive getter. */
  readonly data: Awaited<AsyncData>

  /**
   * Sets a function to be called when this layer is returned to, replacing past
   * `onReturn` calls.
   */
  onReturn(fn: LayerOnReturn): void

  /**
   * Sets a function to be called when exiting this layer, replacing past
   * `onPop` calls. If the function returns `"stop"`, the pop is cancelled. If a
   * promise is returned, the pop is delayed until the promise resolves.
   */
  onPop(fn: LayerOnPop): void

  /** Pops the current layer. If `force` is called, ignores `onPop` handlers. */
  pop(force?: boolean): Promise<void>

  /** Forces a reload of the layer's data. */
  refetchData(): void

  /**
   * Forcefully mutates the layer's data. Will put the application into a
   * loading state if a promise is passed.
   */
  mutateData(data: AsyncData): void

  /** Pushes a layer. */
  push<T>(layer: Layerable<T>, props: T): void

  /** The `Owner` of the reactive tree. */
  owner: Owner | null
}

/** A complete layer definition. */
export interface Layer<Props, State, AsyncData> {
  /**
   * Initializes this layer's state. Only ever called once. If this method is
   * not defined, the layer's state will be `undefined` unless set elsewhere.
   */
  init?(props: Props): State

  /**
   * Loads asynchronous information required to render this layer. Called when
   * the layer is first shown and when it is returned to, although the
   * application may return `info.data` to keep the last result if it exists.
   */
  load?(info: LayerLoadInfo<Props, State>): AsyncData

  /**
   * Renders this layer, and can register hooks which are called when exiting
   * the layer. Common utilities like `push` and `owner` are also available.
   */
  render(info: LayerRenderInfo<Props, State, AsyncData>): JSX.Element
}

export function defineLayer<Props, State, AsyncData>(
  layer: Layer<Props, State, AsyncData>,
): Layerable<Props> {
  return (props, popRaw) => {
    let onReturn: LayerOnReturn | undefined
    let onPop: LayerOnPop | undefined

    const layers = useLayers()
    const owner = getOwner()
    const [state, setState] = createSignal(layer.init?.(props) as State)
    const [message, setMessage] = createSignal("Loading...")

    const layerLoadInfo: LayerLoadInfo<Props, State> = {
      props,
      get state() {
        return untrack(state)
      },
      set state(v) {
        setState(() => v)
      },
      get reloading() {
        // try-catch because of TDZ
        try {
          data()
          return true
        } catch {
          return false
        }
      },
      setMessage(message) {
        setMessage(message)
      },
      pop,
    }

    const [data, { mutate, refetch }] = createResource(
      () =>
        // Solid's typings only allow for T and Promise<T>, but the code allows
        // for any thenable. That's not compatiable with our types, so we have
        // to cast here.
        layer.load?.(layerLoadInfo) as Awaited<AsyncData>,
    )

    const layerRenderInfo: LayerRenderInfo<Props, State, AsyncData> = {
      props,
      get state() {
        return untrack(state)
      },
      set state(v) {
        setState(() => v)
      },
      get data() {
        const d = data()!
        if (d == null) {
          throw new Error("Cannot access application data while loading.")
        }
        return d
      },
      onReturn(fn) {
        onReturn = fn
      },
      onPop(fn) {
        onPop = fn
      },
      refetchData() {
        mutate(undefined)
        refetch()
      },
      mutateData(data) {
        if (typeof data == "object" && data && "then" in data) {
          mutate(undefined)
          ;(data as PromiseLike<AsyncData>).then((data) => {
            mutate(() => data as Awaited<AsyncData>)
          })
        } else {
          mutate(() => data as Awaited<AsyncData>)
        }
      },
      pop,
      push(layer, props) {
        layers.push(layer, props)
      },
      owner,
    }

    return {
      el: <El />,
      async onForcePop() {
        if (!onPop) {
          return true
        }

        return (await onPop()) !== "stop"
      },
      async onReturn() {
        if (!onReturn || (await onReturn()) !== "preserve-data") {
          mutate(undefined)
          refetch()
        }
      },
    }

    function El() {
      return (
        <Show
          fallback={<Loading message={message()} pop={() => pop(false)} />}
          when={data.state == "ready"}
        >
          {/**
           * The `untrack` call is automatically placed around JSX elements, but
           * we can't use proper JSX elements here, so we add it manually
           * instead. */}
          {untrack(() => layer.render(layerRenderInfo))}
        </Show>
      )
    }

    async function pop(force: boolean) {
      if (force || !onPop || (await onPop()) !== "stop") {
        popRaw()
      }
    }
  }
}
