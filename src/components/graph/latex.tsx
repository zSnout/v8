import "./latex.postcss"

export type Bracket = "()" | "[]" | "{}" | "||"

export type BaseSymbol =
  | { type: "." }
  | { type: "," }
  | { type: "op"; op: string }
  | { type: "var"; letter: string }
  | { type: "const"; name: string }
  | { type: "cursor" }
  | { type: "sqrt"; contents: Symbol[] }
  | { type: "root"; root: Symbol[]; contents: Symbol[] }
  | { type: "frac"; top: Symbol[]; bottom: Symbol[] }
  | { type: "bracket"; bracket: Bracket; contents: Symbol[] }
  | { type: "repeat"; op: "sum" | "prod"; sub: Symbol[]; sup: Symbol[] }
  | { type: "int"; sub: Symbol[]; sup: Symbol[] }

export type Symbol =
  | { type: "number"; value: string; cursor?: number }
  | { type: "fn"; name: string; cursor?: number }
  | { type: "sup"; contents: Symbol[] }
  | { type: "sub"; contents: Symbol[] }
  | { type: "supsub"; sup: Symbol[]; sub: Symbol[] }
  | BaseSymbol

export type ContextualizedSymbol =
  | { type: "digit"; digit: string; spaceBefore: boolean }
  | { type: "fn"; letter: string; spaceBefore: boolean; spaceAfter: boolean }
  | { type: "prefix"; op: "+" | "-" }
  | { type: "sup"; contents: Symbol[]; spaceAfter: boolean }
  | { type: "sub"; contents: Symbol[]; spaceAfter: boolean }
  | { type: "supsub"; sup: Symbol[]; sub: Symbol[]; spaceAfter: boolean }
  | BaseSymbol

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
      return true

    case ",":
    case "fn":
    case "op":
    case "repeat":
    case "int":
      return false
  }
}

export function drawSymbolArray(list: Symbol[]) {
  return list.flatMap((symbol, index) => {
    switch (symbol.type) {
      case "number": {
        if (list[index - 1]?.type == ".") {
          const array = symbol.value
            .split("")
            .map((digit) =>
              drawSymbol({ type: "digit", digit, spaceBefore: false }),
            )

          if (symbol.cursor != null) {
            array.splice(symbol.cursor, 0, drawCursor())
          }

          return array
        } else {
          const array = symbol.value.split("").map((digit, digitIndex) =>
            drawSymbol({
              type: "digit",
              digit,
              spaceBefore:
                digitIndex > 0 && (symbol.value.length - digitIndex) % 3 == 0,
            }),
          )

          if (symbol.cursor != null) {
            array.splice(symbol.cursor, 0, drawCursor())
          }

          return array
        }
      }

      case "fn": {
        const next =
          list[index + 1]?.type == "cursor"
            ? list[index + 2]?.type
            : list[index + 1]?.type

        const nextConsumesSpace =
          next == null ||
          next == "sub" ||
          next == "sup" ||
          next == "supsub" ||
          next == "," ||
          next == "bracket"

        const last = symbol.name.length - 1

        const array = symbol.name.split("").map((letter, letterIndex) =>
          drawSymbol({
            type: "fn",
            letter,
            spaceBefore: letterIndex == 0 && index != 0,
            spaceAfter:
              !nextConsumesSpace &&
              letterIndex == last &&
              index != list.length - 1,
          }),
        )

        if (symbol.cursor != null) {
          array.splice(symbol.cursor, 0, drawCursor())
        }

        return array
      }

      case "sup":
      case "sub":
      case "supsub": {
        const prev =
          list[index - 1]?.type == "cursor"
            ? list[index - 2]?.type
            : list[index - 1]?.type

        return drawSymbol({ ...symbol, spaceAfter: prev == "fn" })
      }

      case "op": {
        if (symbol.op == "+" || symbol.op == "-") {
          if (
            index == 0 ||
            !isNumericSymbolOnRHS(list[index - 1]!, list[index - 2])
          ) {
            return drawSymbol({ type: "prefix", op: symbol.op })
          }
        }

        return drawSymbol(symbol)
      }

      default:
        return drawSymbol(symbol)
    }
  })
}

export function drawCursor() {
  return <span class="">&nbsp;</span>
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

export function drawSymbol(symbol: ContextualizedSymbol) {
  switch (symbol.type) {
    case "digit":
      return (
        <span
          class="font-mathnum"
          classList={{ "pl-[.125em]": symbol.spaceBefore }}
        >
          {symbol.digit}
        </span>
      )
    case ".":
      return <span class="font-mathnum">.</span>
    case ",":
      return <span class="pr-[.2em] font-mathnum">,</span>
    case "op":
      return <span class="px-[.2em] font-mathnum">{symbol.op}</span>
    case "prefix":
      return <span class="font-mathnum">{symbol.op}</span>
    case "var":
      return <span class="font-mathvar italic">{symbol.letter}</span>
    case "const":
      return <span class="font-mathvar">{symbol.name}</span>
    case "fn":
      return (
        <span
          class="font-mathvar"
          classList={{
            "pl-[.2em]": symbol.spaceBefore,
            "pr-[.2em]": symbol.spaceAfter,
          }}
        >
          {symbol.letter}
        </span>
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
            {drawSymbolArray(symbol.contents)}
          </span>
        </span>
      )
    case "root":
      return (
        <span class="inline-block">
          <span class="ml-[.2em] mr-[-.6em] min-w-[.5em] align-[.8em] text-[80%]">
            {drawSymbolArray(symbol.root)}
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
              {drawSymbolArray(symbol.contents)}
            </span>
          </span>
        </span>
      )
    case "frac":
      return (
        <span class="inline-block px-[.2em] text-center align-[-.4em] text-[90%]">
          <span class="block py-[.1em]">{drawSymbolArray(symbol.top)}</span>
          <span class="float-right block w-full border-t border-t-current p-[.1em]">
            {drawSymbolArray(symbol.bottom)}
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
            {drawSymbolArray(symbol.contents)}
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
            {drawSymbolArray(symbol.contents)}
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
            {drawSymbolArray(symbol.contents)}
          </span>

          <span class="inline-block w-0">&#8203;</span>
        </span>
      )
    case "supsub":
      return (
        <span
          class="mb-[-.2em] inline-block text-left align-[-.5em] text-[90%]"
          classList={{ "pr-[.2em]": symbol.spaceAfter }}
        >
          <span class="block">{drawSymbolArray(symbol.sup)}</span>

          <span class="float-left block text-[80%]">
            {drawSymbolArray(symbol.sub)}
          </span>

          <span class="inline-block w-0">​&#8203;</span>
        </span>
      )
    case "repeat":
      return (
        <span class="inline-block p-[.2em] text-center align-[-.2em]">
          <span class="block text-[80%]">{drawSymbolArray(symbol.sup)}</span>
          <span class="block text-[200%]">
            {symbol.op == "sum" ? "∑" : "∏"}
          </span>
          <span class="float-right block w-full text-[80%]">
            {drawSymbolArray(symbol.sub)}
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
              <span class="align-[1.3em]">{drawSymbolArray(symbol.sup)}</span>
            </span>

            <span class="float-left ml-[-.35em] block text-[100%]">
              {drawSymbolArray(symbol.sub)}
            </span>

            <span class="inline-block w-0">​</span>
          </span>
        </span>
      )
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
      {drawSymbolArray(props.symbols())}
    </div>
  )
}

export function ReadonlyField(props: { symbols: Symbol[] }) {
  return <Field symbols={() => props.symbols} setSymbols={() => {}} />
}

export function Main() {
  return (
    <div class="flex flex-col gap-4">
      <ReadonlyField
        symbols={[
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
            ],
          },
          { type: "op", op: "+" },
          {
            type: "frac",
            top: [{ type: "number", value: "2" }],
            bottom: [{ type: "number", value: "4" }],
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
        ]}
      />

      <ReadonlyField
        symbols={[
          { type: "number", value: "40" },
          { type: "," },
          { type: "number", value: "623" },
          { type: "." },
          { type: "const", name: "x" },
          { type: "var", letter: "e" },
          { type: "const", name: "π" },
          { type: "fn", name: "sin" },
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
                    top: [{ type: "number", value: "3" }],
                    bottom: [{ type: "number", value: "4" }],
                  },
                ],
              },
            ],
          },
          {
            type: "bracket",
            bracket: "[]",
            contents: [{ type: "number", value: "623" }],
          },
          {
            type: "bracket",
            bracket: "{}",
            contents: [{ type: "number", value: "623" }],
          },
          {
            type: "bracket",
            bracket: "||",
            contents: [{ type: "number", value: "623" }],
          },
        ]}
      />
    </div>
  )
}
