import { error, ok } from "../../result"
import { optimize } from "./optimize"
import { parse, type Tree } from "./parse"

export function treeToGLSL(tree: Tree): string {
  if (tree.type == "number") {
    return `vec2(${tree.value[0]}, ${tree.value[1]})`
  }

  if (tree.type == "constant") {
    return tree.name
  }

  if (tree.type == "unary-fn") {
    return `cx_${tree.name}(${treeToGLSL(tree.arg)})`
  }

  if (tree.type == "binary-fn") {
    if (tree.name == "+" || tree.name == "-") {
      return `(${treeToGLSL(tree.left)}) ${tree.name} (${treeToGLSL(
        tree.right,
      )})`
    }

    if (tree.name == "#") {
      return `(${treeToGLSL(tree.left)}) * (${treeToGLSL(tree.right)})`
    }

    if (tree.name == "*" || tree.name == "**") {
      return `cx_mult(${treeToGLSL(tree.left)}, ${treeToGLSL(tree.right)})`
    }

    if (tree.name == "/") {
      return `cx_div(${treeToGLSL(tree.left)}, ${treeToGLSL(tree.right)})`
    }

    if (tree.name == "^") {
      return `cx_pow(${treeToGLSL(tree.left)}, ${treeToGLSL(tree.right)})`
    }

    throw new Error("Unknown operator: '" + tree.name + "'.")
  }

  throw new Error("Unknown tree type: '" + tree + "'.")
}

export function textToGLSL(source: string) {
  try {
    const result = parse(source)

    if (!result.ok) {
      return result
    }

    return ok(treeToGLSL(optimize(result.value)))
  } catch (err) {
    return error(err)
  }
}
