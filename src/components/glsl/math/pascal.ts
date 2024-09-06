import { error, ok, type Result } from "@/components/result"
import type { Node } from "@/mathquill/parse"

function toJs(node: Node, vlist: readonly string[]): string {
  switch (node.type) {
    case "n": {
      if (/^\d+$/.test(node.value)) {
        return node.value + "n"
      } else if (/^\d+(?:\.\d+)?$/.test(node.value)) {
        throw new Error("This calculator does not support decimals.")
      } else {
        throw new Error(`Invalid number ${node.value}.`)
      }
    }
    case "v": {
      if (vlist.includes(node.name)) {
        return node.name
      } else {
        throw new Error(`Undefined variable ${node.name}.`)
      }
    }
    case "bracket":
      switch (node.bracket) {
        case "()":
          return toJs(node.contents, vlist)
        case "[]":
          throw new Error("This calculator does not support square brackets.")
        case "{}":
          throw new Error("This calculator does not support curly brackets.")
        case "||":
          return `((q)=>q<0n?-q:q)(${toJs(node.contents, vlist)})`
        case "<>":
          throw new Error("This calculator does not support angle brackets.")
        case "||||":
          throw new Error("This calculator does not support determinants.")
      }
    case "group":
      return toJs(node.contents, vlist)
    case "unary":
      switch (node.op) {
        case "abs":
          return `((q)=>q<0n?-q:q)(${toJs(node.contents, vlist)})`
        case "-":
          return `-(${toJs(node.contents, vlist)})`
        case "+":
          return toJs(node.contents, vlist)
        case "neg":
          return `!(${toJs(node.contents, vlist)})`
        case "sqrt":
        case "unsign":
        case "!":
        case "logb":
        case "logb^2":
        case "sin":
        case "arcsin":
        case "sinh":
        case "arcsinh":
        case "cos":
        case "arccos":
        case "cosh":
        case "arccosh":
        case "tan":
        case "arctan":
        case "tanh":
        case "arctanh":
        case "csc":
        case "arccsc":
        case "csch":
        case "arccsch":
        case "sec":
        case "arcsec":
        case "sech":
        case "arcsech":
        case "cot":
        case "arccot":
        case "coth":
        case "arccoth":
        case "sin^2":
        case "arcsin^2":
        case "sinh^2":
        case "arcsinh^2":
        case "cos^2":
        case "arccos^2":
        case "cosh^2":
        case "arccosh^2":
        case "tan^2":
        case "arctan^2":
        case "tanh^2":
        case "arctanh^2":
        case "csc^2":
        case "arccsc^2":
        case "csch^2":
        case "arccsch^2":
        case "sec^2":
        case "arcsec^2":
        case "sech^2":
        case "arcsech^2":
        case "cot^2":
        case "arccot^2":
        case "coth^2":
        case "arccoth^2":
        case "length":
        case "log":
        case "log^2":
        case "ln":
        case "ln^2":
        case "exp":
        case "exp^2":
        case "real":
        case "imag":
        case "sign":
        case "angle":
        case "pm":
        case "mp":
        case "frozenmouse":
        case "frozentime":
          throw new Error(
            `This calculator does not support the ${node.op} operator.`,
          )
      }
    case "big":
      throw new Error(
        `This calculator does not support the ${node.op} operator.`,
      )
    case "binary":
      switch (node.op) {
        case "+":
          return `(${toJs(node.a, vlist)}) + (${toJs(node.b, vlist)})`
        case "-":
          return `(${toJs(node.a, vlist)}) - (${toJs(node.b, vlist)})`
        case "*":
        case "times":
        case "cdot":
        case "implicit_mult":
          return `(${toJs(node.a, vlist)}) * (${toJs(node.b, vlist)})`
        case "/":
        case "div":
        case "frac":
          return `(${toJs(node.a, vlist)}) / (${toJs(node.b, vlist)})`
        case "^":
          return `(${toJs(node.b, vlist)}) ** (${toJs(node.a, vlist)})`
        case "=":
          return `(${toJs(node.a, vlist)}) == (${toJs(node.b, vlist)})`
        case "<":
          return `(${toJs(node.a, vlist)}) < (${toJs(node.b, vlist)})`
        case ">":
          return `(${toJs(node.a, vlist)}) > (${toJs(node.b, vlist)})`
        case "le":
          return `(${toJs(node.a, vlist)}) <= (${toJs(node.b, vlist)})`
        case "ge":
          return `(${toJs(node.a, vlist)}) >= (${toJs(node.b, vlist)})`
        case "ne":
          return `(${toJs(node.a, vlist)}) != (${toJs(node.b, vlist)})`
        case "mod":
          return `(${toJs(node.a, vlist)}) % (${toJs(node.b, vlist)})`
        case "and":
        case "wedge":
          return `(${toJs(node.a, vlist)}) && (${toJs(node.b, vlist)})`
        case "or":
        case "vee":
          return `(${toJs(node.a, vlist)}) || (${toJs(node.b, vlist)})`
        case "nthroot":
        case "%":
        case "logb":
        case "logb^2":
        case "with":
        case "pm":
        case "mp":
        case "binom":
        case "dual":
        case "_":
        case "odot":
        case "to":
        case "for":
        case ",":
          throw new Error(`The ${node.op} operator is not supported.`)
      }
  }
}

export type Compiled<T extends string> = (
  opts: Record<T, bigint | boolean>,
) => unknown

export function compile<const T extends readonly string[]>(
  node: Node,
  vlist: T,
): Result<Compiled<T[number]>> {
  try {
    return ok(
      new Function(
        `{${vlist.join(",")}}`,
        `return (${toJs(node, vlist)})`,
      ) as any,
    )
  } catch (err) {
    return error(err)
  }
}
