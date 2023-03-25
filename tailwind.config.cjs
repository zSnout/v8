const typography = require("@tailwindcss/typography")
const containerQueries = require("@tailwindcss/container-queries")

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      customColors: {
        "z-bg-body": "var(--z-bg-body)",
        "z-bg-body-partial": "var(--z-bg-body-partial)",
        "z-bg-body-selected": "var(--z-bg-body-selected)",
        "z-bg-field": "var(--z-bg-field)",
        "z-bg-theme-switcher": "var(--z-bg-theme-switcher)",

        "z-border": "var(--z-border)",
        "z-border-focus": "var(--z-border-focus)",
        "z-border-separator": "var(--z-border-separator)",

        "z-ring-focus": "var(--z-ring-focus)",

        "z-text": "var(--z-text)",
        "z-text-link": "var(--z-text-link)",
        "z-text-heading": "var(--z-text-heading)",
        "z-text-subtitle": "var(--z-text-subtitle)",
      },
      colors: ({ theme }) => ({
        ...theme("customColors"),
        slate: {
          // Slightly darker than normal slate.100
          100: "#ecf1f7",
        },
      }),

      backgroundColor: {
        "z-body": "var(--z-bg-body)",
        "z-body-partial": "var(--z-bg-body-partial)",
        "z-body-selected": "var(--z-bg-body-selected)",
        "z-field": "var(--z-bg-field)",
        "z-theme-switcher": "var(--z-bg-theme-switcher)",
      },
      borderColor: {
        z: "var(--z-border)",
        "z-focus": "var(--z-border-focus)",
        "z-separator": "var(--z-border-separator)",
      },
      iconStrokeColor: {
        z: "var(--z-icon-stroke)",
      },
      outlineColor: {
        z: "var(--z-border)",
        "z-focus": "var(--z-border-focus)",
      },
      ringColor: {
        "z-focus": "var(--z-ring-focus)",
      },
      textColor: {
        z: "var(--z-text)",
        "z-link": "var(--z-text-link)",
        "z-heading": "var(--z-text-heading)",
        "z-subtitle": "var(--z-text-subtitle)",
      },

      borderRadius: {
        sm: "0.25rem",
      },
      rotate: {
        60: "60deg",
      },
      spacing: {
        4.5: "1.125rem",
      },
    },
  },
  plugins: [
    typography(),
    containerQueries,

    /** @type {import("tailwindcss/types/config").PluginCreator} */
    ({ addVariant, addUtilities, matchUtilities, theme }) => {
      addVariant("xs", "@media (min-width: 400px)")

      addVariant(
        "prose-details",
        '& :is(:where(details):not(:where([class~="not-prose"] *)))',
      )

      addVariant(
        "prose-summary",
        '& :is(:where(summary):not(:where([class~="not-prose"] *)))',
      )

      addUtilities({
        ".aspect-open-graph": {
          "aspect-ratio": "40 / 21",
        },
      })

      matchUtilities(
        {
          "icon-stroke"(value) {
            return {
              "--icon-stroke": value,
            }
          },
        },
        {
          type: "color",
          values: {
            ...theme("iconStrokeColor"),
            ...theme("customColors"),
          },
        },
      )

      matchUtilities({
        "transition-and"(value) {
          return {
            "transition-property":
              "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, " +
              value,
            "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
            "transition-duration": "150ms",
          }
        },
      })
    },
  ],
}
