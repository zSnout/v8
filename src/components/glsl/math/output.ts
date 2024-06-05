import { MathError, parseLatex, type Node } from "@/mathquill/parse"
import { Result, error, ok } from "../../result"
import type { Vec2 } from "../types"
import { optimize } from "./optimize"
import { Constant, Operator, UnaryFunction, parse, type Tree } from "./parse"

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
    if (tree.name == "+") {
      return treeToGLSL(tree.arg)
    }
    if (tree.name == "-") {
      return `-(${treeToGLSL(tree.arg)})`
    }
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
  "ln",
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
  frac: "/",
  "/": "/",
  odot: "#",
  "^": "^",
  dual: "|",
}

export function nodeToTree(node: Node): Tree {
  switch (node.type) {
    case "n":
      return { type: "number", value: [+node.value, 0] }
    case "v":
      if (node.name == "i") {
        return { type: "number", value: [0, 1] }
      } else if (node.name == "e") {
        return { type: "number", value: [Math.E, 0] }
      } else if (node.name == "π") {
        return { type: "number", value: [Math.PI, 0] }
      } else if (node.name == "fx") {
        return { type: "number", value: [1, -1] }
      } else if (node.name == "fy") {
        return { type: "number", value: [-1, 1] }
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
        return {
          type: "unary-fn",
          name: "length",
          arg: nodeToTree(node.contents),
        }
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
      } else if (node.op == "unsign") {
        return {
          type: "unary-fn",
          name: "abs",
          arg: nodeToTree(node.contents),
        }
      } else if (node.op == "log") {
        return {
          type: "unary-fn",
          name: "log10",
          arg: nodeToTree(node.contents),
        }
      } else if (node.op == "frozenmouse" || node.op == "frozentime") {
        const symbol = node.op == "frozenmouse" ? "$" : "@"
        const tree = nodeToTree(node.contents)
        Object.assign(tree, { __symbol: symbol })
        return tree
      }
      {
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
            coprod: "coprod notation",
            lim: "limits",
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

function write(value: number): string {
  let output = value.toFixed(12)

  while (output.endsWith("0")) {
    output = output.slice(0, -1)
  }

  if (output.endsWith(".")) {
    output = output.slice(0, -1)
  }

  return output
}

const enum Precedence {
  Leaf,
  Exponentiation,
  TightImplicitMultiplication,
  UnaryFunction,
  Multiplication,
  Addition,
}

export function treeToLatex(tree: Tree): {
  value: string
  precedence: Precedence
} {
  if (
    "__symbol" in tree &&
    typeof tree.__symbol == "string" &&
    (tree.__symbol == "$" || tree.__symbol == "@")
  ) {
    const { __symbol, ...next } = tree
    const { value } = treeToLatex(next)
    const op = __symbol == "$" ? "\\frozenmouse" : "\\frozentime"
    return { value: `${op}{${value}}`, precedence: Precedence.Leaf }
  }

  switch (tree.type) {
    case "number":
      if (tree.value[0] == 1 && tree.value[1] == -1) {
        return { value: `\\operatorname{fx}`, precedence: Precedence.Leaf }
      }

      if (tree.value[0] == -1 && tree.value[1] == 1) {
        return { value: `\\operatorname{fy}`, precedence: Precedence.Leaf }
      }

      if (tree.value[0] == 0 && tree.value[1] == 1) {
        return { value: `i`, precedence: Precedence.Leaf }
      }

      if (tree.value[0] == Math.E && tree.value[1] == 0) {
        return { value: `e`, precedence: Precedence.Leaf }
      }

      if (tree.value[0] == Math.PI && tree.value[1] == 0) {
        return { value: `\\pi `, precedence: Precedence.Leaf }
      }

      if (tree.value[0] && tree.value[1]) {
        const a = write(tree.value[0])
        let b = write(tree.value[1])
        if (b[0] != "-") {
          b = "+" + b
        }
        return { value: `${a}${b}i`, precedence: Precedence.Addition }
      } else if (tree.value[1]) {
        const written = write(tree.value[1])
        return {
          value: written + "i",
          precedence: written.startsWith("-")
            ? Precedence.UnaryFunction
            : Precedence.TightImplicitMultiplication,
        }
      } else {
        const written = write(tree.value[0])
        return {
          value: written,
          precedence: written.startsWith("-")
            ? Precedence.UnaryFunction
            : Precedence.Leaf,
        }
      }
    case "constant":
      return {
        value: {
          c: "c",
          z: "z",
          p: "p",
          iter: "\\operatorname{iter}",
          u_mouse: "m",
          u_slider: "s",
          u_time: "t",
        }[tree.name],
        precedence: Precedence.Leaf,
      }
    case "unary-fn": {
      const { value, precedence } = treeToLatex(tree.arg)

      if (tree.name == "length") {
        return { value: `\\left|${value}\\right|`, precedence: Precedence.Leaf }
      }

      if (tree.name == "sqr" || tree.name == "cube") {
        const arg =
          precedence < Precedence.Exponentiation
            ? value
            : `\\left(${value}\\right)`

        return {
          value: `${arg}^{${tree.name == "sqr" ? "2" : "3"}}`,
          precedence: Precedence.Exponentiation,
        }
      }

      const arg =
        precedence <= Precedence.UnaryFunction
          ? value
          : `\\left(${value}\\right)`

      const fn = {
        sin: "\\sin ",
        cos: "\\cos ",
        tan: "\\tan ",
        exp: "\\exp ",
        log10: "\\log ",
        ln: "\\ln ",
        real: "\\operatorname{real}",
        imag: "\\operatorname{imag}",
        sign: "\\operatorname{sign}",
        angle: "\\operatorname{angle}",
        "+": "+",
        "-": "-",
        abs: "\\operatorname{unsign}",
      }[tree.name]

      return {
        value: `${fn}${arg}`,
        precedence: Precedence.UnaryFunction,
      }
    }
    case "binary-fn": {
      const { value: a, precedence: pa } = treeToLatex(tree.left)
      const { value: b, precedence: pb } = treeToLatex(tree.right)

      if (tree.name == "*" || tree.name == "**") {
        if (
          pa <= Precedence.TightImplicitMultiplication &&
          pb <= Precedence.TightImplicitMultiplication
        ) {
          return {
            value: `${a}${b}`,
            precedence: Precedence.TightImplicitMultiplication,
          }
        }

        if (pa <= Precedence.TightImplicitMultiplication) {
          return {
            value: `${a}\\left(${b}\\right)`,
            precedence: Precedence.TightImplicitMultiplication,
          }
        }

        if (pb <= Precedence.TightImplicitMultiplication) {
          return {
            value: `\\left(${a}\\right)${b}`,
            precedence: Precedence.TightImplicitMultiplication,
          }
        }

        if (
          pa <= Precedence.Multiplication &&
          pb <= Precedence.Multiplication
        ) {
          return {
            value: `${a}\\cdot ${b}`,
            precedence: Precedence.Multiplication,
          }
        }

        if (pa <= Precedence.Multiplication) {
          return {
            value: `${a}\\cdot\\left(${b}\\right)`,
            precedence: Precedence.Multiplication,
          }
        }

        if (pb <= Precedence.Multiplication) {
          return {
            value: `\\left(${a}\\right)\\cdot ${b}`,
            precedence: Precedence.Multiplication,
          }
        }

        return {
          value: `\\left(${a}\\right)\\left(${b}\\right)`,
          precedence: Precedence.TightImplicitMultiplication,
        }
      }

      if (tree.name == "^") {
        if (pa < Precedence.Exponentiation) {
          return { value: `${a}^{${b}}`, precedence: Precedence.Exponentiation }
        }

        return {
          value: `\\left(${a}\\right)^{${b}}`,
          precedence: Precedence.Exponentiation,
        }
      }

      if (tree.name == "/") {
        return { value: `\\frac{${a}}{${b}}`, precedence: Precedence.Leaf }
      }

      if (tree.name == "|") {
        return { value: `\\dual{${a}}{${b}}`, precedence: Precedence.Leaf }
      }

      if (tree.name == "#") {
        if (
          pa <= Precedence.Multiplication &&
          pb <= Precedence.Multiplication
        ) {
          return {
            value: `${a}\\odot ${b}`,
            precedence: Precedence.Multiplication,
          }
        }

        if (pa <= Precedence.Multiplication) {
          return {
            value: `${a}\\odot\\left(${b}\\right)`,
            precedence: Precedence.Multiplication,
          }
        }

        if (pb <= Precedence.Multiplication) {
          return {
            value: `\\left(${a}\\right)\\odot ${b}`,
            precedence: Precedence.Multiplication,
          }
        }

        return {
          value: `\\left(${a}\\right)\\odot\\left(${b}\\right)`,
          precedence: Precedence.Multiplication,
        }
      }

      if (pb < Precedence.Addition) {
        return {
          value: `${a}${tree.name}${b}`,
          precedence: Precedence.Addition,
        }
      }

      return {
        value: `${a}${tree.name}\\left(${b}\\right)`,
        precedence: Precedence.Addition,
      }
    }
  }
}

export function latexToGLSL(latex: string): Result<string> {
  try {
    const node = parseLatex(latex)
    if (!node.ok) {
      return node
    }
    const tree = nodeToTree(node.value)
    return ok(treeToGLSL(tree))
  } catch (err) {
    return error(err)
  }
}

export function treeHasSlider(tree: Tree): boolean {
  switch (tree.type) {
    case "number":
      return false
    case "binary-fn":
      return treeHasSlider(tree.left) || treeHasSlider(tree.right)
    case "unary-fn":
      return treeHasSlider(tree.arg)
    case "constant":
      return tree.name == "u_slider"
  }
}

export function nodeHasUnfrozenMouseTime(node: Node): boolean {
  switch (node.type) {
    case "n":
      return false
    case "v":
      return node.name == "m" || node.name == "t"
    case "bracket":
    case "group":
    case "unary":
      return nodeHasUnfrozenMouseTime(node.contents)
    case "big":
      return (
        nodeHasUnfrozenMouseTime(node.contents) ||
        nodeHasUnfrozenMouseTime(node.top) ||
        nodeHasUnfrozenMouseTime(node.bottom)
      )
    case "binary":
      return (
        nodeHasUnfrozenMouseTime(node.a) || nodeHasUnfrozenMouseTime(node.b)
      )
  }
}

export function unfreeze(node: Node): Node {
  switch (node.type) {
    case "n":
    case "v":
      return node
    case "bracket":
    case "group":
    case "unary":
      if (
        node.type == "unary" &&
        (node.op == "frozenmouse" || node.op == "frozentime")
      ) {
        return {
          type: "v",
          name: node.op == "frozenmouse" ? "m" : "t",
        }
      } else {
        return { ...node, contents: unfreeze(node.contents) }
      }
    case "big":
      return {
        ...node,
        contents: unfreeze(node.contents),
        top: unfreeze(node.top),
        bottom: unfreeze(node.bottom),
      }
    case "binary":
      return {
        ...node,
        a: unfreeze(node.a),
        b: unfreeze(node.b),
      }
  }
}

export function numberToNode(value: number): Node {
  const str = write(value)

  if (str.startsWith("-")) {
    return {
      type: "unary",
      op: "-",
      contents: { type: "n", value: str.slice(1) },
    }
  } else {
    return { type: "n", value: str }
  }
}

export function complexToNode(real: number, imag: number): Node {
  const i = write(imag)

  return {
    type: "binary",
    op: i.startsWith("-") ? "-" : "+",
    a: numberToNode(real),
    b: {
      type: "binary",
      op: "implicit_mult",
      a: { type: "n", value: i.startsWith("-") ? i.slice(1) : i },
      b: { type: "v", name: "i" },
    },
  }
}

export function freeze(node: Node, mouse: Vec2, time: number): Node {
  switch (node.type) {
    case "n":
    case "v":
      if (node.type == "v" && node.name == "m") {
        return {
          type: "unary",
          op: "frozenmouse",
          contents: complexToNode(mouse[0], mouse[1]),
        }
      }
      if (node.type == "v" && node.name == "t") {
        return {
          type: "unary",
          op: "frozentime",
          contents: numberToNode(time),
        }
      }
      return node
    case "bracket":
    case "group":
    case "unary":
      return { ...node, contents: freeze(node.contents, mouse, time) }

    case "big":
      return {
        ...node,
        contents: freeze(node.contents, mouse, time),
        top: freeze(node.top, mouse, time),
        bottom: freeze(node.bottom, mouse, time),
      }
    case "binary":
      return {
        ...node,
        a: freeze(node.a, mouse, time),
        b: freeze(node.b, mouse, time),
      }
  }
}
