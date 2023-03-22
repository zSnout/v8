import { BlueGreenText } from "../BlueGreenText"
import type { Page } from "../pages"

export function BlogCard(props: { class: string; page: Page }) {
  return (
    <div class={"w-full flex-col " + props.class}>
      <BlueGreenText name={props.page.tags[0]} />

      <p class="mt-1 text-xl font-bold text-z-heading">{props.page.title}</p>

      <p class="mt-2 text-sm text-z-subtitle [line-height:1.5]">
        {props.page.longSubtitle}
      </p>
    </div>
  )
}
