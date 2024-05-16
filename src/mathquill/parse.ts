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

export type Token =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "bracket"; bracket: MathBracket }
  | { type: "lb"; bracket: LatexBracket }

export type BuildableToken =
  | { type: "op"; name: string; opname: boolean }
  | { type: "n"; value: string }
  | { type: "/" }

export function tokenize(text: string): Token[] {
  const tokens: Token[] = []
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
            tokens.push({ type: "lb", bracket: char })
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
          if (prev?.type == "lb" && prev.bracket == "{") {
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

export type TreeA =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "bracket"; bracket: DoubleBracket; tokens: TreeA[] }
  | { type: "lb"; tokens: TreeA[] }

export type TreeAResult =
  | { ok: true; tokens: TreeA[] }
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

export function tokensToTree(tokens: Token[]): TreeAResult {
  let current: TreeA[] = []
  const all: TreeA[][] = [current]

  for (const token of tokens) {
    if (token.type == "lb") {
      if (token.bracket == "{") {
        const group: TreeA[] = []
        current.push({ type: "lb", tokens: group })
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
        if (last?.type != "lb") {
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
        const group: TreeA[] = []
        current.push({
          type: "bracket",
          bracket: LEFT_TO_DOUBLE[token.bracket],
          tokens: group,
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

export type TreeB =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "vsub"; name: string; sub: TreeB[] }
  | { type: "sub" | "sup" | "sqrt"; contents: TreeB[] }
  | { type: "logb"; base: TreeB[] }
  | { type: "bracket"; bracket: DoubleBracket; contents: TreeB[] }
  | { type: "nthroot"; root: TreeB[]; contents: TreeB[] }
  | { type: "sum" | "prod" | "int"; from: TreeB[]; to: TreeB[] }
  | { type: "frac" | "binom" | "dual"; a: TreeB[]; b: TreeB[] }
  | { type: "implicit_mult"; a: TreeB; b: TreeB }
  | { type: "call"; fn: TreeB; param: TreeB[] }
  | { type: "^"; base: TreeB; sup: TreeB[] }
  | { type: "!"; contents: TreeB }

const TREE_B_TYPES_WHICH_IMPLICITLY_MULTIPLY = Object.freeze<
  (TreeB["type"] | undefined)[]
>([
  "n",
  "v",
  "vsub",
  "bracket",
  "sqrt",
  "nthroot",
  "frac",
  "binom",
  "dual",
  "implicit_mult",
  "^",
  "!",
])

/** functions which get renamed to other functions (asin --> arcsin) */
const FN_RENAME_MAP: Record<string, string> = Object.freeze({
  asin: "arcsin",
  acos: "arccos",
  atan: "arctan",
  acsc: "arccsc",
  asec: "arcsec",
  acot: "arccot",
  asinh: "arcsin",
  acosh: "arccos",
  atanh: "arctan",
  acsch: "arccsc",
  asech: "arcsec",
  acoth: "arccot",
})

/** functions which have inverses (sin --> arcsin) */
const FN_INVERSE_MAP: Record<string, string> = Object.freeze({
  sin: "arcsin",
  sinh: "arcsinh",
  arcsin: "sin",
  arcsinh: "sinh",
  cos: "arccos",
  cosh: "arccosh",
  arccos: "cos",
  arccosh: "cosh",
  tan: "arctan",
  tanh: "arctanh",
  arctan: "tan",
  arctanh: "tanh",
  csc: "arccsc",
  csch: "arccsch",
  arccsc: "csc",
  arccsch: "csch",
  sec: "arcsec",
  sech: "arcsech",
  arcsec: "sec",
  arcsech: "sech",
  cot: "arccot",
  coth: "arccoth",
  arccot: "cot",
  arccoth: "coth",
})

/** functions which have squares (ln --> ln^2) */
const FN_SQUARED_MAP: Record<string, string> = Object.freeze({
  sin: "sin^2",
  sinh: "sinh^2",
  asin: "arcsin^2",
  asinh: "arcsinh^2",
  arcsin: "arcsin^2",
  arcsinh: "arcsinh^2",
  cos: "cos^2",
  cosh: "cosh^2",
  acos: "arccos^2",
  acosh: "arccosh^2",
  arccos: "arccos^2",
  arccosh: "arccosh^2",
  tan: "tan^2",
  tanh: "tanh^2",
  atan: "arctan^2",
  atanh: "arctanh^2",
  arctan: "arctan^2",
  arctanh: "arctanh^2",
  csc: "csc^2",
  csch: "csch^2",
  acsc: "arccsc^2",
  acsch: "arccsch^2",
  arccsc: "arccsc^2",
  arccsch: "arccsch^2",
  sec: "sec^2",
  sech: "sech^2",
  asec: "arcsec^2",
  asech: "arcsech^2",
  arcsec: "arcsec^2",
  arcsech: "arcsech^2",
  cot: "cot^2",
  coth: "coth^2",
  acot: "arccot^2",
  acoth: "arccoth^2",
  arccot: "arccot^2",
  arccoth: "arccoth^2",
  log: "log^2",
  ln: "ln^2",
})

export function treeAToB(tree: TreeA[]): TreeB[] {
  const output: TreeB[] = []

  for (let index = 0; index < tree.length; index++) {
    const self = tree[index]!

    switch (self.type) {
      case "op":
        switch (self.name) {
          case "left":
          case "right":
            break

          case "sqrt": {
            const next = tree[index + 1]
            const next2 = tree[index + 2]

            if (
              next?.type == "bracket" &&
              next.bracket == "[]" &&
              next2?.type == "lb"
            ) {
              output.push({
                type: "nthroot",
                root: treeAToB(next.tokens),
                contents: treeAToB(next2.tokens),
              })
              index += 2
            } else if (next?.type == "lb") {
              output.push({
                type: "sqrt",
                contents: treeAToB(next.tokens),
              })
              index += 1
            } else {
              output.push({
                type: "sqrt",
                contents: [],
              })
            }
            break
          }

          case "sum":
          case "prod":
          case "int": {
            const next1 = tree[index + 1]
            const next2 = tree[index + 2]
            const next3 = tree[index + 3]
            const next4 = tree[index + 4]

            if (
              next1?.type == "op" &&
              next1.name == "_" &&
              next2?.type == "lb" &&
              next3?.type == "op" &&
              next3.name == "^" &&
              next4?.type == "lb"
            ) {
              output.push({
                type: self.name,
                from: treeAToB(next2.tokens),
                to: treeAToB(next4.tokens),
              })
              index += 4
            } else if (
              next1?.type == "op" &&
              next1.name == "^" &&
              next2?.type == "lb" &&
              next3?.type == "op" &&
              next3.name == "_" &&
              next4?.type == "lb"
            ) {
              output.push({
                type: self.name,
                from: treeAToB(next4.tokens),
                to: treeAToB(next2.tokens),
              })
              index += 4
            } else if (
              next1?.type == "op" &&
              next1.name == "_" &&
              next2?.type == "lb"
            ) {
              output.push({
                type: self.name,
                from: treeAToB(next2.tokens),
                to: [],
              })
              index += 2
            } else if (
              next1?.type == "op" &&
              next1.name == "^" &&
              next2?.type == "lb"
            ) {
              output.push({
                type: self.name,
                from: [],
                to: treeAToB(next2.tokens),
              })
              index += 2
            } else {
              output.push({
                type: self.name,
                from: [],
                to: [],
              })
            }
            break
          }

          case "log": {
            const next = tree[index + 1]
            const next2 = tree[index + 2]

            if (next?.type == "op" && next.name == "_" && next2?.type == "lb") {
              output.push({
                type: "logb",
                base: treeAToB(next2.tokens),
              })
              index += 2
            } else {
              output.push({
                type: "op",
                name: "log",
              })
            }
            break
          }

          case "_": {
            const next = tree[index + 1]

            if (next?.type == "lb") {
              output.push({
                type: "sub",
                contents: treeAToB(next.tokens),
              })
              index += 1
            }
            break
          }

          case "^": {
            const next = tree[index + 1]

            if (next?.type == "lb") {
              const prev = output[output.length - 1]

              if (prev) {
                output[output.length - 1] = {
                  type: "^",
                  base: prev,
                  sup: treeAToB(next.tokens),
                }
              } else {
                output.push({
                  type: "sup",
                  contents: treeAToB(next.tokens),
                })
              }

              index += 1
            }

            break
          }

          case "!": {
            const prev = output[output.length - 1]

            if (prev) {
              output[output.length - 1] = {
                type: "!",
                contents: prev,
              }
            }

            break
          }

          case "frac":
          case "binom":
          case "dual": {
            const next = tree[index + 1]
            const next2 = tree[index + 2]

            if (next?.type == "lb" && next2?.type == "lb") {
              output.push({
                type: self.name,
                a: treeAToB(next.tokens),
                b: treeAToB(next2.tokens),
              })
              index += 2
            } else {
              output.push({
                type: self.name,
                a: [],
                b: [],
              })
            }
            break
          }

          default: {
            const name =
              self.name in FN_RENAME_MAP ? FN_RENAME_MAP[self.name]! : self.name

            const next = tree[index + 1]
            const next2 = tree[index + 2]

            if (next?.type == "op" && next.name == "^" && next2?.type == "lb") {
              if (
                next2.tokens.length == 1 &&
                next2.tokens[0]?.type == "n" &&
                next2.tokens[0].value == "2" &&
                name in FN_SQUARED_MAP
              ) {
                index += 2
                output.push({ type: "op", name: FN_SQUARED_MAP[name]! })
                break
              }

              if (
                next2.tokens.length == 2 &&
                next2.tokens[0]?.type == "op" &&
                next2.tokens[0].name == "-" &&
                next2.tokens[1]?.type == "n" &&
                next2.tokens[1].value == "1" &&
                name in FN_INVERSE_MAP
              ) {
                index += 2
                output.push({ type: "op", name: FN_INVERSE_MAP[name]! })
                break
              }
            }

            output.push({
              type: "op",
              name,
            })
          }
        }
        break

      case "n": {
        const last = output[output.length - 1]

        if (TREE_B_TYPES_WHICH_IMPLICITLY_MULTIPLY.includes(last?.type)) {
          output[output.length - 1] = {
            type: "implicit_mult",
            a: last!,
            b: self,
          }
        } else {
          output.push(self)
        }

        break
      }

      case "v": {
        let me: TreeB
        const next = tree[index + 1]
        const next2 = tree[index + 2]

        if (next?.type == "op" && next.name == "_" && next2?.type == "lb") {
          me = {
            type: "vsub",
            name: self.name,
            sub: treeAToB(next2.tokens),
          }
          index += 2
        } else {
          me = self
        }

        const last = output[output.length - 1]

        if (TREE_B_TYPES_WHICH_IMPLICITLY_MULTIPLY.includes(last?.type)) {
          output[output.length - 1] = {
            type: "implicit_mult",
            a: last!,
            b: me,
          }
        } else {
          output.push(me)
        }

        break
      }

      case "bracket": {
        const me: TreeB = {
          type: "bracket",
          bracket: self.bracket,
          contents: treeAToB(self.tokens),
        }

        const last = output[output.length - 1]

        if (
          self.bracket == "()" &&
          (last?.type == "v" || last?.type == "vsub")
        ) {
          output[output.length - 1] = {
            type: "call",
            fn: last,
            param: me.contents,
          }
        } else if (
          TREE_B_TYPES_WHICH_IMPLICITLY_MULTIPLY.includes(last?.type)
        ) {
          output[output.length - 1] = {
            type: "implicit_mult",
            a: last!,
            b: me,
          }
        } else {
          output.push(me)
        }

        break
      }

      case "lb":
    }
  }

  return output
}

const UNARY_TRIG_OPERATORS = Object.freeze([
  "sin",
  "sin^2",
  "sinh",
  "sinh^2",
  "arcsin",
  "arcsin^2",
  "arcsinh",
  "arcsinh^2",
  "cos",
  "cos^2",
  "cosh",
  "cosh^2",
  "arccos",
  "arccos^2",
  "arccosh",
  "arccosh^2",
  "tan",
  "tan^2",
  "tanh",
  "tanh^2",
  "arctan",
  "arctan^2",
  "arctanh",
  "arctanh^2",
  "csc",
  "csc^2",
  "csch",
  "csch^2",
  "arccsc",
  "arccsc^2",
  "arccsch",
  "arccsch^2",
  "sec",
  "sec^2",
  "sech",
  "sech^2",
  "arcsec",
  "arcsec^2",
  "arcsech",
  "arcsech^2",
  "cot",
  "cot^2",
  "coth",
  "coth^2",
  "arccot",
  "arccot^2",
  "arccoth",
  "arccoth^2",
] as const)

export type UnaryTrigOperator = (typeof UNARY_TRIG_OPERATORS)[number]

const GLOBAL_UNARY_OPERATOR = Object.freeze([
  ...UNARY_TRIG_OPERATORS,
  "log",
  "ln",
  "exp",
  "floor",
  "ceil",
  "not",
  "real",
  "imag",
] as const)

const PREFIX_UNARY_OPERATOR = Object.freeze(["+", "-", "pm", "mp"] as const)

export type GlobalUnaryOperator = (typeof GLOBAL_UNARY_OPERATOR)[number]

export type PrefixOnlyUnaryOperator = (typeof PREFIX_UNARY_OPERATOR)[number]

export type UnaryOperator = GlobalUnaryOperator | PrefixOnlyUnaryOperator

export type TreeC<U extends string> =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "vsub"; name: string; sub: TreeC<U>[] }
  | { type: "sub" | "sup" | "sqrt"; contents: TreeC<U>[] }
  | { type: "logb"; base: TreeC<U>[] }
  | { type: "bracket"; bracket: DoubleBracket; contents: TreeC<U>[] }
  | { type: "nthroot"; root: TreeC<U>[]; contents: TreeC<U>[] }
  | { type: "sum" | "prod" | "int"; from: TreeC<U>[]; to: TreeC<U>[] }
  | { type: "frac" | "binom" | "dual"; a: TreeC<U>[]; b: TreeC<U>[] }
  | { type: "implicit_mult"; a: TreeC<U>; b: TreeC<U> }
  | { type: "call"; fn: TreeC<U>; param: TreeC<U>[] }
  | { type: "^"; base: TreeC<U>; sup: TreeC<U>[] }
  | { type: "!"; contents: TreeC<U> }
  | { type: "unary"; name: U; contents: TreeC<U>[] }

/** things which a prefix `-` or `+` may follow */
const TREE_B_TYPES_WHICH_MAY_BE_FOLLOWED_BY_PREFIX_OPERATORS = Object.freeze<
  (TreeB["type"] | "unary" | undefined)[]
>(["op", "logb", "sum", "prod", "int", undefined])

export function replaceUnaries(
  tokens: TreeB[],
  globalUnary?: undefined,
  prefixOnlyUnary?: undefined,
): TreeC<UnaryOperator>[]

export function replaceUnaries<U extends string>(
  tokens: TreeB[],
  globalUnary: readonly U[],
  prefixOnlyUnary: readonly U[],
): TreeC<U>[]

export function replaceUnaries<U extends string = UnaryOperator>(
  tokens: TreeB[],
  ug: readonly U[] = GLOBAL_UNARY_OPERATOR as any,
  up: readonly U[] = PREFIX_UNARY_OPERATOR as any,
): TreeC<U>[] {
  const tree: TreeC<U>[] = []

  for (let index = 0; index < tokens.length; index++) {
    const prev = tree[tree.length - 1]
    const token = tokens[index]!

    switch (token.type) {
      case "op":
        if (
          (up.includes(token.name as any) &&
            TREE_B_TYPES_WHICH_MAY_BE_FOLLOWED_BY_PREFIX_OPERATORS.includes(
              prev?.type,
            )) ||
          ug.includes(token.name as any)
        ) {
          let current: TreeC<U> & { type: "unary" } = {
            type: "unary",
            name: token.name as U,
            contents: [],
          }
          const final = current

          while (true) {
            const next = tokens[index + 1]

            if (
              next?.type == "op" &&
              (up.includes(next.name as any) || ug.includes(next.name as any))
            ) {
              const self: TreeC<U> & { type: "unary" } = {
                type: "unary",
                name: next.name as U,
                contents: [],
              }
              current.contents = [self]
              current = self
              index += 1
              continue
            }

            if (TREE_B_TYPES_WHICH_IMPLICITLY_MULTIPLY.includes(next?.type)) {
              current.contents = replaceUnaries([next!], ug, up)
              index += 1
            }

            break
          }

          tree.push(final)
        } else {
          tree.push(token)
        }
        break
      case "n":
      case "v":
        tree.push(token)
        break
      case "vsub":
        tree.push({
          type: "vsub",
          name: token.name,
          sub: replaceUnaries(token.sub, ug, up),
        })
        break
      case "sub":
      case "sup":
      case "sqrt":
      case "bracket":
        tree.push({
          ...token,
          contents: replaceUnaries(token.contents, ug, up),
        })
        break
      case "nthroot":
        tree.push({
          type: "nthroot",
          root: replaceUnaries(token.root, ug, up),
          contents: replaceUnaries(token.contents, ug, up),
        })
        break
      case "logb":
        tree.push({
          type: "logb" as const,
          base: replaceUnaries(token.base, ug, up),
        })
        break
      case "sum":
      case "prod":
      case "int":
        tree.push({
          type: token.type,
          from: replaceUnaries(token.from, ug, up),
          to: replaceUnaries(token.to, ug, up),
        })
        break
      case "frac":
      case "binom":
      case "dual":
        tree.push({
          type: token.type,
          a: replaceUnaries(token.a, ug, up),
          b: replaceUnaries(token.b, ug, up),
        })
        break
      case "implicit_mult": {
        const a = replaceUnaries([token.a], ug, up)[0]
        if (!a) {
          throw new Error("treeBToC must keep at least one token")
        }
        const b = replaceUnaries([token.b], ug, up)[0]
        if (!b) {
          throw new Error("treeBToC must keep at least one token")
        }
        tree.push({
          type: token.type,
          a,
          b,
        })
        break
      }
      case "call": {
        const fn = replaceUnaries([token.fn], ug, up)[0]
        if (!fn) {
          throw new Error("treeBToC must keep at least one token")
        }
        tree.push({
          type: "call",
          fn,
          param: replaceUnaries(token.param, ug, up),
        })
        break
      }
      case "^": {
        const base = replaceUnaries([token.base], ug, up)[0]
        if (!base) {
          throw new Error("treeBToC must keep at least one token")
        }
        tree.push({
          type: "^",
          base,
          sup: replaceUnaries(token.sup, ug, up),
        })
        break
      }
      case "!": {
        const contents = replaceUnaries([token.contents], ug, up)[0]
        if (!contents) {
          throw new Error("treeBToC must keep at least one token")
        }
        tree.push({
          type: "!",
          contents,
        })
        break
      }
    }
  }

  return tree
}

export type TreeD<U extends string> =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "vsub"; name: string; sub: TreeD<U>[] }
  | { type: "sub" | "sup" | "sqrt"; contents: TreeD<U>[] }
  | { type: "logb"; base: TreeD<U>[]; contents: TreeD<U> | undefined }
  | { type: "bracket"; bracket: DoubleBracket; contents: TreeD<U>[] }
  | { type: "nthroot"; root: TreeD<U>[]; contents: TreeD<U>[] }
  | {
      type: "sum" | "prod" | "int"
      from: TreeD<U>[]
      to: TreeD<U>[]
      contents: TreeD<U> | undefined
    }
  | { type: "frac" | "binom" | "dual"; a: TreeD<U>[]; b: TreeD<U>[] }
  | { type: "implicit_mult"; a: TreeD<U>; b: TreeD<U> }
  | { type: "call"; fn: TreeD<U>; param: TreeD<U>[] }
  | { type: "^"; base: TreeD<U>; sup: TreeD<U>[] }
  | { type: "!"; contents: TreeD<U> }
  | { type: "unary"; name: U; contents: TreeD<U>[] }

export function replaceBigSymbols<U extends string>(
  tokens: TreeC<U>[],
): TreeD<U>[] {
  const tree: TreeD<U>[] = []

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!

    switch (token.type) {
      case "logb":
      case "sum":
      case "prod":
      case "int": {
        const base =
          token.type == "logb"
            ? {
                type: "logb" as const,
                base: replaceBigSymbols(token.base),
              }
            : {
                type: token.type as "sum" | "prod" | "int",
                from: replaceBigSymbols(token.from),
                to: replaceBigSymbols(token.to),
              }

        let contents: TreeD<U> | undefined
        while (true) {
          const next = tokens[index + 1]
          if (
            next?.type == "unary" ||
            TREE_B_TYPES_WHICH_IMPLICITLY_MULTIPLY.includes(next?.type)
          ) {
            const b = replaceBigSymbols([next!])[0]
            if (!b) {
              throw new Error("replaceBigSymbols must keep at least one token")
            }
            if (contents) {
              contents = { type: "implicit_mult", a: contents, b }
            } else {
              contents = b
            }
            index += 1
          } else {
            break
          }
        }

        tree.push({
          ...base,
          contents,
        })
        break
      }
      case "op":
      case "n":
      case "v":
        tree.push(token)
        break
      case "vsub":
        tree.push({ type: "" })
      case "sub":
      case "sup":
      case "sqrt":
      case "bracket":
      case "nthroot":
      case "frac":
      case "binom":
      case "dual":
      case "implicit_mult":
      case "call":
      case "^":
      case "!":
      case "unary":
    }
  }

  return tree
}

const enum Precedence {
  Comma,
  Binding,
  BooleanOp,
  Comparison,
  Equality,
  Addition,
  Multiplication,
}

const BINARY_OPERATORS = Object.freeze({
  ",": Precedence.Comma,

  for: Precedence.Binding,
  with: Precedence.Binding,

  and: Precedence.BooleanOp,
  or: Precedence.BooleanOp,
  xor: Precedence.BooleanOp,

  "<": Precedence.Comparison,
  ">": Precedence.Comparison,
  le: Precedence.Comparison,
  ge: Precedence.Comparison,

  "=": Precedence.Equality,
  ne: Precedence.Equality,

  "+": Precedence.Addition,
  "-": Precedence.Addition,

  cdot: Precedence.Multiplication,
  times: Precedence.Multiplication,
  div: Precedence.Multiplication,
  "/": Precedence.Multiplication,
  "%": Precedence.Multiplication,
  "#": Precedence.Multiplication,
  mod: Precedence.Multiplication,
} as const)

export type BinaryOperator = keyof typeof BINARY_OPERATORS

// export type TreeD<U extends string, B extends string> =
//   | { type: "n"; value: string }
//   | { type: "v"; name: string }
//   | { type: "vsub"; name: string; sub: TreeD<U, B> }
//   | { type: "sub" | "sup" | "sqrt"; contents: TreeD<U, B> }
//   | { type: "logb"; base: TreeD<U, B>; contents: TreeD<U, B> }
//   | { type: "bracket"; bracket: DoubleBracket; contents: TreeD<U, B> }
//   | { type: "nthroot"; root: TreeD<U, B>; contents: TreeD<U, B> }
//   | { type: "sum" | "prod" | "int"; from: TreeD<U, B>; to: TreeD<U, B> }
//   | { type: "frac" | "binom" | "dual"; a: TreeD<U, B>; b: TreeD<U, B> }
//   | { type: "implicit_mult"; a: TreeD<U, B>; b: TreeD<U, B> }
//   | { type: "call"; fn: TreeD<U, B>; param: TreeD<U, B> }
//   | { type: "^"; base: TreeD<U, B>; sup: TreeD<U, B> }
//   | { type: "!"; contents: TreeD<U, B> }
//   | { type: "unary"; name: U; contents: TreeD<U, B> }
//   | { type: "binary"; name: B; a: TreeD<U, B>; b: TreeD<U, B> }
//   | { type: "unknown"; value?: TreeD<U, B> | undefined; error: TreeC<U> }

// export function treeCToD<U extends string>(
//   tokens: TreeC<U>[],
//   binary?: undefined,
// ): TreeD<U, BinaryOperator>

// export function treeCToD<U extends string, B extends string>(
//   tokens: TreeC<U>[],
//   binary: { readonly [k in B]: number },
// ): TreeD<U, B>

// export function treeCToD<U extends string, B extends string>(
//   tokens: TreeC<U>[],
//   binary: { readonly [k in B]: number } = BINARY_OPERATORS as any,
// ): TreeD<U, B> {
//   type State =
//     | { type: "none" }
//     | { type: "value"; value: TreeD<U, B>; precedence: number }
//     | { type: "hanging_op"; op: B; precedence: number }

//   let state: State = { type: "none" }

//   // TODO: implement
//   throw new Error("unimplemented")
// }

// export function tokenCToD<U extends string, B extends string>(
//   token: TreeC<U>,
//   binary: { readonly [k in B]: number } = BINARY_OPERATORS as any,
// ): TreeD<U, B> {
//   switch (token.type) {
//     case "op":
//       return {
//         type: "unknown",
//         error: token,
//       }
//     case "n":
//     case "v":
//       return token
//     case "vsub":
//       return {
//         type: "vsub",
//         name: token.name,
//         sub: treeCToD(token.sub, binary),
//       }
//     case "sub":
//     case "sup":
//     case "sqrt":
//     case "bracket":
//     case "unary":
//       return {
//         ...token,
//         contents: treeCToD(token.contents, binary),
//       }
//     case "logb":
//       return {
//         ...token,
//         base: treeCToD(token.base, binary),
//         contents: treeCToD(token.contents, binary),
//       }
//     case "nthroot":
//       return {
//         ...token,
//         root: treeCToD(token.root, binary),
//         contents: treeCToD(token.contents, binary),
//       }
//     case "sum":
//     case "prod":
//     case "int":
//       return {
//         ...token,
//         from: treeCToD(token.from, binary),
//         to: treeCToD(token.to, binary),
//       }
//     case "frac":
//     case "binom":
//     case "dual":
//       return {
//         ...token,
//         a: treeCToD(token.a, binary),
//         b: treeCToD(token.b, binary),
//       }
//     case "implicit_mult":
//       return {
//         type: "implicit_mult",
//         a: tokenCToD(token.a, binary),
//         b: tokenCToD(token.b, binary),
//       }
//     case "call":
//       return {
//         type: "call",
//         fn: tokenCToD(token.fn, binary),
//         param: treeCToD(token.param, binary),
//       }
//     case "^":
//       return {
//         type: "^",
//         base: tokenCToD(token.base, binary),
//         sup: treeCToD(token.sup, binary),
//       }
//     case "!":
//       return {
//         ...token,
//         contents: tokenCToD(token.contents, binary),
//       }
//   }
// }

// // export function toReversePolish<U extends string, B extends string>(
// //   tokens: readonly TreeC<U>[],
// //   binary: { readonly [k in B]: number } = BINARY_OPERATORS as any,
// // ): readonly TreeC<U>[] {
// //   const output: TreeC<U>[] = []

// //   const operatorStack: Extract<TreeC<U>, { type: "op" }>[] = []

// //   let token

// //   for (const token of tokens) {
// //     if (token.type != "op" || !(token.name in binary)) {
// //       output.push(token)
// //       continue
// //     }

// //     let o2

// //     while ((o2 = operatorStack[operatorStack.length - 1])) {
// //       const level1 = binary[token.name as B]
// //       const level2 = binary[o2.name as B]

// //       if (level1 > level2) {
// //         break
// //       }

// //       operatorStack.pop()
// //       output.push(o2)
// //     }

// //     operatorStack.push(token)
// //   }

// //   while ((token = operatorStack.pop())) {
// //     output.push(token)
// //   }

// //   return output
// // }

// // export function rpnToTree<U extends string, B extends string>(
// //   tokens: readonly TreeC<U>[],
// //   binary: { readonly [k in B]: number } = BINARY_OPERATORS as any,
// // ): TreeD<U, B> {
// //   const stack: TreeD<U, B>[] = []

// //   for (const token of tokens) {
// //     if (token.type != "op") {
// //       stack.push(token)
// //       continue
// //     }

// //     const right = stack.pop()
// //     const left = stack.pop()

// //     if (!right || !left) {
// //       throw new Error("Invalid placement of operator '" + token.name + "'.")
// //     }

// //     stack.push({
// //       type: "binary-fn",
// //       name: token.name,
// //       left,
// //       right,
// //     })
// //   }

// //   if (stack.length == 0) {
// //     throw new Error("Unexpected end of input.")
// //   }

// //   if (stack.length != 1) {
// //     throw new Error("Unexpected value.")
// //   }

// //   return stack[0]!
// // }
