import { createContext, JSX, useContext } from "solid-js"

export class Layers {
  static Base(props: { children: JSX.Element }) {
    const layers = new Layers()
    return (
      <LayerContext.Provider value={layers}>
        <div class="relative min-h-full w-full">
          <div
            class="z-layer-root absolute top-0 -mb-8 min-h-full w-full transform pb-8 opacity-100 transition"
            ref={(el) => layers.layers.push(el)}
          >
            {props.children}
          </div>
        </div>
      </LayerContext.Provider>
    )
  }

  static get() {
    return useContext(LayerContext)
  }

  private layers: HTMLDivElement[] = []

  push(el: (pop: () => void) => JSX.Element): () => void {
    const prev = this.layers[this.layers.length - 1]
    if (!prev) {
      throw new Error("Cannot push a layer when no base layer exists.")
    }

    const pop = () => {
      const idx = this.layers.indexOf(next)
      if (idx != -1) {
        this.layers.splice(idx, Infinity)
      }
      animateOut(prev, next)
    }
    let next: HTMLDivElement

    prev.inert = true
    const child = el(pop)
    prev.after(
      (
        <div
          class="fixed bottom-0 left-0 right-0 top-12 translate-x-16 transform overflow-y-auto bg-z-body-partial px-6 py-8 opacity-0 transition"
          ref={(el) => {
            next = el
            this.layers.push(el)
            setTimeout(() => animateIn(prev, el))
          }}
        >
          {child}
        </div>
      ) as HTMLDivElement,
    )

    return pop
  }
}

function animateIn(prev: HTMLDivElement, next: HTMLDivElement) {
  prev.classList.remove("opacity-100")
  prev.classList.add("opacity-0")
  prev.classList.add("blur-lg")
  prev.classList.remove("translate-x-0")
  prev.classList.remove("translate-x-16")
  prev.classList.add("-translate-x-16")
  // prev.classList.add("max-h-[calc(100dvh_-_5rem)]")
  prev.classList.add("overflow-clip")
  prev.inert = true
  if (prev.classList.contains("z-layer-root")) {
    document.body.classList.add("overflow-clip")
  }

  next.classList.remove("opacity-0")
  next.classList.add("opacity-100")
  next.classList.remove("translate-x-16")
  next.classList.remove("-translate-x-16")
  next.classList.add("translate-x-0")
  next.inert = false
}

function animateOut(prev: HTMLDivElement, next: HTMLDivElement) {
  prev.classList.add("opacity-100")
  prev.classList.remove("opacity-0")
  prev.classList.remove("blur-lg")
  prev.classList.add("translate-x-0")
  prev.classList.remove("-translate-x-16")
  prev.classList.remove("-translate-x-16")
  // prev.classList.remove("max-h-[calc(100dvh_-_5rem)]")
  prev.classList.remove("overflow-clip")
  prev.inert = false
  if (prev.classList.contains("z-layer-root")) {
    document.body.classList.remove("overflow-clip")
  }

  next.classList.add("opacity-0")
  next.classList.remove("opacity-100")
  next.classList.add("translate-x-16")
  next.classList.remove("-translate-x-16")
  next.classList.remove("translate-x-0")
  next.classList.add("overflow-clip")
  next.inert = true
  next.addEventListener("transitionend", () => next.remove())
}

const LayerContext = createContext(new Layers())
