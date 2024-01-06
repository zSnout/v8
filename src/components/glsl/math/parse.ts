import { error, ok, Result } from "../../result"
import type { Complex } from "./complex"
import { createTokenizer } from "./tokenize"

export type Operator = "+" | "-" | "*" | "#" | "/" | "^" | "**"

export type UnaryFunction =
  | "sin"
  | "cos"
  | "tan"
  | "exp"
  | "log"
  | "abs"
  | "length"
  | "sqr"
  | "cube"
  | "real"
  | "imag"
  | "sign"
  | "angle"

export type Constant =
  | "c"
  | "z"
  | "p"
  | "iter"
  | "u_mouse"
  | "u_slider"
  | "u_time"

export type Token =
  | { type: "left-paren" }
  | { type: "right-paren" }
  | { type: "operator"; name: Operator }
  | { type: "number"; value: Complex }
  | { type: "constant"; name: Constant }
  | { type: "unary-fn"; name: UnaryFunction }

const tokenize = createTokenizer<Token>(
  [/^[$@]/, () => undefined],
  [/^\(/, () => ({ type: "left-paren" })],
  [/^\)/, () => ({ type: "right-paren" })],
  [
    /^(?:sin|cos|tan|exp|log|abs|length|real|imag|sign|angle)/,
    ([match]) => ({ type: "unary-fn", name: match as UnaryFunction }),
  ],
  [/^iter/, () => ({ type: "constant", name: "iter" })],
  [/^i/, () => ({ type: "number", value: [0, 1] })],
  [/^e/, () => ({ type: "number", value: [Math.E, 0] })],
  [/^pi/, () => ({ type: "number", value: [Math.PI, 0] })],
  [/^fx/, () => ({ type: "number", value: [1, -1] })],
  [/^fy/, () => ({ type: "number", value: [-1, 1] })],
  [
    /^[cmpstz]/,
    ([match]) => ({
      type: "constant",
      name: (
        {
          c: "c",
          m: "u_mouse",
          p: "p",
          s: "u_slider",
          t: "u_time",
          z: "z",
        } as const
      )[match as "c" | "m" | "p" | "s" | "t" | "z"],
    }),
  ],
  [/^[-+*#/^]/, ([match]) => ({ type: "operator", name: match as Operator })],
  [
    /^\d+(?:\.\d+)?(?:e[+-]?\d+)?/,
    ([match]) => ({ type: "number", value: [+match, 0] }),
  ],
)

export type PartialTree = Tree | Extract<Token, { type: "operator" }>

export type Tree =
  | { type: "binary-fn"; name: Operator; left: Tree; right: Tree }
  | { type: "unary-fn"; name: UnaryFunction; arg: Tree }
  | { type: "constant"; name: Constant }
  | { type: "number"; value: Complex }

const precedenceMap: Record<Operator, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "#": 2,
  "/": 2,
  "**": 3,
  "^": 4,
}

function toReversePolish(
  tokens: readonly PartialTree[],
): readonly PartialTree[] {
  const output: PartialTree[] = []

  const operatorStack: Extract<Token, { type: "operator" }>[] = []

  let token

  for (const token of tokens) {
    if (token.type != "operator") {
      output.push(token)
      continue
    }

    let o2

    while ((o2 = operatorStack[operatorStack.length - 1])) {
      const level1 = precedenceMap[token.name]
      const level2 = precedenceMap[o2.name]

      if (level1 > level2) {
        break
      }

      operatorStack.pop()
      output.push(o2)
    }

    operatorStack.push(token)
  }

  while ((token = operatorStack.pop())) {
    output.push(token)
  }

  return output
}

function rpnToTree(tokens: readonly PartialTree[]): Tree {
  const stack: Tree[] = []

  for (const token of tokens) {
    if (token.type != "operator") {
      stack.push(token)
      continue
    }

    const right = stack.pop()
    const left = stack.pop()

    if (!right || !left) {
      throw new Error("Invalid placement of operator '" + token.name + "'.")
    }

    stack.push({
      type: "binary-fn",
      name: token.name,
      left,
      right,
    })
  }

  if (stack.length == 0) {
    throw new Error("Unexpected end of input.")
  }

  if (stack.length != 1) {
    throw new Error("Unexpected value.")
  }

  return stack[0]!
}

function untilNextParenthesis(tokens: Token[]): Tree {
  let wasLastTokenAValue = false
  const partialTree: PartialTree[] = []

  while (true) {
    const token = tokens[0]

    if (!token) {
      break
    }

    if (token.type == "right-paren") {
      tokens.shift()
      break
    }

    if (token.type == "operator") {
      if (wasLastTokenAValue) {
        tokens.shift()
        partialTree.push(token)
        wasLastTokenAValue = false
      } else if (token.name == "-") {
        tokens.shift()

        partialTree.push({
          type: "binary-fn",
          name: "-",
          left: {
            type: "number",
            value: [0, 0],
          },
          right: getNext(tokens),
        })

        wasLastTokenAValue = true
      } else if (token.name == "+") {
        tokens.shift()
        wasLastTokenAValue = false
      } else {
        throw new Error("Bad placement of operator '" + token.name + "'.")
      }
    } else {
      if (wasLastTokenAValue) {
        partialTree.push({ type: "operator", name: "**" })
      }

      partialTree.push(getNext(tokens))
      wasLastTokenAValue = true
    }
  }

  if (!wasLastTokenAValue) {
    throw new Error("Unexpected right parenthesis.")
  }

  return rpnToTree(toReversePolish(partialTree))
}

function getNext(tokens: Token[]): Tree {
  const next = tokens.shift()

  if (next == null) {
    throw new Error("Unexpected end of input.")
  }

  if (next.type == "right-paren") {
    throw new Error("Unexpected right parenthesis.")
  }

  if (next.type == "operator") {
    if (next.name == "-") {
      return {
        type: "binary-fn",
        name: "-",
        left: { type: "number", value: [0, 0] },
        right: getNext(tokens),
      }
    }

    if (next.name != "+") {
      throw new Error("Unexpected operator.")
    }
  }

  if (next.type == "constant" || next.type == "number") {
    let result: Tree = next
    let token: Token | undefined

    while ((token = tokens[0])) {
      if (token.type == "constant" || token.type == "number") {
        if (tokens[1]?.type != "operator" || tokens[1].name == "^") {
          break
        }

        tokens.shift()

        result = {
          type: "binary-fn",
          name: "**",
          left: result,
          right: token,
        }
      } else {
        break
      }
    }

    return result
  }

  if (next.type == "unary-fn") {
    return {
      type: "unary-fn",
      name: next.name,
      arg: getNext(tokens),
    }
  }

  if (next.type == "left-paren") {
    return untilNextParenthesis(tokens)
  }

  throw new Error("Unexpected token type.")
}

function tokensToTree(_tokens: readonly Token[]): Result<Tree> {
  try {
    const tokens = _tokens.slice()
    tokens.push({ type: "right-paren" })

    return ok(untilNextParenthesis(tokens))
  } catch (err) {
    return error(err)
  }
}

export function parse(source: string): Result<Tree> {
  const tokens = tokenize(source)

  if (!tokens) {
    return error("Unknown token found.")
  }

  return tokensToTree(tokens)
}
