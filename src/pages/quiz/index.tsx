import { Fa } from "@/components/Fa"
import { CheckboxTree, Tree, TreeOf } from "@/components/fields/CheckboxGroup"
import { createStorage } from "@/stores/local-storage-store"
import {
  faArrowRight,
  faBackspace,
  faChevronRight,
  faLocationPinLock,
  faSlash,
} from "@fortawesome/free-solid-svg-icons"
import { For, JSX, Show, createEffect, createSignal, onMount } from "solid-js"

type RawTree = TreeOf<DirectTreeCard | Generator>

export class PartialCard {
  private declare __brand

  constructor(
    readonly short: JSX.Element,
    readonly front: JSX.Element,
    readonly back: JSX.Element,
    readonly source: readonly string[],
    readonly id: string,
  ) {}

  toCard(path: string[]): Card {
    return { ...this, group: path, answerShown: false }
  }
}

export class DirectTreeCard {
  private declare __brand2

  constructor(
    readonly short: JSX.Element,
    readonly front: JSX.Element,
    readonly back: JSX.Element,
    readonly source: readonly string[],
    readonly weight: number,
  ) {}

  toPartial(): PartialCard {
    return new PartialCard(this.short, this.front, this.back, this.source, "")
  }
}

export class Generator {
  private declare __brand3
  readonly weight: number

  constructor(
    readonly generate: (id?: string | undefined) => PartialCard,
    readonly cardCount: number,
  ) {
    this.weight = 1 / cardCount
  }
}

export interface Card {
  readonly front: JSX.Element
  readonly back: JSX.Element
  readonly group: readonly string[]
  readonly id: string
  readonly answerShown: boolean
  readonly source: readonly string[]
}

function kanaTree(
  type: "Hiragana" | "Katakana",
  kana: { [romaji: string]: string },
): RawTree {
  return Object.fromEntries(
    Object.entries(kana).map(([romaji, kana]) => [
      romaji,
      new DirectTreeCard(romaji, romaji, kana, ["Japanese", type], 1 / 30),
    ]),
  )
}

const tree = new Tree<DirectTreeCard | Generator>(
  {
    Japanese: {
      Hiragana: {
        Basic: {
          ...kanaTree("Hiragana", {
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
            wo: "を",
            n: "ん",
          }),
        },
        Obscure: {
          ...kanaTree("Hiragana", {
            wi: "ゐ",
            we: "ゑ",
          }),
        },
      },
    },
  },
  (value): value is DirectTreeCard | Generator =>
    value instanceof DirectTreeCard || value instanceof Generator,
)

export function Main() {
  const [storageTree, setStorageTree] = createStorage("quiz::tree", "{}")

  createEffect(() => {
    try {
      const val = JSON.parse(storageTree())
      tree.importJSON(val)
    } catch {}
  })

  createEffect(() => setStorageTree(JSON.stringify(tree.toJSON())))

  const [card, setCard] = createSignal<Card>({
    front: "",
    back: "",
    group: [],
    id: "",
    answerShown: false,
    source: [],
  })

  function nextCard() {
    const next = tree.choose((leaf) => leaf.weight)

    if (next == null) {
      // TODO: no things selected
      return
    }

    const { node, path } = next

    if (node instanceof DirectTreeCard) {
      setCard(node.toPartial().toCard(path))
    } else if (node instanceof Generator) {
      setCard(node.generate().toCard(path))
    }
  }

  onMount(() => {
    try {
      const val = JSON.parse(storageTree())
      tree.importJSON(val)
    } catch {}

    nextCard()
  })

  return (
    <div class="flex flex-1 items-start gap-6">
      <div class="flex h-full w-full flex-1 flex-col items-start gap-4">
        <div class="flex w-full flex-1 flex-col gap-4">
          <div class="font-mono text-sm/[1] lowercase text-z-subtitle">
            <For each={card().source}>
              {(item, index) => (
                <Show fallback={item} when={index() != 0}>
                  {" "}
                  / {item}
                </Show>
              )}
            </For>
          </div>

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
                  class="w-full rounded bg-z-body-selected py-2"
                  onClick={() => setCard((c) => ({ ...c, answerShown: true }))}
                >
                  Show Answer
                </button>
              }
              when={card().answerShown}
            >
              <div class="grid grid-cols-3 gap-1 md:gap-2">
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
        <div class="fixed bottom-8 right-0 top-20 flex w-[13.5rem] flex-col overflow-y-auto border-l border-z px-4 py-10 md:w-[19.5rem]" />

        <div class="fixed bottom-0 right-0 top-12 flex w-[13.5rem] flex-col items-start overflow-y-auto border-l border-transparent px-4 pt-8 md:w-[19.5rem]">
          <ul class="flex w-full flex-1 flex-col gap-1">
            <CheckboxTree tree={tree} />
          </ul>

          <div class="sticky bottom-0 w-full">
            <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

            <div class="h-2 w-full bg-z-body" />

            <div class="relative border-t border-z bg-z-body pb-8 pt-2">
              <div class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-z-body px-2 text-sm/[1]">
                Relearn Queue
              </div>

              <div class="grid grid-cols-[auto,1fr] items-baseline gap-x-4">
                <QueueEntry front="ju" pushed="8:35" />
                <QueueEntry front="kya" pushed="8:32" />
                <QueueEntry front="hi" pushed="8:30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QueueEntry(props: { front: JSX.Element; pushed: string }) {
  return (
    <>
      <p class="text-xs text-z-subtitle">{props.pushed}</p>
      <p class="text-sm">{props.front}</p>
    </>
  )
}
