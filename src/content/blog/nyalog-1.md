---
category: code
title: DSLs | project nya Devlog 1
description:
excerpt: todo
imageAlt: todo
draft: true
published: 2025-10-27
---

For the last year or so, my main dev project has been
[project nya](https://nya.zsnout.com/), a graphing calculator designed to
outperform Desmos and be extensible enough to support additional features.

## Dual compilation troubles

From the beginning, project nya's goal has been to support compiling Desmos
expressions to JavaScript and GLSL, simultaneously. The reason is fractal
generation—I wanted project nya to be more powerful than
[zSnout's Fractal Explorer](https://v8.zsnout.com/fractal-explorer), which
renders its images on the GPU, making it incredibly performant. But simple
expressions like addition should still run in JavaScript. Hence, dual
compilation.

The first issue with this is that every function has to be implemented
twice—once in JavaScript, and once for GLSL. That's fine for simple functions
like `+`, which are implemented identically, but more complex things like
`atan2` or `gamma` look totally different.

The second issue is that Desmos has a strict type system. Everything is
inferred, and functions are implicitly generic, but it still has a type system.
JavaScript does not have a runtime type system. So we needed to specify types in
a typeless language.

The third issue is that we actually support more targets than dual-compilation:
numbers in JS can either be floating-point or exact rationals, and numbers in
GLSL can either be 32-bit floats, or simulated 64-bit floats. All had to be
implemented separately.

Both of these led to bloated function definitions.

```ts
// ignore the first parameter for now
FN_ARCTAN.add([ty.get("f32"), ty.get("f32")], ty.get("f32"), {
  jsConst(_, y: number, x: number) {
    return Math.atan2(y, x)
  },
  jsExact(_, y: Rational, x: Rational) {
    return new Rational(Math.atan2(y.approx(), x.approx()))
  },
  js(_, y: string, x: string): string {
    return `Math.atan2(${y},${x})`
  },
  glsl(_, y: string, x: string): string {
    return `atan(${y},${x})`
  },
})
```

Functions relating to complex numbers were even worse:

```ts
FN_MUL.add([ty.get("c32"), ty.get("c32")], ty.get("c32"), {
  jsConst(_, a, b) {
    return {
      x: a.x * b.x - a.y * b.y,
      y: a.x * b.y + a.y * b.x,
    }
  },
  js(_, a, b) {
    const aCached = cache(a)
    const bCached = cache(b)
    return `({
      x:${aCached}.x*${bCached}.x-${aCached}.y*${bCached}.y,
      y:${aCached}.x*${bCached}.y+${aCached}.y*${bCached}.x
    })`
  },
  glsl(env, a, b) {
    // that `_` parameter is used to define global functions, to avoid local caches and copies
    env.defineFunction(`
      vec2 complex_mul(vec2 a, vec b) {
        return vec2(
          a.x*b.x-a.y*b.y,
          a.x*b.y+a.y*b.x
        );
      }
    `)
    return `vec2(${a},${b})`
  },
  // other definitions omitted for brevity
})
```

## A new language

I eventually found a solution to both these issues—the creation of a new
programming language designed specifically for project nya. I wrote manual
implementations of builtins like `atan2` like before, but larger functions like
`gamma` and `total` could now have a single canonical interpretation in the
repo, rather than relying on a combination of JS and GLSL which could product
potentially different results. All the complex number functions, too, gained a
much-needed simplicitly rewrite. And I could name functions reasonable things,
like `*` for the multiplication operator.

```rs
struct Complex {
  re: num,
  im: num,
}

fn *(a: Complex, b: Complex) -> Complex {
  Complex {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  } // syntax is rust-inspired, and implicitly returns the last expression
}
```

The trouble, though, came with array functions. We need functions like `total`
to sum all elements in an array, but those can't be directly written in GLSL,
since the underlying array could be variably-sized.

```rs
// what is the type of `a`?
fn total(a: [num; ?]) -> num {
  let mut total = 0;
  for el in a {
    total = total + el;
  }
  total
}
```

Initially, I wanted to use generics. But the existing architecture did not
easily allow me to implement generics, so I just created a type `any [num]`
which means "an array of any length; inline this function anywhere it's used".
Not a great solution, especially seeing how it couldn't be used anywhere except
function parameters.

It also didn't allow me to write matrix types, which were one of project nya's
goals. So although the language is incredibly powerful, it is not powerful
enough.

After my disillusionment with the current architecture, I took to rewriting the
language and compiler. There have been around eight rewrites so far, with
varying levels of complexity, but the main thing I learned is that it's tricky
to do everything at once. Dealing with generics, type-checking, type coercion,
and dual compilation all at once seemed like a bad idea. One version even had
growable arrays, which definitely aren't available in GLSL at all!

So I started on the ninth rewrite, with a minimal language in mind. No generics,
no coercion, no redundant types. The internals of that language, codenamed
nyalang9 LIR for now, will be discussed more in a future post.
