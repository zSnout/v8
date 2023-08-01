import { createSignal } from "solid-js"

type TropeData = readonly [
  trope: string,
  className: string,
  munachClassName: string,
]

const munach: TropeData = ["֣", "munach", "munach"]

const tropes: TropeData[] = [
  ["֑", "bg-[#38761d40]", "bg-[#00ff0040]"],
  ["ֽ", "bg-[#5b0f0040]", "MunachSofPassuk"],
  ["֒", "bg-[#0097a740]", "MunachSegol"],
  ["֓", "Shalshelet", "MunachShalshelet"],
  ["֔", "bg-[#9900ff40]", "bg-[#cb7eff40]"],
  ["֕", "bg-[#1b00af40]", "MunachZakefGadol"],
  ["֖", "bg-[#ff000040]", "MunachTifcha"],
  ["֗", "bg-[#0000ff40]", "bg-[#6d9eeb40]"],
  ["֮", "bg-[#d3ff0040]", "bg-[#69800040]"],
  ["֙", "bg-[#00ffff40]", "MunachPashta"],
  ["֚", "bg-[#ffff0040]", "MunachYetiv"],
  ["֛", "bg-[#00008040]", "MunachTevir"],
  [
    "֡",
    "bg-[linear-gradient(110deg,#ff000040,#ffff0040,#00ff0040,#0000ff40,#ff00ff40)]",
    "MunachPazer",
  ],
  ["֟", "QarneFarah", "MunachQarneFarah"],
  ["֠", "bg-[#90909040]", "bg-[#00000040]"],
  ["֜", "bg-[#7f600040]", "MunachGeresh"],
  ["֞", "bg-[#ff00ff40]", "MunachGershayim"],
  ["֥", "bg-[#ff990040]", "MunachMercha"],
  ["֤", "bg-[#ffff0040]", "MunachMahpach"],
  ["֧", "bg-[#98000040]", "MunachDarga"],
  ["֨", "bg-[#00ffff40]", "MunachKadma"],
  ["֩", "bg-[#90909040]", "bg-[#00000040]"],
  ["֦", "MerchaKefula", "MunachMerchaKefula"],
  ["֪", "YerachBenYomo", "MunachYerachBenYomo"],
  munach,
]

function findTropeDataOf(word: string) {
  let lastIndex = -1
  let data: TropeData | undefined

  for (const trope of tropes) {
    if (word.indexOf(trope[0]) > lastIndex) {
      lastIndex = word.indexOf(trope[0])
      data = trope
    }
  }

  return data
}

type WordWithTropeClass = readonly [
  word: string,
  className: string,
  // prevents TropeData from being assignable to TropeData
  unused?: undefined,
]

function findTropeDataOfAll(words: readonly string[]): WordWithTropeClass[] {
  const withTropes = words.map((word) => [word, findTropeDataOf(word)] as const)

  return withTropes.map<WordWithTropeClass>(([word, data], index) => {
    if (!data) {
      return [word, ""]
    }

    if (data != munach) {
      return [word, data[1]]
    }

    const next = withTropes[index + 1]

    if (!next) {
      return [word, data[1]]
    }

    if (next[1]) {
      return [word, next[1][2]]
    }

    return [word, data[1]]
  })
}

function createWordSpan([word, className]: WordWithTropeClass) {
  const el = document.createElement("span")

  el.className = (className || "") + " p-1.5 -mx-[0.28125rem]"

  el.textContent = word

  return el
}

export function Main() {
  const [textContent, setTextContent] = createSignal("")
  const [div, setDiv] = createSignal<HTMLDivElement>()

  function onInput({
    currentTarget: el,
  }: InputEvent & { currentTarget: HTMLDivElement; target: Element }) {
    if (el.innerHTML.match(/^(?:<div><br><\/div>){2,}$/)) {
      setTextContent("\n")
    } else {
      setTextContent(el.textContent || "")
    }
  }

  function recolor() {
    const el = div()

    if (!el) {
      return
    }

    const content = (el.textContent || "").trim()

    const spans = findTropeDataOfAll(content.split(/\s+/)).map(createWordSpan)

    const nodes = spans.flatMap((el, index) =>
      index == 0 ? el : [document.createTextNode(" "), el],
    )

    el.childNodes.forEach((node) => node.remove())

    el.append(...nodes)
  }

  return (
    <div class="relative flex h-full w-full flex-1">
      <div
        class="field flex-1 bg-white px-6 py-4 font-hebrew text-5xl text-black [direction:rtl] [line-height:1.5]"
        contentEditable
        data-placeholder={
          textContent() != "" ? "" : "...Paste Hebrew text here"
        }
        onInput={onInput}
        onPaste={() => setTimeout(recolor)}
        ref={setDiv}
      />

      <button
        class="field absolute bottom-4 right-4"
        contentEditable={false}
        onClick={recolor}
      >
        Add Colors
      </button>
    </div>
  )
}
