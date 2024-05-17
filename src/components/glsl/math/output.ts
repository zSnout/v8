import { MathError, type Node } from "@/mathquill/parse"
import { error, ok } from "../../result"
import { optimize } from "./optimize"
import { parse, UnaryFunction, type Tree, Constant, Operator } from "./parse"

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
        return `(dual ? ${treeToGLSL(tree.right)} : ${treeToGLSL(tree.left)})`
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

const NODE_NAME_MAP: Record<string, Constant> = {
  c: "c",
  z: "z",
  p: "p",
  iter: "iter",
  m: "u_mouse",
  s: "u_slider",
  t: "u_time",
}

const UNARY_FUNCTIONS: readonly UnaryFunction[] = [
  "sin",
  "cos",
  "tan",
  "exp",
  "log",
  "abs",
  "length",
  "sqr",
  "cube",
  "real",
  "imag",
  "sign",
  "angle",
  "+",
  "-",
]

const BINARY_FUNCTION_MAP: Record<string, Operator> = {
  "+": "+",
  "-": "-",
  "*": "*",
  cdot: "*",
  times: "*",
  implicit_mult: "**",
  "/": "/",
  "^": "^",
  "#": "#",
  dual: "|",
}

export function nodeToTree(node: Node): Tree {
  switch (node.type) {
    case "n":
      return { type: "number", value: [+node.value, 0] }
    case "v":
      if (node.name == "i") {
        return { type: "number", value: [0, 1] }
      } else if (node.name in NODE_NAME_MAP) {
        return {
          type: "constant",
          name: NODE_NAME_MAP[node.name]!,
        }
      } else {
        throw new MathError(`Unknown variable ${node.name}.`)
      }
    case "bracket":
      if (node.bracket == "()") {
        return nodeToTree(node.contents)
      } else if (node.bracket == "||") {
        return { type: "unary-fn", name: "abs", arg: nodeToTree(node.contents) }
      } else {
        throw new MathError(
          `This calculator does not support ${node.bracket} brackets.`,
        )
      }
    case "group":
      return nodeToTree(node.contents)
    case "unary":
      if (UNARY_FUNCTIONS.includes(node.op as any)) {
        return {
          type: "unary-fn",
          name: node.op as UnaryFunction,
          arg: nodeToTree(node.contents),
        }
      } else {
        throw new MathError(
          `This calculator does not support the ${node.op} function.`,
        )
      }
    case "big":
      throw new MathError(
        `This calculator does not support ${
          {
            sum: "summation notation",
            prod: "product notation",
            int: "integrals",
          }[node.op]
        }.`,
      )
    case "binary":
      if (node.op in BINARY_FUNCTION_MAP) {
        return {
          type: "binary-fn",
          name: BINARY_FUNCTION_MAP[node.op]!,
          left: nodeToTree(node.a),
          right: nodeToTree(node.b),
        }
      } else {
        throw new MathError(
          `This calculator does not support the '${node.op}' operator.`,
        )
      }
  }
}
