import openGraphV8 from "../_home/open-graph.jpg"
import openGraphV7 from "@/assets/zsnout-7.png"
import openGraphV6 from "./v6-open-graph.jpg"
import { createSignal } from "solid-js"

interface Page {
  readonly title: string
  readonly description: string
  readonly href: string
  readonly image: string
}

const pages: readonly Page[] = [
  {
    title: "zSnout 8",
    description: "The latest version of zSnout.",
    href: "https://v8.zsnout.com/",
    image: openGraphV8,
  },
  {
    title: "zSnout 7",
    description: "The previous version of zSnout.",
    href: "https://zsnout.com/home",
    image: openGraphV7,
  },
  {
    title: "zSnout 6",
    description: "A very old version of zSnout.",
    href: "https://v6.zsnout.com/",
    image: openGraphV6,
  },
]

export function Main() {
  let initialTimeHovered = Date.now()
  const [timeHovered, setTimeHovered] = createSignal(0)

  setInterval(() => {
    setTimeHovered(Math.max(0, Date.now() - initialTimeHovered))
  })

  return pages.map((page) => {
    return (
      <a
        class="group relative flex aspect-open-graph focus-visible:outline-none"
        href={page.href}
        onMouseEnter={(event) => {
          const animated = event.currentTarget.children[0] as HTMLDivElement
          initialTimeHovered = Date.now()
          setTimeHovered(0)
          animated.style.transitionDuration = "150ms"
        }}
        onMouseMove={(event) => {
          const self = event.currentTarget
          const size = self.getBoundingClientRect()
          const mouseX = event.offsetX / size.width
          const mouseY = 1 - event.offsetY / size.height

          const animated = self.children[0] as HTMLDivElement

          animated.style.transitionDuration = 150 - timeHovered() + "ms"
          animated.style.setProperty(
            "transform",
            `scale(120%) perspective(200px) rotateX(${
              mouseY * 10 - 5
            }deg) rotateY(${mouseX * 10 - 5}deg)`,
          )
        }}
        onMouseLeave={(event) => {
          const animated = event.currentTarget.children[0] as HTMLDivElement

          animated.style.transitionDuration = "150ms"
        }}
      >
        <div class="pointer-events-none relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-transparent px-4 py-3 ring-z-focus transition duration-0 group-hover:z-20 group-focus-visible:border-z-focus group-focus-visible:ring [&:not(.group:hover_*)]:![transform:scale(100%)_perspective(200px)_rotateX(0deg)_rotateY(0deg)]">
          <img
            class="absolute left-0 top-0 h-full w-full select-none"
            src={page.image}
          />

          <div class="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-[#0002] to-current text-[#0008] transition group-hover:to-90% group-hover:text-[#000c]" />

          <div class="relative mt-auto flex flex-col transition [transform:translate3d(0,0,200px)]">
            <p class="text-2xl font-semibold text-white drop-shadow">
              {page.title}
            </p>

            <p class="mt-1 text-xs text-white drop-shadow-sm">
              {page.description}
            </p>
          </div>
        </div>
      </a>
    )
  })
}
