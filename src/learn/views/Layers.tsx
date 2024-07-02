import {
  createContext,
  getOwner,
  JSX,
  onMount,
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

export class Layers {
  static Root(props: { children: JSX.Element }) {
    const layers = new Layers(getOwner())
    // onMount(() => {
    //   addEventListener("keydown", (event) => {
    //     if (
    //       !event.altKey &&
    //       !event.ctrlKey &&
    //       !event.metaKey &&
    //       event.key == "Escape" &&
    //       layers.layers.length >= 1
    //     ) {
    //       event.preventDefault()
    //       layers.popLatest()
    //     }
    //   })
    // })
    return (
      <LayerContext.Provider value={layers}>
        <div class="relative min-h-full w-full">
          <div
            class="z-layer-root min-h-full w-full transform opacity-100 transition"
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
  private layers: [layer: HTMLDivElement, previouslyFocused: Element | null][] =
    []

  push(el: (pop: () => void) => JSX.Element): () => void {
    const prev = this.layers[this.layers.length - 1]?.[0] ?? this.root

    const idx = this.layers.length
    const pop = () => {
      this.pop(idx)
    }

    const previouslyFocused = document.activeElement
    console.log(previouslyFocused)
    prev.inert = true

    const child = runWithOwner(this.owner, () => el(pop))
    const next = (
      <div
        class="fixed bottom-0 left-0 right-0 top-12 flex translate-x-16 transform flex-col overflow-y-auto bg-z-body-partial px-6 py-8 opacity-0 transition"
        ref={(el) => {
          this.layers.push([el, previouslyFocused])
          setTimeout(() => {
            animateIn(prev, el)
          })
        }}
      >
        <div class="mx-auto w-full max-w-5xl flex-1 flex-col">{child}</div>
      </div>
    ) as HTMLDivElement

    prev.after(next)
    return pop
  }

  pop(idx: number): boolean {
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

  popLatest() {
    return this.pop(this.layers.length - 1)
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
  next.inert = true
  next.addEventListener("transitionend", () => {
    next.remove()
  })
}
