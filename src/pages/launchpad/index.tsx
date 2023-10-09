import openGraphV8 from "../_home/open-graph.jpg"
import openGraphV7 from "@/assets/zsnout-7.png"
import openGraphV6 from "./v6-open-graph.jpg"
import { createSignal, onMount } from "solid-js"

interface Page {
  readonly title: string
  readonly description: string
  readonly href: string
  readonly image: string
}

const pages: readonly Page[] = [
  {
    title: "zSnout 8",
    description:
      "The latest version of zSnout, with the new blog and Ithkuil projects.",
    href: "https://v8.zsnout.com/",
    image: openGraphV8,
  },
  {
    title: "zSnout 7",
    description: "",
    href: "https://zsnout.com/home",
    image: openGraphV7,
  },
  {
    title: "zSnout 6",
    description: "",
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
        class="group relative flex aspect-open-graph"
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

          // animated.animate(
          //   [
          //     {
          //       offset: 0,
          //       transform: "perspective(200px) rotateX(0deg) rotateY(0deg)",
          //     },
          //   ],
          //   { duration: 500, composite: "accumulate" },
          // )
        }}
      >
        <div class="pointer-events-none relative flex h-full w-full flex-col overflow-hidden rounded-lg px-4 py-3 transition duration-0 group-hover:z-20 [&:not(.group:hover_*)]:![transform:scale(100%)_perspective(200px)_rotateX(0deg)_rotateY(0deg)]">
          <img
            class="absolute left-0 top-0 h-full w-full select-none"
            src={page.image}
          />

          <div class="absolute left-0 top-0 h-full w-full bg-gradient-to-b from-[#0002] to-current text-[#0008] transition group-hover:to-90% group-hover:text-[#000c]" />

          <div class="relative mt-auto flex translate-y-[calc(var(--description-height)_+_0.25rem)] flex-col transition [--description-height:0.75rem] group-hover:![--description-height:-0.25rem]">
            <p class="text-2xl font-semibold text-white drop-shadow">
              {page.title}
            </p>

            <p
              class="mt-1 text-xs text-white opacity-0 drop-shadow-sm group-hover:opacity-100"
              ref={(self) => {
                const parent = self.parentElement as HTMLDivElement

                function onResize() {
                  parent.style.setProperty(
                    "--description-height",
                    self.getBoundingClientRect().height + "px",
                  )
                }

                onMount(onResize)
                addEventListener("resize", onResize)
                self.addEventListener("resize", onResize)
              }}
            >
              {page.description}
            </p>
          </div>
        </div>
      </a>
    )
  })
}
