import { NavigationSolid } from "@/components/nav/NavigationSolid"
import {
  createContext,
  createSignal,
  getOwner,
  JSX,
  Owner,
  runWithOwner,
  useContext,
} from "solid-js"

const LayerContext = createContext<LayersNew>()

export function useLayersNew() {
  const context = useContext(LayerContext)
  if (context == null) {
    throw new Error("`useLayers` can only be used in a `Layers.Root` scope")
  }
  return context
}

export class LayersNew {
  static Root(props: { children: JSX.Element }) {
    const layers = new LayersNew()
    layers.owner = getOwner()
    // onMount(() => {
    //   addEventListener("popstate", (event) => {
    //     if (layers.popLatestScreen()) {
    //       event.preventDefault()
    //     }
    //   })
    //   addEventListener("keydown", (event) => {
    //     if (
    //       !event.altKey &&
    //       !event.ctrlKey &&
    //       !event.metaKey &&
    //       event.key == "Escape" &&
    //       layers.popLatest()
    //     ) {
    //       event.preventDefault()
    //     }
    //   })
    // })
    return (
      <LayerContext.Provider value={layers}>
        <div class="relative min-h-full w-full">
          <div
            class="min-h-full w-full transform opacity-100 transition"
            ref={(el) => (layers.root = layers.current = el)}
          >
            {props.children}
          </div>
        </div>
      </LayerContext.Provider>
    )
  }

  root!: HTMLDivElement
  current!: HTMLElement
  last!: HTMLElement
  owner!: Owner | null

  pushScreen(createScreen: (pop: () => void) => JSX.Element): () => void {
    function pop() {}

    const el = runWithOwner(this.owner, () => createScreen(pop))
    const [open, setOpen] = createSignal(false)

    const dialog = (
      <dialog
        class="pointer-events-none fixed left-0 top-0 flex min-h-full min-w-full flex-col bg-transparent px-6 pb-8 pt-20 opacity-0 transition backdrop:top-12 backdrop:bg-transparent backdrop:transition open:pointer-events-auto open:opacity-100 open:backdrop:bg-z-body-partial"
        inert={!open()}
        onClose={() => {
          setOpen(false)
          this.current = dialog.parentElement!
          dialog.ontransitionend = () => dialog.remove()
        }}
        open
        style={{ opacity: 1 }}
      >
        <div class="hidden [[open]>&]:contents">
          <div class="fixed left-0 top-0 h-12 w-full bg-z-body"></div>
        </div>
        <div class="relative w-full flex-1 translate-y-12 transition [[open]>&]:translate-y-0">
          {el}
        </div>
        <div class="hidden [[open]>&]:contents">
          <NavigationSolid floating={false} maxWidth="max-w-5xl" />
        </div>
      </dialog>
    ) as HTMLDialogElement
    this.current.appendChild(dialog)
    this.current = this.last = dialog
    // setTimeout(() => {
    //   setOpen(true)
    //   dialog.showModal()
    // })

    return pop
  }
}
