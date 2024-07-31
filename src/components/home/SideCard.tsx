import type { Page } from "./pages"

export function SideCard(props: Page) {
  return (
    <div class="flex w-full gap-4 lg:max-w-md">
      <a
        class="h-40 min-h-[10rem] w-40 min-w-[10rem] overflow-clip rounded-lg"
        draggable={false}
        href={props.href}
      >
        <img
          alt={props.imageAlt}
          class="aspect-square h-full w-full object-cover transition duration-300 hover:scale-105"
          draggable={false}
          src={props.imageSrc}
          width="1200"
          height="630"
        />
      </a>

      <div class="flex flex-col">
        <a
          class="text-xl font-bold text-z-heading underline decoration-transparent transition hover:text-z-link hover:decoration-current"
          href={props.href}
        >
          {props.title}
        </a>

        <p class="mt-3 text-sm text-z-subtitle transition [line-height:1.5]">
          {props.subtitle}
        </p>
      </div>
    </div>
  )
}
