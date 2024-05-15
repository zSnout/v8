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

export type MathBracket = "(" | ")" | "[" | "]" | "{" | "}" | "|L" | "|R"

export type LatexBracket = "{" | "}"

export type Token =
  | { type: "op"; name: string } // name is letters or symbols
  | { type: "n"; value: string }
  | { type: "v"; name: string }
  | { type: "mb"; bracket: MathBracket }
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
      if (current.type != "/") {
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
          tokens.push({ type: "mb", bracket: char })
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
        tokens.push({ type: "mb", bracket: char })
        break

      case "|":
        if (
          current?.type == "op" &&
          (current.name == "left" || current.name == "right")
        ) {
          const name = current.name
          pushCurrent()
          tokens.push({ type: "mb", bracket: name == "left" ? "|L" : "|R" })
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

export type TrigOperator =
  | "sin"
  | "asin"
  | "sinh"
  | "asinh"
  | "cos"
  | "acos"
  | "cosh"
  | "acosh"
  | "tan"
  | "atan"
  | "tanh"
  | "atanh"
  | "csc"
  | "acsc"
  | "csch"
  | "acsch"
  | "sec"
  | "asec"
  | "sech"
  | "asech"
  | "cot"
  | "acot"
  | "coth"
  | "acoth"

export type UnaryOperator =
  | TrigOperator
  | "!"
  | "+"
  | "-"
  | "sqrt"
  | "log"
  | "ln"
  | "exp"
  | "floor"
  | "ceil"
  | "not"
  | "real"
  | "imag"

export type BinaryOperator =
  | "+"
  | "-"
  | "·"
  | "⨯"
  | "frac"
  | "÷"
  | "%"
  | "#"
  | "mod"
  | "and"
  | "or"
  | "xor"
  | "for"

export type Node =
  | { type: "number"; value: string }
  | { type: "variable"; name: string }
  | { type: "op" }
