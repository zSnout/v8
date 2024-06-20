import { Fa } from "@/components/Fa"
import {
  CheckboxTree,
  Json,
  Tree,
  TreeOf,
} from "@/components/fields/CheckboxGroup"
import { createStorage } from "@/stores/local-storage-store"
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons"
import {
  For,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js"

// TODO: sidebar should be visible on mobile

type RawTree = TreeOf<DirectTreeCard | Generator>

type State = "noscript" | "nocards" | "ok"

class PartialCard {
  private declare __brand

  constructor(
    readonly short: string,
    readonly front: JSX.Element,
    readonly back: JSX.Element,
    readonly source: readonly string[],
    readonly id: string,
  ) {}

  toCard(path: string[]): Card {
    return { ...this, path: path, answerShown: false }
  }
}

class DirectTreeCard {
  private declare __brand2

  constructor(
    readonly short: string,
    readonly front: JSX.Element,
    readonly back: JSX.Element,
    readonly source: readonly string[],
    readonly weight: number,
  ) {}

  toPartial(): PartialCard {
    return new PartialCard(this.short, this.front, this.back, this.source, "")
  }
}

class Generator {
  private declare __brand3
  readonly weight: number

  constructor(
    readonly generate: (id?: string | undefined) => PartialCard,
    readonly cardCount: number,
  ) {
    this.weight = 1 / cardCount
  }
}

interface Card {
  readonly front: JSX.Element
  readonly back: JSX.Element
  readonly path: readonly string[]
  readonly id: string
  readonly answerShown: boolean
  readonly source: readonly string[]
  readonly short: string
}

interface QueuedCard {
  readonly short: string
  readonly path: readonly string[]
  readonly id: string
  readonly interval: number
  readonly availableAt: number
}

function kanaTree(
  type: "Hiragana" | "Katakana",
  kana: { [romaji: string]: string },
): RawTree {
  return Object.fromEntries(
    Object.entries(kana).map(([romaji, kana]) => [
      romaji,
      new DirectTreeCard(
        romaji,
        romaji,
        (
          <>
            <span class="font-sans">{kana}</span>
            <span class="font-serif">{kana}</span>
            <span class="font-mono">{kana}</span>
          </>
        ),
        ["Japanese", type],
        1 / 30,
      ),
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

function NoScript() {
  return (
    <div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <Fa class="size-12" icon={faExclamationTriangle} title="error" />

      <p class="text-center">
        JavaScript is disabled.
        <br />
        Please enable it to continue.
      </p>
    </div>
  )
}

function NoCards() {
  return (
    <div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <Fa class="size-12" icon={faExclamationTriangle} title="error" />

      <p class="text-center">
        You have no decks selected.
        <br />
        Select some from the sidebar to continue.
      </p>
    </div>
  )
}

export function Main() {
  const [storageTree, setStorageTree] = createStorage("quiz::tree", "{}")

  const [queue, setQueue] = (() => {
    const [raw, setRaw] = createStorage("quiz::queue", "[]", true)
    // const [queue, setQueue] = createSignal<readonly QueuedCard[]>(
    //   fromString(raw()),
    // )
    // TODO: remove comments here

    function toString(deck: readonly QueuedCard[]) {
      return JSON.stringify(deck)
    }

    function fromString(str: string) {
      try {
        const value = JSON.parse(str) as Json
        if (!(value instanceof Array)) {
          return []
        }
        if (
          !value.every(
            (x): x is typeof x & QueuedCard =>
              typeof x == "object" &&
              x != null &&
              "short" in x &&
              typeof x.short == "string" &&
              "path" in x &&
              x.path instanceof Array &&
              x.path.every((x): x is string => typeof x == "string") &&
              "id" in x &&
              typeof x.id == "string" &&
              "interval" in x &&
              typeof x.interval == "number" &&
              "availableAt" in x &&
              typeof x.availableAt == "number",
          )
        ) {
          return []
        }
        return value
      } catch {
        return []
      }
    }

    // createEffect(() => {
    //   console.log("setting queue from storage")
    //   setQueue(fromString(raw()))
    // })

    // createEffect(() => {
    //   console.log("setting storage from queue")
    //   setRaw(toString(queue()))
    // })

    return [
      createMemo((): readonly QueuedCard[] => fromString(raw())),
      (queue: QueuedCard[]) => setRaw(toString(queue)),
    ]
  })()

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
    path: [],
    id: "",
    answerShown: false,
    source: [],
    short: "",
  })

  const [state, setState] = createSignal<State>("noscript")

  function unsafeDoNotUseNextRandomCard() {
    const next = tree.choose((leaf) => leaf.weight)

    if (next == null) {
      setState("nocards")
      return
    }

    const { node, path } = next

    if (node instanceof DirectTreeCard) {
      setCard(node.toPartial().toCard(path))
    } else if (node instanceof Generator) {
      setCard(node.generate().toCard(path))
    } else {
      setState("nocards")
      return
    }

    setState("ok")
  }

  function areCardsSame(
    a: { readonly path: readonly string[]; readonly id: string },
    b: { readonly path: readonly string[]; readonly id: string },
  ) {
    return (
      a.path.length == b.path.length &&
      a.id == b.id &&
      a.path.every((x, i) => x == b.path[i])
    )
  }

  function nextCard() {
    const queued = queue()
    const current = card()

    unsafeDoNotUseNextRandomCard()

    if (state() == "nocards") {
      return
    }

    for (let i = 0; i < 50; i++) {
      const next = card()

      if (
        !queued.some((q) => areCardsSame(q, next)) &&
        !areCardsSame(current, next)
      ) {
        return
      }

      unsafeDoNotUseNextRandomCard()
    }

    // 50 attempts of generating a fresh card failed
    // TODO: get us a new card
  }

  function answer(response: "again" | "hard" | "good") {
    console.log(response)

    if (response == "good") {
      nextCard()
      return
    }

    const c = card()
    const interval = response == "again" ? 1 : 10
    const q = queue()
    const matchingCardIndex = q.findIndex((a) => areCardsSame(a, c))
    const availableAt = Date.now() + 1000 * 60 * interval
    if (matchingCardIndex != -1) {
      setQueue(
        q
          .map((x, i) =>
            i == matchingCardIndex
              ? {
                  ...x,

                  // we probably just took this one from the queue, so put it
                  // back, but later
                  availableAt: Math.max(x.availableAt, availableAt),
                }
              : x,
          )
          .sort(({ availableAt: a }, { availableAt: b }) => a - b),
      )
    } else {
      setQueue(
        q
          .concat({
            availableAt,
            id: c.id,
            interval,
            path: c.path,
            short: c.short,
          })
          .sort(({ availableAt: a }, { availableAt: b }) => a - b),
      )
    }

    nextCard()
  }

  onMount(() => {
    try {
      const val = JSON.parse(storageTree())
      tree.importJSON(val)
    } catch {}

    nextCard()
  })

  const [now, setNow] = createSignal(Date.now())

  setInterval(() => {
    setNow(Date.now())
  }, 1000)

  function timestamp(ms: number) {
    let dist = Math.floor((ms - now()) / 1000)

    if (dist <= 0) {
      return "now"
    }

    if (dist < 60) {
      return dist + "s"
    }

    dist = Math.floor(dist / 60)

    if (dist < 60) {
      return dist + "m"
    }

    dist = Math.floor(dist / 24)

    if (dist < 24) {
      return dist + "hr"
    }

    dist = Math.floor(dist / 30)

    if (dist < 30) {
      return dist + "d"
    }

    dist = Math.floor(dist * 10) / 10

    if (dist < 12) {
      return dist + "mo"
    }

    dist = Math.floor(Math.floor(dist / 12) * 10) / 10

    return dist + "yr"
  }

  return (
    <div class="flex flex-1 items-start gap-6">
      <div class="flex h-full w-full flex-1 flex-col items-start gap-4">
        <Show
          fallback={
            <Show fallback={<NoCards />} when={state() == "noscript"}>
              <NoScript />
            </Show>
          }
          when={state() == "ok"}
        >
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

              <div class="flex items-baseline justify-center gap-2 text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                {card().back}
              </div>
            </Show>
          </div>
        </Show>

        <div class="sticky bottom-0 -mb-8 flex w-full flex-col pb-8">
          <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

          <div class="-mb-8 w-full bg-z-body pb-8 text-center">
            <Show
              fallback={
                <Show
                  fallback={
                    <a
                      class="block w-full rounded bg-z-body-selected py-2"
                      href=""
                    >
                      Reload Page
                    </a>
                  }
                  when={state() == "nocards"}
                >
                  <button
                    class="w-full rounded bg-z-body-selected py-2"
                    onClick={() =>
                      setCard((c) => ({ ...c, answerShown: true }))
                    }
                  >
                    Next Card
                  </button>
                </Show>
              }
              when={state() == "ok"}
            >
              <Show
                fallback={
                  <button
                    class="w-full rounded bg-z-body-selected py-2"
                    onClick={() =>
                      setCard((c) => ({ ...c, answerShown: true }))
                    }
                  >
                    Show Answer
                  </button>
                }
                when={card().answerShown}
              >
                <div class="grid grid-cols-3 gap-1 md:gap-2">
                  <button
                    class="rounded bg-red-300 py-2 text-red-900"
                    onClick={() => answer("again")}
                  >
                    Again
                  </button>

                  <button
                    class="rounded bg-[#ffcc91] py-2 text-yellow-900"
                    onClick={() => answer("hard")}
                  >
                    Hard
                  </button>

                  <button
                    class="rounded bg-green-300 py-2 text-green-900"
                    onClick={() => answer("good")}
                  >
                    Good
                  </button>
                </div>
              </Show>
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

            <div class="relative border-t border-z bg-z-body pb-8 pt-[0.546875rem]">
              <div class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-z-body px-2 text-sm/[1]">
                Review Queue
              </div>

              <div class="grid grid-cols-[auto,1fr] items-baseline gap-x-4">
                <For
                  fallback={
                    <div class="col-span-2 text-sm">No reviews queued.</div>
                  }
                  each={queue()}
                >
                  {(card) => (
                    <QueueEntry
                      short={card.short}
                      availableAt={timestamp(card.availableAt)}
                    />
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QueueEntry(props: { short: JSX.Element; availableAt: string }) {
  return (
    <>
      <p class="text-xs text-z-subtitle">{props.availableAt}</p>
      <p class="text-sm">{props.short}</p>
    </>
  )
}
