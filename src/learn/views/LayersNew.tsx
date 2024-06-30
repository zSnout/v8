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
        <div
          class="relative min-h-full w-full transform transition"
          ref={(el) => (layers.root = el)}
        >
          <div class="min-h-full w-full transform opacity-100 transition">
            {props.children}
          </div>
        </div>
      </LayerContext.Provider>
    )
  }

  root!: HTMLDivElement
  current?: HTMLDialogElement
  owner!: Owner | null

  pushScreen(createScreen: (pop: () => void) => JSX.Element): () => void {
    function pop() {}

    const el = runWithOwner(this.owner, () => createScreen(pop))
    const [open, setOpen] = createSignal(false)

    const dialog = (
      <dialog
        class="pointer-events-none fixed left-0 top-0 flex min-h-full min-w-full translate-x-12 flex-col bg-transparent px-6 pb-8 pt-20 opacity-0 backdrop-blur-none transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,filter,backdrop-filter] backdrop:hidden open:pointer-events-auto open:translate-x-0 open:bg-z-body-partial open:opacity-100 open:backdrop-blur"
        inert={!open()}
        onClose={() => {
          setOpen(false)
          if (
            dialog.parentElement &&
            dialog.parentElement instanceof HTMLDialogElement
          ) {
            this.current = dialog.parentElement
          } else {
            this.current = undefined
          }
          dialog.ontransitionend = () => dialog.remove()
          shiftable.classList.remove("-translate-x-12")
        }}
        // open
        // style={{ opacity: 1 }}
      >
        <div class="hidden [[open]>&]:contents">
          <div class="fixed left-0 top-0 h-12 w-full bg-z-body"></div>
        </div>
        <div class="relative w-full flex-1 translate-x-12 transition [[open]>&]:translate-x-0">
          {el}
        </div>
        <div class="hidden [[open]>&]:contents">
          <NavigationSolid floating={false} maxWidth="max-w-5xl" />
        </div>
      </dialog>
    ) as HTMLDialogElement
    const parent = this.current?.children[1] || document.body
    const shiftable = this.current?.children[1] || this.root
    parent.appendChild(dialog)
    shiftable.classList.remove("translate-x-12")
    shiftable.classList.add("-translate-x-12")
    this.current = dialog
    setTimeout(() => {
      setOpen(true)
      dialog.showModal()
    })

    return pop
  }
}
