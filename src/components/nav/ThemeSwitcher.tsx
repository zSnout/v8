import { faM, faMoon, faSun } from "@fortawesome/free-solid-svg-icons"
import { createMemo, Show } from "solid-js"
import { isDark, toggleIsDark } from "@/stores/theme"
import { Fa } from "../Fa"
import { clsx } from "../clsx"

export function ThemeSwitcher(props?: {
  theme?: "light" | "dark"
  gray?: boolean
}) {
  const isActuallyDark = createMemo(() =>
    props?.theme == "light" ? false
    : props?.theme == "dark" ? true
    : isDark(),
  )

  return (
    <button
      aria-checked={isActuallyDark()}
      class={clsx(
        "group pointer-events-auto relative z-20 flex h-5 w-10 items-center rounded-full border bg-clip-padding ring-z-focus transition focus-visible:border-z-focus focus-visible:outline-none focus-visible:ring dark:focus-visible:border-z-focus",
        props?.gray ?
          "border-z bg-z-body dark:border-z-theme-switcher dark:bg-z-theme-switcher"
        : "border-z-theme-switcher bg-z-theme-switcher",
      )}
      classList={{ "opacity-30": typeof props?.theme == "string" }}
      disabled={typeof props?.theme == "string"}
      onClick={toggleIsDark}
      role="switch"
    >
      <div
        class={clsx(
          "relative flex h-5 w-5 items-center justify-center rounded-full outline outline-1 outline-z transition-all icon-z group-focus-visible:outline-z-focus",
          props?.gray ?
            "bg-z-body dark:bg-z-theme-switcher"
          : "bg-z-theme-switcher",
        )}
        classList={{
          "left-[1.125rem]": isActuallyDark(),
          "left-0": !isActuallyDark(),
        }}
      >
        <Fa
          class="h-3 w-3"
          icon={isActuallyDark() ? faMoon : faSun}
          title={isActuallyDark() ? "Moon" : "Sun"}
        />
      </div>
    </button>
  )
}
