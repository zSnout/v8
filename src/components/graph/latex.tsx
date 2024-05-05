import { For, Show, createSignal } from "solid-js"
import "./latex.postcss"

// if you see empty <span>s, they probably have the `​` character. don't delete

export type Bracket = "()" | "[]" | "{}" | "||"

export type PiecewiseSection = { value: Symbol[]; when: Symbol[] }

export type BaseSymbol =
  | { type: "." }
  | { type: "," }
  | { type: "var"; letter: string }
  | { type: "const"; name: string }
  | { type: "cursor" }
  | { type: "sqrt"; contents: Symbol[] }
  | { type: "root"; root: Symbol[]; contents: Symbol[] }
  | { type: "frac"; sup: Symbol[]; sub: Symbol[] }
  | { type: "bracket"; bracket: Bracket; contents: Symbol[] }
  | { type: "repeat"; op: "sum" | "prod"; sub: Symbol[]; sup: Symbol[] }
  | { type: "int"; sub: Symbol[]; sup: Symbol[] }
  | { type: "matrix"; data: Symbol[][][] } // such a silly type definition
  | { type: "cases"; cases: PiecewiseSection[] }

export type Symbol =
  | { type: "number"; value: string; cursor?: number }
  | { type: "fn"; name: string; cursor?: number }
  | { type: "sup"; contents: Symbol[] }
  | { type: "sub"; contents: Symbol[] }
  | { type: "supsub"; sup: Symbol[]; sub: Symbol[] }
  | { type: "op"; op: string }
  | BaseSymbol

export type ContextualizedSymbol =
  | { type: "number"; value: string; afterDecimal: boolean; cursor?: number }
  | {
      type: "fn"
      name: string
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

/**
 * Gets the index the cursor should be at based on where an element was clicked
 * on. Also stops event from executing default action and stops
 * propogation immediately.
 */
function cursorIndexShift(event: {
  currentTarget: { getBoundingClientRect(): { x: number; width: number } }
  clientX: number
  preventDefault: () => void
  stopImmediatePropagation: () => void
}) {
  const { x, width } = event.currentTarget.getBoundingClientRect()

  event.preventDefault()
  event.stopImmediatePropagation()

  return +(event.clientX - x > width / 2)
}

// @ts-expect-error this function should never be used
// its purpose is to ensure that all contextualized symbols are variants
// of normal symbols, so that replacement works properly
function assertAllContextualVariantsAreSubtypesOfNormal(
  contextual: ContextualizedSymbol,
): Symbol {
  return contextual
}

export function isNumericSymbolOnRHS(
  symbol: Symbol,
  prev: Symbol | undefined,
): boolean {
  switch (symbol.type) {
    case "cursor":
      return prev ? isNumericSymbolOnRHS(prev, undefined) : false

    case "number":
    case ".":
    case "var":
    case "const":
    case "sqrt":
    case "root":
    case "frac":
    case "sup":
    case "sub":
    case "supsub":
    case "bracket":
    case "cases":
    case "matrix":
      return true

    case ",":
    case "fn":
    case "op":
    case "repeat":
    case "int":
      return false
  }
}

/** Splices symbols, then joins numbers and function names. */
export function spliceSymbols(
  current: Symbol[],
  index: number,
  deleteCount: number,
  inserted: Symbol[],
): Symbol[] {
  return current.toSpliced(index, deleteCount, ...inserted)
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
      .map<Symbol>((symbol) => {
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
      })
  }

  return [symbols, index]
}

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
                name: symbol.name,
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
                  onClick={(event) => {
                    replaceSelf(
                      [
                        {
                          type: "number",
                          value: symbol.value,
                          cursor: cursorIndexShift(event) + index(),
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
      return <span>.</span>
    case ",":
      return <span class="pr-[.2em]">,</span>
    case "op":
      return (
        <span classList={{ "px-[.2em]": !symbol.isPrefix }}>{symbol.op}</span>
      )
    case "var":
      return <span class="font-mathvar italic">{symbol.letter}</span>
    case "const":
      return <span class="font-mathvar">{symbol.name}</span>
    case "fn":
      return (
        <>
          <For each={[...symbol.name]}>
            {(letter, index) => (
              <>
                <Show when={index() === symbol.cursor}>{drawCursor()}</Show>

                <span
                  class="font-mathvar"
                  classList={{
                    "pl-[.2em]": index() == 0 && symbol.spaceBefore,
                    "pr-[.2em]":
                      index() == symbol.name.length - 1 && symbol.spaceAfter,
                  }}
                >
                  {letter}
                </span>
              </>
            )}
          </For>

          <Show when={symbol.cursor == symbol.name.length}>{drawCursor()}</Show>
        </>
      )
    case "cursor":
      return drawCursor()
    case "sqrt":
      return (
        <span class="relative inline-block">
          <span class="absolute bottom-[.15em] top-px inline-block w-[.95em]">
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

          <span class="ml-[.9em] mr-[.1em] mt-px inline-block h-max border-t border-t-current pl-[.15em] pr-[.2em] pt-px">
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
          <span class="relative z-[1] ml-[.2em] mr-[-.6em] min-w-[.5em] align-[.8em] text-[80%]">
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
            <span class="absolute bottom-[.15em] top-px inline-block w-[.95em]">
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

            <span class="ml-[.9em] mr-[.1em] mt-px inline-block h-max border-t border-t-current pl-[.15em] pr-[.2em] pt-px">
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
        <span class="inline-block px-[.2em] text-center align-[-.4em] text-[90%]">
          <span class="block py-[.1em]">
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
          <span class="float-right block w-full border-t border-t-current p-[.1em]">
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
          <span class={"absolute bottom-[2px] left-0 top-0 " + w}>
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

          <span class={"absolute bottom-[2px] right-0 top-0 " + w}>
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
          <span class="block text-[80%]">
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
          <span class="block text-[200%]">
            {symbol.op == "sum" ? "∑" : "∏"}
          </span>
          <span class="float-right block w-full text-[80%]">
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
        <span class="inline-block">
          <span class="inline-block scale-x-[70%] align-[-.16em] text-[200%]">
            ∫
          </span>

          <span class="mb-[-.2em] inline-block pr-[.2em] text-left align-[-1.1em] text-[80%]">
            <span class="block">
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

            <span class="float-left ml-[-.35em] block text-[100%]">
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

          <span class={"my-[.1em] inline-block " + mx}>
            <div class="inline-grid grid-cols-[auto,auto] gap-x-[1em] align-middle">
              {symbol.cases.flatMap(({ value, when }, index) => (
                <>
                  <span class="py-[.1em]">
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

                  <span class="py-[.1em]">
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

          <span class={"absolute bottom-[2px] right-0 top-0 " + w}>
            {drawRightBracket("[]")}
          </span>
        </span>
      )
    }
  }

  // @ts-expect-error this should never be reached
  throw new Error("this should never be reached")
}

export function Field(props: {
  symbols: () => Symbol[]
  setSymbols: (symbols: Symbol[]) => void
}) {
  return (
    <div class="whitespace-nowrap font-mathnum text-[1.265em] font-normal not-italic text-black [line-height:1]">
      <SymbolList
        symbols={props.symbols()}
        replaceSelf={(symbols) => props.setSymbols(symbols)}
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
    { type: "sup", contents: [{ type: "number", value: "2" }] },
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
            {
              type: "bracket",
              bracket: "()",
              contents: [
                {
                  type: "frac",
                  sup: [{ type: "number", value: "33498423101" }],
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
      ],
      sup: [{ type: "number", value: "4" }],
    },
    {
      type: "int",
      sub: [{ type: "number", value: "1" }],
      sup: [{ type: "number", value: "4" }],
    },
    {
      type: "fn",
      name: "log",
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
          when: [{ type: "fn", name: "otherwise" }],
        },
      ],
    },
    {
      type: "matrix",
      data: [
        [[{ type: "number", value: "1984" }], [{ type: "number", value: "2" }]],
        [[{ type: "number", value: "3" }], [{ type: "number", value: "4" }]],
      ],
    },
  ])

  return (
    <div class="m-auto flex select-none flex-col gap-4 text-center">
      <Field symbols={symbols} setSymbols={setSymbols} />
    </div>
  )
}
