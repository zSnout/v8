/// <reference path="../.astro/types.d.ts" />
/// <reference types="../.astro/types" />
/// <reference types="astro/client" />
/// <reference types="vite-plugin-glsl/ext" />

declare module "absurd-sql"
declare module "absurd-sql/dist/indexeddb-backend"
declare module "absurd-sql/dist/indexeddb-main-thread"
declare module "core-js/proposals/explicit-resource-management"

declare module "../node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-bundler-friendly.mjs" {
  export * from "@sqlite.org/sqlite-wasm"
}
