import type { Page } from "../pages"

export function CompactCard(props: { page: Page }) {
  return (
    <div class="flex flex-col">
      <p class="text-xl font-bold text-z-heading">{props.page.title}</p>

      <p class="mt-2 text-sm text-z-subtitle [line-height:1.5]">
        {props.page.longSubtitle}
      </p>
    </div>
  )
}
