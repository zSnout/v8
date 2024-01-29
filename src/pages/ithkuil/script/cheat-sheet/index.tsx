import { LabeledCheckbox } from "@/components/fields/Checkbox"
import { createStorageBoolean } from "@/stores/local-storage-store"
import {
  Anchor,
  CORES,
  Diacritic,
  EXTENSIONS,
  Extension,
  HANDWRITTEN_CORES,
  HANDWRITTEN_PRIMARY_CORES,
  PRIMARY_CORES,
  fitViewBox,
  rotate180,
} from "@zsnout/ithkuil/script"
import { For, Show } from "solid-js"

const [showBorder, setShowBorder] = createStorageBoolean(
  "ithkuil/script/cheat-sheet/extension:show-border",
  false,
)

const [showExtensions, setShowExtensions] = createStorageBoolean(
  "ithkuil/script/cheat-sheet/extension:show-extensions",
  true,
)

const [showCores, setShowCores] = createStorageBoolean(
  "ithkuil/script/cheat-sheet/extension:show-cores",
  true,
)

const [showNormalLetters, setShowNormalLetters] = createStorageBoolean(
  "ithkuil/script/cheat-sheet/extension:show-normal-letters",
  true,
)

const [showFlippedLetters, setShowFlippedLetters] = createStorageBoolean(
  "ithkuil/script/cheat-sheet/extension:show-flipped-letters",
  true,
)

function Helper(props: { children: any }) {
  return (
    <div class="bg-z-field-selected my-4 flex flex-col gap-1 rounded-lg px-6 py-4 text-z transition print:hidden">
      {props.children}

      <p class="mt-2 italic">This box will disappear when printing.</p>
    </div>
  )
}

function PrintCenter(props: { children: any }) {
  return (
    <div class="contents text-z [page-break-inside:avoid] print:flex print:h-screen print:w-screen print:flex-col print:justify-center">
      {props.children}
    </div>
  )
}

function Cores() {
  return (
    <PrintCenter>
      <div class="m-auto grid grid-cols-6 gap-y-4">
        {Object.entries(CORES).map(([key, value]) => (
          <div class="flex items-center">
            <svg
              class="h-12 w-16 fill-black dark:fill-white"
              ref={(el) => setTimeout(() => fitViewBox(el))}
            >
              <path d={value.shape} />
            </svg>

            <svg
              class="h-12 w-16"
              ref={(el) => setTimeout(() => fitViewBox(el, 5))}
              fill="none"
              stroke-width={5}
              stroke="blue"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d={HANDWRITTEN_CORES[key as keyof typeof CORES]!.shape} />
            </svg>

            <p class="text-center text-xl font-extralight">
              {{
                STANDARD_PLACEHOLDER: "place",
                ALPHABETIC_PLACEHOLDER: "alpha",
                TONAL_PLACEHOLDER: "Z",
                STRESSED_SYLLABLE_PLACEHOLDER: "|",
                BIAS: "bias",
              }[key] || key}
            </p>
          </div>
        ))}

        {Object.entries(PRIMARY_CORES)
          .slice(2)
          .map(([key, value]) => (
            <div class="flex items-center">
              <svg
                class="h-12 w-16 fill-black dark:fill-white"
                ref={(el) => setTimeout(() => fitViewBox(el))}
              >
                <path d={value} />
              </svg>

              <svg
                class="h-12 w-16"
                ref={(el) => setTimeout(() => fitViewBox(el, 5))}
                fill="none"
                stroke-width={5}
                stroke="blue"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d={
                    HANDWRITTEN_PRIMARY_CORES[
                      key as keyof typeof PRIMARY_CORES
                    ]!
                  }
                />
              </svg>

              <p class="text-center text-xl font-extralight">
                {{
                  STANDARD_PLACEHOLDER: "place",
                  ALPHABETIC_PLACEHOLDER: "alpha",
                  TONAL_PLACEHOLDER: "Z",
                  STRESSED_SYLLABLE_PLACEHOLDER: "|",
                  BIAS: "bias",
                }[key] || key}
              </p>
            </div>
          ))}
      </div>
    </PrintCenter>
  )
}

const EXTENSION_SORT_ORDER = [
  "b",
  "c",
  "č",
  "ç",
  "d",
  "d_WITH_LINE",
  "ḑ",
  "f",
  "g",
  "g_WITH_LINE",
  "h",
  "j",
  "k",
  "l",
  "ļ",
  "m",
  "n",
  "ň",
  "p",
  "p_WITH_LINE",
  "r",
  "r_FLIPPED",
  "ř",
  "s",
  "š",
  "t",
  "ţ",
  "v",
  "w",
  "x",
  "y",
  "z",
  "ż",
  "ž",
  "CORE_GEMINATE",
  "EXTENSION_GEMINATE",
  "'",
  "EJECTIVE",
  "VELARIZED",

  "Σ",
  "|",
  "{",
  "}",
  "Z",
]

const diacriticObject = {
  DOT: "A",
  HORIZ_BAR: "Ä",
  HORIZ_WITH_BOTTOM_LINE: "E",
  HORIZ_WITH_TOP_LINE: "Ë",
  VERT_BAR: "I",
  DIAG_BAR: "I₂",
  TWO_PART_DIAG_BAR: "I₃",
  CURVE_TO_TOP: "O",
  CURVE_TO_BOTTOM: "Ö",
  CURVE_TO_BOTTOM_WITH_LINE: "Ö₂",
  VERT_WITH_RIGHT_LINE: "U",
  VERT_WITH_LEFT_LINE: "Ü",

  CURVE_TO_LEFT: "CL",
  CURVE_TO_RIGHT: "CR",
  CURVE_TO_LEFT_WITH_DOT: "CLD",
  CURVE_TO_RIGHT_WITH_DOT: "CRD",
}

const diacritics = Object.entries(diacriticObject) as [
  keyof typeof diacriticObject,
  string,
][]

function Extensions(props: { handwritten: boolean }) {
  const cores = props.handwritten ? HANDWRITTEN_CORES : CORES

  const primaries = props.handwritten
    ? HANDWRITTEN_PRIMARY_CORES
    : PRIMARY_CORES

  const chars = Object.entries(EXTENSIONS)
    .map(
      ([key, value]) =>
        [
          key,
          {
            extension: value as Extension | undefined,
            core: cores[key as keyof typeof cores]?.shape as string | undefined,
          },
        ] as const,
    )
    .concat([
      ["{", { extension: undefined, core: cores.ALPHABETIC_PLACEHOLDER.shape }],
      ["}", { extension: undefined, core: cores.STANDARD_PLACEHOLDER.shape }],
      ["Z", { extension: undefined, core: cores.TONAL_PLACEHOLDER.shape }],
      [
        "|",
        {
          extension: undefined,
          core: cores.STRESSED_SYLLABLE_PLACEHOLDER.shape,
        },
      ],
      ["Σ", { extension: undefined, core: cores.BIAS.shape }],
    ])
    .concat([
      ["BSC", { extension: undefined, core: primaries.BSC }],
      ["CTE", { extension: undefined, core: primaries.CTE }],
      ["CSV", { extension: undefined, core: primaries.CSV }],
      [
        "OBJ",
        {
          extension: undefined,
          core: primaries.OBJ,
        },
      ],
    ])
    .sort(
      ([a], [b]) =>
        EXTENSION_SORT_ORDER.indexOf(a) - EXTENSION_SORT_ORDER.indexOf(b),
    )

  return (
    <PrintCenter>
      <Helper>
        <LabeledCheckbox
          label="Show border?"
          checked={showBorder()}
          onInput={(event) => setShowBorder(event.currentTarget.checked)}
        />

        <LabeledCheckbox
          label="Show extensions?"
          checked={showExtensions()}
          onInput={(event) => setShowExtensions(event.currentTarget.checked)}
        />

        <LabeledCheckbox
          label="Show cores?"
          checked={showCores()}
          onInput={(event) => setShowCores(event.currentTarget.checked)}
        />

        <LabeledCheckbox
          label="Show normal letters?"
          checked={showNormalLetters()}
          onInput={(event) => setShowNormalLetters(event.currentTarget.checked)}
        />

        <LabeledCheckbox
          label="Show flipped letters?"
          checked={showFlippedLetters()}
          onInput={(event) =>
            setShowFlippedLetters(event.currentTarget.checked)
          }
        />
      </Helper>

      <div class="grid grid-cols-4 pl-px pt-px">
        <For each={chars}>
          {([key, value]) => {
            const label =
              {
                d_WITH_LINE: "d₂",
                g_WITH_LINE: "g₂",
                p_WITH_LINE: "p₂",
                r_FLIPPED: "r₂",
                CORE_GEMINATE: "=",
                EXTENSION_GEMINATE: "≈",
                EJECTIVE: "eject.",
                VELARIZED: "velar",
              }[key] || key

            return (
              <div class="-ml-px -mt-px flex items-center border border-z print:w-[25vw]">
                <div class="flex">
                  <Show when={showExtensions()}>
                    <svg
                      class={
                        props.handwritten
                          ? "h-12 fill-transparent stroke-black dark:stroke-white"
                          : "h-12 fill-black dark:fill-white"
                      }
                      stroke-width={4}
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      viewBox={
                        props.handwritten
                          ? "-30 -30 120 60"
                          : showCores()
                          ? "-30 -30 150 60"
                          : "-30 -30 180 60"
                      }
                    >
                      <Show when={value.extension}>
                        <g
                          transform={
                            props.handwritten
                              ? ""
                              : key == "h"
                              ? "translate(0,-20)"
                              : key == "EXTENSION_GEMINATE"
                              ? "translate(0,-10)"
                              : ""
                          }
                        >
                          <path
                            class={
                              props.handwritten
                                ? "fill-none"
                                : "fill-[#c0c0c0] dark:fill-[#404040]"
                            }
                            d={
                              props.handwritten
                                ? "M 0 0 h -40"
                                : "M -10 10 l 10 -10 h -40 l -10 10 z"
                            }
                          />

                          <path
                            d={
                              props.handwritten
                                ? rotate180(value.extension?.horiz2 || "")
                                : value.extension?.horiz
                            }
                          />
                        </g>

                        <g
                          transform={
                            !props.handwritten && showCores()
                              ? "translate(45,0)"
                              : "translate(60,0)"
                          }
                        >
                          <path
                            class="fill-[#c0c0c0] dark:fill-[#404040]"
                            d={
                              props.handwritten
                                ? "M 0 0 v 40"
                                : "M -10 10 l 10 -10 v 40 l -10 10 z"
                            }
                          />

                          <path
                            d={
                              props.handwritten
                                ? value.extension?.vert2
                                : value.extension?.vert
                            }
                          />
                        </g>

                        <Show when={!props.handwritten}>
                          <g
                            transform={
                              showCores()
                                ? "translate(90,0)"
                                : "translate(120,0)"
                            }
                          >
                            <path
                              class="fill-[#c0c0c0] dark:fill-[#404040]"
                              d="M -10 10 l 7.5 -7.5 l 40 40 l -7.5 7.5 z"
                            />

                            <path
                              transform="translate(-2.5,2.5)"
                              d={value.extension?.diag}
                            />
                          </g>
                        </Show>
                      </Show>
                    </svg>
                  </Show>

                  <Show when={showCores()}>
                    <svg
                      class={
                        props.handwritten
                          ? "h-12 w-16 fill-transparent stroke-black dark:stroke-white"
                          : "h-12 w-16 fill-black dark:fill-white"
                      }
                      stroke-width={5}
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      viewBox="-40 -40 80 80"
                    >
                      <path d={value.core} />
                    </svg>
                  </Show>
                </div>

                <div class="mx-auto h-12 text-center text-xl/6 font-bold text-z-heading">
                  <Show when={showNormalLetters()}>
                    <p>{label}</p>
                  </Show>

                  <Show when={showFlippedLetters()}>
                    <p class="rotate-180 opacity-30">{label}</p>
                  </Show>
                </div>
              </div>
            )
          }}
        </For>
      </div>

      <div class="-mt-px flex border border-z">
        <For each={diacritics}>
          {([key, name]) => (
            <div class="flex flex-1 flex-col">
              <svg
                class={
                  props.handwritten
                    ? "fill-none stroke-black stroke-[5px] dark:stroke-white"
                    : "fill-black dark:fill-white"
                }
                stroke-linecap="round"
                stroke-linejoin="round"
                viewBox="-50 -25 100 50"
              >
                <Anchor
                  at="cc"
                  children={Diacritic({
                    name: key,
                    handwritten: props.handwritten,
                  })}
                />
              </svg>

              <p class="text-center text-lg font-light">{name}</p>
            </div>
          )}
        </For>
      </div>
    </PrintCenter>
  )
}

export function Main() {
  return (
    <div>
      <Helper>
        <p>
          To use this cheat sheet, scroll through, choose your options, and save
          the page as a PDF. Then, open a PDF editor and remove any pages you
          don't want. Alternatively, print it directly from your browser and
          deselect any pages you don't want to be printed.
        </p>

        <p>
          Each table is printed in the center of each page, for your
          convenience.
        </p>
      </Helper>

      <Cores />
      <Extensions handwritten={false} />
      <Extensions handwritten={true} />
    </div>
  )
}
