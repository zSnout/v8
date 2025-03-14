import { BlueGreenText } from "../BlueGreenText"
import type { Page } from "../pages"

export function BlogCard(props: { class: string; page: Page }) {
  return (
    <div class={"w-full flex-col " + props.class}>
      <a class="block w-full" href={props.page.href}>
        <img
          class="mb-2 aspect-open-graph w-full rounded-lg"
          src={props.page.imageSrc}
          alt={props.page.imageAlt}
        />
      </a>

      <BlueGreenText name={props.page.tags[0]} />

      <a
        class="mt-1 text-xl font-bold text-z-heading underline decoration-transparent transition hover:text-z-link hover:decoration-current"
        href={props.page.href}
      >
        {props.page.title}
      </a>

      <p class="mt-2 text-sm text-z-subtitle transition [line-height:1.5]">
        {props.page.subtitle}
      </p>
    </div>
  )
}
