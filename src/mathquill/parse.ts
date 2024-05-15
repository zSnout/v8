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
  | { type: "sub" | "sup" | "sqrt" | "logb"; contents: TreeB[] }
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
                contents: treeAToB(next2.tokens),
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

const UNARY_OPERATOR = Object.freeze([
  ...UNARY_TRIG_OPERATORS,
  "+",
  "-",
  "log",
  "ln",
  "exp",
  "floor",
  "ceil",
  "not",
  "real",
  "imag",
] as const)

export type UnaryOperator = (typeof UNARY_OPERATOR)[number]

export type TreeC =
  | { type: "op"; name: string }
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "vsub"; name: string; sub: TreeC[] }
  | { type: "sub" | "sup" | "sqrt" | "logb"; contents: TreeC[] }
  | { type: "bracket"; bracket: DoubleBracket; contents: TreeC[] }
  | { type: "nthroot"; root: TreeC[]; contents: TreeC[] }
  | { type: "sum" | "prod" | "int"; from: TreeC[]; to: TreeC[] }
  | { type: "frac" | "binom" | "dual"; a: TreeC[]; b: TreeC[] }
  | { type: "implicit_mult"; a: TreeC; b: TreeC }
  | { type: "call"; fn: TreeC; param: TreeC[] }
  | { type: "^"; base: TreeC; sup: TreeC[] }
  | { type: "!"; contents: TreeC }
  | { type: "unary"; name: UnaryOperator; contents: TreeC[] }

export function treeBToC(tokens: TreeB[]): TreeC[] {
  const tree: TreeC[] = []

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!

    switch (token.type) {
      case "op":
        if (UNARY_OPERATOR.includes(token.name as any)) {
          const next = tokens[index + 1]

          if (TREE_B_TYPES_WHICH_IMPLICITLY_MULTIPLY.includes(next?.type)) {
            tree.push({
              type: "unary",
              name: token.name as UnaryOperator,
              contents: treeBToC([next!]),
            })
            index += 1
          } else {
            tree.push({
              type: "unary",
              name: token.name as UnaryOperator,
              contents: [],
            })
          }
        } else {
          tree.push(token)
        }
        break
      case "n":
      case "v":
        tree.push(token)
        break
      case "vsub":
        tree.push({ type: "vsub", name: token.name, sub: treeBToC(token.sub) })
        break
      case "sub":
      case "sup":
      case "sqrt":
      case "logb":
      case "bracket":
        tree.push({
          ...token,
          contents: treeBToC(token.contents),
        })
        break
      case "nthroot":
        tree.push({
          type: "nthroot",
          root: treeBToC(token.root),
          contents: treeBToC(token.contents),
        })
        break
      case "sum":
      case "prod":
      case "int":
        tree.push({
          type: token.type,
          from: treeBToC(token.from),
          to: treeBToC(token.to),
        })
        break
      case "frac":
      case "binom":
      case "dual":
        tree.push({
          type: token.type,
          a: treeBToC(token.a),
          b: treeBToC(token.b),
        })
        break
      case "implicit_mult": {
        const a = treeBToC([token.a])[0]
        if (!a) {
          throw new Error("treeBToC must keep at least one token")
        }
        const b = treeBToC([token.b])[0]
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
      case "call":
        tree.push({
          type: "call",
          fn: token.fn,
          param: treeBToC(token.param),
        })
        break
      case "^": {
        const base = treeBToC([token.base])[0]
        if (!base) {
          throw new Error("treeBToC must keep at least one token")
        }
        tree.push({
          type: "^",
          base,
          sup: treeBToC(token.sup),
        })
        break
      }
      case "!": {
        const contents = treeBToC([token.contents])[0]
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
