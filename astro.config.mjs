// @ts-check

import mdx from "@astrojs/mdx"
import solidJs from "@astrojs/solid-js"
import tailwind from "@astrojs/tailwind"
import AstroPWA from "@vite-pwa/astro"
import { defineConfig } from "astro/config"
import rehypeKatex from "rehype-katex"
import remarkMath from "remark-math"
import nesting from "tailwindcss/nesting"
import glsl from "vite-plugin-glsl"
import tsconfigPaths from "vite-tsconfig-paths"

// @ts-expect-error typescript isn't smart enough and ts in a mjs file is stupid
Promise.withResolvers ??= () => {
  let resolve
  let reject
  return {
    promise: new Promise((a, b) => {
      resolve = a
      reject = b
    }),
    resolve,
    reject,
  }
}

// https://astro.build/config
export default defineConfig({
  integrations: [
    solidJs(),
    // @ts-expect-error ughhh
    mdx(),
    tailwind({ applyBaseStyles: false }),
    AstroPWA({
      srcDir: "src/learn/lib",
      filename: "sw.ts",
      strategies: "injectManifest",
      injectRegister: false,
      manifest: false,
      injectManifest: {
        injectionPoint: undefined,
      },
      scope: "/learn",
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  markdown: {
    rehypePlugins: [
      // @ts-ignore bad typing
      rehypeKatex,
    ],
    remarkPlugins: [
      // @ts-expect-error bad typing
      remarkMath,
      () => (tree) => {
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
    plugins: [glsl({ compress: true })],
    optimizeDeps: {
      esbuildOptions: { target: "es2022" },
      exclude: ["@sqlite.org/sqlite-wasm", "pyodide"],
    },
    esbuild: { target: "es2022" },
    build: { target: "es2022" },
    worker: {
      format: "es",
      plugins: () => [tsconfigPaths()],
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
})

function escapeHTML(/** @type {string} */ text) {
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
