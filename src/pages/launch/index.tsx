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
    href: "https://zsnout.com/home",
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
    image: "TODO:",
  },
  {
    title: "Scheduler",
    href: "https://scheduler.zsnout.com",
    image: "TODO:",
  },
  {
    title: "zSnout 6",
    href: "https://v6.zsnout.com/",
    image: openGraphV6,
  },
]

export function Main() {
  return (
    <div class="flex flex-col">
      <For each={pages}></For>
    </div>
  )
}
