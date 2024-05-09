import { binary } from "./complex"
import type { Tree } from "./parse"

export function optimize(tree: Tree): Tree {
  if (tree.type == "number" || tree.type == "constant") {
    return tree
  }

  if (tree.type == "unary-fn") {
    const arg = optimize(tree.arg)

    return {
      type: "unary-fn",
      name: tree.name,
      arg,
    }
  }

  const left = optimize(tree.left)
  const right = optimize(tree.right)

  if (tree.name == "|") {
    return {
      type: "binary-fn",
      name: "|",
      left,
      right,
    }
  }

  if (left.type == "number" && right.type == "number") {
    return {
      type: "number",
      value: binary[tree.name](left.value, right.value),
    }
  }

  if (tree.name == "^" && right.type == "number" && right.value[1] == 0) {
    if (right.value[0] == 1) {
      return left
    }

    if (right.value[0] == 2) {
      return optimize({
        type: "unary-fn",
        name: "sqr",
        arg: left,
      })
    }

    if (right.value[0] == 3) {
      return optimize({
        type: "unary-fn",
        name: "cube",
        arg: left,
      })
    }
  }

  return {
    type: "binary-fn",
    name: tree.name,
    left,
    right,
  }
}
