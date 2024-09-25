import openGraphV7 from "@/assets/zsnout-7.png"
import openGraphV8 from "../_home/open-graph.jpg"
import openGraphV6 from "./v6-open-graph.jpg"
import { For } from "solid-js"

interface Page {
  readonly title: string
  readonly href: string
  readonly image: string
}

const pages: readonly Page[] = [
  {
    title: "zSnout 8",
    href: "/home",
    image: openGraphV8,
  },
  {
    title: "zSnout 7",
    href: "https://v7dyn.zsnout.com/",
    image: openGraphV7,
  },
  {
    title: "Learn",
    href: "https://learn.zsnout.com",
    image: openGraphV7,
  },
  {
    title: "Scheduler",
    href: "https://scheduler.zsnout.com",
    image: openGraphV7,
  },
  {
    title: "zSnout 6",
    href: "https://v6.zsnout.com/",
    image: openGraphV6,
  },
]

export function Main() {
  return (
    <div class="grid w-full grid-cols-2 gap-4">
      <For each={pages}>
        {(page) => (
          <a
            class="relative block aspect-video w-full rounded-xl border border-z"
            href={page.href}
          >
            <img
              class="absolute left-0 top-0 h-full w-full rounded-xl object-cover"
              src={page.image}
            />
            <div class="absolute inset-0 flex items-center justify-center rounded-xl">
              <h2 class="rounded-lg border border-z bg-z-body-partial px-3 py-2 text-3xl text-z-heading backdrop-blur-xl">
                {page.title}
              </h2>
            </div>
          </a>
        )}
      </For>
    </div>
  )
}
