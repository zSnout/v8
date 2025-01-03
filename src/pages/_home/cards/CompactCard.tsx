import { Show } from "solid-js"
import { BlueGreenText } from "../BlueGreenText"
import type { PageTextOnly } from "../pages"

export function CompactCard(props: { page: PageTextOnly }) {
  return (
    <div class="flex flex-col">
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
