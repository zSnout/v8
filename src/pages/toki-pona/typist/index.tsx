import { Checkbox } from "@/components/fields/Checkbox"
import { createStorage } from "@/stores/local-storage-store"
import {
  For,
  Index,
  createEffect,
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

  code: string,
]

type KeyRow = readonly Key[]

type KeyData = readonly [KeyRow, KeyRow, KeyRow, KeyRow]

const KEY_DATA: KeyData = [
  [
    ["`", "(", ")", "<", ">", "Backquote"],
    ["1", "󱥳", "󱤹", "󱥗", "󱥹", "Digit1"],
    ["2", "󱥮", "󱤾", "󱥑", "󱤁", "Digit2"],
    ["3", "󱤼", "󱤽", "󱤋", "󱥽", "Digit3"],
    ["4", "󱥩", "󱤈", "󱤲", "󱦡", "Digit4"],
    ["5", "󱤭", "󱥌", "󱥃", "󱥻", "Digit5"],
    ["6", "󱤨", "󱥣", "󱥦", "󱦃", "Digit6"],
    ["7", "󱤊", "󱥢", "󱥴", "󱦀", "Digit7"],
    ["8", "󱤖", "󱥶", "󱤦", "󱥸", "Digit8"],
    ["9", "󱤄", "󱦐", "󱥇", "󱦣", "Digit9"],
    ["0", "󱤂", "󱦑", "󱥋", "🗧", "Digit0"],
    // ["-", "‍", "‍", "", ""], // "󱦓", "󱦒"], (not recommended)
    // ["=", "󱦕", "󱦖", "", ""], // "󱦔", "󱦙"], (not recommended)
  ],
  [
    ["q", "󱥙", "󱥤", "󱤜", "󱤺", "KeyQ"],
    ["w", "󱤡", "󱥵", "󱥚", "󱥲", "KeyW"],
    ["e", "󱤉", "󱥖", "󱥓", "󱥼", "KeyE"],
    ["r", "󱥫", "󱤤", "󱤫", "󱦇", "KeyR"],
    ["t", "󱥬", "󱥭", "󱥥", "󱥾", "KeyT"],
    ["y", "󱤬", "󱤇", "󱤗", "󱦁", "KeyY"],
    ["u", "󱥞", "󱤕", "󱥰", "󱥯", "KeyU"],
    ["i", "󱤍", "󱤎", "󱤏", "󱦂", "KeyI"],
    ["o", "󱥄", "󱤌", "󱥜", "󱥺", "KeyO"],
    ["p", "󱥔", "󱥈", "󱥒", "󱥕", "KeyP"],
    ["[", "", "", "[", "{", "BracketLeft"],
    ["]", "", "", "]", "}", "BracketRight"],
    ["\\", "/", "_", "\\", "|", "Backslash"],
  ],
  [
    ["a", "󱤀", "󱤆", "󱤔", "󱤅", "KeyA"],
    ["s", "󱥡", "󱥠", "󱥛", "󱥘", "KeyS"],
    ["d", "󱥨", "󱤪", "󱤥", "󱤃", "KeyD"],
    ["f", "󱥍", "󱥐", "󱤚", "󱦠", "KeyF"],
    ["g", "󱥆", "󱤟", "󱤣", "󱦅", "KeyG"],
    ["h", "󱥂", "󱥝", "󱥊", "󱦢", "KeyH"],
    ["j", "󱤑", "󱤓", "󱤐", "󱤒", "KeyJ"],
    ["k", "󱤘", "󱤙", "󱤛", "󱦈", "KeyK"],
    ["l", "󱤧", "󱤮", "󱤩", "󱤯", "KeyL"],
    [";", "󱦜", "󱦝", ";", ":", "Semicolon"],
    ["'", "'", '"', "+", "*", "Quote"],
  ],
  [
    ["z", "󱥧", "󱤢", "󱤷", "󱤸", "KeyZ"],
    ["x", "󱥉", "󱤶", "󱥱", "󱥟", "KeyX"],
    ["c", "󱥎", "󱥅", "󱤞", "󱦄", "KeyC"],
    ["v", "󱥷", "󱥪", "󱤝", "󱥿", "KeyV"],
    ["b", "󱥁", "󱤿", "󱥏", "󱤵", "KeyB"],
    ["n", "󱦆", "󱤻", "󱤠", "󱥀", "KeyN"],
    ["m", "󱤴", "󱤰", "󱤱", "󱤳", "KeyM"],
    [",", "、", "「", ",", "『", "Comma"],
    [".", "。", "」", ".", "』", "Period"],
    ["/", "-", "=", "!", "?", "Slash"],
  ],
]

const PRESSABLE_BY_SEGMENT = [
  KEY_DATA.flatMap((x) => x.map((y) => y[1])).filter((x) => x),
  KEY_DATA.flatMap((x) => x.map((y) => y[2])).filter((x) => x),
  KEY_DATA.flatMap((x) => x.map((y) => y[3])).filter((x) => x),
  KEY_DATA.flatMap((x) => x.map((y) => y[4])).filter((x) => x),
] as const

const PRESSABLE: string[] = KEY_DATA.flatMap((x) =>
  x.flatMap((x) => x.slice(1, 5) as string[]),
).filter((x) => x)

const [used, setUsed] = createStorage(
  "toki-pona/typist:used",
  PRESSABLE_BY_SEGMENT[0].join(""),
)

const [font, setFont] = createStorage("toki-pona/typist:font", "", true)

function createKeysStorage() {
  const [keys, setKeys] = createStorage(
    "toki-pona/typist:keys",
    '{"󱥬":1}',
    true,
  )

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

const [isBlurred, setIsBlurred] = createStorage(
  "toki-pona/typist:blur_keyboard",
  "false",
)

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
  function Char(props: {
    index: 1 | 2 | 3 | 4
    char: string
    key: Key
    row: KeyRow
  }) {
    return (
      <p
        class="flex cursor-pointer select-none items-center justify-center"
        classList={{ "opacity-20 text-xs": !used().includes(props.char) }}
        onContextMenu={(event) => event.preventDefault()}
        onMouseDown={(event) => {
          setUsed((usedStr) => {
            const used = split(usedStr)

            const keys = event.altKey
              ? [props.key]
              : event.ctrlKey || event.metaKey
              ? KEY_DATA.flat()
              : props.row

            const items = event.shiftKey
              ? keys.flatMap((x) => x.slice(1, 5) as string[])
              : keys.map((x) => x[props.index])

            if (used.includes(props.char)) {
              return used.filter((x) => !items.includes(x)).join("")
            } else {
              return used
                .concat(...items)
                .filter((x, i, a) => a.indexOf(x) == i)
                .join("")
            }
          })
        }}
      >
        {props.char}
      </p>
    )
  }

  return (
    <div
      class="group mx-auto flex flex-col text-z-heading transition hover:blur-none"
      classList={{ blur: isBlurred() == "true" }}
    >
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
            const [_, main, shf, alt, as] = cell

            return (
              <div
                class={
                  "-ml-px grid aspect-square grid-cols-[1.75rem,1.75rem] grid-rows-[1.75rem,1.75rem] border border-z transition first:ml-0" +
                  ((cell as readonly (string | undefined)[])
                    .slice(1)
                    .includes(props.active)
                    ? isBlurred() == "true"
                      ? " relative group-hover:border-z-focus group-hover:bg-z-ring-focus group-hover:ring group-hover:ring-z-focus"
                      : " relative border-z-focus bg-z-ring-focus ring ring-z-focus"
                    : "")
                }
              >
                <Char char={shf} index={2} key={cell} row={KEY_DATA[index]!} />
                <Char char={as} index={4} key={cell} row={KEY_DATA[index]!} />
                <Char char={main} index={1} key={cell} row={KEY_DATA[index]!} />
                <Char char={alt} index={3} key={cell} row={KEY_DATA[index]!} />
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

function chooseNextKeys() {
  function choose<T>(items: T[]): T {
    if (items.length == 0) {
      throw new Error()
    }

    return items[Math.floor(items.length * Math.random())]!
  }

  const values = split(used()).filter((x) => PRESSABLE.includes(x))

  if (values.length == 0) {
    return undefined
  }

  return [
    choose(values),
    choose(values),
    choose(values),
    choose(values),
    choose(values),
    choose(values),
  ]
}

const [useCode, setUseCode] = createStorage(
  "toki-pona/typist:use_code",
  "true",
  true,
)

export function Main() {
  const [prompt, setPrompt] = createSignal<Prompt>({
    answer: split("󱥬󱥔󱦜"),
    typed: split("󱥬"),
  })

  function setNextPrompt() {
    const values = chooseNextKeys() || ["󱤴", "󱤘", "󱤂", "󱥌", "󱤉", "󱥂"]

    setPrompt({
      answer: values,
      typed: [],
    })
  }

  createEffect(() => {
    used()
    setNextPrompt()
  })

  createEffect(() => {
    const spFont = font()

    document.documentElement.style.setProperty(
      "--font-sp",
      spFont || "nasin-nanpa",
    )
  })

  onMount(() => {
    document.addEventListener("keydown", (event) => {
      if (event.metaKey || event.ctrlKey || event.defaultPrevented) {
        return
      }

      if (event.key == "Backspace") {
        setPrompt((prompt) => ({ ...prompt, typed: prompt.typed.slice(0, -1) }))
        return
      }

      if (event.key == " " || event.key == "　") {
        setIsBlurred((x) => (x == "true" ? "false" : "true"))
        return
      }

      const key =
        untrack(useCode) == "true"
          ? KEY_DATA.flat().find((x) => x[5] == event.code)?.[
              1 + 2 * +event.altKey + +event.shiftKey
            ] || ""
          : event.key

      if (PRESSABLE.includes(key)) {
        setPrompt((prompt) => ({
          ...prompt,
          typed: prompt.typed.concat(key),
        }))

        if (prompt().typed.join("") == prompt().answer.join("")) {
          const typed = prompt().typed.join("")

          const newKeys = { ...untrack(keys) }
          for (const word of typed) {
            newKeys[word] = (newKeys[word] || 0) + 1
          }
          setKeys(newKeys)

          setNextPrompt()
        }
      }
    })

    setNextPrompt()
  })

  return (
    <div class="m-auto flex flex-col gap-20">
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

      <CharTable
        active={prompt().answer.find(
          (value, index) => prompt().typed[index] != value,
        )}
      />

      <p class="-mt-16 text-center">
        Click a cell to toggle keys in its given row.
        <br />
        Press <kbd>Ctrl</kbd> to toggle the whole keyboard.
        <br />
        Press <kbd>Shift</kbd> to ignore key modifiers.
        <br />
        Press <kbd>Alt</kbd> to select just one cell.
        <br />
        Press <kbd>Space</kbd> to blur the keyboard unless hovered.
        <br />
        Based on{" "}
        <a
          class="text-z-link underline decoration-transparent underline-offset-2 transition hover:decoration-inherit focus:decoration-inherit focus:outline-none"
          href="https://www.kreativekorp.com/software/keyboards/sitelenpona/"
          target="_blank"
        >
          this keyboard layout
        </a>
        .
      </p>

      <datalist id="preloaded-fonts">
        <option>nasin-nanpa</option>
        <option>sitelen seli kiwen juniko</option>
        <option>Fairfax HD</option>
        <option>linja lipamanka</option>
        <option>linja enki</option>
      </datalist>

      <div class="-my-12 mx-auto flex w-full max-w-md flex-col gap-4">
        <input
          list="preloaded-fonts"
          class="z-field"
          type="text"
          value={font()}
          onInput={(event) => setFont(event.currentTarget.value)}
          placeholder="Preferred font..."
          onKeyDown={(event) => event.stopImmediatePropagation()}
        />

        <label class="flex gap-2">
          <Checkbox
            checked={useCode() == "true"}
            onInput={(event) =>
              setUseCode(event.currentTarget.checked ? "true" : "false")
            }
          />

          <p>Force sitelen pona keyboard layout</p>
        </label>
      </div>

      <Entries entries={keys()} />
    </div>
  )
}

function Entries(props: { entries: Record<string, number> }) {
  return (
    <div class="flex max-w-full flex-wrap gap-y-6">
      <For
        each={Object.entries(props.entries)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .sort(([, a], [, b]) => b - a)}
      >
        {([word, practices]) => (
          <div class="flex w-8 flex-col items-center">
            <p class="text-xl">{word}</p>
            <p class="text-sm text-z-subtitle">{practices}</p>
          </div>
        )}
      </For>
    </div>
  )
}
