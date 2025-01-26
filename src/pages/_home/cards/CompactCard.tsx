import { Fa } from "@/components/Fa"
import { Show } from "solid-js"
import { BlueGreenText } from "../BlueGreenText"
import type { PageTextOnly } from "../pages"

export function CompactCard(props: { page: PageTextOnly }) {
  return (
    <div class="flex flex-col">
      <a class="mb-2 block w-full" href={props.page.href}>
        {typeof props.page.imageSrc == "string" ?
          <div class="relative mb-2 aspect-open-graph w-full">
            <img
              class="w-full rounded-lg"
              src={props.page.imageSrc}
              alt={props.page.imageAlt}
            />
            <div class="absolute inset-0 rounded-lg border border-slate-500/20 dark:hidden" />
          </div>
        : <div class="flex aspect-open-graph rounded-lg bg-white dark:bg-slate-800">
            <div class="m-auto flex aspect-square w-[25%] rounded-full bg-slate-200 dark:bg-slate-700">
              <Fa
                class="m-auto w-[50%]"
                icon={props.page.imageSrc}
                title={props.page.imageAlt}
              />
            </div>
          </div>
        }
      </a>

      <Show when={props.page.category}>
        <BlueGreenText name={props.page.category!} />
      </Show>

      <a
        class="text-xl font-bold text-z-heading underline decoration-transparent transition hover:text-z-link hover:decoration-current"
        classList={{
          "mt-1": props.page.category != null,
        }}
        href={props.page.href}
      >
        {props.page.title}
      </a>

      <p class="mt-2 text-sm text-z-subtitle [line-height:1.5]">
        {props.page.subtitle}
      </p>
    </div>
  )
}
