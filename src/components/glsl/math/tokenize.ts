export type Pattern<T> = [
  regex: RegExp,
  map: (match: RegExpMatchArray) => T | null | undefined,
]

export function createTokenizer<Patterns extends Pattern<unknown>[]>(
  ...patterns: Patterns
): (text: string) => readonly ReturnType<Patterns[number][1]>[] | undefined

export function createTokenizer<T>(
  ...patterns: Pattern<T>[]
): (text: string) => readonly T[] | undefined

export function createTokenizer(...patterns: Pattern<unknown>[]) {
  for (const [regex] of patterns) {
    if (regex.sticky || regex.global || !regex.source.startsWith("^")) {
      throw new Error(
        "Invalid regular expression: " +
          "/" +
          regex.source +
          "/" +
          regex.flags +
          ".",
      )
    }
  }

  return (text: string) => {
    const output: unknown[] = []

    main: while (text != "") {
      if (text[0]!.trim() == "") {
        text = text.slice(1)
        continue
      }

      for (const [regex, map] of patterns) {
        const match = text.match(regex)

        if (match) {
          const value = map(match)

          if (value != null) {
            output.push(map(match))
          }

          text = text.slice(match[0].length)
          continue main
        }
      }

      return undefined
    }

    return output
  }
}
