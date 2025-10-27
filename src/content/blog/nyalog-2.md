---
category: code
title: Type Systems | project nya Devlog 2
description:
excerpt: todo
imageAlt: todo
draft: true
published: 2025-10-27
---

I have been working on a custom programming language for my latest application,
[project nya](https://nya.zsnout.com). My decisions for its expression language
and type system have been informed through trial-and-error of writing tens of
compilers, and I believe the current language is a good stepping stone towards
the 3rd version of project nya's backend.

The latest language, nyalang9 LIR, has a rather unique type system, with a small
amount of core types and very few syntactical constructs to use them. Yet, I
think it's perfect for the use cases I envision.

## The system itself

First off, this is an intermediate representation, not a language designed for
human typing. As such, its constructs are needlessly verbose and impractical.
It's designed for a compiler, not a person. This means there may exist excessive
quantities of type annotations.

Second, the type system is built for a great many targets, so its primary
feature is extern types, types which are defined by the specific compiler rather
than the language. These might be DOM elements in JS, or textures in GLSL.
Technically, our language only needs extern types, but it's helpful to not force
compilers to do all the heavy lifting of type construction, and the point of an
IR is to let higher-level languages easily translate into it.

With that, we move onto our first compound type: the heterogeneous tuple. This
is equivalent to structs from various languages, but it is anonymous: types do
not inherently have names in nyalang9 (aside from extern types).

For instance, assuming `23` is an `int` and `true` is a `bool` (assume these are
extern types for now), we have `(23, true)` of type `(int, bool)`. This means
that given an `f64` extern type, we get `Complex` for free: it's just
`(f64, f64)`.

Seeing how we can construct a `(int, bool)`, we should also have a way to
deconstruct it, via `tuple.index` syntax.

For geometry, another useful type is `Line | Circle`, a union. We could
represent it as `(bool, Line, Circle)` (the `bool` tells us if it's a `Line` or
a `Circle`), and leave one of the members uninitialized when not in use, but
that requires the IR to be able to construct uninitialized values, which could
lead to other hazards. So instead, we have a tagged union type
`union(Line, Circle)`, which either remembers "I'm the line `l`", or "I'm the
circle `c`". The compiler can then choose to represent it naïvely, or use a more
specialized representation (JS uses `{ k: variant_index, v: variant_data }`, for
instance).

To use such a type, we need new expressions. For constructing a union, we have
`union(Ty.index = data)` (e.g. `union(union(int, bool).1 = true)` to initialize
a `union(int, bool)`'s `bool` slot with `true`. To use a union, we have a
`match` construct:

```rs
// assume `a` is a `union(int, ())`

match a {
  .0(b) => b,
  .1(c) => 0,
}
```

Technically, all types can be represented in terms of these now. `bool` is just
`union((), ())`. But that's silly, and it's nice to have a `bool` builtin which
more clearly matches native `bool` types in layout. So we introduce `bool`.
