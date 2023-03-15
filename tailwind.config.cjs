/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      customColors: {
        "z-bg-body": "var(--z-bg-body)",
        "z-bg-body-partial": "var(--z-bg-body-partial)",
        "z-bg-field": "var(--z-bg-field)",

        "z-border": "var(--z-border)",
        "z-border-focus": "var(--z-border-focus)",
        "z-border-separator": "var(--z-border-separator)",

        "z-ring-focus": "var(--z-ring-focus)",

        "z-text": "var(--z-text)",
        "z-text-link": "var(--z-text-link)",
        "z-text-nav-title": "var(--z-text-nav-title)",
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
        "z-field": "var(--z-bg-field)",
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
        "z-nav-title": "var(--z-text-nav-title)",
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
    /** @type {import("tailwindcss/types/config").PluginCreator} */
    ({ addVariant, matchUtilities, theme }) => {
      addVariant("xs", "@media (min-width: 400px)")

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
