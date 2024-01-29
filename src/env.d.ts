/// <reference path="../.astro/types.d.ts" />
/// <reference types="../.astro/types" />
/// <reference types="astro/client" />
/// <reference types="vite-plugin-glsl/ext" />

type IsNeg<T extends number> = `${T}` extends `-${string}` ? true : false
