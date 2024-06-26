import mdx from "@astrojs/mdx"
import solidJs from "@astrojs/solid-js"
import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import nesting from "tailwindcss/nesting"
import glsl from "vite-plugin-glsl"

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&apos;")
    .replaceAll('"', "&quot;")
}

/** @returns {import("mdast").Content} */
function traverse(/** @type {import("mdast").Content} */ node) {
  if (node.type == "image") {
    if (node.title) {
      return {
        type: "html",
        value: `<figure><img alt="${escapeHTML(
          node.alt || "",
        )}" src="${escapeHTML(node.url)}" /><figcaption>${escapeHTML(
          node.title,
        )}</figcaption></figure>`,
        position: node.position,
      }
    } else {
      return node
    }
  } else if (node.type == "code" && node.lang == "sp") {
    return {
      type: "html",
      position: node.position,
      value:
        "<div class='sp-outer'><div class='sp-inner'>" +
        escapeHTML(node.value) +
        "</div></div>",
    }
  } else if ("children" in node) {
    return {
      ...node,
      children: /** @type {any} */ (node.children.map(traverse)),
    }
  } else {
    return node
  }
}

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
  markdown: {
    rehypePlugins: [rehypeKatex],
    remarkPlugins: [
      remarkMath,
      () => (tree, file) => {
        return {
          ...tree,
          children: tree.children.map(traverse),
        }
      },
    ],
    shikiConfig: { wrap: true },
  },
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
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
    },
    build: {
      target: "esnext",
    },
  },
})
