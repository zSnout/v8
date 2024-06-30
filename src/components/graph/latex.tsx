/* eslint-disable */

import { For, Show, createSignal } from "solid-js"
import "./latex.postcss"

// if you see empty <span>s, they probably have the `​` character. don't delete

const FUNCTION_NAMES = [
  "log",
  "ln",
  "exp",

  "if",
  "then",
  "else",
  "and",
  "or",
  "not",
  "xor",
  "xnor",
  "nor",
  "nand",

  "sinh",
  "cosh",
  "tanh",
  "csch",
  "coth",
  "sech",

  "asinh",
  "acosh",
  "atanh",
  "acsch",
  "acoth",
  "asech",

  "arcsinh",
  "arccosh",
  "arctanh",
  "arccsch",
  "arccoth",
  "arcsech",

  "sin",
  "cos",
  "tan",
  "csc",
  "cot",
  "sec",

  "asin",
  "acos",
  "atan",
  "acsc",
  "acot",
  "asec",

  "arcsin",
  "arccos",
  "arctan",
  "arccsc",
  "arccot",
  "arcsec",

  "mean",
  "median",
  "min",
  "max",
  "quartile",
  "quantile",
  "stdev",
  "stdevp",
  "var",
  "mad",
  "cov",
  "covp",
  "corr",
  "spearman",
  "stats",
  "count",
  "total",

  "join",
  "sort",
  "unique",
  "shuffle",
  "for",
  "with",

  "histogram",
  "dotplot",
  "boxplot",
  "normaldist",
  "tdist",
  "poissondist",
  "binomialdist",
  "uniformdist",
  "pdf",
  "cdf",
  "inversecdf",
  "random",
  "ttest",
  "tscore",
  "ittest",
  "polygon",
  "distance",
  "midpoint",
  "rgb",
  "hsv",
  "tone",
  "lcm",
  "gcd",
  "mod",
  "ceil",
  "floor",
  "round",
  "sign",
  "nPr",
  "nCr",
].sort((a, b) => b.length - a.length)

const OTHERS: [string, Symbol][] = [
  [
    "sum",
    {
      type: "repeat",
      op: "sum",
      sub: [
        { type: "var", letter: "n" },
        { type: "op", op: "=" },
      ],
      sup: [],
    },
  ],
  [
    "prod",
    {
      type: "repeat",
      op: "prod",
      sub: [
        { type: "var", letter: "n" },
        { type: "op", op: "=" },
      ],
      sup: [],
    },
  ],
  [
    "int",
    {
      type: "int",
      sub: [],
      sup: [],
    },
  ],
  ["sqrt", { type: "sqrt", contents: [] }],
  ["nthroot", { type: "root", root: [], contents: [] }],
  ["root", { type: "root", root: [], contents: [] }],
  ["pi", { type: "const", name: "π" }],
]

const ALL = [...FUNCTION_NAMES, ...OTHERS].sort(
  (a, b) =>
    (typeof b == "string" ? b.length : b[0].length) -
    (typeof a == "string" ? a.length : a[0].length),
)

export type Bracket = "()" | "[]" | "{}" | "||"

export type PiecewiseSection = { value: Symbol[]; when: Symbol[] }

export type BaseSymbol =
  | { type: "." }
  | { type: "," }
  | { type: "var"; letter: string }
  | { type: "const"; name: string }
  | { type: "cursor" }
  | { type: "sqrt"; contents: Symbol[] }
  | { type: "ans"; contents: Symbol[] }
  | { type: "root"; root: Symbol[]; contents: Symbol[] }
  | { type: "bracket"; bracket: Bracket; contents: Symbol[] }
  | { type: "frac"; sup: Symbol[]; sub: Symbol[] }
  | { type: "repeat"; op: "sum" | "prod"; sub: Symbol[]; sup: Symbol[] }
  | { type: "int"; sub: Symbol[]; sup: Symbol[] }
  | { type: "matrix"; data: Symbol[][][] } // such a silly type definition
  | { type: "cases"; cases: PiecewiseSection[] }

export type Symbol =
  | { type: "number"; value: string; cursor?: number }
  | { type: "fn"; value: string; cursor?: number }
  | { type: "sup"; contents: Symbol[] }
  | { type: "sub"; contents: Symbol[] }
  | { type: "supsub"; sup: Symbol[]; sub: Symbol[] }
  | { type: "op"; op: string }
  | BaseSymbol

export type ContextualizedSymbol =
  | { type: "number"; value: string; afterDecimal: boolean; cursor?: number }
  | {
      type: "fn"
      value: string
      cursor?: number
      spaceBefore: boolean
      spaceAfter: boolean
    }
  | { type: "op"; op: string; isPrefix: boolean }
  | { type: "sup"; contents: Symbol[]; spaceAfter: boolean }
  | { type: "sub"; contents: Symbol[]; spaceAfter: boolean }
  | { type: "supsub"; sup: Symbol[]; sub: Symbol[]; spaceAfter: boolean }
  | BaseSymbol

export interface ReplacementData {
  removeCursor: boolean
}

// @ts-expect-error this function should never be used
// its purpose is to ensure that all contextualized symbols are variants
// of normal symbols, so that replacement works properly
function assertAllContextualVariantsAreSubtypesOfNormal(
  contextual: ContextualizedSymbol,
): Symbol {
  return contextual
}

/**
 * Checks if a symbol is numeric on its right hand side.
 * Used to see if the + and - symbols should be operators or prefixes.
 */
export function isNumericSymbolOnRHS(
  symbol: Symbol | undefined,
  prev: Symbol | undefined,
  prev2: Symbol | undefined,
) {
  if (prev2?.type == "cursor") {
    prev2 = undefined
  }

  if (prev?.type == "cursor") {
    prev = prev2
    prev2 = undefined
  }

  if (symbol?.type == "cursor") {
    symbol = prev
    prev = prev2
    prev2 = undefined
  }

  switch (symbol?.type) {
    case undefined:
      return false

    case "number":
    case ".":
    case "var":
    case "const":
    case "sqrt":
    case "root":
    case "frac":
    case "bracket":
    case "cases":
    case "matrix":
    case "ans":
      return true

    case "sup":
    case "sub":
    case "supsub":
      return prev?.type != "fn"

    case ",":
    case "fn":
    case "op":
    case "repeat":
    case "int":
      return false
  }
}

/** Splices symbols, then joins numbers and function names in place. */
export function spliceSymbolsInPlace(
  current: Symbol[],
  index: number,
  deleteCount: number,
  inserted: Symbol[],
) {
  current.splice(index, deleteCount, ...inserted)

  let start = index
  let end = index + inserted.length - deleteCount

  while (
    current[start - 1]?.type == "cursor" ||
    current[start - 1]?.type == "fn" ||
    current[start - 1]?.type == "var" ||
    current[start - 1]?.type == "number"
  ) {
    start--
  }

  while (
    current[end]?.type == "cursor" ||
    current[end]?.type == "fn" ||
    current[end]?.type == "var" ||
    current[end]?.type == "number"
  ) {
    end++
  }

  for (let index = start; index < end; index++) {
    // merge numbers next to each other
    if (index < end - 2) {
      const self = current[index]!
      const next = current[index + 1]!
      const next2 = current[index + 2]!

      if (self.type == "number" && next.type == "number") {
        current.splice(index, 2, {
          type: "number",
          value: self.value + next.value,
          cursor:
            self.cursor != null
              ? self.cursor
              : next.cursor != null
              ? next.cursor + self.value.length
              : undefined,
        })
        end -= 1
        continue
      }

      if (
        self.type == "number" &&
        next.type == "cursor" &&
        next2.type == "number"
      ) {
        current.splice(index, 3, {
          type: "number",
          value: self.value + next2.value,
          cursor: self.value.length,
        })
        end -= 2
        continue
      }
    }

    // replace fn with var[]
    const self = current[index]
    if (self?.type == "fn") {
      const vars = Array.from(self.value).map<Symbol>((letter) => ({
        type: "var",
        letter,
      }))
      if (self.cursor != null) {
        vars.splice(self.cursor, 0, { type: "cursor" })
      }
      current.splice(index, 1, ...vars)
      end += vars.length - 1
    }
  }

  for (const all of ALL) {
    const word = typeof all == "string" ? all : all[0]

    position: for (let index = start; index < end - word.length + 1; index++) {
      let cursorIndex: number | undefined
      let subindex: number

      for (subindex = index; subindex < index + word.length + 1; subindex++) {
        const letterIndex =
          cursorIndex == null ? subindex - index : subindex - index - 1

        const self = current[subindex]

        if (self?.type == "cursor") {
          cursorIndex = subindex
          continue
        } else if (self?.type != "var") {
          continue position
        } else if (letterIndex >= word.length) {
          break
        } else if (self.letter == word[letterIndex]) {
          if (letterIndex == word.length - 1) {
            break
          } else {
            continue
          }
        } else {
          continue position
        }
      }

      const symbol: Symbol[] =
        typeof all == "string"
          ? [
              {
                type: "fn",
                value: word,
                cursor: cursorIndex == null ? undefined : cursorIndex - index,
              },
            ]
          : cursorIndex == index
          ? [{ type: "cursor" }, structuredClone(all[1])]
          : cursorIndex != null
          ? [structuredClone(all[1]), { type: "cursor" }]
          : [structuredClone(all[1])]

      const deleted = subindex - index + (cursorIndex == subindex ? 0 : 1)
      current.splice(index, deleted, ...symbol)
      end += symbol.length - deleted
    }
  }
}

/** Splices symbols, then joins numbers and function names. */
export function spliceSymbols(
  current: readonly Symbol[],
  index: number,
  deleteCount: number,
  inserted: Symbol[],
): Symbol[] {
  const next = current.slice()
  spliceSymbolsInPlace(next, index, deleteCount, inserted)
  return next
}

export function prepareSymbol(symbol: Symbol, data: ReplacementData): Symbol {
  if (data.removeCursor) {
    switch (symbol.type) {
      case "op":
      case ".":
      case ",":
      case "var":
      case "const":
      case "cursor":
        return symbol
      case "number":
      case "fn":
        return { ...symbol, cursor: undefined }
      case "sup":
      case "sub":
      case "sqrt":
      case "bracket":
      case "ans":
        return {
          ...symbol,
          contents: prepareSymbolList(symbol.contents, data),
        }
      case "supsub":
      case "int":
      case "repeat":
      case "frac":
        return {
          ...symbol,
          sub: prepareSymbolList(symbol.sub, data),
          sup: prepareSymbolList(symbol.sup, data),
        }
      case "root":
        return {
          ...symbol,
          contents: prepareSymbolList(symbol.contents, data),
          root: prepareSymbolList(symbol.root, data),
        }
      case "matrix":
        return {
          ...symbol,
          data: symbol.data.map((row) =>
            row.map((cell) => prepareSymbolList(cell, data)),
          ),
        }
      case "cases":
        return {
          ...symbol,
          cases: symbol.cases.map(({ value, when }) => ({
            value: prepareSymbolList(value, data),
            when: prepareSymbolList(when, data),
          })),
        }
    }
  } else {
    return symbol
  }
}

/** Removes cursors from a symbol list if the data says to. */
export function prepareSymbolList(
  symbols: Symbol[],
  data: ReplacementData,
): Symbol[] {
  return prepareSymbolListAndShiftIndex(symbols, data, 0)[0]
}

/** Removes cursors from a symbol list and keeps track of an index. */
export function prepareSymbolListAndShiftIndex(
  symbols: Symbol[],
  data: ReplacementData,
  index: number,
): [symbols: Symbol[], index: number] {
  if (data.removeCursor) {
    symbols = symbols
      .filter((symbol, myIndex) => {
        if (symbol.type == "cursor") {
          if (index > myIndex) {
            index--
          }

          return false
        }

        return true
      })
      .map((symbol) => prepareSymbol(symbol, data))
  }

  return [symbols, index]
}

/**
 * Renders an array of symbols with contextual alternates.
 * For example, `3--2` is rendered more like `3 - -2`.
 * Subscripts and superscripts are also spaced properly after operators.
 */
export function SymbolList(props: {
  symbols: Symbol[]
  replaceSelf: (symbols: Symbol[], data: ReplacementData) => void
}) {
  return (
    <For each={props.symbols}>
      {(symbol, index) => {
        function replaceSelf(symbols: Symbol[], data: ReplacementData) {
          const i = index()

          const [newSymbols, newIndex] = prepareSymbolListAndShiftIndex(
            props.symbols,
            data,
            i,
          )

          props.replaceSelf(
            spliceSymbols(newSymbols, newIndex, 1, symbols),
            data,
          )
        }

        switch (symbol.type) {
          case "number": {
            const afterDecimal = props.symbols[index() - 1]?.type == "."

            return drawSymbol(
              {
                type: "number",
                value: symbol.value,
                afterDecimal,
                cursor: symbol.cursor,
              },
              replaceSelf,
            )
          }

          case "fn": {
            const prev =
              props.symbols[index() - 1]?.type == "cursor"
                ? props.symbols[index() - 2]?.type
                : props.symbols[index() - 1]?.type

            const next =
              props.symbols[index() + 1]?.type == "cursor"
                ? props.symbols[index() + 2]?.type
                : props.symbols[index() + 1]?.type

            const spaceBefore = !(
              prev == null ||
              prev == "int" ||
              prev == "repeat" ||
              prev == "op"
            )

            const spaceAfter = !(
              next == null ||
              next == "sub" ||
              next == "sup" ||
              next == "supsub" ||
              next == "," ||
              next == "bracket"
            )

            return drawSymbol(
              {
                type: "fn",
                value: symbol.value,
                cursor: symbol.cursor,
                spaceBefore,
                spaceAfter,
              },
              replaceSelf,
            )
          }

          case "sup":
          case "sub":
          case "supsub": {
            const prev =
              props.symbols[index() - 1]?.type == "cursor"
                ? props.symbols[index() - 2]?.type
                : props.symbols[index() - 1]?.type

            return drawSymbol(
              { ...symbol, spaceAfter: prev == "fn" },
              replaceSelf,
            )
          }

          case "op": {
            const isPrefix =
              ((symbol.op == "+" || symbol.op == "-") && index() == 0) ||
              !isNumericSymbolOnRHS(
                props.symbols[index() - 1]!,
                props.symbols[index() - 2],
                props.symbols[index() - 3],
              )

            return drawSymbol(
              { type: "op", op: symbol.op, isPrefix },
              replaceSelf,
            )
          }

          default:
            return drawSymbol(symbol, replaceSelf)
        }
      }}
    </For>
  )
}

export function drawCursor() {
  return (
    <span class="pointer-events-none relative z-20 -ml-px inline-block border-l border-l-current p-0">
      ​
    </span>
  )
}

export function getBracketSize(bracket: Bracket) {
  switch (bracket) {
    case "()":
    case "[]":
      return { w: "w-[.55em]", mx: "mx-[.55em]" }

    case "{}":
      return { w: "w-[.7em]", mx: "mx-[.7em]" }

    case "||":
      return { w: "w-[.4em]", mx: "mx-[.4em]" }
  }
}

export function drawLeftBracket(bracket: Bracket) {
  switch (bracket) {
    case "()":
      return (
        <svg
          preserveAspectRatio="none"
          viewBox="3 0 106 186"
          class="absolute left-0 top-0 h-full w-full fill-current"
        >
          <path d="M85 0 A61 101 0 0 0 85 186 L75 186 A75 101 0 0 1 75 0" />
        </svg>
      )

    case "[]":
      return (
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 11 24"
          class="absolute left-0 top-0 h-full w-full fill-current"
        >
          <path d="M8 0 L3 0 L3 24 L8 24 L8 23 L4 23 L4 1 L8 1" />
        </svg>
      )

    case "{}":
      return (
        <svg
          preserveAspectRatio="none"
          viewBox="10 0 210 350"
          class="absolute left-0 top-0 h-full w-full fill-current"
        >
          <path d="M170 0 L170 6 A47 52 0 0 0 123 60 L123 127 A35 48 0 0 1 88 175 A35 48 0 0 1 123 223 L123 290 A47 52 0 0 0 170 344 L170 350 L160 350 A58 49 0 0 1 102 301 L103 220 A45 40 0 0 0 58 180 L58 170 A45 40 0 0 0 103 130 L103 49 A58 49 0 0 1 161 0" />
        </svg>
      )

    case "||":
      return (
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 10 54"
          class="absolute left-0 top-0 h-full w-full fill-current"
        >
          <path d="M4.4 0 L4.4 54 L5.6 54 L5.6 0" />
        </svg>
      )
  }
}

export function drawRightBracket(bracket: Bracket) {
  switch (bracket) {
    case "()":
      return (
        <svg
          preserveAspectRatio="none"
          viewBox="3 0 106 186"
          class="absolute left-0 top-0 h-full w-full fill-current"
        >
          <path d="M24 0 A61 101 0 0 1 24 186 L34 186 A75 101 0 0 0 34 0" />
        </svg>
      )

    case "[]":
      return (
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 11 24"
          class="absolute left-0 top-0 h-full w-full fill-current"
        >
          <path d="M3 0 L8 0 L8 24 L3 24 L3 23 L7 23 L7 1 L3 1" />
        </svg>
      )

    case "{}":
      return (
        <svg
          preserveAspectRatio="none"
          viewBox="10 0 210 350"
          class="absolute left-0 top-0 h-full w-full fill-current"
        >
          <path d="M60 0 L60 6 A47 52 0 0 1 107 60 L107 127 A35 48 0 0 0 142 175 A35 48 0 0 0 107 223 L107 290 A47 52 0 0 1 60 344 L60 350 L70 350 A58 49 0 0 0 128 301 L127 220 A45 40 0 0 1 172 180 L172 170 A45 40 0 0 1 127 130 L127 49 A58 49 0 0 0 70 0" />
        </svg>
      )

    case "||":
      return (
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 10 54"
          class="absolute left-0 top-0 h-full w-full fill-current"
        >
          <path d="M4.4 0 L4.4 54 L5.6 54 L5.6 0" />
        </svg>
      )
  }
}

export function drawSymbol(
  symbol: ContextualizedSymbol,
  replaceSelf: (symbols: Symbol[], data: ReplacementData) => void,
) {
  switch (symbol.type) {
    case "number":
      return (
        <>
          <For each={[...symbol.value]}>
            {(letter, index) => (
              <>
                <Show when={index() === symbol.cursor}>{drawCursor()}</Show>

                <span
                  classList={{
                    "pl-[.125em]":
                      !symbol.afterDecimal &&
                      index() != 0 &&
                      (symbol.value.length - index()) % 3 == 0,
                  }}
                  data-latex="leaf"
                  onLatexTargetFind={(event) => {
                    replaceSelf(
                      [
                        {
                          type: "number",
                          value: symbol.value,
                          cursor: event.detail.offset + index(),
                        },
                      ],
                      { removeCursor: true },
                    )
                  }}
                >
                  {letter}
                </span>
              </>
            )}
          </For>

          <Show when={symbol.cursor == symbol.value.length}>
            {drawCursor()}
          </Show>
        </>
      )
    case ".":
      return (
        <span
          data-latex="leaf"
          onLatexTargetFind={(event) => {
            const array: Symbol[] = [symbol]
            array.splice(event.detail.offset, 0, { type: "cursor" })
            replaceSelf(array, { removeCursor: true })
          }}
        >
          .
        </span>
      )
    case ",":
      return (
        <span
          data-latex="leaf"
          class="pr-[.2em]"
          onLatexTargetFind={(event) => {
            const array: Symbol[] = [symbol]
            array.splice(event.detail.offset, 0, { type: "cursor" })
            replaceSelf(array, { removeCursor: true })
          }}
        >
          ,
        </span>
      )
    case "op":
      return (
        <span
          data-latex="leaf"
          class="inline-block"
          classList={{ "px-[.2em]": !symbol.isPrefix }}
          onLatexTargetFind={(event) => {
            const array: Symbol[] = [symbol]
            array.splice(event.detail.offset, 0, { type: "cursor" })
            replaceSelf(array, { removeCursor: true })
          }}
        >
          {symbol.op}
        </span>
      )
    case "var":
      return (
        <span
          data-latex="leaf"
          class="font-mathvar italic"
          onLatexTargetFind={(event) => {
            const array: Symbol[] = [symbol]
            array.splice(event.detail.offset, 0, { type: "cursor" })
            replaceSelf(array, { removeCursor: true })
          }}
        >
          {symbol.letter}
        </span>
      )
    case "const":
      return (
        <span
          data-latex="leaf"
          class="font-mathvar"
          onLatexTargetFind={(event) => {
            const array: Symbol[] = [symbol]
            array.splice(event.detail.offset, 0, { type: "cursor" })
            replaceSelf(array, { removeCursor: true })
          }}
        >
          {symbol.name}
        </span>
      )
    case "fn":
      return (
        <>
          <For each={[...symbol.value]}>
            {(letter, index) => (
              <>
                <Show when={index() === symbol.cursor}>{drawCursor()}</Show>

                <span
                  data-latex="leaf"
                  class="font-mathvar"
                  classList={{
                    "pl-[.2em]": index() == 0 && symbol.spaceBefore,
                    "pr-[.2em]":
                      index() == symbol.value.length - 1 && symbol.spaceAfter,
                  }}
                  onLatexTargetFind={(event) => {
                    replaceSelf(
                      [
                        {
                          type: "fn",
                          value: symbol.value,
                          cursor: event.detail.offset + index(),
                        },
                      ],
                      { removeCursor: true },
                    )
                  }}
                >
                  {letter}
                </span>
              </>
            )}
          </For>

          <Show when={symbol.cursor == symbol.value.length}>
            {drawCursor()}
          </Show>
        </>
      )
    case "cursor":
      return drawCursor()
    case "sqrt":
      return (
        <span class="relative inline-block">
          <span
            class="absolute bottom-[.15em] top-px inline-block w-[.95em]"
            data-latex="shape"
            onLatexTargetFind={(event) => {
              if (event.detail.offset) {
                replaceSelf(
                  [
                    {
                      type: "sqrt",
                      contents: [
                        { type: "cursor" },
                        ...prepareSymbolList(symbol.contents, {
                          removeCursor: true,
                        }),
                      ],
                    },
                  ],
                  { removeCursor: true },
                )
              } else {
                replaceSelf(
                  [
                    { type: "cursor" },
                    prepareSymbol(symbol, { removeCursor: true }),
                  ],
                  { removeCursor: true },
                )
              }
            }}
          >
            <svg
              preserveAspectRatio="none"
              viewBox="0 0 32 54"
              class="absolute left-0 top-0 h-full w-full fill-current"
            >
              <path
                d="M0 33 L7 27 L12.5 47 L13 47 L30 0 L32 0 L13 54 L11 54 L4.5 31 L0 33"
                class=""
              />
            </svg>
          </span>

          <span
            class="ml-[.9em] mr-[.1em] mt-px inline-block h-max border-t border-t-current pl-[.15em] pr-[.2em] pt-px"
            data-latex="group"
          >
            <SymbolList
              symbols={symbol.contents}
              replaceSelf={(symbols, data) =>
                replaceSelf([{ type: "sqrt", contents: symbols }], data)
              }
            />
          </span>
        </span>
      )
    case "root":
      return (
        <span class="inline-block">
          <span
            class="relative z-[1] ml-[.2em] mr-[-.6em] min-w-[.5em] align-[.8em] text-[80%]"
            data-latex="group"
          >
            <SymbolList
              symbols={symbol.root}
              replaceSelf={(symbols, data) =>
                replaceSelf(
                  [
                    {
                      type: "root",
                      contents: prepareSymbolList(symbol.contents, data),
                      root: symbols,
                    },
                  ],
                  data,
                )
              }
            />
          </span>

          <span class="relative inline-block">
            <span
              class="absolute bottom-[.15em] top-px inline-block w-[.95em]"
              data-latex="shape"
              onLatexTargetFind={(event) => {
                if (event.detail.offset) {
                  replaceSelf(
                    [
                      {
                        type: "root",
                        contents: [
                          { type: "cursor" },
                          ...prepareSymbolList(symbol.contents, {
                            removeCursor: true,
                          }),
                        ],
                        root: prepareSymbolList(symbol.root, {
                          removeCursor: true,
                        }),
                      },
                    ],
                    { removeCursor: true },
                  )
                } else {
                  replaceSelf(
                    [
                      {
                        type: "root",
                        contents: prepareSymbolList(symbol.contents, {
                          removeCursor: true,
                        }),
                        root: [
                          ...prepareSymbolList(symbol.root, {
                            removeCursor: true,
                          }),
                          { type: "cursor" },
                        ],
                      },
                    ],
                    { removeCursor: true },
                  )
                }
              }}
            >
              <svg
                preserveAspectRatio="none"
                viewBox="0 0 32 54"
                class="absolute left-0 top-0 h-full w-full fill-current"
              >
                <path
                  d="M0 33 L7 27 L12.5 47 L13 47 L30 0 L32 0 L13 54 L11 54 L4.5 31 L0 33"
                  class=""
                />
              </svg>
            </span>

            <span
              class="ml-[.9em] mr-[.1em] mt-px inline-block h-max border-t border-t-current pl-[.15em] pr-[.2em] pt-px"
              data-latex="group"
            >
              <SymbolList
                symbols={symbol.contents}
                replaceSelf={(symbols, data) =>
                  replaceSelf(
                    [
                      {
                        type: "root",
                        contents: symbols,
                        root: prepareSymbolList(symbol.root, data),
                      },
                    ],
                    data,
                  )
                }
              />
            </span>
          </span>
        </span>
      )
    case "frac":
      return (
        <span
          class="inline-block px-[.2em] text-center align-[-.4em] text-[90%]"
          data-latex="group"
        >
          <span class="block py-[.1em]" data-latex="group">
            <SymbolList
              symbols={symbol.sup}
              replaceSelf={(symbols, data) =>
                replaceSelf(
                  [
                    {
                      type: "frac",
                      sup: symbols,
                      sub: prepareSymbolList(symbol.sub, data),
                    },
                  ],
                  data,
                )
              }
            />
          </span>

          <span
            class="float-right block w-full border-t border-t-current p-[.1em]"
            data-latex="group"
          >
            <SymbolList
              symbols={symbol.sub}
              replaceSelf={(symbols, data) =>
                replaceSelf(
                  [
                    {
                      type: "frac",
                      sup: prepareSymbolList(symbol.sup, data),
                      sub: symbols,
                    },
                  ],
                  data,
                )
              }
            />
          </span>
          <span class="inline-block w-0">​</span>
        </span>
      )
    case "bracket": {
      const { w, mx } = getBracketSize(symbol.bracket)

      return (
        <span class="relative inline-block">
          <span
            class={"absolute bottom-[2px] left-0 top-0 " + w}
            data-latex="shape"
            onLatexTargetFind={(event) => {
              if (event.detail.offset) {
                replaceSelf(
                  [
                    {
                      type: "bracket",
                      bracket: symbol.bracket,
                      contents: [
                        { type: "cursor" },
                        ...prepareSymbolList(symbol.contents, {
                          removeCursor: true,
                        }),
                      ],
                    },
                  ],
                  { removeCursor: true },
                )
              } else {
                replaceSelf(
                  [
                    { type: "cursor" },
                    prepareSymbol(symbol, { removeCursor: true }),
                  ],
                  { removeCursor: true },
                )
              }
            }}
          >
            {drawLeftBracket(symbol.bracket)}
          </span>

          <span class={"my-[.1em] inline-block " + mx}>
            <SymbolList
              symbols={symbol.contents}
              replaceSelf={(symbols, data) =>
                replaceSelf(
                  [
                    {
                      type: "bracket",
                      bracket: symbol.bracket,
                      contents: symbols,
                    },
                  ],
                  data,
                )
              }
            />
          </span>

          <span
            class={"absolute bottom-[2px] right-0 top-0 " + w}
            data-latex="shape"
            onLatexTargetFind={(event) => {
              if (event.detail.offset) {
                replaceSelf(
                  [
                    prepareSymbol(symbol, { removeCursor: true }),
                    { type: "cursor" },
                  ],
                  { removeCursor: true },
                )
              } else {
                replaceSelf(
                  [
                    {
                      type: "bracket",
                      bracket: symbol.bracket,
                      contents: [
                        ...prepareSymbolList(symbol.contents, {
                          removeCursor: true,
                        }),
                        { type: "cursor" },
                      ],
                    },
                  ],
                  { removeCursor: true },
                )
              }
            }}
          >
            {drawRightBracket(symbol.bracket)}
          </span>
        </span>
      )
    }
    case "sup":
      return (
        <span
          class="mb-[-.2em] inline-block text-left align-[.5em] text-[90%]"
          classList={{ "pr-[.2em]": symbol.spaceAfter }}
        >
          <span class="inline-block align-text-bottom">
            <SymbolList
              symbols={symbol.contents}
              replaceSelf={(symbols, data) =>
                replaceSelf([{ type: "sup", contents: symbols }], data)
              }
            />
          </span>
        </span>
      )
    case "sub":
      return (
        <span
          class="mb-[-.2em] inline-block text-left align-[-.5em] text-[90%]"
          classList={{ "pr-[.2em]": symbol.spaceAfter }}
        >
          <span class="float-left block text-[80%]">
            <SymbolList
              symbols={symbol.contents}
              replaceSelf={(symbols, data) =>
                replaceSelf([{ type: "sub", contents: symbols }], data)
              }
            />
          </span>

          <span class="inline-block w-0">​</span>
        </span>
      )
    case "supsub":
      return (
        <span
          class="mb-[-.2em] inline-block text-left align-[-.5em] text-[90%]"
          classList={{ "pr-[.2em]": symbol.spaceAfter }}
        >
          <span class="block">
            <SymbolList
              symbols={symbol.sup}
              replaceSelf={(symbols, data) =>
                replaceSelf(
                  [
                    {
                      type: "supsub",
                      sup: symbols,
                      sub: prepareSymbolList(symbol.sub, data),
                    },
                  ],
                  data,
                )
              }
            />
          </span>

          <span class="float-left block text-[80%]">
            <SymbolList
              symbols={symbol.sub}
              replaceSelf={(symbols, data) =>
                replaceSelf(
                  [
                    {
                      type: "supsub",
                      sub: symbols,
                      sup: prepareSymbolList(symbol.sup, data),
                    },
                  ],
                  data,
                )
              }
            />
          </span>

          <span class="inline-block w-0">​​</span>
        </span>
      )
    case "repeat":
      return (
        <span class="inline-block p-[.2em] text-center align-[-.2em]">
          <span class="block text-[80%]" data-latex="group">
            <SymbolList
              symbols={symbol.sup}
              replaceSelf={(symbols, data) =>
                replaceSelf(
                  [
                    {
                      type: "repeat",
                      op: symbol.op,
                      sup: symbols,
                      sub: prepareSymbolList(symbol.sub, data),
                    },
                  ],
                  data,
                )
              }
            />
          </span>

          <span class="relative block text-[200%]">
            {symbol.op == "sum" ? "∑" : "∏"}
            <span
              class="absolute bottom-0 left-0 top-0 inline-block w-full origin-left scale-y-50"
              data-latex="shape"
              onLatexTargetFind={(event) => {
                const symbols = [prepareSymbol(symbol, { removeCursor: true })]
                symbols.splice(event.detail.offset, 0, { type: "cursor" })
                replaceSelf(symbols, { removeCursor: true })
              }}
            />
          </span>

          <span class="float-right block w-full text-[80%]" data-latex="group">
            <SymbolList
              symbols={symbol.sub}
              replaceSelf={(symbols, data) =>
                replaceSelf(
                  [
                    {
                      type: "repeat",
                      op: symbol.op,
                      sup: prepareSymbolList(symbol.sup, data),
                      sub: symbols,
                    },
                  ],
                  data,
                )
              }
            />
          </span>
        </span>
      )
    case "int":
      return (
        <span class="relative inline-block">
          <span class="relative inline-block scale-x-[70%] align-[-.16em] text-[200%]">
            ∫
            <span
              class="absolute bottom-0 left-0 top-0 inline-block w-full origin-left scale-x-50"
              data-latex="shape"
              onLatexTargetFind={() => {
                replaceSelf(
                  [
                    { type: "cursor" },
                    prepareSymbol(symbol, { removeCursor: true }),
                  ],
                  { removeCursor: true },
                )
              }}
            />
          </span>

          <span class="mb-[-.2em] inline-block pb-[.2em] pr-[.2em] text-left align-[-1.1em] text-[80%]">
            <span class="block" data-latex="group">
              <span class="align-[1.3em]">
                <SymbolList
                  symbols={symbol.sup}
                  replaceSelf={(symbols, data) =>
                    replaceSelf(
                      [
                        {
                          type: "int",
                          sup: symbols,
                          sub: prepareSymbolList(symbol.sub, data),
                        },
                      ],
                      data,
                    )
                  }
                />
              </span>
            </span>

            <span
              class="float-left ml-[-.35em] block text-[100%]"
              data-latex="group"
            >
              <SymbolList
                symbols={symbol.sub}
                replaceSelf={(symbols, data) =>
                  replaceSelf(
                    [
                      {
                        type: "int",
                        sub: symbols,
                        sup: prepareSymbolList(symbol.sup, data),
                      },
                    ],
                    data,
                  )
                }
              />
            </span>

            <span class="inline-block w-0">​</span>
          </span>
        </span>
      )
    case "cases": {
      const { w, mx } = getBracketSize("{}")

      return (
        <span class="relative inline-block text-left">
          <span class={"absolute bottom-[2px] left-0 top-0 " + w}>
            {drawLeftBracket("{}")}
          </span>

          <span
            class={
              "absolute bottom-[2px] left-0 top-0 origin-left scale-x-50 " + w
            }
            data-latex="shape"
            onLatexTargetFind={() => {
              replaceSelf(
                [
                  { type: "cursor" },
                  prepareSymbol(symbol, { removeCursor: true }),
                ],
                { removeCursor: true },
              )
            }}
          />

          <span class={"my-[.1em] inline-block " + mx}>
            <div class="inline-grid grid-cols-[auto,auto] gap-x-[1em] align-middle">
              {symbol.cases.flatMap(({ value, when }, index) => (
                <>
                  <span class="py-[.1em]" data-latex="group">
                    <SymbolList
                      symbols={value}
                      replaceSelf={(symbols, data) =>
                        replaceSelf(
                          [
                            {
                              type: "cases",
                              cases: symbol.cases.map(
                                ({ value, when }, myIndex) => {
                                  if (index == myIndex) {
                                    return {
                                      value: symbols,
                                      when: prepareSymbolList(when, data),
                                    }
                                  } else {
                                    return {
                                      value: prepareSymbolList(value, data),
                                      when: prepareSymbolList(when, data),
                                    }
                                  }
                                },
                              ),
                            },
                          ],
                          data,
                        )
                      }
                    />
                  </span>

                  <span class="py-[.1em]" data-latex="group">
                    <SymbolList
                      symbols={when}
                      replaceSelf={(symbols, data) =>
                        replaceSelf(
                          [
                            {
                              type: "cases",
                              cases: symbol.cases.map(
                                ({ value, when }, myIndex) => {
                                  if (index == myIndex) {
                                    return {
                                      value: prepareSymbolList(value, data),
                                      when: symbols,
                                    }
                                  } else {
                                    return {
                                      value: prepareSymbolList(value, data),
                                      when: prepareSymbolList(when, data),
                                    }
                                  }
                                },
                              ),
                            },
                          ],
                          data,
                        )
                      }
                    />
                  </span>
                </>
              ))}
            </div>
          </span>

          <span
            class={
              "absolute bottom-[2px] right-0 top-0 origin-right scale-x-50 " + w
            }
            data-latex="shape"
            onLatexTargetFind={() => {
              replaceSelf(
                [
                  prepareSymbol(symbol, { removeCursor: true }),
                  { type: "cursor" },
                ],
                { removeCursor: true },
              )
            }}
          />

          <span class={"absolute bottom-[2px] right-0 top-0 " + w}>
            {drawRightBracket("{}")}
          </span>
        </span>
      )
    }
    case "matrix": {
      const { w, mx } = getBracketSize("[]")

      return (
        <span class="relative inline-block text-center">
          <span class={"absolute bottom-[2px] left-0 top-0 " + w}>
            {drawLeftBracket("[]")}
          </span>

          <span
            class={
              "absolute bottom-[2px] left-0 top-0 origin-left scale-x-50 " + w
            }
            data-latex="shape"
            onLatexTargetFind={() => {
              replaceSelf(
                [
                  { type: "cursor" },
                  prepareSymbol(symbol, { removeCursor: true }),
                ],
                { removeCursor: true },
              )
            }}
          />

          <span class={"my-[.1em] inline-block " + mx}>
            <div
              class="inline-grid gap-x-[.5em] align-middle"
              style={{
                "grid-template-columns": `repeat(${symbol.data.reduce(
                  (a, b) => Math.max(a, b.length),
                  1,
                )},auto)`,
              }}
            >
              {symbol.data.flatMap((row, i) =>
                row.map((cell, j) => (
                  <span
                    class="py-[.1em]"
                    data-latex="group"
                    style={{ "grid-area": `${i} ${j} ${i + 1} ${j + 1}` }}
                  >
                    <SymbolList
                      symbols={cell}
                      replaceSelf={(symbols, data) =>
                        replaceSelf(
                          [
                            {
                              type: "matrix",
                              data: symbol.data.map((row, rowI) =>
                                row.map((cell, cellJ) => {
                                  if (i == rowI && j == cellJ) {
                                    return symbols
                                  } else {
                                    return prepareSymbolList(cell, data)
                                  }
                                }),
                              ),
                            },
                          ],
                          data,
                        )
                      }
                    />
                  </span>
                )),
              )}
            </div>
          </span>

          <span
            class={
              "absolute bottom-[2px] right-0 top-0 origin-right scale-x-50 " + w
            }
            data-latex="shape"
            onLatexTargetFind={() => {
              replaceSelf(
                [
                  prepareSymbol(symbol, { removeCursor: true }),
                  { type: "cursor" },
                ],
                { removeCursor: true },
              )
            }}
          />

          <span class={"absolute bottom-[2px] right-0 top-0 " + w}>
            {drawRightBracket("[]")}
          </span>
        </span>
      )
    }
    case "ans":
      return (
        <span
          class="relative mb-[2px] mr-px inline-block min-w-[1.6304347826em] overflow-ellipsis rounded-[4px] border-2 border-blue-500 bg-blue-500/10 px-[.4em] py-[.2em] text-center align-middle text-blue-500 after:absolute after:bottom-[-.5em] after:left-[50%] after:h-[1em] after:w-[1.9em] after:-translate-x-1/2 after:overflow-hidden after:rounded-[3px] after:border after:border-blue-500 after:bg-z-body after:p-0 after:text-center after:text-[60%] after:text-blue-500 after:transition after:content-['ans'] after:[line-height:.9em]"
          data-latex-ignore
          data-latex="leaf"
          onLatexTargetFind={(event) => {
            const symbols: Symbol[] = [
              {
                type: "ans",
                contents: prepareSymbolList(symbol.contents, {
                  removeCursor: true,
                }),
              },
            ]
            symbols.splice(event.detail.offset, 0, { type: "cursor" })
            replaceSelf(symbols, { removeCursor: true })
          }}
        >
          <SymbolList
            symbols={symbol.contents}
            replaceSelf={(symbols, data) =>
              replaceSelf([{ type: "ans", contents: symbols }], data)
            }
          />
        </span>
      )
  }

  // @ts-expect-error this should never be reached
  throw new Error("this should never be reached")
}

export interface TargetInfo {
  node: Element
  x: number
  y: number
  type: "leaf" | "shape" | "group" | undefined
  score: 0 | 1 | 2 | 3
}

export function getTargetInfo(
  clientX: number,
  clientY: number,
  node: Element,
): TargetInfo {
  const type = node.getAttribute("data-latex")

  const score =
    type == "leaf" ? 0 : type == "shape" ? 1 : type == "group" ? 2 : 3

  const box = node.getBoundingClientRect()

  const xmin = box.x
  const xmax = box.x + box.width
  const ymin = box.y
  const ymax = box.y + box.height

  return {
    node,
    x: clientX < xmin ? xmin - clientX : clientX > xmax ? clientX - xmax : 0,
    y: clientY < ymin ? ymin - clientY : clientY > ymax ? clientY - ymax : 0,
    type: (["leaf", "shape", "group", ,] as const)[score],
    score: score,
  }
}

export function findTarget(
  clientX: number,
  clientY: number,
  within: Element,
): TargetInfo | undefined {
  const targets = Array.from(
    within.querySelectorAll("[data-latex]:not([data-latex-ignore] *)"),
  )
    .map((target) => getTargetInfo(clientX, clientY, target))
    .sort((a, b) => a.score - b.score)

  if (!targets.length) {
    if (within.hasAttribute("data-latex")) {
      return getTargetInfo(clientX, clientY, within)
    } else {
      return
    }
  }

  const matchingX = targets.filter((target) => target.x == 0)

  if (matchingX.length) {
    const node = matchingX.reduce((a, b) => (a.y < b.y ? a : b))!

    if (node.type == "group") {
      return findTarget(clientX, clientY, node.node)
    } else {
      return node
    }
  }

  const matchingY = targets.filter((target) => target.y == 0)

  if (matchingY.length) {
    const node = matchingY.reduce((a, b) => (a.x < b.x ? a : b))!

    if (node.type == "group") {
      return findTarget(clientX, clientY, node.node)
    } else {
      return node
    }
  }

  const closest = targets.reduce((a, b) =>
    Math.hypot(a.x, a.y) < Math.hypot(b.x, b.y) ? a : b,
  )!

  return closest
}

export type LatexTargetFindEvent = CustomEvent<{ offset: 0 | 1 }>

export function symbolsHaveCursor(symbols: Symbol[]) {
  return symbols.some((a) => symbolHasCursor(a))
}

export function symbolHasCursor(symbol: Symbol): boolean {
  switch (symbol.type) {
    case "cursor":
      return true
    case "number":
      return symbol.cursor != null
    case "fn":
      return symbol.cursor != null
    case "op":
    case ".":
    case ",":
    case "var":
    case "const":
      return false
    case "sup":
    case "sub":
    case "sqrt":
    case "bracket":
    case "ans":
      return symbolsHaveCursor(symbol.contents)
    case "root":
      return (
        symbolsHaveCursor(symbol.root) || symbolsHaveCursor(symbol.contents)
      )
    case "frac":
    case "supsub":
    case "repeat":
    case "int":
      return symbolsHaveCursor(symbol.sub) || symbolsHaveCursor(symbol.sup)
    case "matrix":
      return symbol.data.some((a) => a.some((a) => symbolsHaveCursor(a)))
    case "cases":
      return symbol.cases.some(
        ({ value, when }) =>
          symbolsHaveCursor(value) || symbolsHaveCursor(when),
      )
  }
}

/** Abstracts cursor operations because they're complicated. */
export class SymbolListWithCursor {
  constructor(
    readonly root: Symbol[],
    readonly list: Symbol[],
    readonly cursorIndex: number,
    readonly parentList: Symbol[] | undefined,
    readonly parentSymbolIndex: number | undefined,
    readonly parentSymbolDataLocation: string | string[] | undefined,
  ) {}

  insertLeft(symbols: Symbol[]) {
    const cursor = this.list[this.cursorIndex]

    switch (cursor?.type) {
      case "cursor": {
        spliceSymbolsInPlace(this.list, this.cursorIndex, 0, symbols)
        return
      }

      case "number": {
        if (cursor.cursor == null) {
          throw new Error("Invalid cursor position.")
        }

        if (cursor.cursor == 0) {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 0, symbols)
          return
        }

        if (cursor.cursor == cursor.value.length) {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
            {
              type: "number",
              value: cursor.value,
            },
            ...symbols,
            { type: "cursor" },
          ])
          return
        }

        spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
          {
            type: "number",
            value: cursor.value.slice(0, cursor.cursor),
          },
          ...symbols,
          {
            type: "number",
            cursor: 0,
            value: cursor.value.slice(cursor.cursor),
          },
        ])
        return
      }

      case "fn": {
        if (cursor.cursor == null) {
          throw new Error("Invalid cursor position.")
        }

        if (cursor.cursor == 0) {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 0, symbols)
          return
        }

        if (cursor.cursor == cursor.value.length) {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
            {
              type: "fn",
              value: cursor.value,
            },
            ...symbols,
            { type: "cursor" },
          ])
          return
        }

        spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
          {
            type: "fn",
            value: cursor.value.slice(0, cursor.cursor),
          },
          ...symbols,
          {
            type: "fn",
            cursor: 0,
            value: cursor.value.slice(cursor.cursor),
          },
        ])
        return
      }
    }

    throw new Error("Invalid cursor position.")
  }

  /** Deletes the symbol the cursor is in. */
  deleteParentSymbol() {
    if (!this.parentList || this.parentSymbolIndex == null) {
      return
    }

    const symbol = this.parentList[this.parentSymbolIndex]

    if (!symbol) {
      throw new Error("Invalid parent list.")
    }

    switch (symbol.type) {
      case "number":
      case "fn":
      case "op":
      case ".":
      case ",":
      case "var":
      case "const":
      case "cursor":
        throw new Error("Invalid parent symbol " + symbol.type + ".")

      case "ans":
        spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
          { type: "cursor" },
        ])
        return

      case "sup":
      case "sub":
      case "sqrt":
      case "bracket":
        spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
          { type: "cursor" },
          ...symbol.contents,
        ])
        return

      case "supsub":
        switch (this.parentSymbolDataLocation) {
          case "sup":
            spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
              { type: "sub", contents: symbol.sub },
              { type: "cursor" },
              ...symbol.sup,
            ])
            return

          case "sub":
            spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
              { type: "cursor" },
              ...symbol.sub,
              { type: "sup", contents: symbol.sup },
            ])
            return

          default:
            throw new Error("Invalid 'supsub' data location.")
        }

      case "root":
        switch (this.parentSymbolDataLocation) {
          case "root":
            spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
              { type: "cursor" },
              ...symbol.root,
              ...symbol.contents,
            ])
            return

          case "contents":
            spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
              ...symbol.root,
              { type: "cursor" },
              ...symbol.contents,
            ])
            return

          default:
            throw new Error("Invalid 'root' data location.")
        }

      case "frac":
      case "repeat":
      case "int":
        switch (this.parentSymbolDataLocation) {
          case "sub":
            spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
              { type: "cursor" },
              ...symbol.sub,
              ...symbol.sup,
            ])
            return

          case "sup":
            spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
              ...symbol.sub,
              { type: "cursor" },
              ...symbol.sup,
            ])
            return

          default:
            throw new Error(`Invalid '${symbol.type}' data location.`)
        }

      case "matrix":
      case "cases":
      // TODO:
    }
  }

  /** Deletes a character to the left. */
  deleteLeft() {
    const cursor = this.list[this.cursorIndex]

    switch (cursor?.type) {
      case "cursor": {
        break
      }

      case "number":
      case "fn": {
        if (cursor.cursor == null) {
          throw new Error("Invalid cursor position.")
        }

        if (cursor.cursor == 0) {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
            { type: "cursor" },
            { type: cursor.type, value: cursor.value },
          ])
          break
        }

        const nextValue =
          cursor.value.slice(0, cursor.cursor - 1) +
          cursor.value.slice(cursor.cursor)

        if (nextValue) {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
            {
              type: cursor.type,
              value: nextValue,
              cursor: cursor.cursor - 1,
            },
          ])
        } else {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
            {
              type: "cursor",
            },
          ])
        }

        return
      }

      default:
        throw new Error("Invalid cursor position.")
    }

    if (this.cursorIndex == 0) {
      this.deleteParentSymbol()
      return
    }

    const prev = this.list[this.cursorIndex - 1]!

    switch (prev.type) {
      case "number":
      case "fn":
        if (prev.value.length <= 1) {
          spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 1, [])
          return
        } else {
          spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 1, [
            {
              type: prev.type,
              value: prev.value.slice(0, -1),
            },
          ])
          return
        }

      default:
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 1, [])
    }
  }

  /** Moves the cursor left in its parent list. */
  moveLeftInParent() {
    if (!this.parentList || this.parentSymbolIndex == null) {
      return
    }

    spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
      { type: "cursor" },
      prepareSymbol(this.parentList[this.parentSymbolIndex]!, {
        removeCursor: true,
      }),
    ])
  }

  /** Moves the cursor to the left. */
  moveLeft() {
    const cursor = this.list[this.cursorIndex]

    switch (cursor?.type) {
      case "cursor":
        break

      case "number":
      case "fn":
        if (cursor.cursor == null) {
          throw new Error("Invalid cursor position.")
        }

        if (cursor.cursor == 0) {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
            { type: "cursor" },
            { type: cursor.type, value: cursor.value },
          ])
          break
        }

        spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
          {
            type: cursor.type,
            value: cursor.value,
            cursor: cursor.cursor - 1,
          },
        ])
        return

      default:
        throw new Error("Invalid cursor position.")
    }

    if (this.cursorIndex == 0) {
      this.moveLeftInParent()
      return
    }

    const prev = this.list[this.cursorIndex - 1]!

    switch (prev.type) {
      case "cursor":
        throw new Error("Invalid cursor location.")

      case "number":
      case "fn":
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 2, [
          {
            type: prev.type,
            value: prev.value,
            cursor: prev.value.length - 1,
          },
        ])
        return

      case "op":
      case ".":
      case ",":
      case "ans":
      case "var":
      case "const":
      case "matrix": // TODO: improve matrix
      case "cases": // TODO: improve cases
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 2, [
          { type: "cursor" },
          prev,
        ])
        return

      case "sup":
      case "sub":
      case "sqrt":
      case "root":
      case "bracket":
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 2, [
          {
            ...prev,
            contents: [...prev.contents, { type: "cursor" }],
          },
        ])
        return

      case "supsub":
      case "frac":
      case "int":
      case "repeat":
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 2, [
          {
            ...prev,
            sup: [...prev.sup, { type: "cursor" }],
          },
        ])
        return
    }
  }

  /** Moves the cursor right in its parent list. */
  moveRightInParent() {
    if (!this.parentList || this.parentSymbolIndex == null) {
      return
    }

    spliceSymbolsInPlace(this.parentList, this.parentSymbolIndex, 1, [
      prepareSymbol(this.parentList[this.parentSymbolIndex]!, {
        removeCursor: true,
      }),
      { type: "cursor" },
    ])
  }

  /** Moves the cursor to the right. */
  moveRight() {
    const cursor = this.list[this.cursorIndex]

    switch (cursor?.type) {
      case "cursor":
        break

      case "number":
      case "fn":
        if (cursor.cursor == null) {
          throw new Error("Invalid cursor position.")
        }

        if (cursor.cursor == cursor.value.length) {
          spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
            { type: cursor.type, value: cursor.value },
            { type: "cursor" },
          ])
          break
        }

        spliceSymbolsInPlace(this.list, this.cursorIndex, 1, [
          {
            type: cursor.type,
            value: cursor.value,
            cursor: cursor.cursor + 1,
          },
        ])
        return

      default:
        throw new Error("Invalid cursor position.")
    }

    if (this.cursorIndex == this.list.length - 1) {
      this.moveRightInParent()
      return
    }

    const next = this.list[this.cursorIndex + 1]!

    switch (next.type) {
      case "cursor":
        throw new Error("Invalid cursor location.")

      case "number":
      case "fn":
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 2, [
          {
            type: next.type,
            value: next.value,
            cursor: 1,
          },
        ])
        return

      case "op":
      case ".":
      case ",":
      case "ans":
      case "var":
      case "const":
      case "matrix": // TODO: improve matrix
      case "cases": // TODO: improve cases
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 2, [
          next,
          { type: "cursor" },
        ])
        return

      case "sup":
      case "sub":
      case "sqrt":
      case "root":
      case "bracket":
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 2, [
          {
            ...next,
            contents: [{ type: "cursor" }, ...next.contents],
          },
        ])
        return

      case "supsub":
      case "frac":
      case "int":
      case "repeat":
        spliceSymbolsInPlace(this.list, this.cursorIndex - 1, 2, [
          {
            ...next,
            sup: [{ type: "cursor" }, ...next.sup],
          },
        ])
        return
    }
  }
}

export function findCursor(
  symbols: Symbol[],
  parent?: Symbol[],
  parentSymbolIndex?: number,
  parentSymbolKey?: string | string[],
  root = symbols,
): SymbolListWithCursor | undefined {
  for (let index = 0; index < symbols.length; index++) {
    const symbol = symbols[index]!

    switch (symbol.type) {
      case "number":
      case "fn":
        if (symbol.cursor == null) {
          break
        } else {
          return new SymbolListWithCursor(
            root,
            symbols,
            index,
            parent,
            parentSymbolIndex,
            parentSymbolKey,
          )
        }

      case "cursor":
        return new SymbolListWithCursor(
          root,
          symbols,
          index,
          parent,
          parentSymbolIndex,
          parentSymbolKey,
        )

      case "op":
      case ".":
      case ",":
      case "var":
      case "const":
        break

      case "sup":
      case "sub":
      case "sqrt":
      case "ans":
      case "bracket": {
        const contents = findCursor(
          symbol.contents,
          symbols,
          index,
          "contents",
          root,
        )
        if (contents) {
          return contents
        }

        break
      }

      case "supsub":
      case "frac":
      case "repeat":
      case "int": {
        const sup = findCursor(symbol.sup, symbols, index, "sup", root)
        if (sup) {
          return sup
        }

        const sub = findCursor(symbol.sub, symbols, index, "sub", root)
        if (sub) {
          return sub
        }

        break
      }

      case "root": {
        const r = findCursor(symbol.root, symbols, index, "root", root)
        if (r) {
          return r
        }

        const contents = findCursor(
          symbol.contents,
          symbols,
          index,
          "contents",
          root,
        )
        if (contents) {
          return contents
        }

        break
      }

      case "matrix": {
        for (let rowIndex = 0; rowIndex < symbol.data.length; rowIndex++) {
          const row = symbol.data[rowIndex]!
          for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
            const cell = row[cellIndex]!
            const data = findCursor(
              cell,
              symbols,
              index,
              ["data", "" + rowIndex, "" + cellIndex],
              root,
            )
            if (data) {
              return data
            }
          }
        }

        break
      }

      case "cases": {
        for (let caseIndex = 0; caseIndex < symbol.cases.length; caseIndex++) {
          const { value, when } = symbol.cases[caseIndex]!

          const v = findCursor(
            value,
            symbols,
            index,
            ["cases", "" + caseIndex],
            root,
          )
          if (v) {
            return v
          }

          const w = findCursor(
            when,
            symbols,
            index,
            ["cases", "" + caseIndex],
            root,
          )
          if (w) {
            return w
          }
        }

        break
      }

      default:
        throw new Error("this should never be reached")
    }
  }

  return
}

export function Field(props: {
  symbols: () => Symbol[]
  setSymbols: (symbols: Symbol[]) => void
  debug?: boolean
}) {
  let fieldEl: HTMLDivElement | undefined

  return (
    <div
      class="cursor-text select-none whitespace-nowrap font-mathnum text-[1.265em] font-normal not-italic text-black transition [line-height:1] focus:outline-none dark:text-white [&_*]:cursor-text"
      tabIndex={0}
      classList={{
        "[&_[data-latex=leaf]]:bg-blue-500/50": props.debug,
        "[&_[data-latex=shape]]:bg-green-500/50": props.debug,
        "[&_[data-latex=group]]:bg-red-500/50": props.debug,
        "bg-yellow-100": props.debug,
      }}
      onPointerDown={(event) => {
        const target = findTarget(
          event.clientX,
          event.clientY,
          event.currentTarget,
        )?.node

        if (target) {
          event.preventDefault()

          const { x, width } = target.getBoundingClientRect()
          const offset = +(event.clientX - x > width / 2) as 0 | 1

          target.dispatchEvent(
            new CustomEvent("latextargetfind", { detail: { offset } }),
          )
        }
      }}
      ref={(el) => (fieldEl = el)}
      onFocus={() => {
        if (!findCursor(props.symbols())) {
          props.setSymbols([
            { type: "cursor" },
            ...prepareSymbolList(props.symbols(), { removeCursor: true }),
          ])
        }
      }}
      onBlur={() => {
        props.setSymbols(
          prepareSymbolList(props.symbols(), { removeCursor: true }),
        )
      }}
      onKeyDown={(event) => {
        if (event.ctrlKey || event.metaKey) {
          return
        }

        event.preventDefault()

        const nextSymbols = structuredClone(props.symbols())
        const cursor = findCursor(nextSymbols)

        if (cursor) {
          if (event.key == "Backspace") {
            cursor.deleteLeft()
          } else if (event.key == "ArrowLeft") {
            cursor.moveLeft()
          } else if (event.key == "ArrowRight") {
            cursor.moveRight()
          } else {
            if ("0123456789".includes(event.key)) {
              cursor.insertLeft([{ type: "number", value: event.key[0]! }])
            } else {
              cursor.insertLeft([{ type: "var", letter: event.key[0]! }])
            }
          }

          props.setSymbols(nextSymbols)
        }
      }}
    >
      <SymbolList
        symbols={props.symbols()}
        replaceSelf={(symbols) => {
          props.setSymbols(symbols)

          if (symbolsHaveCursor(symbols)) {
            fieldEl?.focus()
          } else {
            fieldEl?.blur()
          }
        }}
      />
    </div>
  )
}

export function ReadonlyField(props: { symbols: Symbol[] }) {
  return <Field symbols={() => props.symbols} setSymbols={() => {}} />
}

export function Main() {
  const [symbols, setSymbols] = createSignal<Symbol[]>([
    { type: "var", letter: "x" },
    { type: "var", letter: "x" },
    {
      type: "sup",
      contents: [
        { type: "number", value: "2" },
        { type: "var", letter: "x" },
        { type: "sup", contents: [{ type: "number", value: "2" }] },
      ],
    },
    { type: "var", letter: "x" },
    { type: "sub", contents: [{ type: "number", value: "1" }] },
    { type: "var", letter: "x" },
    {
      type: "supsub",
      sup: [
        { type: "op", op: "-" },
        { type: "number", value: "2" },
      ],
      sub: [{ type: "number", value: "1" }],
    },
    {
      type: "root",
      root: [
        { type: "number", value: "2" },
        { type: "op", op: "+" },
        { type: "number", value: "3" },
      ],
      contents: [
        { type: "number", value: "4" },
        { type: "op", op: "-" },
        { type: "number", value: "5" },
        {
          type: "sqrt",
          contents: [
            { type: "number", value: "623" },
            { type: "ans", contents: [{ type: "number", value: "5" }] },
            { type: "op", op: "+" },
            {
              type: "bracket",
              bracket: "()",
              contents: [
                {
                  type: "frac",
                  sup: [
                    { type: "number", value: "33498" },
                    { type: "." },
                    { type: "number", value: "423101" },
                  ],
                  sub: [{ type: "number", value: "4" }],
                },
              ],
            },
          ],
        },
      ],
    },
    { type: "op", op: "+" },
    {
      type: "frac",
      sup: [
        { type: "number", value: "2" },
        { type: "const", name: "π" },
      ],
      sub: [{ type: "number", value: "4" }],
    },
    {
      type: "repeat",
      op: "sum",
      sub: [
        { type: "var", letter: "n" },
        { type: "op", op: "=" },
        { type: "number", value: "1" },
        { type: "var", letter: "x" },
        { type: "var", letter: "x" },
        { type: "sup", contents: [{ type: "number", value: "2" }] },
        { type: "var", letter: "x" },
        { type: "sub", contents: [{ type: "number", value: "1" }] },
      ],
      sup: [
        { type: "number", value: "4" },
        { type: "var", letter: "x" },
        { type: "var", letter: "x" },
        { type: "sup", contents: [{ type: "number", value: "2" }] },
        { type: "var", letter: "x" },
        { type: "sub", contents: [{ type: "number", value: "1" }] },
      ],
    },
    {
      type: "int",
      sub: [
        { type: "number", value: "1" },
        {
          type: "int",
          sub: [
            { type: "number", value: "1" },
            {
              type: "int",
              sub: [{ type: "number", value: "1" }],
              sup: [{ type: "number", value: "4" }],
            },
          ],
          sup: [{ type: "number", value: "4" }],
        },
      ],
      sup: [
        { type: "number", value: "4" },
        {
          type: "repeat",
          op: "sum",
          sub: [
            { type: "var", letter: "n" },
            { type: "op", op: "=" },
            { type: "number", value: "1" },
          ],
          sup: [{ type: "number", value: "4" }],
        },
        {
          type: "int",
          sub: [
            { type: "number", value: "1" },
            {
              type: "int",
              sub: [
                { type: "number", value: "1" },
                {
                  type: "int",
                  sub: [{ type: "number", value: "1" }],
                  sup: [{ type: "number", value: "4" }],
                },
              ],
              sup: [{ type: "number", value: "4" }],
            },
          ],
          sup: [{ type: "number", value: "4" }],
        },
        {
          type: "fn",
          value: "log",
        },
        {
          type: "sub",
          contents: [{ type: "number", value: "2" }],
        },
        {
          type: "number",
          value: "3",
        },
      ],
    },
    {
      type: "fn",
      value: "log",
    },
    {
      type: "sub",
      contents: [{ type: "number", value: "2" }],
    },
    {
      type: "number",
      value: "3",
    },
    {
      type: "cases",
      cases: [
        {
          value: [
            { type: "number", value: "3" },
            { type: "op", op: "+" },
            { type: "number", value: "3" },
          ],
          when: [
            { type: "var", letter: "x" },
            { type: "op", op: "<" },
            { type: "number", value: "4" },
          ],
        },
        {
          value: [{ type: "number", value: "8" }],
          when: [
            { type: "var", letter: "x" },
            { type: "op", op: "<" },
            { type: "number", value: "40" },
          ],
        },
        {
          value: [
            { type: "number", value: "45" },
            { type: "sup", contents: [{ type: "number", value: "2" }] },
          ],
          when: [{ type: "fn", value: "else" }],
        },
      ],
    },
    {
      type: "matrix",
      data: [
        [
          [
            { type: "fn", value: "log" },
            { type: "op", op: "-" },
            { type: "number", value: "2" },
          ],
          [
            { type: "fn", value: "log" },
            { type: "sub", contents: [{ type: "number", value: "10" }] },
            { type: "op", op: "-" },
            { type: "number", value: "2" },
          ],
        ],
        [
          [
            { type: "number", value: "3" },
            { type: "op", op: "-" },
            { type: "number", value: "2" },
          ],
          [
            { type: "number", value: "4" },
            { type: "op", op: "-" },
            { type: "number", value: "2" },
          ],
        ],
      ],
    },
  ])

  return (
    <div class="m-auto pr-6 text-center">
      <Field symbols={symbols} setSymbols={setSymbols} />
    </div>
  )
}
