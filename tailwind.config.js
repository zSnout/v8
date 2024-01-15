import containerQueries from "@tailwindcss/container-queries"
import typography from "@tailwindcss/typography"
import { zSnoutTheme } from "@zsnout/tailwind"

/** @type {import("tailwindcss").Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      rotate: { 60: "60deg" },
      spacing: { 4.5: "1.125rem" },
      fontFamily: {
        sans: 'ui-sans-serif, system-ui, var(--font-sp), sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        serif:
          'ui-serif, Georgia, Cambria, "Times New Roman", Times, var(--font-sp), serif',
        mono: 'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", var(--font-sp), monospace',
      },
    },
  },
  plugins: [
    typography(),
    containerQueries,
    zSnoutTheme(),

    /** @type {import("tailwindcss/types/config").PluginCreator} */
    ({ addVariant, matchUtilities, matchVariant, theme }) => {
      addVariant("xs", "@media (min-width: 400px)")

      addVariant("scrollbar", "&::-webkit-scrollbar")

      addVariant(
        "prose-details",
        '& :is(:where(details):not(:where([class~="not-prose"] *)))',
      )

      addVariant(
        "prose-summary",
        '& :is(:where(summary):not(:where([class~="not-prose"] *)))',
      )

      matchVariant("child", (value) => `&:nth-child(${value})`)

      matchUtilities({
        "z-quiz"(value) {
          const [color, index] = value.split(",")

          return {
            [`&:nth-child(${index})`]: {
              "border-bottom-color": theme(`colors.${color}.700`),
              "background-color": theme(`colors.${color}.500`),
            },
          }
        },
      })
    },
  ],
}
