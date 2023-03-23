import { Show } from "solid-js"
import { BlueGreenText } from "../BlueGreenText"
import type { Page } from "../pages"

export function CompactCard(props: { page: Page }) {
  return (
    <div class="flex flex-col">
      <Show when={props.page.category}>
        <BlueGreenText name={props.page.category || ""} />
      </Show>

      <a
        class="text-xl font-bold text-z-heading underline decoration-transparent transition hover:text-z-link hover:decoration-z-text-link"
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
