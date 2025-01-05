// TODO: align, piecewise, floor, ceil, &

/**
 * Latex Parsing Steps
 *
 * 1. Parse tokens
 * 2. Parse brackets and latex groups
 * 3. Parse latex commands like \sqrt, \frac, and \sum
 * 4. Parse ^, _, !, and logb
 * 5. Parse tight implicit multiplication (a b)
 * 6. Parse unary prefix operators and logb
 * 7. Parse loose implicit multiplication (sin a cos b)
 * 8. Parse multiplicative level operators
 * 9. Parse contents of big operators
 * 10. Parse additive operators
 * 11. Parse chained comparisons
 * 12. Parse all other operators
 */

type Step1 =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "bracket"; bracket: MathBracket }
  | { type: "group"; bracket: LatexBracket }

type Step2 = Tree<never, never, never, Step2[]>

type Step3 = Tree<
  "sqrt" | "frozenmouse" | "frozentime",
  Big,
  "frac" | "binom" | "dual" | "nthroot"
>

type Step4 = Tree<
  "sqrt" | "!" | "logb" | "logb^2" | "frozenmouse" | "frozentime",
  Big,
  "frac" | "binom" | "dual" | "nthroot" | "^" | "_"
>

type Step5 = Tree<Unary, Big, Binary>

const substitutions: Record<string, string> = Object.freeze({
  square: "□",
  mid: "∣",
  parallel: "∥",
  nparallel: "∦",
  perp: "⟂",
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  phi: "ϕ",
  varphi: "φ",
  epsilon: "ϵ",
  varepsilon: "ε",
  varpi: "ϖ",
  varsigma: "ς",
  vartheta: "ϑ",
  upsilon: "υ",
  digamma: "ϝ",
  varkappa: "ϰ",
  varrho: "ϱ",
  pi: "π",
  lambda: "λ",
  Upsilon: "ϒ",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  forall: "∀",
})

type MathBracket =
  | "("
  | ")"
  | "["
  | "]"
  | "{"
  | "}"
  | "|L"
  | "|R"
  | "||L"
  | "||R"
  | "<"
  | ">"

type LatexBracket = "{" | "}"

type BuildableToken =
  | { type: "op"; name: string; opname: boolean }
  | { type: "n"; value: string }
  | { type: "/" }

const MULTI_LETTER_VARIABLES = Object.freeze(["iter", "fx", "fy", "infty"])

function s1_tokenize(text: string): Step1[] {
  const tokens: Step1[] = []
  let current: BuildableToken | undefined

  function pushCurrent() {
    if (current) {
      if (current.type == "op" && current.name == "langle") {
        tokens.push({ type: "bracket", bracket: "<" })
      } else if (current.type == "op" && current.name == "rangle") {
        tokens.push({ type: "bracket", bracket: ">" })
      } else if (current.type == "op" && current.name == "lVert") {
        tokens.push({ type: "bracket", bracket: "||L" })
      } else if (current.type == "op" && current.name == "rVert") {
        tokens.push({ type: "bracket", bracket: "||R" })
      } else if (current.type == "op") {
        if (MULTI_LETTER_VARIABLES.includes(current.name)) {
          tokens.push({ type: "v", name: current.name })
        } else if (current.name != "left" && current.name != "right") {
          tokens.push({ type: "op", name: current.name })
        }
      } else if (current.type != "/") {
        tokens.push(current)
      }

      current = undefined
    }
  }

  for (const char of text) {
    switch (char) {
      case " ":
      case "\n":
      case "\t":
      case "\r":
        pushCurrent()
        break

      case "\\":
        if (current?.type == "/") {
          tokens.push({ type: "op", name: "\\" })
        } else {
          pushCurrent()
          current = { type: "/" }
        }
        break

      case "{":
      case "}":
        if (current?.type == "/") {
          tokens.push({ type: "bracket", bracket: char })
          current = undefined
        } else {
          if (char == "}" && current?.type == "op" && current.opname) {
            pushCurrent()
          } else {
            pushCurrent()
            tokens.push({ type: "group", bracket: char })
          }
        }
        break

      case "[":
      case "]":
      case "(":
      case ")":
        pushCurrent()
        tokens.push({ type: "bracket", bracket: char })
        break

      case "|":
        if (
          current?.type == "op" &&
          (current.name == "left" || current.name == "right")
        ) {
          const name = current.name
          pushCurrent()
          tokens.push({
            type: "bracket",
            bracket: name == "left" ? "|L" : "|R",
          })
        }
        break

      default:
        if ("0" <= char && char <= "9") {
          if (current?.type == "n") {
            current.value += char
            break
          }

          pushCurrent()
          const prev = tokens[tokens.length - 1]
          if (prev?.type == "op" && prev.name == ".") {
            const prev2 = tokens[tokens.length - 2]
            if (prev2?.type == "n") {
              prev2.value += "." + char
              current = prev2
              tokens.splice(-2, 2)
            } else {
              current = { type: "n", value: "0." + char }
              tokens.splice(-1, 1)
            }
          } else {
            current = { type: "n", value: char }
          }
          break
        }

        if (("a" <= char && char <= "z") || ("A" <= char && char <= "Z")) {
          if (current?.type == "op") {
            current.name += char
            if (current.name in substitutions) {
              tokens.push({ type: "v", name: substitutions[current.name]! })
              current = undefined
            }
            break
          }

          if (current?.type == "/") {
            current = { type: "op", name: char, opname: false }
            break
          }

          pushCurrent()

          const prev = tokens[tokens.length - 1]
          if (prev?.type == "group" && prev.bracket == "{") {
            const prev2 = tokens[tokens.length - 2]
            if (prev2?.type == "op" && prev2.name == "operatorname") {
              tokens.splice(-2, 2)
              current = { type: "op", name: char, opname: true }
              break
            }
          }

          tokens.push({ type: "v", name: char })
          break
        }

        pushCurrent()
        tokens.push({ type: "op", name: char })
        break
    }
  }

  pushCurrent()
  return tokens
}

type DoubleBracket = "()" | "[]" | "{}" | "||" | "<>" | "||||"

type Tree<Unary, Big, Binary, Inner = Node> =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "desmos"; name: string }
  | { type: "bracket"; bracket: DoubleBracket; contents: Inner }
  | { type: "group"; contents: Inner }
  | { type: "unary"; op: Unary; contents: Inner }
  | { type: "big"; op: Big; bottom: Inner; top: Inner; contents: Inner }
  | { type: "binary"; op: Binary; a: Inner; b: Inner }

type GroupTokensResult =
  | { ok: true; tokens: Step2[] }
  | { ok: false; reason: "unmatched latex '}'" }
  | { ok: false; reason: `unmatched math '${MathBracket}'` }
  | { ok: false; reason: "unmatched opening bracket" }
  | { ok: false; reason: "unmatched bracket pair" }

const LEFT_TO_DOUBLE = Object.freeze({
  "(": "()",
  "[": "[]",
  "{": "{}",
  "|L": "||",
  "<": "<>",
  "||L": "||||",
} as const)

const RIGHT_TO_DOUBLE = Object.freeze({
  ")": "()",
  "]": "[]",
  "}": "{}",
  "|R": "||",
  ">": "<>",
  "||R": "||||",
} as const)

function s2_groupTokens(tokens: Step1[]): GroupTokensResult {
  let current: Step2[] = []
  const all: Step2[][] = [current]

  for (const token of tokens) {
    if (token.type == "group") {
      if (token.bracket == "{") {
        const group: Step2[] = []
        current.push({ type: "group", contents: group })
        current = group
        all.push(current)
      } else {
        all.pop()

        current = all[all.length - 1]!
        if (!current) {
          return {
            ok: false,
            reason: "unmatched latex '}'",
          }
        }

        const last = current[current.length - 1]
        if (last?.type != "group") {
          return {
            ok: false,
            reason: "unmatched bracket pair",
          }
        }
      }
    } else if (token.type == "bracket") {
      if (
        token.bracket == "(" ||
        token.bracket == "[" ||
        token.bracket == "{" ||
        token.bracket == "|L" ||
        token.bracket == "<" ||
        token.bracket == "||L"
      ) {
        const group: Step2[] = []
        current.push({
          type: "bracket",
          bracket: LEFT_TO_DOUBLE[token.bracket],
          contents: group,
        })
        current = group
        all.push(current)
      } else {
        all.pop()

        current = all[all.length - 1]!
        if (!current) {
          return {
            ok: false,
            reason: `unmatched math '${token.bracket}'`,
          }
        }

        const last = current[current.length - 1]
        if (
          last?.type != "bracket" ||
          last.bracket != RIGHT_TO_DOUBLE[token.bracket]
        ) {
          return {
            ok: false,
            reason: "unmatched bracket pair",
          }
        }
      }
    } else {
      current.push(token)
    }
  }

  if (all.length != 1) {
    return {
      ok: false,
      reason: "unmatched opening bracket",
    }
  }

  return {
    ok: true,
    tokens: current,
  }
}

export class MathError extends Error {}

export const UNARY_TRIG_FNS = [
  "sin",
  "arcsin",
  "sinh",
  "arcsinh",
  "cos",
  "arccos",
  "cosh",
  "arccosh",
  "tan",
  "arctan",
  "tanh",
  "arctanh",
  "csc",
  "arccsc",
  "csch",
  "arccsch",
  "sec",
  "arcsec",
  "sech",
  "arcsech",
  "cot",
  "arccot",
  "coth",
  "arccoth",
] as const

const TRIG_OPERATORS = Object.freeze(
  UNARY_TRIG_FNS.flatMap((x) => [x, `${x}^2`] as const),
)

const UNARY_OPERATORS = Object.freeze([
  ...TRIG_OPERATORS,
  "log",
  "log^2",
  "ln",
  "ln^2",
  "exp",
  "exp^2",
  "length",
  "real",
  "imag",
  "sign",
  "angle",
  "abs",
  "unsign",
  "neg",
] as const)

type BaseUnaryOperator = (typeof UNARY_OPERATORS)[number]

function parseGroups(tokens: Step2[]): Node {
  const s3 = s3_parseLatexCommands(tokens)
  const s4 = s4_parseSubscriptSuperscriptFactorial(s3)
  const sa = s0_parseImplicitMultiplication(s4)
  const s5 = s5_parseUnaryPrefixes(sa, false)
  const sb = s0_parseImplicitMultiplication(s5)
  const s6 = s6_parseBinaryOperators(sb, MULTIPLICATIVE_OPERATORS, false)
  const s7 = s7_parseBigSymbolContents(s6)
  const s75 = s5_parseUnaryPrefixes(s7, true)
  const s8 = s6_parseBinaryOperators(s75, ADDITIVE_OPERATORS, true)
  const s9 = s9_parseChainedComparisons(s8)
  const s10 = s6_parseBinaryOperators(s9, BOOLEAN_OPERATORS, true)
  const s11 = s6_parseBinaryOperators(s10, BINDING_OPERATORS_A, true)
  const s12 = s6_parseBinaryOperators(s11, BINDING_OPERATORS_B, true)
  const s13 = s6_parseBinaryOperators(s12, [","], true)
  const s14 = toNode(s13)
  return s14
}

function s3_parseLatexCommands(tokens: Step2[]): Step3[] {
  const output: Step3[] = []

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!

    switch (token.type) {
      case "op":
        switch (token.name) {
          case "desmos": {
            const next = tokens[index + 1]
            if (
              !(
                next?.type == "group" &&
                next.contents.length == 1 &&
                next.contents[0]?.type == "v"
              )
            ) {
              throw new MathError(
                "Expected a lone variable name in the 'desmos' block.",
              )
            }
            output.push({ type: "desmos", name: next.contents[0].name })
            index++
            break
          }
          // @ts-expect-error intentional fallthrough
          case "sqrt":
            const next = tokens[index + 1]
            const next2 = tokens[index + 2]
            if (
              next?.type == "bracket" &&
              next.bracket == "[]" &&
              next2?.type == "group"
            ) {
              output.push({
                type: "binary",
                op: "nthroot",
                a: parseGroups(next.contents),
                b: parseGroups(next2.contents),
              })
              index += 2
              break
            }
          case "frozenmouse":
          case "frozentime": {
            const next = tokens[index + 1]
            if (next?.type != "group") {
              throw new MathError(
                `\\${token.name} requires a {...} group after it.`,
              )
            }
            output.push({
              type: "unary",
              op: token.name,
              contents: parseGroups(next.contents),
            })
            index += 1
            break
          }
          case "frac":
          case "binom":
          case "dual": {
            const next = tokens[index + 1]
            const next2 = tokens[index + 2]

            if (next?.type == "group" && next2?.type == "group") {
              output.push({
                type: "binary",
                op: token.name,
                a: parseGroups(next.contents),
                b: parseGroups(next2.contents),
              })
              index += 2
            } else {
              throw new MathError(
                `Expected two {...} groups after \\${token.name}`,
              )
            }

            break
          }
          case "sum":
          case "prod":
          case "coprod":
          case "int": {
            const next1 = tokens[index + 1]
            const next2 = tokens[index + 2]
            const next3 = tokens[index + 3]
            const next4 = tokens[index + 4]

            if (
              next1?.type == "op" &&
              next3?.type == "op" &&
              next1.name == "_" &&
              next3.name == "^" &&
              next2?.type == "group" &&
              next4?.type == "group"
            ) {
              output.push({
                type: "big",
                op: token.name,
                bottom: parseGroups(next2.contents),
                top: parseGroups(next4.contents),
                contents: { type: "v", name: "placeholder" },
              })
              index += 4
            } else if (
              next1?.type == "op" &&
              next3?.type == "op" &&
              next1.name == "^" &&
              next3.name == "_" &&
              next2?.type == "group" &&
              next4?.type == "group"
            ) {
              output.push({
                type: "big",
                op: token.name,
                bottom: parseGroups(next4.contents),
                top: parseGroups(next2.contents),
                contents: { type: "v", name: "placeholder" },
              })
              index += 4
            } else {
              throw new MathError(`Expected _{...}^{...} after \\${token.name}`)
            }
            break
          }
          case "lim": {
            const next1 = tokens[index + 1]
            const next2 = tokens[index + 2]
            if (
              next1?.type == "op" &&
              next1.name == "_" &&
              next2?.type == "group"
            ) {
              output.push({
                type: "big",
                op: "lim",
                top: { type: "v", name: "placeholder" },
                bottom: parseGroups(next2.contents),
                contents: { type: "v", name: "placeholder" },
              })
              index += 2
            } else {
              throw new MathError(`Expected _{...} after \\lim`)
            }
            break
          }
          default:
            output.push(token)
        }
        break
      case "n":
      case "v":
        output.push(token)
        break
      case "bracket":
      case "group":
      case "unary":
        output.push({
          ...token,
          contents: parseGroups(token.contents),
        })
        break
      case "big":
        output.push({
          type: "big",
          op: token.op,
          top: parseGroups(token.top),
          bottom: parseGroups(token.bottom),
          contents: parseGroups(token.contents),
        })
        break
      case "binary":
        output.push({
          ...token,
          a: parseGroups(token.a),
          b: parseGroups(token.b),
        })
        break
    }
  }

  return output
}

function isValue(
  node: Step4,
): node is
  | ({ type: "unary" } & Step4)
  | Exclude<Step4, { type: "big" } | { type: "group" } | { type: "op" }> {
  if (node.type == "unary") {
    return node.op != "logb" && node.op != "logb^2"
  } else {
    return node.type != "big" && node.type != "group" && node.type != "op"
  }
}

function s4_parseSubscriptSuperscriptFactorial(tokens: Step3[]): Step4[] {
  const output: Step4[] = []

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!

    switch (token.type) {
      case "op":
        switch (token.name) {
          case "_":
          case "^": {
            const prev = output[output.length - 1]
            const next = tokens[index + 1]
            let contents: Node | undefined

            if (next?.type == "group") {
              index += 1
              contents = next.contents
            }

            if (!contents) {
              throw new MathError(`Expected {...} group after ${token.name}`)
            }

            if (
              token.name == "^" &&
              prev?.type == "op" &&
              /^[A-Za-z]+$/.test(prev.name)
            ) {
              if (contents.type == "n" && contents.value == "2") {
                prev.name = prev.name + "^2"
                break
              }

              if (
                contents.type == "unary" &&
                contents.op == "-" &&
                contents.contents.type == "n" &&
                contents.contents.value == "1"
              ) {
                prev.name = prev.name + "^-1"
                break
              }
            }

            if (
              token.name == "^" &&
              prev?.type == "unary" &&
              prev.op == "logb" &&
              contents.type == "n" &&
              contents.value == "2"
            ) {
              prev.op = "logb^2"
              break
            }

            if (token.name == "_" && prev?.type == "op" && prev.name == "log") {
              output[output.length - 1] = {
                type: "unary",
                op: "logb",
                contents: contents,
              }
              break
            }

            if (prev && isValue(prev)) {
              output[output.length - 1] = {
                type: "binary",
                op: token.name,
                a: prev,
                b: contents,
              }
              break
            }

            throw new MathError(
              `Invalid ${token.name == "^" ? "exponent" : "subscript"}`,
            )
          }
          case "!": {
            const prev = output[output.length - 1]

            if (prev && isValue(prev)) {
              output[output.length - 1] = {
                type: "unary",
                op: "!",
                contents: prev,
              }
            } else {
              throw new MathError("Invalid factorial.")
            }

            break
          }
          default:
            output.push(token)
        }
        break
      default:
        output.push(token)
        break
    }
  }

  return output
}

function isImplicitlyMultiplyable(
  token: Step5,
  contentsMayBeBig: boolean,
): token is Step5 & {
  type: "binary" | "unary" | "n" | "v" | "bracket" | "big"
} {
  if (token.type == "binary") {
    return true
  }

  if (token.type == "unary") {
    return token.op != "logb" && token.op != "logb^2"
  }

  if (token.type == "n" || token.type == "v" || token.type == "bracket") {
    return true
  }

  if (contentsMayBeBig && token.type == "big") {
    return true
  }

  return false
}

function s0_parseImplicitMultiplication(tokens: Step5[]): Step5[] {
  const output: Step5[] = []

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!
    const prev = output[output.length - 1]

    if (
      isImplicitlyMultiplyable(token, false) &&
      prev &&
      isImplicitlyMultiplyable(prev, false)
    ) {
      output[output.length - 1] = {
        type: "binary",
        op: "implicit_mult",
        a: prev,
        b: token,
      }
    } else {
      output.push(token)
    }
  }

  return output
}

function canBeFollowedByUnaryNegation(token: Step5): boolean {
  if (token.type == "big" || token.type == "op") {
    return true
  }

  if (token.type == "unary") {
    return token.op == "logb" || token.op == "logb^2"
  }

  return false
}

function s5_parseUnaryPrefixes(
  tokens: Step5[],
  contentsMayBeBig: boolean,
): Step5[] {
  const output: Step5[] = []

  main: for (let index = 0; index < tokens.length; index++) {
    const initialIndex = index
    const token = tokens[index]!
    const prev = output[output.length - 1]

    if (
      (token.type == "op" &&
        ((["+", "-", "pm", "mp"].includes(token.name) &&
          (!prev || canBeFollowedByUnaryNegation(prev))) ||
          UNARY_OPERATORS.includes(token.name as any))) ||
      (token.type == "unary" && (token.op == "logb" || token.op == "logb^2"))
    ) {
      const ops = [token]
      let contents: Node | undefined

      while (true) {
        const next = tokens[index + 1]

        if (
          (next?.type == "op" &&
            (["+", "-", "pm", "mp"].includes(next.name) ||
              UNARY_OPERATORS.includes(next.name as any))) ||
          (next?.type == "unary" && (next.op == "logb" || next.op == "logb^2"))
        ) {
          ops.push(next)
          index += 1
          continue
        }

        if (next) {
          if (isImplicitlyMultiplyable(next, contentsMayBeBig)) {
            index += 1
            contents = next
            break
          } else if (
            !contentsMayBeBig &&
            isImplicitlyMultiplyable(next, true)
          ) {
            index = initialIndex
            output.push(token)
            continue main
          }
        }

        break
      }

      while (ops.length) {
        const op = ops.pop()!

        if (!contents) {
          throw new MathError(
            `Sorry, I don't understand that usage of ${
              op.type == "op" ? op.name : op.op
            }`,
          )
        }

        if (op.type == "op") {
          contents = {
            type: "unary",
            contents,
            op: op.name as BaseUnaryOperator | "+" | "-" | "pm" | "mp",
          }
        } else {
          contents = {
            type: "binary",
            a: op.contents,
            b: contents,
            op: op.op as "logb" | "logb^2",
          }
        }
      }

      output.push(contents!)
    } else {
      output.push(token)
    }
  }

  return output
}

const MULTIPLICATIVE_OPERATORS = Object.freeze([
  "*",
  "/",
  "%",
  "odot",
  "mod",
  "times",
  "cdot",
  "div",
] as const)

type MultiplicativeOperator = (typeof MULTIPLICATIVE_OPERATORS)[number]

function isStep6Value(
  token: {
    type: Step5["type"]
  },
  contentsMayBeBig: boolean,
): token is { type: "n" | "v" | "binary" | "bracket" | "unary" | "big" } {
  return (
    token.type == "n" ||
    token.type == "v" ||
    token.type == "binary" ||
    token.type == "bracket" ||
    token.type == "unary" ||
    (contentsMayBeBig && token.type == "big")
  )
}

function s6_parseBinaryOperators(
  tokens: Step5[],
  operators: readonly string[],
  contentsMayBeBig: boolean,
): Step5[] {
  const output: Step5[] = []

  for (const token of tokens) {
    if (isStep6Value(token, contentsMayBeBig)) {
      const prev = output[output.length - 1]
      const prev2 = output[output.length - 2]

      if (
        prev &&
        prev.type == "op" &&
        operators.includes(prev.name as any) &&
        prev2 &&
        isStep6Value(prev2, contentsMayBeBig)
      ) {
        output.splice(-2, 2, {
          type: "binary",
          op: prev.name as any,
          a: prev2,
          b: token,
        })
        continue
      }
    }

    output.push(token)
  }

  return output
}

function s7_parseBigSymbolContents(tokens: Step5[]): Step5[] {
  const output: Step5[] = []

  for (const token of tokens.slice().reverse()) {
    if (token.type == "big") {
      const prev = output[output.length - 1]

      if (prev && isStep6Value(prev, true)) {
        output[output.length - 1] = {
          ...token,
          contents: prev,
        }
      } else {
        throw new MathError(
          `What do you want to take the ${
            token.op == "prod" ? "product"
            : token.op == "int" ? "integral"
            : token.op
          } of?`,
        )
      }
    } else {
      output.push(token)
    }
  }

  return output.reverse()
}

const ADDITIVE_OPERATORS = Object.freeze(["+", "-", "pm", "mp"] as const)

const COMPARISON_OPERATORS = Object.freeze([
  "=",
  "<",
  ">",
  "le",
  "ge",
  "ne",
] as const)

function s9_parseChainedComparisons(tokens: Step5[]): Step5[] {
  const output: Step5[] = []

  for (const token of tokens) {
    if (isStep6Value(token, true)) {
      const prev = output[output.length - 1]
      const prev2 = output[output.length - 2]

      if (
        prev &&
        prev.type == "op" &&
        COMPARISON_OPERATORS.includes(prev.name as any) &&
        prev2 &&
        isStep6Value(prev2, true)
      ) {
        if (
          prev2.type == "binary" &&
          COMPARISON_OPERATORS.includes(prev2.op as any)
        ) {
          output.splice(-2, 2, {
            type: "binary",
            op: "and",
            a: prev2,
            b: {
              type: "binary",
              op: prev.name as any,
              a: structuredClone(prev2.b),
              b: token,
            },
          })
        } else if (
          prev2.type == "binary" &&
          prev2.op == "and" &&
          prev2.b.type == "binary"
        ) {
          output.splice(-2, 2, {
            type: "binary",
            op: "and",
            a: prev2,
            b: {
              type: "binary",
              op: prev.name as any,
              a: structuredClone(prev2.b.b),
              b: token,
            },
          })
        } else {
          output.splice(-2, 2, {
            type: "binary",
            op: prev.name as any,
            a: prev2,
            b: token,
          })
        }
        continue
      }
    }

    output.push(token)
  }

  return output
}

const BOOLEAN_OPERATORS = Object.freeze(["and", "or", "wedge", "vee"] as const)

const BINDING_OPERATORS_A = Object.freeze(["to"] as const)

const BINDING_OPERATORS_B = Object.freeze(["for", "with"] as const)

type BaseBinaryOperator =
  | MultiplicativeOperator
  | (typeof ADDITIVE_OPERATORS)[number]
  | (typeof COMPARISON_OPERATORS)[number]
  | (typeof BOOLEAN_OPERATORS)[number]
  | (typeof BINDING_OPERATORS_A)[number]
  | (typeof BINDING_OPERATORS_B)[number]
  | ","

export type Node =
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "desmos"; name: string }
  | { type: "bracket"; bracket: DoubleBracket; contents: Node }
  | { type: "group"; contents: Node }
  | { type: "unary"; op: Unary; contents: Node }
  | { type: "big"; op: Big; bottom: Node; top: Node; contents: Node }
  | { type: "binary"; op: Binary; a: Node; b: Node }

const BINARY_OPERATORS = [
  ...MULTIPLICATIVE_OPERATORS,
  ...ADDITIVE_OPERATORS,
  ...COMPARISON_OPERATORS,
  ...BOOLEAN_OPERATORS,
  ...BINDING_OPERATORS_A,
  ...BINDING_OPERATORS_B,
  ",",
]

function toNode(tree: Step5[]): Node {
  if (tree.length == 0) {
    throw new MathError(`Empty expression.`)
  }
  for (const node of tree) {
    if (node.type == "op") {
      if (BINARY_OPERATORS.includes(node.name)) {
        throw new MathError(
          `You need something on both sides of the '${node.name}' symbol.`,
        )
      } else if (UNARY_OPERATORS.includes(node.name as any)) {
        throw new MathError(
          `${node.name} is a function. Try using parentheses.`,
        )
      }
    }
  }
  if (tree.length > 1) {
    console.error(tree)
    throw new MathError(`Unrecognized symbol.`)
  }
  const node = tree[0]!
  return node as Exclude<typeof node, { type: "op" }>
}

export type Unary =
  | "sqrt"
  | "!"
  | "logb"
  | "logb^2"
  | BaseUnaryOperator
  | "+"
  | "-"
  | "pm"
  | "mp"
  | "frozenmouse"
  | "frozentime"

export type Big =
  | "sum"
  | "prod"
  | "int"
  | "coprod"
  // lim isn't a `big` operator, but it's easier to do this than special-case it
  | "lim"

export type Binary =
  | "frac"
  | "binom"
  | "dual"
  | "nthroot"
  | "^"
  | "_"
  | "implicit_mult"
  | "logb"
  | "logb^2"
  | BaseBinaryOperator

export type ParseLatexResult =
  | { ok: false; reason: string }
  | { ok: true; value: Node }

export function parseLatex(latex: string): ParseLatexResult {
  const s1 = s1_tokenize(latex)
  const s2 = s2_groupTokens(s1)
  if (!s2.ok) {
    return { ok: false, reason: s2.reason }
  }
  try {
    const tree = parseGroups(s2.tokens)
    return { ok: true, value: tree }
  } catch (error) {
    if (error instanceof MathError) {
      return { ok: false, reason: error.message }
    } else {
      throw error
    }
  }
}
