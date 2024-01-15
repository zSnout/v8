import { createStorage } from "@/stores/local-storage-store"
import {
  For,
  Index,
  createMemo,
  createSignal,
  onMount,
  untrack,
} from "solid-js"

type Key = readonly [
  standard: string,
  main: string,
  shift: string,
  alt: string,
  altShift: string,
]

type KeyRow = readonly Key[]

type KeyData = readonly [KeyRow, KeyRow, KeyRow, KeyRow]

const KEY_DATA: KeyData = [
  [
    ["`", "(", ")", "<", ">"],
    ["1", "󱥳", "󱤹", "󱥗", "󱥹"],
    ["2", "󱥮", "󱤾", "󱥑", "󱤁"],
    ["3", "󱤼", "󱤽", "󱤋", "󱥽"],
    ["4", "󱥩", "󱤈", "󱤲", "󱦡"],
    ["5", "󱤭", "󱥌", "󱥃", "󱥻"],
    ["6", "󱤨", "󱥣", "󱥦", "󱦃"],
    ["7", "󱤊", "󱥢", "󱥴", "󱦀"],
    ["8", "󱤖", "󱥶", "󱤦", "󱥸"],
    ["9", "󱤄", "󱦐", "󱥇", "󱦣"],
    ["0", "󱤂", "󱦑", "󱥋", "🗧"],
    // ["-", "‍", "‍", "", ""], // "󱦓", "󱦒"], (not recommended)
    // ["=", "󱦕", "󱦖", "", ""], // "󱦔", "󱦙"], (not recommended)
  ],
  [
    ["q", "󱥙", "󱥤", "󱤜", "󱤺"],
    ["w", "󱤡", "󱥵", "󱥚", "󱥲"],
    ["e", "󱤉", "󱥖", "󱥓", "󱥼"],
    ["r", "󱥫", "󱤤", "󱤫", "󱦇"],
    ["t", "󱥬", "󱥭", "󱥥", "󱥾"],
    ["y", "󱤬", "󱤇", "󱤗", "󱦁"],
    ["u", "󱥞", "󱤕", "󱥰", "󱥯"],
    ["i", "󱤍", "󱤎", "󱤏", "󱦂"],
    ["o", "󱥄", "󱤌", "󱥜", "󱥺"],
    ["p", "󱥔", "󱥈", "󱥒", "󱥕"],
    ["[", "", "", "[", "{"],
    ["]", "", "", "]", "}"],
    ["\\", "/", "_", "\\", "|"],
  ],
  [
    ["a", "󱤀", "󱤆", "󱤔", "󱤅"],
    ["s", "󱥡", "󱥠", "󱥛", "󱥘"],
    ["d", "󱥨", "󱤪", "󱤥", "󱤃"],
    ["f", "󱥍", "󱥐", "󱤚", "󱦠"],
    ["g", "󱥆", "󱤟", "󱤣", "󱦅"],
    ["h", "󱥂", "󱥝", "󱥊", "󱦢"],
    ["j", "󱤑", "󱤓", "󱤐", "󱤒"],
    ["k", "󱤘", "󱤙", "󱤛", "󱦈"],
    ["l", "󱤧", "󱤮", "󱤩", "󱤯"],
    [";", "󱦜", "󱦝", ";", ":"],
    ["'", "'", '"', "+", "*"],
  ],
  [
    ["z", "󱥧", "󱤢", "󱤷", "󱤸"],
    ["x", "󱥉", "󱤶", "󱥱", "󱥟"],
    ["c", "󱥎", "󱥅", "󱤞", "󱦄"],
    ["v", "󱥷", "󱥪", "󱤝", "󱥿"],
    ["b", "󱥁", "󱤿", "󱥏", "󱤵"],
    ["n", "󱦆", "󱤻", "󱤠", "󱥀"],
    ["m", "󱤴", "󱤰", "󱤱", "󱤳"],
    [",", "、", "「", ",", "『"],
    [".", "。", "」", ".", "』"],
    ["/", "-", "=", "!", "?"],
  ],
]

const PRESSABLE_BY_SEGMENT = [
  KEY_DATA.flatMap((x) => x.map((y) => y[1])).filter((x) => x),
  KEY_DATA.flatMap((x) => x.map((y) => y[2])).filter((x) => x),
  KEY_DATA.flatMap((x) => x.map((y) => y[3])).filter((x) => x),
  KEY_DATA.flatMap((x) => x.map((y) => y[4])).filter((x) => x),
] as const

const PRESSABLE = KEY_DATA.flatMap((x) => x.flatMap((x) => x.slice(1))).filter(
  (x) => x,
)

function createKeysStorage() {
  const [keys, setKeys] = createStorage("toki-pona/typist:keys", "{}")

  return [
    (): Record<string, number> => {
      try {
        const value = JSON.parse(keys())

        if (typeof value == "object") {
          return Object.fromEntries(
            Object.entries(value).filter(
              ([key, value]) =>
                typeof value == "number" && PRESSABLE.includes(key),
            ) as [string, number][],
          )
        } else {
          return {}
        }
      } catch {
        return {}
      }
    },
    (value: Record<string, number>) => {
      setKeys(JSON.stringify(value))
    },
  ] as const
}

const [keys, setKeys] = createKeysStorage()

function split(text: string): string[] {
  const output = []
  let index = 0
  let value

  while (((value = text.codePointAt(index)), value != null)) {
    const char = String.fromCodePoint(value)
    output.push(char)
    index += char.length
  }

  return output
}

function CharTable(props: { active: string | undefined }) {
  return (
    <div class="mx-auto flex flex-col text-z-heading">
      {KEY_DATA.map((row, index) => (
        <div
          class="-mt-px flex pl-[--offset] first:mt-0"
          style={{
            "--offset": ["0", "calc(5.25rem + 2px)", "6.125rem", "7.875rem"][
              index
            ],
          }}
        >
          {row.map((cell) => {
            const [_, main, shift, alt, altShift] = cell

            return (
              <div
                class={
                  "-ml-px grid aspect-square grid-cols-[1.75rem,1.75rem] grid-rows-[1.75rem,1.75rem] border border-z transition first:ml-0" +
                  ((cell as readonly (string | undefined)[]).includes(
                    props.active,
                  )
                    ? " relative border-z-focus bg-z-ring-focus ring ring-z-focus"
                    : "")
                }
              >
                <p class="flex items-center justify-center">{shift}</p>
                <p class="flex items-center justify-center">{altShift}</p>
                <p class="flex items-center justify-center">{main}</p>
                <p class="flex items-center justify-center">{alt}</p>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface Prompt {
  readonly answer: readonly string[]
  readonly typed: readonly string[]
}

export function Main() {
  function Content(props: { class?: string; children: any }) {
    return (
      <div
        class={
          "mx-auto flex w-full max-w-lg flex-1 flex-col" +
          (props.class ? " " + props.class : "")
        }
      >
        {props.children}
      </div>
    )
  }

  const [prompt, setPrompt] = createSignal<Prompt>({
    answer: split("󱥬󱥔󱦜"),
    typed: split("󱥬"),
  })

  onMount(() => {
    document.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.defaultPrevented) {
        return
      }

      if (event.key == "Backspace") {
        setPrompt((prompt) => ({ ...prompt, typed: prompt.typed.slice(0, -1) }))
      } else if (PRESSABLE.includes(event.key)) {
        setPrompt((prompt) => ({
          ...prompt,
          typed: prompt.typed.concat(event.key),
        }))

        if (prompt().typed.join("") == prompt().answer.join("")) {
          const typed = prompt().typed.join("")

          const newKeys = { ...untrack(keys) }
          for (const word of typed) {
            newKeys[word] = (newKeys[word] || 0) + 1
          }
          setKeys(newKeys)

          const pick = () =>
            PRESSABLE[Math.floor(PRESSABLE.length * Math.random())]!

          setPrompt({ answer: Array(6).fill(0).map(pick), typed: [] })
        }
      }
    })
  })

  return (
    <div class="m-auto flex flex-col gap-20">
      <Content>
        <div class="mx-auto flex gap-6">
          <Index each={prompt().answer}>
            {(value, index) => (
              <div
                class={
                  "flex h-20 w-20 items-center justify-center rounded-lg border border-z text-6xl transition " +
                  (prompt().typed[index] == value()
                    ? " !border-green-500 bg-green-100 dark:bg-green-950"
                    : prompt().typed[index]
                    ? " !border-red-500 bg-red-100 dark:bg-red-950"
                    : "")
                }
              >
                {value()}
              </div>
            )}
          </Index>
        </div>
      </Content>

      <CharTable
        active={prompt().answer.find(
          (value, index) => prompt().typed[index] != value,
        )}
      />

      <Entries entries={keys()} />
    </div>
  )
}

function Entries(props: { entries: Record<string, number> }) {
  return (
    <div class="flex">
      <For
        each={Object.entries(props.entries)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .sort(([, a], [, b]) => a - b)}
      >
        {([word, practices]) => (
          <div class="h-10 w-10">
            {word}
            {practices}
          </div>
        )}
      </For>
    </div>
  )
}
