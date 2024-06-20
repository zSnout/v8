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
  faDownload,
  faExclamationTriangle,
  faNavicon,
  faTrash,
  faUpload,
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

function kanaRead(kana: { [romaji: string]: string }): Node {
  function count(n: number): Node {
    return new Generator(
      (
        id = Array.from({ length: n }, () => random(Object.keys(kana))).join(
          "",
        ),
      ) => {
        return new PartialCard(
          id,
          id,
          (id.match(/.[ゃゅょャュョ]?/g) || []).map((c) => kana[c]).join(""),
          ["Japanese", "Kana"],
          id,
        )
      },
      10,
    )
  }

  return {
    "2 Characters": count(2),
    "3 Characters": count(3),
    "5 Characters": count(5),
    "8 Characters": count(8),
    "12 Characters": count(12),
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
      Hiragana: {
        ...kanaTree(
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
        Reading: kanaRead({
          あ: "a",
          い: "i",
          う: "u",
          え: "e",
          お: "o",
          か: "ka",
          き: "ki",
          く: "ku",
          け: "ke",
          こ: "ko",
          さ: "sa",
          し: "shi",
          す: "su",
          せ: "se",
          そ: "so",
          た: "ta",
          ち: "chi",
          つ: "tsu",
          て: "te",
          と: "to",
          な: "na",
          に: "ni",
          ぬ: "nu",
          ね: "ne",
          の: "no",
          は: "ha",
          ひ: "hi",
          ふ: "fu",
          へ: "he",
          ほ: "ho",
          ま: "ma",
          み: "mi",
          む: "mu",
          め: "me",
          も: "mo",
          や: "ya",
          ゆ: "yu",
          よ: "yo",
          ら: "ra",
          り: "ri",
          る: "ru",
          れ: "re",
          ろ: "ro",
          わ: "wa",
          を: "wo",
          ん: "n",
          ゐ: "wi",
          ゑ: "we",
          が: "ga",
          ぎ: "gi",
          ぐ: "gu",
          げ: "ge",
          ご: "go",
          ざ: "za",
          じ: "ji",
          ず: "zu",
          ぜ: "ze",
          ぞ: "zo",
          だ: "da",
          ぢ: "ji",
          づ: "zu",
          で: "de",
          ど: "do",
          ば: "ba",
          び: "bi",
          ぶ: "bu",
          べ: "be",
          ぼ: "bo",
          ぱ: "pa",
          ぴ: "pi",
          ぷ: "pu",
          ぺ: "pe",
          ぽ: "po",
          きゃ: "kya",
          きゅ: "kyu",
          きょ: "kyo",
          ぎゃ: "gya",
          ぎゅ: "gyu",
          ぎょ: "gyo",
          しゃ: "sha",
          しゅ: "shu",
          しょ: "sho",
          じゃ: "ja",
          じゅ: "ju",
          じょ: "jo",
          ちゃ: "cha",
          ちゅ: "chu",
          ちょ: "cho",
          にゃ: "nya",
          にゅ: "nyu",
          にょ: "nyo",
          ひゃ: "hya",
          ひゅ: "hyu",
          ひょ: "hyo",
          びゃ: "bya",
          びゅ: "byu",
          びょ: "byo",
          ぴゃ: "pya",
          ぴゅ: "pyu",
          ぴょ: "pyo",
          みゃ: "mya",
          みゅ: "myu",
          みょ: "myo",
          りゃ: "rya",
          りゅ: "ryu",
          りょ: "ryo",
        }),
      },
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
        Reading: kanaRead({
          ア: "a",
          イ: "i",
          ウ: "u",
          エ: "e",
          オ: "o",
          カ: "ka",
          キ: "ki",
          ク: "ku",
          ケ: "ke",
          コ: "ko",
          サ: "sa",
          シ: "shi",
          ス: "su",
          セ: "se",
          ソ: "so",
          タ: "ta",
          チ: "chi",
          ツ: "tsu",
          テ: "te",
          ト: "to",
          ナ: "na",
          ニ: "ni",
          ヌ: "nu",
          ネ: "ne",
          ノ: "no",
          ハ: "ha",
          ヒ: "hi",
          フ: "fu",
          ヘ: "he",
          ホ: "ho",
          マ: "ma",
          ミ: "mi",
          ム: "mu",
          メ: "me",
          モ: "mo",
          ヤ: "ya",
          ユ: "yu",
          ヨ: "yo",
          ラ: "ra",
          リ: "ri",
          ル: "ru",
          レ: "re",
          ロ: "ro",
          ワ: "wa",
          ウォ: "wo",
          ン: "n",
          ウィ: "wi",
          ウェ: "we",
          ガ: "ga",
          ギ: "gi",
          グ: "gu",
          げ: "ge",
          ゴ: "go",
          ザ: "za",
          ジ: "ji",
          ズ: "zu",
          ゼ: "ze",
          ゾ: "zo",
          ダ: "da",
          ヂ: "ji",
          ヅ: "zu",
          デ: "de",
          ド: "do",
          バ: "ba",
          ビ: "bi",
          ブ: "bu",
          ベ: "be",
          ボ: "bo",
          パ: "pa",
          ピ: "pi",
          プ: "pu",
          ペ: "pe",
          ポ: "po",
          キャ: "kya",
          キュ: "kyu",
          キョ: "kyo",
          ギャ: "gya",
          ギュ: "gyu",
          ギョ: "gyo",
          シャ: "sha",
          シュ: "shu",
          ショ: "sho",
          ジャ: "ja",
          ジュ: "ju",
          ジョ: "jo",
          チャ: "cha",
          チュ: "chu",
          チョ: "cho",
          ニャ: "nya",
          ニュ: "nyu",
          ニョ: "nyo",
          ヒャ: "hya",
          ヒュ: "hyu",
          ヒョ: "hyo",
          ビャ: "bya",
          ビュ: "byu",
          ビョ: "byo",
          ピャ: "pya",
          ピュ: "pyu",
          ピョ: "pyo",
          ミャ: "mya",
          ミュ: "myu",
          ミョ: "myo",
          リャ: "rya",
          リュ: "ryu",
          リョ: "ryo",
          ヴァ: "va",
          ヴィ: "vi",
          ヴ: "vu",
          ヴェ: "ve",
          ヴォ: "vo",
          ファ: "fa",
          フィ: "fi",
          フェ: "fe",
          フォ: "fo",
          ツァ: "tsa",
          ツィ: "tsi",
          ツェ: "tse",
          ツォ: "tso",
          トゥ: "twu",
          ドゥ: "dwu",
          ティ: "thi",
          ディ: "dhi",
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

function QueueEntry(props: { short: JSX.Element; availableAt: string }) {
  return (
    <>
      <p class="text-xs text-z-subtitle">{props.availableAt}</p>
      <p class="text-sm">{props.short}</p>
    </>
  )
}

function Shortcut(props: { key: string }) {
  return (
    <kbd
      class="absolute bottom-0 right-1 text-sm"
      title={`Shortcut: key ${props.key}`}
    >
      {props.key}
    </kbd>
  )
}

export function Main() {
  const [storageTree, setStorageTree] = createStorage("quiz::tree", "{}")

  const [sidebarOpen, setSidebarOpen] = createSignal(true)

  const [reviewsWithoutNew, setReviewsWithoutNew] = createStorage(
    "quiz::reviews_without_new",
    "0",
  )

  function queueFromJson(value: Json) {
    if (!(value instanceof Array)) {
      throw new Error("Review queue data is invalid.")
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
      throw new Error("Review queue data is invalid.")
    }
    return value
  }

  function queueFromString(str: string) {
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

  const [queue, setQueue] = (() => {
    const [raw, setRaw] = createStorage("quiz::queue", "[]", "directmount")

    return [
      createMemo((): readonly QueuedCard[] => queueFromString(raw())),
      (queue: readonly QueuedCard[]) => setRaw(JSON.stringify(queue)),
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

  function exportState(): string {
    return JSON.stringify({
      version: 1,
      tree: tree.toJSON(),
      reviewsWithoutNew: reviewsWithoutNew(),
      queue: queue(),
    })
  }

  function importState(x: string) {
    try {
      const y: Json = JSON.parse(x)

      if (
        typeof y != "object" ||
        y == null ||
        !("version" in y) ||
        y.version != 1 ||
        !("tree" in y) ||
        !("reviewsWithoutNew" in y) ||
        typeof y.reviewsWithoutNew != "string" ||
        !("queue" in y)
      ) {
        throw new TypeError("Malformed data file.")
      }

      setReviewsWithoutNew(y.reviewsWithoutNew)
      let queueFailed = false
      let treeFailed = false
      try {
        setQueue(queueFromJson(y.queue))
      } catch {
        queueFailed = true
      }
      try {
        tree.importJSON(y.tree)
      } catch {
        treeFailed = false
      }

      if (queueFailed && treeFailed) {
        alert(
          "Review queue and checkbox tree data were both malformed. Their data in the application has not changed.",
        )
      } else if (queueFailed) {
        alert(
          "Review queue data was malformed. Its application data was not changed.",
        )
      } else if (treeFailed) {
        alert(
          "Checkbox tree data was malformed. Its application data was not changed.",
        )
      }
    } catch {
      alert("Data file cannot be read. No application data was changed.")
    }
  }

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

  function answer(response: "again" | "hard" | "good" | "easy") {
    if (response == "easy") {
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
    const interval = response == "again" ? 1 : response == "hard" ? 10 : 30
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
  }, 5000)

  function timestamp(ms: number) {
    let dist = Math.floor((ms - now()) / 1000)

    dist = Math.floor(dist / 5) * 5

    if (dist < 5) {
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

  onMount(() => {
    document.body.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      if (event.key == "0" || event.key == " ") {
        if (state() == "ok") {
          if (!card().answerShown) {
            setCard((c) => ({ ...c, answerShown: true }))
          }
        } else {
          nextCard()
        }
      } else if (
        event.key == "1" ||
        event.key == "2" ||
        event.key == "3" ||
        event.key == "4"
      ) {
        if (state() == "ok" && card().answerShown) {
          answer(([, "again", "hard", "good", "easy"] as const)[event.key])
        }
      }
    })
  })

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
          <div class="flex w-full max-w-full flex-1 flex-col gap-4">
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

            <div class="max-w-full hyphens-auto text-center text-6xl font-semibold text-z-heading sm:text-7xl md:text-8xl lg:text-9xl">
              {card().front}
            </div>

            <Show when={card().answerShown}>
              <hr class="border-z" />

              <div class="max-w-full hyphens-auto text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
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
                      class="flex h-12 w-full items-center justify-center rounded bg-z-body-selected py-2"
                      href=""
                    >
                      Reload Page
                    </a>
                  }
                  when={state() == "nodecks" || state() == "noneleft"}
                >
                  <button
                    class="relative h-12 w-full rounded bg-z-body-selected py-2"
                    onClick={() => nextCard()}
                  >
                    Next Card
                    <Shortcut key="Space" />
                  </button>
                </Show>
              }
              when={state() == "ok"}
            >
              <Show
                fallback={
                  <button
                    class="relative h-12 w-full rounded bg-z-body-selected py-2"
                    onClick={() =>
                      setCard((c) => ({ ...c, answerShown: true }))
                    }
                  >
                    Reveal Answer
                    <Shortcut key="Space" />
                  </button>
                }
                when={card().answerShown}
              >
                <div class="grid grid-cols-4 gap-1 text-base/[1.25] md:gap-2">
                  <button
                    class="relative rounded bg-red-300 py-1 text-red-900"
                    onClick={() => answer("again")}
                  >
                    Again
                    <br />
                    1m
                    <Shortcut key="1" />
                  </button>

                  <button
                    class="relative rounded bg-[#ffcc91] py-1 text-yellow-900"
                    onClick={() => answer("hard")}
                  >
                    Hard
                    <br />
                    10m
                    <Shortcut key="2" />
                  </button>

                  <button
                    class="relative rounded bg-green-300 py-1 text-green-900"
                    onClick={() => answer("good")}
                  >
                    Good
                    <br />
                    30m
                    <Shortcut key="3" />
                  </button>

                  <button
                    class="relative rounded bg-blue-300 py-1 text-green-900"
                    onClick={() => answer("easy")}
                  >
                    Easy
                    <br />
                    (end)
                    <Shortcut key="4" />
                  </button>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </div>

      <div class="fixed right-4 top-16 z-10 flex flex-col gap-2">
        <button
          class="z-field overflow-clip p-1 active:translate-y-0 md:translate-x-[min(0px,-50vw_+_512px+1rem)]"
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
          class="flex flex-col gap-2 transition"
          classList={{ "translate-x-14": !sidebarOpen() }}
          aria-hidden={!sidebarOpen()}
          inert={!sidebarOpen()}
        >
          <button
            class="z-field overflow-clip p-1 active:translate-y-0 md:translate-x-[min(0px,-50vw_+_512px+1rem)]"
            onClick={() => {
              const file = new File(
                [exportState()],
                "zsnout-quiz-" + new Date().toISOString() + ".json",
                { type: "application/json" },
              )

              const url = URL.createObjectURL(file)

              const a = document.createElement("a")
              a.href = url
              a.download = file.name
              a.click()
            }}
          >
            <div class="flex h-6 w-6 items-center justify-center">
              <Fa
                class="h-5 w-5"
                icon={faDownload}
                title="download application data"
              />
            </div>
          </button>

          <input
            class="sr-only"
            type="file"
            accept="application/json"
            onInput={async (event) => {
              const f = event.currentTarget.files?.[0]
              if (!f) {
                return
              }
              event.currentTarget.value = ""
              const text = await f.text()
              importState(text)
            }}
          />

          <button
            class="z-field overflow-clip p-1 active:translate-y-0 md:translate-x-[min(0px,-50vw_+_512px+1rem)]"
            onClick={(event) => {
              const i = event.currentTarget.previousElementSibling
              if (!(i instanceof HTMLInputElement)) {
                return
              }
              i.value = ""
              i.click()
            }}
          >
            <div class="flex h-6 w-6 items-center justify-center">
              <Fa
                class="h-5 w-5"
                icon={faUpload}
                title="upload application data"
              />
            </div>
          </button>
        </div>
      </div>

      <div
        class="fixed left-0 top-0 h-full w-full translate-x-0 transition-[transform,width,backdrop-filter,background-color] sm:pointer-events-auto sm:static sm:flex sm:h-[calc(100%_+_4rem)] sm:w-72 sm:-translate-y-8 sm:translate-x-6 sm:bg-transparent sm:backdrop-filter-none"
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
        aria-hidden={!sidebarOpen()}
        inert={!sidebarOpen()}
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

          <div class="sticky bottom-0 max-h-[min(24rem,50%)] w-full">
            <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

            <div class="h-2 w-full bg-z-body" />

            <div class="relative border-t border-z bg-z-body pt-[0.546875rem] sm:pb-0">
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

              <div class="grid grid-cols-[auto,1fr] items-baseline gap-x-4 pb-8">
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
