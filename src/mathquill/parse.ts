/** Latex Parsing Steps
 *
 * 1. parse tokens
 * 2. parse brackets and latex groups
 * 3. parse latex commands like \sqrt, \frac, and \sum
 * 4. parse ^, _, !, and logb
 * 4.5. parse tight implicit multiplication (a b)
 * 5. parse unary prefix operators and logb
 * 5.5. parse loose implicit multiplication (sin a cos b)
 * 6. parse multiplicative level operators
 * 7. parse contents of BIG operators
 * 8. parse all other binary operators
 */

// STEP 1: PARSE TOKENS
export type Step1 =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "bracket"; bracket: MathBracket }
  | { type: "group"; bracket: LatexBracket }

// STEP 2: PARSE BRACKETS
export type Step2 = WellBehavedTree<never, never, never>

// STEP 3: PARSE CORE LATEX COMMANDS
export type Step3 = Tree<
  "sqrt",
  "sum" | "prod" | "int",
  "frac" | "binom" | "dual" | "nthroot",
  StepFinal[]
>

// STEP 4: PARSE SUPERSCRIPT, SUBSCRIPT, FACTORIAL, LOGB
export type Step4 = Tree<
  "sqrt" | "!" | "logb" | "logb^2",
  "sum" | "prod" | "int",
  "frac" | "binom" | "dual" | "nthroot" | "^" | "_",
  StepFinal[]
>

// STEP 4.5: PARSE TIGHT IMPLICIT MULTIPLICATION

// STEP 5: PARSE UNARY PREFIX OPERATORS AND LOGB
export type Step5 = Tree<
  "sqrt" | "!" | "logb" | "logb^2" | UnaryOperator | "+" | "-" | "pm" | "mp",
  "sum" | "prod" | "int",
  | "frac"
  | "binom"
  | "dual"
  | "nthroot"
  | "^"
  | "_"
  | "implicit_mult"
  | "logb"
  | "logb^2",
  StepFinal[]
>

// STEP 5.5: PARSE LOOSE IMPLICIT MULTIPLICATION

// STEP 6: PARSE MULTIPLICATIVE LEVEL OPERATORS
export type Step6 = Tree<
  "sqrt" | "!" | "logb" | "logb^2" | UnaryOperator | "+" | "-" | "pm" | "mp",
  "sum" | "prod" | "int",
  | "frac"
  | "binom"
  | "dual"
  | "nthroot"
  | "^"
  | "_"
  | "implicit_mult"
  | "logb"
  | "logb^2"
  | MultiplicativeOperator,
  StepFinal[]
>

// STEP 7: PARSE CONTENTS OF BIG OPERATORS

// STEP 8: PARSE ALL OTHER BINARY OPERATORS

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

export type MathBracket =
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

export type LatexBracket = "{" | "}"

export type BuildableToken =
  | { type: "op"; name: string; opname: boolean }
  | { type: "n"; value: string }
  | { type: "/" }

export function s1_tokenize(text: string): Step1[] {
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
        tokens.push({ type: "op", name: current.name })
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
        if ("0" <= char && char < "9") {
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

export type DoubleBracket = "()" | "[]" | "{}" | "||" | "<>" | "||||"

export type Tree<Unary, Big, Binary, Inner> =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "bracket"; bracket: DoubleBracket; contents: Inner }
  | { type: "group"; contents: Inner }
  | { type: "unary"; op: Unary; contents: Inner }
  | { type: "big"; op: Big; bottom: Inner; top: Inner; contents: Inner }
  | { type: "binary"; op: Binary; a: Inner; b: Inner }

export type WellBehavedTree<Unary, Big, Binary> = Tree<
  Unary,
  Big,
  Binary,
  WellBehavedTree<Unary, Big, Binary>[]
>

export type GroupTokensResult =
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

export function s2_groupTokens(tokens: Step1[]): GroupTokensResult {
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

export class LatexParsingError extends Error {}

export const TRIG_OPERATORS = Object.freeze(
  (
    [
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
  ).flatMap((x) => [x, `${x}^2`] as const),
)

export type TrigOperator = (typeof TRIG_OPERATORS)[number]

export const UNARY_OPERATORS = Object.freeze([
  ...TRIG_OPERATORS,
  "log",
  "log^2",
  "ln",
  "ln^2",
  "exp",
  "exp^2",
] as const)

export type UnaryOperator = (typeof UNARY_OPERATORS)[number]

export type StepFinal = Step6

export function parseGroups(tokens: Step2[]): StepFinal[] {
  const s3 = s3_parseLatexCommands(tokens)
  const s4 = s4_parseSubscriptSuperscriptFactorial(s3)
  const sa = s0_parseImplicitMultiplication(s4)
  const s5 = s5_parseUnaryPrefixes(sa)
  const sb = s0_parseImplicitMultiplication(s5)
  const s6 = s6_parseBinaryOperators(sb, MULTIPLICATIVE_OPERATORS)
  const s7 = s7_parseBigSymbolContents(s6)
  return s7
}

function s3_parseLatexCommands(tokens: Step2[]): Step3[] {
  const output: Step3[] = []

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!

    switch (token.type) {
      case "op":
        switch (token.name) {
          case "sqrt": {
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
            } else if (next?.type == "group") {
              output.push({
                type: "unary",
                op: "sqrt",
                contents: parseGroups(next.contents),
              })
              index += 1
            } else {
              throw new LatexParsingError(
                "\\sqrt requires a {...} group after it.",
              )
            }
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
              throw new LatexParsingError(
                `Expected two {...} groups after \\${token.name}`,
              )
            }

            break
          }
          case "sum":
          case "prod":
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
                contents: [],
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
                contents: [],
              })
              index += 4
            } else {
              throw new LatexParsingError(
                `Expected _{...}^{...} after \\${token.name}`,
              )
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

function isValue(node: Step4) {
  if (node.type == "unary") {
    return node.op != "logb" && node.op != "logb^2"
  } else {
    return node.type != "big" && node.type != "group"
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
            let contents: StepFinal[] = []

            if (next?.type == "group") {
              index += 1
              contents = next.contents
            }

            if (
              token.name == "^" &&
              prev?.type == "op" &&
              /^[A-Za-z]+$/.test(prev.name)
            ) {
              if (
                contents.length == 1 &&
                contents[0]?.type == "n" &&
                contents[0].value == "2"
              ) {
                prev.name = prev.name + "^2"
                break
              }

              if (
                contents.length == 2 &&
                contents[0]?.type == "op" &&
                contents[0].name == "-" &&
                contents[1]?.type == "n" &&
                contents[1].value == "1"
              ) {
                prev.name = prev.name + "^-1"
                break
              }
            }

            if (
              token.name == "^" &&
              prev?.type == "unary" &&
              prev.op == "logb" &&
              contents.length == 1 &&
              contents[0]?.type == "n" &&
              contents[0].value == "2"
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
                a: [prev],
                b: contents,
              }
              break
            }

            output.push({
              type: "binary",
              op: token.name,
              a: [],
              b: contents,
            })

            break
          }
          case "!": {
            const prev = output[output.length - 1]

            if (prev && isValue(prev)) {
              output[output.length - 1] = {
                type: "unary",
                op: "!",
                contents: [prev],
              }
            } else {
              output.push({
                type: "unary",
                op: "!",
                contents: [],
              })
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

function isImplicitlyMultiplyable(token: Step5): boolean {
  if (token.type == "binary") {
    return true
  }

  if (token.type == "unary") {
    return token.op != "logb" && token.op != "logb^2"
  }

  if (token.type == "n" || token.type == "v" || token.type == "bracket") {
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
      isImplicitlyMultiplyable(token) &&
      prev &&
      isImplicitlyMultiplyable(prev)
    ) {
      output[output.length - 1] = {
        type: "binary",
        op: "implicit_mult",
        a: [prev],
        b: [token],
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

function s5_parseUnaryPrefixes(tokens: Step5[]): Step5[] {
  const output: Step5[] = []

  for (let index = 0; index < tokens.length; index++) {
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
      let contents: Step5[] = []

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

        if (next && isImplicitlyMultiplyable(next)) {
          index += 1
          contents = [next]
          break
        }

        break
      }

      while (ops.length) {
        const op = ops.pop()!

        if (op.type == "op") {
          contents = [
            {
              type: "unary",
              contents,
              op: op.name as UnaryOperator | "+" | "-" | "pm" | "mp",
            },
          ]
        } else {
          contents = [
            {
              type: "binary",
              a: op.contents,
              b: contents,
              op: op.op as "logb" | "logb^2",
            },
          ]
        }
      }

      output.push(...contents)
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
  "#",
  "mod",
  "times",
  "cdot",
  "div",
] as const)

export type MultiplicativeOperator = (typeof MULTIPLICATIVE_OPERATORS)[number]

function isStep6Value(token: { type: StepFinal["type"] }): boolean {
  return (
    token.type == "n" ||
    token.type == "v" ||
    token.type == "binary" ||
    token.type == "bracket" ||
    token.type == "unary"
  )
}

function s6_parseBinaryOperators(
  tokens: Step6[],
  operators: readonly string[],
): Step6[] {
  const output: Step6[] = []

  for (const token of tokens) {
    if (isStep6Value(token)) {
      const prev = output[output.length - 1]
      const prev2 = output[output.length - 2]

      if (
        prev &&
        prev.type == "op" &&
        operators.includes(prev.name as any) &&
        prev2 &&
        isStep6Value(prev2)
      ) {
        output.splice(-2, 2, {
          type: "binary",
          op: prev.name as any,
          a: [prev2],
          b: [token],
        })
        continue
      }
    }

    output.push(token)
  }

  return output
}

function s7_parseBigSymbolContents(tokens: Step6[]): Step6[] {
  const output: Step6[] = []

  for (const token of tokens.reverse()) {
    if (token.type == "big") {
      const prev = output[output.length - 1]

      if (prev && (prev.type == "big" || isStep6Value(prev))) {
        output[output.length - 1] = {
          ...token,
          contents: [prev],
        }
        continue
      }
    }

    output.push(token)
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

const BOOLEAN_OPERATORS = Object.freeze(["and", "or"] as const)

export type BinaryOperator =
  | MultiplicativeOperator
  | (typeof ADDITIVE_OPERATORS)[number]
  | (typeof COMPARISON_OPERATORS)[number]
  | (typeof BOOLEAN_OPERATORS)[number]
