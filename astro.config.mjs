import mdx from "@astrojs/mdx"
import solidJs from "@astrojs/solid-js"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import nesting from "tailwindcss/nesting"
import glsl from "vite-plugin-glsl"

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs(),
    mdx(),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
  ],
  site: "https://v8.zsnout.com/",
  vite: {
    css: {
      postcss: {
        plugins: [nesting],
      },
    },
    plugins: [
      glsl({
        compress: true,
      }),
    ],
  },
})
