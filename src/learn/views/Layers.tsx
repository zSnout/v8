import {
  createContext,
  getOwner,
  JSX,
  onMount,
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

export function withCurrentOwner<This, Args extends any[], Retval>(
  fn: (this: This, ...args: Args) => Retval,
): (this: This, ...args: Args) => Retval {
  const owner = getOwner()

  return function (this, ...args) {
    return runWithOwner(owner, () => fn.apply(this, args))!
  }
}

export class Layers {
  static Root(props: { children: JSX.Element }) {
    const layers = new Layers()
    onMount(() => {
      addEventListener("popstate", (event) => {
        if (layers.popLatestScreen()) {
          event.preventDefault()
        }
      })
      addEventListener("keydown", (event) => {
        if (
          !event.altKey &&
          !event.ctrlKey &&
          !event.metaKey &&
          event.key == "Escape" &&
          layers.popLatest()
        ) {
          event.preventDefault()
        }
      })
    })
    return (
      <LayerContext.Provider value={layers}>
        <div class="relative min-h-full w-full">
          <div
            class="z-layer-root min-h-full w-full transform opacity-100 transition"
            ref={(el) => layers.layers.push(el)}
          >
            {props.children}
          </div>
        </div>
      </LayerContext.Provider>
    )
  }

  private layers: HTMLDivElement[] = []

  pushScreen(el: (pop: () => void) => JSX.Element): () => void {
    const prev = this.layers[this.layers.length - 1]
    if (!prev) {
      throw new Error("Cannot push a layer when no root layer exists.")
    }

    const pop = () => {
      const idx = this.layers.indexOf(next)
      if (idx != -1) {
        this.layers.splice(idx, Infinity)
      }
      animateOut(prev, next)
    }

    prev.inert = true

    const child = el(pop)
    const next = (
      <div
        class="fixed bottom-0 left-0 right-0 top-12 translate-x-16 transform overflow-y-auto bg-z-body-partial px-6 py-8 opacity-0 transition"
        ref={(el) => {
          this.layers.push(el)
          setTimeout(() => animateIn(prev, el))
        }}
      >
        {child}
      </div>
    ) as HTMLDivElement

    prev.after(next)
    history.pushState({}, "", location.href)
    return pop
  }

  pushDialog(el: (pop: () => void) => JSX.Element): () => void {
    const prev = this.layers[this.layers.length - 1]
    if (!prev) {
      throw new Error("Cannot push a layer when no root layer exists.")
    }

    const pop = () => {
      const idx = this.layers.indexOf(next)
      if (idx != -1) {
        this.layers.splice(idx, Infinity)
      }
      animateOut(prev, next)
    }

    prev.inert = true

    const child = el(pop)
    const next = (
      <div
        class="fixed bottom-0 left-0 right-0 top-12 translate-y-8 transform overflow-y-auto bg-z-body-partial px-6 py-8 opacity-0 transition"
        ref={(el) => {
          this.layers.push(el)
          setTimeout(() => animateIn(prev, el))
        }}
        role="dialog"
      >
        <div>{child}</div>
      </div>
    ) as HTMLDivElement

    prev.after(next)
    return pop
  }

  pop(idx: number): boolean {
    const prev = this.layers[idx - 1]
    if (!prev) {
      return false
    }
    const next = this.layers[idx]
    if (!next) {
      return false
    }
    if (idx != -1) {
      for (const el of this.layers.splice(idx + 1, Infinity)) {
        el.remove()
      }
      this.layers.splice(idx, 1)
    }
    animateOut(prev, next)
    return true
  }

  popLatestScreen() {
    return this.pop(this.layers.findLastIndex((x) => x.role != "dialog"))
  }

  popLatest() {
    return this.pop(this.layers.length - 1)
  }
}

function animateIn(prev: HTMLDivElement, next: HTMLDivElement) {
  if (next.role == "dialog") {
    prev.classList.add("blur")
  } else {
    prev.classList.add("blur-lg")
    prev.classList.remove("opacity-100")
    prev.classList.add("opacity-0")
    prev.classList.remove("translate-x-0")
    prev.classList.remove("translate-x-16")
    prev.classList.add("-translate-x-16")
    prev.classList.add("overflow-clip")
    if (prev.classList.contains("z-layer-root")) {
      document.body.classList.add("overflow-clip")
    }
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
  next.inert = false
}

function animateOut(prev: HTMLDivElement, next: HTMLDivElement) {
  if (next.role == "dialog") {
    prev.classList.remove("blur")
  } else {
    prev.classList.add("opacity-100")
    prev.classList.remove("opacity-0")
    prev.classList.remove("blur-lg")
    prev.classList.add("translate-x-0")
    prev.classList.remove("-translate-x-16")
    prev.classList.remove("-translate-x-16")
    prev.classList.remove("overflow-clip")
    if (prev.classList.contains("z-layer-root")) {
      document.body.classList.remove("overflow-clip")
    }
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
  if (next.role == "dialog") {
    next.classList.add("translate-y-8")
  } else {
    next.classList.add("translate-x-16")
  }
  next.classList.add("overflow-clip")
  next.inert = true
  next.addEventListener("transitionend", () => next.remove())
}
