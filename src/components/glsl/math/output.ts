import { error, ok } from "../../result"
import { optimize } from "./optimize"
import { parse, type Tree } from "./parse"

export function treeToGLSL(tree: Tree): string {
  if (tree.type == "number") {
    return `vec2(${tree.value[0]}, ${tree.value[1]})`
  }

  if (tree.type == "constant") {
    if (tree.name == "iter") {
      return "vec2(i,0)"
    }

    return tree.name
  }

  if (tree.type == "unary-fn") {
    return `cx_${tree.name}(${treeToGLSL(tree.arg)})`
  }

  if (tree.type == "binary-fn") {
    switch (tree.name) {
      case "+":
      case "-":
        return `(${treeToGLSL(tree.left)}) ${tree.name} (${treeToGLSL(
          tree.right,
        )})`
      case "*":
      case "**":
        return `cx_mult(${treeToGLSL(tree.left)}, ${treeToGLSL(tree.right)})`
      case "#":
        return `(${treeToGLSL(tree.left)}) * (${treeToGLSL(tree.right)})`
      case "/":
        return `cx_div(${treeToGLSL(tree.left)}, ${treeToGLSL(tree.right)})`
      case "^":
        return `cx_pow(${treeToGLSL(tree.left)}, ${treeToGLSL(tree.right)})`
      case "|":
        return `(u_dual ? ${treeToGLSL(tree.right)} : ${treeToGLSL(
          tree.right,
        )})`
    }

    // @ts-expect-error nothing should reach here
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
