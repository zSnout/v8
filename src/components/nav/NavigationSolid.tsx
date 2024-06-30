import { ThemeSwitcher } from "./ThemeSwitcher"

export function NavigationSolid(props: {
  floating: boolean
  maxWidth: `max-w-${string}`
  theme?: "light" | "dark"
  shortLine?: boolean
  solid?: boolean
}) {
  return (
    // This is _intentionally_ not a <nav /> element.
    // That is used in prose and other documents with internal nav links.
    <div
      class={
        "pointer-events-none fixed left-0 top-0 z-30 flex h-12 w-full touch-none select-none items-center justify-center border-b px-6 py-1.5 transition print:hidden " +
        (props.floating
          ? "border-b-transparent"
          : props.shortLine
          ? "border-b-transparent bg-z-body-partial backdrop-blur-sm"
          : "border-b-z bg-z-body-partial backdrop-blur-sm")
      }
    >
      <div
        class={`relative flex h-full w-full flex-1 items-center ${props.maxWidth}`}
      >
        {props.shortLine && (
          <div class="absolute -bottom-1.5 left-0 h-px w-full translate-y-px bg-z-border" />
        )}

        <a
          class={
            "pointer-events-auto relative left-[calc(-0.5rem_-_1px)] z-20 mr-auto rounded-lg border border-transparent px-2 py-0.5 text-2xl font-extralight text-z-heading underline decoration-transparent decoration-1 underline-offset-2 ring-z-focus transition hover:decoration-current focus-visible:border-z-focus focus-visible:outline-none focus-visible:ring " +
            (props.floating ? "bg-z-body-partial backdrop-blur-sm" : "")
          }
          href="/"
        >
          zSnout
        </a>

        <ThemeSwitcher theme={props.theme} />
      </div>
    </div>
  )
}
