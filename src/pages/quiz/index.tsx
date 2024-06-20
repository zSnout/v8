import { Fa } from "@/components/Fa"
import {
  CheckboxTree,
  Json,
  Tree,
  TreeOf,
} from "@/components/fields/CheckboxGroup"
import { createStorage } from "@/stores/local-storage-store"
import {
  faClose,
  faExclamationTriangle,
  faNavicon,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import {
  For,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js"

type Leaf = DirectTreeCard | Generator

type RawTree = TreeOf<Leaf>

type Node = RawTree | Leaf

type State = "noscript" | "nodecks" | "noneleft" | "ok"

class PartialCard {
  static of(base: Leaf) {
    if (base instanceof DirectTreeCard) {
      return base.toPartial()
    } else if (base instanceof Generator) {
      return base.generate()
    } else {
      throw new TypeError("Invalid card generator.")
    }
  }

  private declare __brand

  constructor(
    readonly short: string,
    readonly front: JSX.Element,
    readonly back: JSX.Element,
    readonly source: readonly string[],
    readonly id: string,
  ) {}

  toCard(path: readonly string[]): Card {
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

// prettier-ignore
type BaseKanaNames =
  | "a" | "i" | "u" | "e" | "o" | "ka" | "ki" | "ku" | "ke" | "ko" | "sa"
  | "shi" | "su" | "se" | "so" | "ta" | "chi" | "tsu" | "te" | "to" | "na"
  | "ni" | "nu" | "ne" | "no" | "ha" | "hi" | "fu" | "he" | "ho" | "ma" | "mi"
  | "mu" | "me" | "mo" | "ya" | "yu" | "yo" | "ra" | "ri" | "ru" | "re" | "ro"
  | "wa" | "wo" | "n"

type WiWeKanaNames = "wi" | "we"

// prettier-ignore
type DakutenKanaNames =
  | "ga" | "gi" | "gu" | "ge" | "go" | "za" | "ji" | "zu" | "ze" | "zo" | "da"
  | "ji2" | "zu2" | "de" | "do" | "ba" | "bi" | "bu" | "be" | "bo" | "pa" | "pi"
  | "pu" | "pe" | "po"

type LittleKanaNames = "xya" | "xyu" | "xyo"

function kanaList(
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

function kanaTree(
  type: "Hiragana" | "Katakana",
  base: Record<BaseKanaNames, string>,
  wiwe: Record<WiWeKanaNames, string>,
  dakuten: Record<DakutenKanaNames, string>,
  little: Record<LittleKanaNames, string>,
): RawTree {
  const { xya, xyo, xyu } = little
  const { ki, shi, chi, ni, hi, mi, ri } = base
  const { gi, ji, bi, pi } = dakuten
  return {
    Basic: kanaList(type, { ...base, ...wiwe }),
    Dakuten: kanaList(type, dakuten),
    Combination: kanaList(type, {
      kya: ki + xya,
      kyu: ki + xyu,
      kyo: ki + xyo,
      gya: gi + xya,
      gyu: gi + xyu,
      gyo: gi + xyo,
      sha: shi + xya,
      shu: shi + xyu,
      sho: shi + xyo,
      ja: ji + xya,
      ju: ji + xyu,
      jo: ji + xyo,
      cha: chi + xya,
      chu: chi + xyu,
      cho: chi + xyo,
      nya: ni + xya,
      nyu: ni + xyu,
      nyo: ni + xyo,
      hya: hi + xya,
      hyu: hi + xyu,
      hyo: hi + xyo,
      bya: bi + xya,
      byu: bi + xyu,
      byo: bi + xyo,
      pya: pi + xya,
      pyu: pi + xyu,
      pyo: pi + xyo,
      mya: mi + xya,
      myu: mi + xyu,
      myo: mi + xyo,
      rya: ri + xya,
      ryu: ri + xyu,
      ryo: ri + xyo,
    }),
  }
}

function each<T>(
  names: T[],
  card: (value: T) => Node,
  name: (x: T) => string = String,
): RawTree {
  return Object.fromEntries(names.map((x) => [name(x), card(x)]))
}

const tree = new Tree<Leaf>(
  {
    Japanese: {
      Hiragana: kanaTree(
        "Hiragana",
        {
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
        },
        {
          wi: "ゐ",
          we: "ゑ",
        },
        {
          ga: "が",
          gi: "ぎ",
          gu: "ぐ",
          ge: "げ",
          go: "ご",
          za: "ざ",
          ji: "じ",
          zu: "ず",
          ze: "ぜ",
          zo: "ぞ",
          da: "だ",
          ji2: "ぢ",
          zu2: "づ",
          de: "で",
          do: "ど",
          ba: "ば",
          bi: "び",
          bu: "ぶ",
          be: "べ",
          bo: "ぼ",
          pa: "ぱ",
          pi: "ぴ",
          pu: "ぷ",
          pe: "ぺ",
          po: "ぽ",
        },
        {
          xya: "ゃ",
          xyu: "ゅ",
          xyo: "ょ",
        },
      ),
      Katakana: {
        ...kanaTree(
          "Katakana",
          {
            a: "ア",
            i: "イ",
            u: "ウ",
            e: "エ",
            o: "オ",
            ka: "カ",
            ki: "キ",
            ku: "ク",
            ke: "ケ",
            ko: "コ",
            sa: "サ",
            shi: "シ",
            su: "ス",
            se: "セ",
            so: "ソ",
            ta: "タ",
            chi: "チ",
            tsu: "ツ",
            te: "テ",
            to: "ト",
            na: "ナ",
            ni: "ニ",
            nu: "ヌ",
            ne: "ネ",
            no: "ノ",
            ha: "ハ",
            hi: "ヒ",
            fu: "フ",
            he: "ヘ",
            ho: "ホ",
            ma: "マ",
            mi: "ミ",
            mu: "ム",
            me: "メ",
            mo: "モ",
            ya: "ヤ",
            yu: "ユ",
            yo: "ヨ",
            ra: "ラ",
            ri: "リ",
            ru: "ル",
            re: "レ",
            ro: "ロ",
            wa: "ワ",
            wo: "ヲ",
            n: "ン",
          },
          {
            wi: "ヰ",
            we: "ヱ",
          },
          {
            ga: "ガ",
            gi: "ギ",
            gu: "グ",
            ge: "げ",
            go: "ゴ",
            za: "ザ",
            ji: "ジ",
            zu: "ズ",
            ze: "ゼ",
            zo: "ゾ",
            da: "ダ",
            ji2: "ヂ",
            zu2: "ヅ",
            de: "デ",
            do: "ド",
            ba: "バ",
            bi: "ビ",
            bu: "ブ",
            be: "ベ",
            bo: "ボ",
            pa: "パ",
            pi: "ピ",
            pu: "プ",
            pe: "ペ",
            po: "ポ",
          },
          {
            xya: "ャ",
            xyu: "ュ",
            xyo: "ョ",
          },
        ),
        "More Combos": kanaList("Katakana", {
          va: "ヴァ",
          vi: "ヴィ",
          vu: "ヴ",
          ve: "ヴェ",
          vo: "ヴォ",
          fa: "ファ",
          fi: "フィ",
          fe: "フェ",
          fo: "フォ",
          wi: "ウィ",
          we: "ウェ",
          wo: "ウォ",
          tsa: "ツァ",
          tsi: "ツィ",
          tse: "ツェ",
          tso: "ツォ",
          twu: "トゥ",
          dwu: "ドゥ",
          thi: "ティ",
          dhi: "ディ",
        }),
      },
    },
    Mathematics: {
      Squares: each(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        (b) =>
          each(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            (y) => {
              const x = 10 * b + y
              return new DirectTreeCard(
                x + "²",
                x + "²",
                x * x + "",
                ["Mathematics", "Squares"],
                1 / 20,
              )
            },
            (y) => 10 * b + y + "",
          ),
        (b) => `${10 * b + 1}~${10 * b + 10}`,
      ),
    },
  },
  (value): value is Leaf =>
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

function NoneLeft() {
  return (
    <div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <Fa class="size-12" icon={faExclamationTriangle} title="error" />

      <p class="text-center">
        You have no cards left to pick.
        <br />
        Select more decks from the sidebar to continue.
        <br />
        Alternatively, wait until your reviews are ready.
        <br />
        Alternatively, clear your reviews.
      </p>
    </div>
  )
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

function random<T>(x: readonly T[]): T {
  if (x.length == 0) {
    throw new RangeError("Array must not be empty.")
  }

  return x[Math.floor(x.length * Math.random())]!
}

function restoreQueuedCard(q: QueuedCard): PartialCard | undefined {
  let obj = tree.tree
  let result
  for (let index = 0; index < q.path.length; index++) {
    const segment = q.path[index]!
    const next = obj[segment]
    if (next == null) {
      return
    }
    if (tree.isLeaf(next)) {
      if (index == q.path.length - 1) {
        result = next
        break
      }
      return
    }
    obj = next
  }

  if (!result) {
    return
  }

  return PartialCard.of(result)
}

export function Main() {
  const [storageTree, setStorageTree] = createStorage("quiz::tree", "{}")

  const [sidebarOpen, setSidebarOpen] = createSignal(true)

  const [reviewsWithoutNew, setReviewsWithoutNew] = createStorage(
    "quiz::reviews_without_new",
    "0",
  )

  const [queue, setQueue] = (() => {
    const [raw, setRaw] = createStorage("quiz::queue", "[]", "directmount")

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
      setState("nodecks")
      return
    }

    const { node, path } = next
    setCard(PartialCard.of(node).toCard(path))
    setState("ok")
  }

  function randomFromQueue(q: readonly QueuedCard[]): QueuedCard | undefined {
    const n = now()

    for (const t of [
      0,
      1000 * 60,
      1000 * 60 * 5,
      1000 * 60 * 10,
      1000 * 60 * 20,
    ]) {
      const c = q.filter((x) => x.availableAt < n - t)
      if (c.length) {
        return random(c)
      }
    }

    return
  }

  function unsafeDoNotUseNextCard() {
    const queued = queue()
    const current = card()

    unsafeDoNotUseNextRandomCard()

    if (state() == "nodecks") {
      return
    }

    for (let i = 0; i < 50; i++) {
      const next = card()

      if (
        !queued.some((q) => areCardsSame(q, next)) &&
        !areCardsSame(current, next)
      ) {
        setState("ok")
        return
      }

      unsafeDoNotUseNextRandomCard()
    }

    const q = randomFromQueue(queued)
    if (q) {
      const c = restoreQueuedCard(q)
      if (c) {
        setCard(c.toCard(q.path))
        setState("ok")
        return
      }
    }

    setState("noneleft")
    return
  }

  function nextCard() {
    if (+reviewsWithoutNew() >= 8) {
      setReviewsWithoutNew("0")
      unsafeDoNotUseNextCard()
      return
    } else {
      const n = now()
      const needReview = queue().filter((x) => x.availableAt < n)
      if (needReview.length) {
        const qc = random(needReview)
        const qd = restoreQueuedCard(qc)
        if (qd) {
          const card = qd.toCard(qc.path)
          setCard(card)
          setState("ok")
          return
        }
      }
    }

    unsafeDoNotUseNextCard()
    return
  }

  function answer(response: "again" | "hard" | "good") {
    if (response == "good") {
      const c = card()
      setQueue(
        queue()
          .filter((x) => !areCardsSame(x, c))
          .sort(({ availableAt: a }, { availableAt: b }) => a - b),
      )
      nextCard()
      return
    }

    const c = card()
    const interval = response == "again" ? 1 : 10
    const q = queue()
    const matchingCardIndex = q.findIndex((a) => areCardsSame(a, c))
    const availableAt = Date.now() + 1000 * 60 * interval
    if (matchingCardIndex != -1) {
      // this was a review, count it as such
      setReviewsWithoutNew((x) => {
        const y = +x
        if (Number.isSafeInteger(y)) {
          return y + 1 + ""
        } else {
          return "1"
        }
      })

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
            <Show
              fallback={
                <Show fallback={<NoCards />} when={state() == "noneleft"}>
                  <NoneLeft />
                </Show>
              }
              when={state() == "noscript"}
            >
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
                  when={state() == "nodecks"}
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
                    Reveal Answer
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

      <button
        class="z-field fixed right-4 top-16 z-[100] overflow-clip p-1 active:translate-y-0 md:translate-x-[min(0px,-50vw_+_512px+1rem)]"
        onClick={() => setSidebarOpen((x) => !x)}
      >
        <div class="relative h-6 w-6">
          <div
            class="absolute left-0 top-0 transition"
            classList={{
              "translate-x-[125%]": !sidebarOpen(),
              "translate-x-0": sidebarOpen(),
            }}
          >
            <Fa class="h-6 w-6" icon={faClose} title="close sidebar" />
          </div>

          <div
            class="absolute left-0 top-0 transition"
            classList={{
              "translate-x-0": !sidebarOpen(),
              "-translate-x-[125%]": sidebarOpen(),
            }}
          >
            <Fa class="h-6 w-6" icon={faNavicon} title="open sidebar" />
          </div>
        </div>
      </button>

      <div
        class="fixed left-0 top-0 h-full w-full translate-x-0 transition-[transform,width,backdrop-filter,background-color] sm:pointer-events-auto sm:static sm:flex sm:h-[calc(100%_+_2rem)] sm:w-72 sm:-translate-y-8 sm:translate-x-6 sm:bg-transparent sm:backdrop-filter-none"
        classList={{
          "backdrop-blur-sm": sidebarOpen(),
          "backdrop-blur-0": !sidebarOpen(),
          "bg-z-body-partial": sidebarOpen(),
          "pointer-events-none": !sidebarOpen(),
          "sm:!w-0": !sidebarOpen(),
          "sm:!translate-x-[15rem]": !sidebarOpen(),
          "md:!translate-x-[21rem]": !sidebarOpen(),
        }}
        onClick={(event) => {
          if (event.currentTarget == event.target && event.offsetY > 48) {
            setSidebarOpen(false)
          }
        }}
      >
        <div
          class="fixed bottom-0 right-0 top-8 flex w-[19.5rem] flex-col overflow-y-auto border-l border-z px-4 py-10 sm:translate-x-0"
          classList={{
            "translate-x-0": sidebarOpen(),
            "translate-x-full": !sidebarOpen(),
          }}
        />

        <div
          class="fixed bottom-0 right-0 top-12 flex w-full flex-col items-start overflow-y-auto border-l border-transparent bg-z-body px-4 pt-8 transition xs:w-[19.5rem] xs:border-z sm:top-0 sm:w-[19.5rem] sm:translate-x-0 sm:border-transparent sm:bg-transparent sm:transition-none"
          classList={{
            "translate-x-0": sidebarOpen(),
            "translate-x-full": !sidebarOpen(),
          }}
        >
          <ul class="flex w-full flex-1 flex-col gap-1">
            <CheckboxTree tree={tree} />
          </ul>

          <div class="sticky bottom-0 w-full">
            <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

            <div class="h-2 w-full bg-z-body" />

            <div class="relative border-t border-z bg-z-body pb-8 pt-[0.546875rem] sm:pb-0">
              <div class="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 flex-row items-center whitespace-nowrap bg-z-body px-2 text-sm/[1]">
                Review Queue
                <button
                  class="ml-2 inline-flex h-4 w-4 items-center justify-center rounded bg-red-500"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete all saved reviews?",
                      )
                    ) {
                      setQueue([])
                    }
                  }}
                >
                  <Fa
                    class="h-3 w-3 icon-white"
                    icon={faTrash}
                    title="delete reviews"
                  />
                </button>
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
