import {
  createContext,
  getOwner,
  JSX,
  Owner,
  runWithOwner,
  useContext,
} from "solid-js"

const LayerContext = createContext<Layers>()

export function useLayers() {
  const context = useContext(LayerContext)
  if (context == null) {
    throw new Error("`useLayers` can only be used in a `Layers.Root` scope")
  }
  return context
}

type LayerInfo = [
  layer: HTMLDivElement,
  previouslyFocused: Element | null,
  onForcePop: ForcePopHandler,
]

export class Layers {
  static Root(props: { children: JSX.Element }) {
    const layers = new Layers(getOwner())

    return (
      <LayerContext.Provider value={layers}>
        <div class="relative flex min-h-full w-full">
          <div
            class="z-layer-root flex min-h-full w-full transform flex-col opacity-100 transition"
            ref={(el) => (layers.root = el)}
          >
            {props.children}
          </div>
        </div>
      </LayerContext.Provider>
    )
  }

  constructor(private owner: Owner | null) {}

  private root!: HTMLDivElement
  private layers: LayerInfo[] = []

  push<T>(fn: Layerable<T>, props: T, popHook: () => void) {
    const prev = this.layers[this.layers.length - 1]?.[0] ?? this.root

    const idx = this.layers.length
    const pop = () => {
      this.pop(idx)
      popHook()
    }

    const previouslyFocused = document.activeElement

    let onForcePop!: ForcePopHandler
    function Inner() {
      const output = fn(props, pop)
      const fp = output.onForcePop
      onForcePop = async () => {
        const retval = await fp()
        if (retval) {
          popHook()
        }
        return retval
      }
      return output.el
    }

    const next = runWithOwner(this.owner, () => {
      const el = (
        <LayerContext.Provider value={this}>
          <Inner />
        </LayerContext.Provider>
      )

      const next = (
        <div
          class="fixed bottom-0 left-0 right-0 top-12 flex translate-x-16 transform flex-col overflow-y-auto bg-z-body-partial px-6 py-8 opacity-0 transition"
          ref={(el) => {
            this.layers.push([el, previouslyFocused, onForcePop])
            setTimeout(() => {
              animateIn(prev, el)
            })
          }}
        >
          <div class="mx-auto w-full max-w-5xl flex-1">{el}</div>
        </div>
      ) as HTMLDivElement

      return next
    })!

    prev.inert = true
    prev.after(next)
  }

  private pop(idx: number): boolean {
    const prev = this.layers[idx - 1]?.[0] ?? this.root
    const current = this.layers[idx]
    if (!current) {
      return false
    }
    const [next, previouslyFocused] = current
    for (const [el] of this.layers.splice(idx + 1, Infinity)) {
      el.remove()
    }
    this.layers.splice(idx, 1)
    animateOut(prev, next)
    if (
      previouslyFocused instanceof HTMLElement ||
      previouslyFocused instanceof SVGElement
    ) {
      previouslyFocused.focus()
    }
    return true
  }

  async forcePopAll() {
    for (let index = this.layers.length - 1; index >= 0; index--) {
      const data = this.layers[index]
      if (!data) {
        return
      }

      const [, , onForcePop] = data

      if (!(await onForcePop())) {
        return
      }

      this.pop(index)
    }
  }
}

function animateIn(prev: HTMLDivElement, next: HTMLDivElement) {
  prev.classList.add("blur-lg")
  prev.classList.remove("opacity-100")
  prev.classList.add("opacity-0")
  prev.classList.remove("translate-x-0")
  prev.classList.remove("translate-x-16")
  prev.classList.add("-translate-x-16")
  prev.classList.add("overflow-clip")
  if (prev.classList.contains("z-layer-root")) {
    document.body.classList.add("overflow-clip")
  } else {
    prev.classList.remove("z-layer-active")
  }
  prev.inert = true

  next.classList.remove("opacity-0")
  next.classList.add("opacity-100")
  next.classList.remove("translate-x-16")
  next.classList.remove("-translate-x-16")
  next.classList.add("translate-x-0")
  next.classList.remove("translate-y-8")
  next.classList.remove("-translate-y-8")
  next.classList.add("translate-y-0")
  next.classList.add("z-layer-active")
  next.inert = false
}

function animateOut(prev: HTMLDivElement, next: HTMLDivElement) {
  prev.classList.add("opacity-100")
  prev.classList.remove("opacity-0")
  prev.classList.remove("blur-lg")
  prev.classList.add("translate-x-0")
  prev.classList.remove("-translate-x-16")
  prev.classList.remove("-translate-x-16")
  prev.classList.remove("overflow-clip")
  if (prev.classList.contains("z-layer-root")) {
    document.body.classList.remove("overflow-clip")
  } else {
    prev.classList.add("z-layer-active")
  }
  prev.inert = false

  next.classList.add("opacity-0")
  next.classList.remove("opacity-100")
  next.classList.remove("-translate-x-16")
  next.classList.remove("translate-x-16")
  next.classList.remove("translate-x-0")
  next.classList.remove("-translate-y-8")
  next.classList.remove("translate-y-8")
  next.classList.remove("translate-y-0")
  next.classList.add("translate-x-16")
  next.classList.add("overflow-clip")
  next.classList.remove("z-layer-active")
  next.inert = true
  next.addEventListener("transitionend", () => {
    next.remove()
  })
}

// TODO: properly unmount new layers once they're removed

export interface LayerOutput {
  /** The element to be shown in the layer. */
  el: JSX.Element
  onForcePop: ForcePopHandler
}

/** Return `false` to stop this layer from being removed. */
export type ForcePopHandler = () => boolean | PromiseLike<boolean>

export type Layerable<T> = (props: T, pop: () => void) => LayerOutput
