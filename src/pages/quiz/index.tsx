import { CheckboxTree, Tree } from "@/components/fields/CheckboxGroup"
import { JSX, Show, createSignal } from "solid-js"

interface PartialCard {
  readonly front: JSX.Element
  readonly back: JSX.Element
  readonly id: string
}

export class Card {
  constructor(
    readonly front: JSX.Element,
    readonly back: JSX.Element,
    readonly group: readonly string[],
    readonly id: string,
    readonly answerShown: boolean,
  ) {}
}

type Generator = (id?: string | undefined) => PartialCard

function random<T>(array: readonly T[]): T {
  if (array.length == 0) {
    throw new RangeError("No items in array.")
  }

  return array[Math.floor(Math.random() * array.length)]!
}

const tree = new Tree<Card | Generator>({
  Japanese: {
    Hiragana: {
      Basic(id) {
        const chars: Record<string, string> = {
          a: "あ",
          i: "い",
          u: "う",
          e: "え",
          o: "お",
          ka: "か",
          ki: "き",
          ku: "く",
          ke: "け",
          ko: "こ",
          sa: "さ",
          shi: "し",
          su: "す",
          se: "せ",
          so: "そ",
          ta: "た",
          chi: "ち",
          tsu: "つ",
          te: "て",
          to: "と",
          na: "な",
          ni: "に",
          nu: "ぬ",
          ne: "ね",
          no: "の",
          ha: "は",
          hi: "ひ",
          fu: "ふ",
          he: "へ",
          ho: "ほ",
          ma: "ま",
          mi: "み",
          mu: "む",
          me: "め",
          mo: "も",
          ya: "や",
          yu: "ゆ",
          yo: "よ",
          ra: "ら",
          ri: "り",
          ru: "る",
          re: "れ",
          ro: "ろ",
          wa: "わ",
          // wi: "ゐ",
          // we: "ゑ",
          wo: "を",
          n: "ん",
        }

        id = id ?? random(Object.keys(chars))

        if (id in chars) {
          return {
            front: id,
            back: chars[id]!,
            id,
          }
        }

        throw new RangeError(`Card "${id}" does not exist.`)
      },
    },
  },
  JP2: {
    Katakana: {
      Basic(id) {
        const chars: Record<string, string> = {
          a: "あ",
          i: "い",
          u: "う",
          e: "え",
          o: "お",
          ka: "か",
          ki: "き",
          ku: "く",
          ke: "け",
          ko: "こ",
          sa: "さ",
          shi: "し",
          su: "す",
          se: "せ",
          so: "そ",
          ta: "た",
          chi: "ち",
          tsu: "つ",
          te: "て",
          to: "と",
          na: "な",
          ni: "に",
          nu: "ぬ",
          ne: "ね",
          no: "の",
          ha: "は",
          hi: "ひ",
          fu: "ふ",
          he: "へ",
          ho: "ほ",
          ma: "ま",
          mi: "み",
          mu: "む",
          me: "め",
          mo: "も",
          ya: "や",
          yu: "ゆ",
          yo: "よ",
          ra: "ら",
          ri: "り",
          ru: "る",
          re: "れ",
          ro: "ろ",
          wa: "わ",
          // wi: "ゐ",
          // we: "ゑ",
          wo: "を",
          n: "ん",
        }

        id = id ?? random(Object.keys(chars))

        if (id in chars) {
          return {
            front: id,
            back: chars[id]!,
            id,
          }
        }

        throw new RangeError(`Card "${id}" does not exist.`)
      },
    },
  },
})

export function Main() {
  const [card, setCard] = createSignal<Card>({
    front: "7:00",
    back: "しちじ",
    group: ["Japanese", "Hiragana", "Basic"],
    id: "7",
    answerShown: true,
  })

  return (
    <div class="flex flex-1 items-start gap-6">
      <div class="flex h-full w-full flex-1 flex-col items-start gap-4">
        <div class="flex w-full flex-1 flex-col gap-4">
          <div class="text-center text-6xl font-semibold text-z-heading sm:text-7xl md:text-8xl lg:text-9xl">
            {card().front}
          </div>

          <Show when={card().answerShown}>
            <hr class="border-z" />

            <div class="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              {card().back}
            </div>
          </Show>
        </div>

        <div class="sticky bottom-0 -mb-8 flex w-full flex-col pb-8">
          <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

          <div class="-mb-8 w-full bg-z-body pb-8">
            <Show
              fallback={
                <button
                  class="rounded bg-z-body-selected py-2"
                  onClick={() => setCard((c) => ({ ...c, answerShown: true }))}
                >
                  Show Answer
                </button>
              }
              when={card().answerShown}
            >
              <div class="grid grid-cols-3 gap-1 text-base/[1.25] md:gap-2">
                <button class="rounded bg-red-300 py-2 text-red-900">
                  Again
                </button>
                <button class="rounded bg-[#ffcc91] py-2 text-yellow-900">
                  Hard
                </button>
                <button class="rounded bg-green-300 py-2 text-green-900">
                  Good
                </button>
              </div>
            </Show>
          </div>
        </div>
      </div>

      <div class="hidden w-48 sm:flex md:w-72">
        <div class="fixed bottom-8 right-0 top-20 flex w-[13.5rem] flex-col overflow-y-auto border-l border-z px-4 py-2 md:w-[19.5rem]">
          <ul class="flex flex-col gap-1">
            <CheckboxTree
              isLeaf={(value): value is Card | Generator =>
                value instanceof Card || typeof value == "function"
              }
              tree={tree}
            />
          </ul>

          <pre class="text-xs">
            {JSON.stringify(tree.enabled(), undefined, 2)}
          </pre>

          <pre class="text-xs">
            {JSON.stringify(tree.expanded(), undefined, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
