import {
  ALL_ASPECTS,
  ALL_EFFECTS,
  ALL_PHASES,
  ALL_SPECIFICATIONS,
  ALL_VALENCES,
  deepFreeze,
  has,
  type Aspect,
  type Effect,
  type Phase,
  type Specification,
  type Valence,
} from "@zsnout/ithkuil/generate"
import {
  Anchor,
  CORES,
  CORE_DIACRITICS,
  EXTENSIONS,
  HANDWRITTEN_DIACRITICS,
  HANDWRITTEN_REGISTERS,
  Primary,
  Quaternary,
  REGISTERS,
  Secondary,
  Tertiary,
  scale,
  type CoreName,
  type DiacriticName,
  type ExtensionName,
  type RegisterMode,
} from "@zsnout/ithkuil/script"
import { Numeral } from "@zsnout/ithkuil/script/numerals"
import { For, Index, JSX, createSignal, untrack } from "solid-js"

export type ActiveDeadKey =
  | "valence"
  | "phase"
  | "effect"
  | "aspect"
  | "ap1"
  | "ap2"
  | "ap3"
  | "ap4"
  | "register"
  | "registerStandard"
  | "registerAlphabetic"
  | "registerTranscriptive"
  | "registerTransliterative"
  | "none"

const BASE_KEYBOARD_LAYOUT: KeyboardLayout = [
  [
    "TWO_PART_DIAG_BAR",
    "DOT",
    "HORIZ_WITH_BOTTOM_LINE",
    "VERT_WITH_RIGHT_LINE",
    "CURVE_TO_TOP",
    "DIAG_BAR",
    "CURVE_TO_BOTTOM",
    "VERT_WITH_LEFT_LINE",
    "HORIZ_WITH_TOP_LINE",
    "HORIZ_BAR",
    "VERT_BAR",
    "CURVE_TO_LEFT",
    "CURVE_TO_RIGHT",
  ],

  [
    "p",
    "t",
    "k",
    "f",
    "ţ",
    "s",
    "š",
    "ç",
    "c",
    "č",
    "d_WITH_LINE",
    "'",
    "EJECTIVE",
  ],

  [
    "MNO",
    "PUN",
    "rotate",
    "BSC",
    "up",
    "down",
    "CTE",
    "STRESSED_SYLLABLE_PLACEHOLDER",
    "1:BEN",
    "RTR",
    ["alphabetic", "NRR"],
  ],

  [
    "l",
    "x",
    "w",
    "m",
    "CORE_GEMINATE",
    "n",
    "STANDARD_PLACEHOLDER",
    "ALPHABETIC_PLACEHOLDER",
    "r",
    "p_WITH_LINE",
  ],
]

const SHIFTED_KEYBOARD_LAYOUT: KeyboardLayout = [
  [
    "CURVE_TO_BOTTOM_WITH_LINE",
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    0,
    "CURVE_TO_LEFT_WITH_DOT",
    "CURVE_TO_RIGHT_WITH_DOT",
  ],

  [
    "b",
    "d",
    "g",
    "v",
    "ḑ",
    "z",
    "ž",
    "h",
    "ż",
    "j",
    "g_WITH_LINE",
    "'",
    "VELARIZED",
  ],

  [
    "MNO",
    "PUN",
    "rotate",
    "OBJ",
    "left",
    "right",
    "CSV",
    "ASR",
    "1:BEN",
    "RTR",
    ["alphabetic", "NRR"],
  ],

  [
    "ļ",
    "x",
    "y",
    "m",
    "EXTENSION_GEMINATE",
    "ň",
    "BIAS",
    "TONAL_PLACEHOLDER",
    "ř",
    "r_FLIPPED",
  ],
]

const VALENCE_KEYBOARD_LAYOUT: KeyboardLayout = [
  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "MNO",
    "PRL",
    "CRO",
    "RCP",
    "CPL",
    "DUP",
    "DEM",
    "CNG",
    "PTI",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],
]

const PHASE_KEYBOARD_LAYOUT: KeyboardLayout = [
  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "PUN",
    "ITR",
    "REP",
    "ITM",
    "RCT",
    "FRE",
    "FRG",
    "VAC",
    "FLC",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],
]

const EFFECT_KEYBOARD_LAYOUT: KeyboardLayout = [
  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "1:BEN",
    "2:BEN",
    "3:BEN",
    "SLF:BEN",
    "UNK",
    "SLF:DET",
    "3:DET",
    "2:DET",
    "1:DET",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],
]

const ASPECT_KEYBOARD_LAYOUT: KeyboardLayout = [
  [
    "blank",
    "DCL",
    "CCL",
    "CUL",
    "IMD",
    "TRD",
    "TNS",
    "ITC",
    "MTV",
    "SQN",
    "blank",
    "blank",
    "blank",
  ],

  [
    "PMP",
    "CLM",
    "DLT",
    "TMP",
    "XPD",
    "LIM",
    "EPD",
    "PTC",
    "PPR",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "RTR",
    "PRS",
    "HAB",
    "PRG",
    "IMM",
    "PCS",
    "REG",
    "SMM",
    "ATP",
    "blank",
    "blank",
  ],

  ["RSM", "CSS", "PAU", "RGR", "PCL", "CNT", "ICS", "EXP", "IRP", "blank"],
]

const REGISTER_KEYBOARD_LAYOUT: KeyboardLayout = [
  [
    "blank",
    "blank",
    "blank",
    ["transliterative", "NRR"],
    ["transliterative", "DSV"],
    ["transliterative", "PNT"],
    ["transliterative", "CGT"],
    ["transliterative", "EXM"],
    ["transliterative", "SPF"],
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    ["transcriptive", "NRR"],
    ["transcriptive", "DSV"],
    ["transcriptive", "PNT"],
    ["transcriptive", "CGT"],
    ["transcriptive", "EXM"],
    ["transcriptive", "SPF"],
    "blank",
    "blank",
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    "blank",
    "blank",
    ["standard", "PNT"],
    ["standard", "CGT"],
    ["standard", "EXM"],
    ["standard", "SPF"],
    "blank",
    "blank",
    "blank",
  ],

  [
    "blank",
    "blank",
    ["alphabetic", "NRR"],
    ["alphabetic", "DSV"],
    ["alphabetic", "PNT"],
    ["alphabetic", "CGT"],
    ["alphabetic", "EXM"],
    ["alphabetic", "SPF"],
    "blank",
    "blank",
  ],
]

const keyNames = deepFreeze([
  // High row
  [11, "Backquote"],
  [1, "Digit1"],
  [2, "Digit2"],
  [3, "Digit3"],
  [4, "Digit4"],
  [5, "Digit5"],
  [6, "Digit6"],
  [7, "Digit7"],
  [8, "Digit8"],
  [9, "Digit9"],
  [0, "Digit0"],
  [13, "Minus"],
  [15, "Equal"],

  // Top row
  ["P", "KeyQ"],
  ["T", "KeyW"],
  ["K", "KeyE"],
  ["F", "KeyR"],
  ["Ţ", "KeyT"],
  ["S", "KeyY"],
  ["Š", "KeyU"],
  ["Ç", "KeyI"],
  ["C", "KeyO"],
  ["Č", "KeyP"],
  ["D2", "BracketLeft"],
  ["GlottalStop", "BracketRight"],
  ["Ejective", "Backslash"],

  // Home row
  ["Valence", "KeyA"],
  ["Phase", "KeyS"],
  ["Rotate", "KeyD"],
  ["BSC", "KeyF"],
  ["Up", "KeyG"],
  ["Down", "KeyH"],
  ["CTE", "KeyJ"],
  ["Quaternary", "KeyK"],
  ["Effect", "KeyL"],
  ["Aspect", "Semicolon"],
  ["Register", "Quote"],

  // Bottom row
  ["L", "KeyZ"],
  ["X", "KeyX"],
  ["W", "KeyC"],
  ["M", "KeyV"],
  ["Geminate", "KeyB"],
  ["N", "KeyN"],
  ["StandardPlaceholder", "KeyM"],
  ["AlphabeticPlaceholder", "Comma"],
  ["R", "Period"],
  ["P2", "Slash"],

  // Control keys
  ["Escape", "Escape"],
  ["Space", "Space"],
])

type KeyName = (typeof keyNames)[number][0]

const shiftedKeyNames = deepFreeze({
  // High row
  11: 12,
  1: "Numeral1",
  2: "Numeral2",
  3: "Numeral3",
  4: "Numeral4",
  5: "Numeral5",
  6: "Numeral6",
  7: "Numeral7",
  8: "Numeral8",
  9: "Numeral9",
  0: "Numeral0",
  13: 14,
  15: 16,

  // Top row
  P: "B",
  T: "D",
  K: "G",
  F: "V",
  S: "Š",
  Ţ: "Ḑ",
  Š: "Ž",
  Ç: "H",
  C: "Ż",
  Č: "J",
  Register: "RegisterAlphabeticNarrative",
  D2: "G2",
  P2: "R2",

  // Home row
  Valence: "Valence",
  Phase: "Phase",
  Rotate: "Rotate",
  BSC: "OBJ",
  Up: "Left",
  Down: "Right",
  CTE: "CSV",
  Quaternary: "QuaternaryASR",
  Effect: "Effect",
  Aspect: "Aspect",
  GlottalStop: "GlottalStop",

  // Bottom row
  L: "Ļ",
  X: "X",
  W: "Y",
  M: "M",
  Geminate: "ExtensionGeminate",
  N: "Ň",
  StandardPlaceholder: "Bias",
  AlphabeticPlaceholder: "TonalPlaceholder",
  R: "Ř",
  Ejective: "Velarized",

  // Control keys
  Escape: "Escape",
  Space: "Space",
} satisfies Record<KeyName, unknown>)

const SCALING_FACTOR = 4 / 2.625

const HANDWRITTEN_MODE = true

function Key(props: { active?: boolean; children?: JSX.Element }) {
  return (
    <div class="z-field flex h-16 w-16 items-center justify-center">
      <svg
        fill={HANDWRITTEN_MODE ? "none" : "var(--z-text)"}
        height={64}
        stroke={HANDWRITTEN_MODE ? "var(--z-text)" : "none"}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width={HANDWRITTEN_MODE ? 5 : 0}
        viewBox="-50 -50 100 100"
        width={64}
      >
        {props.children}
      </svg>
    </div>
  )
}

function KeyRow(props: { offset?: number; children?: JSX.Element }) {
  return (
    <div
      class="flex gap-1"
      style={
        props.offset ? { "padding-left": props.offset + "rem" } : undefined
      }
    >
      {props.children}
    </div>
  )
}

type KeyLabel =
  | CoreName
  | ExtensionName
  | Valence
  | Phase
  | Effect
  | Aspect
  | Specification
  | DiacriticName
  | [RegisterMode, "NRR" | "DSV" | "PNT" | "SPF" | "EXM" | "CGT"]
  | number
  | "ASR"
  | "up"
  | "down"
  | "left"
  | "right"
  | "rotate"
  | "blank"

function LabeledKey(props: { active?: boolean; label: KeyLabel }) {
  return (
    <Key active={props.active}>
      {props.label == "up" ?
        <path d="M -20 10 l 20 -20 l 20 20" />
      : props.label == "down" ?
        <path d="M -20 -10 l 20 20 l 20 -20" />
      : props.label == "left" ?
        <path d="M 10 -20 l -20 20 l 20 20" />
      : props.label == "right" ?
        <path d="M -10 -20 l 20 20 l -20 20" />
      : props.label == "rotate" ?
        <path d="M 0 30 a 30 30 0 1 0 -30 -30 l -10 -20 m 10 20 l 20 -10" />
      : has(ALL_SPECIFICATIONS, props.label) ?
        Primary({ specification: props.label, handwritten: HANDWRITTEN_MODE })
      : has(ALL_VALENCES, props.label) ?
        Tertiary({ valence: props.label, handwritten: HANDWRITTEN_MODE })
      : (
        has(ALL_PHASES, props.label) ||
        has(ALL_EFFECTS, props.label) ||
        has(ALL_ASPECTS, props.label)
      ) ?
        Tertiary({ top: props.label, handwritten: HANDWRITTEN_MODE })
      : has(Object.keys(CORES) as CoreName[], props.label) ?
        Secondary({
          core: props.label,
          handwritten: HANDWRITTEN_MODE,
          rotated: props.label == "BIAS",
        })
      : props.label == "ASR" ?
        Quaternary({ value: "ASR", handwritten: HANDWRITTEN_MODE })
      : has(Object.keys(EXTENSIONS) as ExtensionName[], props.label) ?
        Secondary({
          core: "STRESSED_SYLLABLE_PLACEHOLDER",
          top: props.label,
          handwritten: HANDWRITTEN_MODE,
        })
      : has(Object.keys(CORE_DIACRITICS) as DiacriticName[], props.label) ?
        Anchor({
          at: "cc",
          children:
            (props.label,
            (
              <path
                d={scale(
                  (HANDWRITTEN_MODE ? HANDWRITTEN_DIACRITICS : CORE_DIACRITICS)[
                    props.label
                  ],
                  1,
                )}
              />
            ) as SVGPathElement),
        })
      : typeof props.label == "number" ?
        Numeral({ value: props.label, handwritten: HANDWRITTEN_MODE })
      : typeof props.label == "object" ?
        Anchor({
          at: "cc",
          children:
            (props.label,
            (
              <path
                d={scale(
                  (HANDWRITTEN_MODE ? HANDWRITTEN_REGISTERS : REGISTERS)[
                    props.label[0]
                  ][props.label[1]],
                  1,
                )}
              />
            ) as SVGPathElement),
        })
      : undefined}
    </Key>
  )
}

type KeyboardLayout = [
  [
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
  ],

  [
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
  ],

  [
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
  ],

  [
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
    KeyLabel,
  ],
]

function Keyboard(props: { layout: KeyboardLayout }) {
  return (
    <div class="mx-auto flex flex-col gap-1">
      <KeyRow>
        <Index each={props.layout[0]}>
          {(item) => <LabeledKey label={item()} />}
        </Index>
      </KeyRow>

      <KeyRow offset={4.1875 * SCALING_FACTOR}>
        <Index each={props.layout[1]}>
          {(item) => <LabeledKey label={item()} />}
        </Index>
      </KeyRow>

      <KeyRow offset={4.84375 * SCALING_FACTOR}>
        <Index each={props.layout[2]}>
          {(item) => <LabeledKey label={item()} />}
        </Index>
      </KeyRow>

      <KeyRow offset={6.15625 * SCALING_FACTOR}>
        <Index each={props.layout[3]}>
          {(item) => <LabeledKey label={item()} />}
        </Index>
      </KeyRow>
    </div>
  )
}

export function Main() {
  const [modifier_, setModifier] = createSignal<ActiveDeadKey>("none")
  const [placeholder, setPlaceholder] = createSignal<string>("Type here...")
  const [isShifting, setIsShifting] = createSignal<boolean>(false)

  const [output, setOutput] = createSignal<readonly string[]>([
    "Placeholder Text 5",
    "Placeholder Text 4",
    "Placeholder Text 3",
    "Placeholder Text 2",
    "Placeholder Text 1",
  ])

  function write(text: string) {
    setOutput((current) => {
      const output = current.slice(0, 4)
      output.unshift(text)
      return output
    })
  }

  function handleKeydown(event: KeyboardEvent): ActiveDeadKey {
    if (event.shiftKey) {
      setIsShifting(true)
    }

    event.preventDefault()

    const mod = untrack(modifier_)

    let key: KeyName | undefined

    for (const [name, code] of keyNames) {
      if (event.code == code) {
        key = name
      }
    }

    if (key == null) {
      return mod
    }

    setPlaceholder("Detected key " + key + ".")

    if (key == "Escape") {
      return "none"
    }

    if (key == "Space") {
      if (mod == "none") {
        write("KEY: Space")
      }

      return "none"
    }

    if (key == "Valence") {
      return "valence"
    }

    if (key == "Phase") {
      return "phase"
    }

    if (key == "Effect") {
      return "effect"
    }

    if (key == "Aspect") {
      return "aspect"
    }

    if (key == "Register") {
      if (event.shiftKey) {
        write("REGISTER: alphabetic, narrative")
        return "none"
      }

      return "register"
    }

    if (mod == "aspect") {
      if (key == 1 || key == 2 || key == 3 || key == 4) {
        return `ap${key}`
      }
    }

    if (mod == "register") {
      if (key == 1) {
        return "registerStandard"
      }

      if (key == 2) {
        return "registerAlphabetic"
      }

      if (key == 3) {
        return "registerTranscriptive"
      }

      if (key == 4) {
        return "registerTransliterative"
      }
    }

    if (mod == "valence" || mod == "phase" || mod == "effect") {
      if (
        key == 1 ||
        key == 2 ||
        key == 3 ||
        key == 4 ||
        key == 5 ||
        key == 6 ||
        key == 7 ||
        key == 8 ||
        key == 9
      ) {
        const segmentGroup =
          mod == "phase" ? ALL_PHASES
          : mod == "effect" ? ALL_EFFECTS
          : ALL_VALENCES

        write(mod.toUpperCase() + ": " + segmentGroup[key - 1]!)

        return "none"
      }
    }

    if (mod == "ap1" || mod == "ap2" || mod == "ap3" || mod == "ap4") {
      if (
        key == 1 ||
        key == 2 ||
        key == 3 ||
        key == 4 ||
        key == 5 ||
        key == 6 ||
        key == 7 ||
        key == 8 ||
        key == 9
      ) {
        const aspectIndex = 9 * (+mod[2]! - 1) + (key - 1)
        write("ASPECT: " + ALL_ASPECTS[aspectIndex]!)
        return "none"
      }
    }

    if (
      mod == "registerStandard" ||
      mod == "registerAlphabetic" ||
      mod == "registerTranscriptive" ||
      mod == "registerTransliterative"
    ) {
      if (
        key == 1 ||
        key == 2 ||
        key == 3 ||
        key == 4 ||
        key == 5 ||
        key == 6
      ) {
        const registerMode = mod.slice(8).toLowerCase() as RegisterMode
        const registerType = [, "NRR", "DSV", "PNT", "SPF", "EXM", "CGT"][key]
        write("REGISTER: " + registerMode + ", " + registerType)
        return "none"
      }
    }

    const label = event.shiftKey ? shiftedKeyNames[key] : key

    write("KEY: " + (typeof label == "number" ? "Diacritic #" + label : label))

    return "none"
  }

  const result = (
    <div class="my-auto flex flex-col gap-4">
      <Keyboard
        layout={
          modifier_() == "valence" ? VALENCE_KEYBOARD_LAYOUT
          : modifier_() == "phase" ?
            PHASE_KEYBOARD_LAYOUT
          : modifier_() == "effect" ?
            EFFECT_KEYBOARD_LAYOUT
          : modifier_() == "aspect" ?
            ASPECT_KEYBOARD_LAYOUT
          : modifier_() == "register" ?
            REGISTER_KEYBOARD_LAYOUT
          : isShifting() ?
            SHIFTED_KEYBOARD_LAYOUT
          : BASE_KEYBOARD_LAYOUT
        }
      />

      <div class="mx-auto flex w-96 max-w-full flex-col">
        <h1 class="mb-8 text-center text-lg font-light text-z-heading transition">
          TODO
        </h1>

        <p>Modifier: {modifier_()}.</p>

        <input
          class="z-field my-4 w-full"
          placeholder={placeholder()}
          onKeyDown={(event) => {
            event.preventDefault()

            if (event.ctrlKey || event.metaKey) {
              return
            }

            const nextModifier = handleKeydown(event)

            setModifier(nextModifier)
          }}
          onInput={(event) => event.preventDefault()}
          type="text"
        />

        <For each={output()}>{(item) => <p>{item}</p>}</For>
      </div>
    </div>
  )

  for (const el of document.getElementsByClassName("q8s7")) {
    el.remove()
  }

  window.addEventListener("keyup", (event) => {
    if (event.key == "Shift") {
      setIsShifting(false)
    }
  })

  return result
}
