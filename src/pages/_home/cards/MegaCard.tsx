import { toDateString } from "@/components/to-date-string"
import { Show } from "solid-js"
import { BlueGreenText } from "../BlueGreenText"
import type { Page } from "../pages"

export function MegaCard(props: Page) {
  return (
    <div class="flex w-full flex-1 flex-col lg:max-w-2xl lg:basis-96">
      <a
        class="aspect-open-graph w-full overflow-clip rounded-lg"
        draggable={false}
        href={props.href}
      >
        <img
          alt={props.imageAlt}
          class="object-cover transition duration-300 hover:scale-105"
          draggable={false}
          src={props.imageSrc}
          width="1200"
          height="630"
        />
      </a>

      <Show when={props.category || props.published}>
        <div class="mb-3 mt-6 flex w-full items-baseline">
          <Show when={props.category}>
            <BlueGreenText href={props.categoryHref} name={props.category!} />
          </Show>

          <Show when={props.published}>
            <time
              class="ml-auto font-mono text-sm text-z-subtitle transition"
              datetime={props.published?.toISOString()}
            >
              {props.published && toDateString(props.published)}
            </time>
          </Show>
        </div>
      </Show>

      <a
        class="text-3xl font-bold text-z-heading underline decoration-transparent transition hover:text-z-link hover:decoration-current md:text-4xl"
        classList={{
          "mt-6": !(props.category || props.published),
        }}
        href={props.href}
      >
        {props.title}
      </a>

      <p class="mt-3 text-z-subtitle transition">{props.subtitle}</p>
    </div>
  )
}
