import { Fa } from "@/components/Fa"
import {
  type IconDefinition,
  faAdd,
  faChevronDown,
  faClose,
} from "@fortawesome/free-solid-svg-icons"
import { affixes } from "@zsnout/ithkuil/data/affixes-latest.js"
import { affixesMap } from "@zsnout/ithkuil/data/affixes-map.js"
import { roots } from "@zsnout/ithkuil/data/roots-latest.js"
import { rootsMap } from "@zsnout/ithkuil/data/roots-map.js"
import {
  AFFILIATION_TO_NAME_MAP,
  ALL_AFFILIATIONS,
  ALL_AFFIX_DEGREES,
  ALL_ASPECTS,
  ALL_CASES_SKIPPING_DEGREE_8,
  ALL_CASE_SCOPES,
  ALL_CONFIGURATIONS,
  ALL_CONTEXTS,
  ALL_EFFECTS,
  ALL_ESSENCES,
  ALL_EXTENSIONS,
  ALL_FUNCTIONS,
  ALL_ILLOCUTIONS,
  ALL_LEVELS,
  ALL_MOODS,
  ALL_PERSPECTIVES,
  ALL_PHASES,
  ALL_SPECIFICATIONS,
  ALL_STEMS,
  ALL_VALENCES,
  ALL_VALIDATIONS,
  ALL_VERSIONS,
  ASPECT_TO_NAME_MAP,
  type Affix,
  type AffixDegree,
  type AffixShortcut,
  type AffixType,
  CASE_SCOPE_TO_NAME_MAP,
  CASE_TO_NAME_MAP,
  CONTEXT_TO_NAME_MAP,
  type Case,
  type CaseScope,
  type Context,
  ESSENCE_TO_NAME_MAP,
  EXTENSION_TO_NAME_MAP,
  FUNCTION_TO_NAME_MAP,
  type Function,
  ILLOCUTION_TO_NAME_MAP,
  type IllocutionOrValidation,
  LEVEL_TO_NAME_MAP,
  MOOD_TO_NAME_MAP,
  type Mood,
  PERSPECTIVE_TO_NAME_MAP,
  PHASE_TO_NAME_MAP,
  type PartialCA,
  type PartialFormative,
  SPECIFICATION_TO_NAME_MAP,
  type Specification,
  type Stem,
  VALENCE_TO_NAME_MAP,
  VALIDATION_TO_NAME_MAP,
  VERSION_TO_NAME_MAP,
  type VN,
  type Version,
  deepFreeze,
  has,
  wordToIthkuil,
} from "@zsnout/ithkuil/generate"
import { glossWord } from "@zsnout/ithkuil/gloss"
import { Searcher } from "fast-fuzzy"
import {
  type Accessor,
  Index,
  type Setter,
  Show,
  batch,
  createEffect,
  createMemo,
  createSignal,
  untrack,
} from "solid-js"

const rootSearcher = new Searcher(
  roots.flatMap((root) =>
    [
      { stem: 0 as const, cr: root.cr, label: root.stems[0] },
      { stem: 1 as const, cr: root.cr, label: root.stems[1] },
      { stem: 2 as const, cr: root.cr, label: root.stems[2] },
      { stem: 3 as const, cr: root.cr, label: root.stems[3] },
    ].filter((root) => root.label),
  ),
  {
    keySelector(value) {
      return value.label!
    },
  },
)

const affixSearcher = new Searcher(
  affixes.flatMap((affix) =>
    [
      {
        degree: 0 as const,
        cs: affix.cs,
        label: affix.degrees[0],
        abbr: affix.abbreviation,
      },
      {
        degree: 1 as const,
        cs: affix.cs,
        label: affix.degrees[1],
        abbr: affix.abbreviation,
      },
      {
        degree: 2 as const,
        cs: affix.cs,
        label: affix.degrees[2],
        abbr: affix.abbreviation,
      },
      {
        degree: 3 as const,
        cs: affix.cs,
        label: affix.degrees[3],
        abbr: affix.abbreviation,
      },
      {
        degree: 4 as const,
        cs: affix.cs,
        label: affix.degrees[4],
        abbr: affix.abbreviation,
      },
      {
        degree: 5 as const,
        cs: affix.cs,
        label: affix.degrees[5],
        abbr: affix.abbreviation,
      },
      {
        degree: 6 as const,
        cs: affix.cs,
        label: affix.degrees[6],
        abbr: affix.abbreviation,
      },
      {
        degree: 7 as const,
        cs: affix.cs,
        label: affix.degrees[7],
        abbr: affix.abbreviation,
      },
      {
        degree: 8 as const,
        cs: affix.cs,
        label: affix.degrees[8],
        abbr: affix.abbreviation,
      },
      {
        degree: 9 as const,
        cs: affix.cs,
        label: affix.degrees[9],
        abbr: affix.abbreviation,
      },
    ].filter((x) => x.label),
  ),
  {
    keySelector(value) {
      return [value.abbr + "/" + value.degree, value.label!]
    },
  },
)

// function Tooltip(props: { children: any }) {
//   return (
//     <div class="pointer-events-none absolute left-1/2 top-[calc(100%_+_0.5rem)] -translate-x-1/2 select-none rounded-lg bg-z-field px-3 py-2 text-base text-z shadow transition">
//       {props.children}
//     </div>
//   )
// }

// function Dialog(props: { children: JSX.Element }) {
//   const el = (
//     <dialog
//       class="h-[32rem] max-h-[calc(100%_-_2rem)] w-[48rem] max-w-[calc(100%_-_2rem)] rounded px-3 py-2 outline-none backdrop:backdrop-blur-sm"
//       onClose={(event) => {
//         event.preventDefault()
//       }}
//     >
//       {props.children}
//     </dialog>
//   ) as HTMLDialogElement

//   onMount(() => el.showModal())

//   return el
// }

function SelectField<T extends string | number | boolean | undefined>(props: {
  class: "flex" | `flex ${string}` | "grid" | `grid ${string}`
  get(): T
  set(value: T | ((value: T) => T)): void
  id: string
  labels?: Record<`${T}`, string>
  name: string | undefined
  options: readonly T[]
  outerClass?: string
}) {
  const { labels } = props

  return (
    <div
      class={
        "flex flex-1 flex-col" +
        (props.outerClass ? " " + props.outerClass : "")
      }
    >
      <Show when={props.name}>
        <p class="relative mb-1 whitespace-nowrap text-sm text-z-subtitle transition">
          {props.name}
        </p>
      </Show>

      <div
        class={
          "z-field w-full rounded-md bg-z-body p-1 shadow transition " +
          props.class
        }
      >
        <Index each={props.options}>
          {(item) => {
            return (
              <button
                class={
                  "block flex-1 whitespace-nowrap rounded px-2 py-1 text-z transition" +
                  (props.get() == item() ? " bg-z-body-selected" : "")
                }
                onClick={() => props.set(item())}
              >
                {labels?.[item() as `${T}`] || item()}
              </button>
            )
          }}
        </Index>
      </div>
    </div>
  )
}

function CircleButton(props: {
  class: `left-${string} top-${string}`
  onClick?: () => void
  icon: IconDefinition
  title: string
}) {
  return (
    <button
      class={
        "z-field absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1 active:translate-y-[calc(-50%_+_1px)] " +
        props.class
      }
      onClick={() => props.onClick?.()}
    >
      <Fa class="h-3 w-3" icon={props.icon} title={props.title} />
    </button>
  )
}

// function AffixSelector(props: {
//   get: () => Affix
//   set: (a: Affix | ((previous: Affix) => Affix)) => void
//   remove(): void
//   insert(): void
// }) {
//   return (
//     // @ts-ignore
//     <Dynamic
//       component={(() => {
//         const value = props.get()

//         if ("case" in value) {
//           return undefined
//         } else if ("referents" in value) {
//           return undefined
//         } else if ("ca" in value) {
//           return CaSelector
//         } else {
//           return PlainAffixSelector
//         }
//       })()}
//       {...props}
//     />
//   )
// }

interface PlainAffix {
  readonly cs: string
  readonly degree: AffixDegree
  readonly type: AffixType
  readonly setFromDefinitionField: boolean
}

function PlainAffixSelector(props: {
  get(): PlainAffix
  set(affix: PlainAffix | ((previous: PlainAffix) => PlainAffix)): void
  remove(): void
  insert(): void
  atRoot: boolean
}) {
  const inputId = "x-" + Math.random().toString(36).slice(2)

  return (
    <div class="relative -mx-4 px-4 py-2 child-[2]:-mt-2">
      <div>
        <Show when={props.atRoot}>
          <label
            for={inputId}
            class="block pb-1 text-sm text-z-subtitle transition"
          >
            Root
          </label>
        </Show>

        <div class="flex flex-wrap gap-4">
          <div class="z-field flex flex-1 flex-col items-baseline overflow-hidden p-0 sm:flex-row">
            <input
              id={inputId}
              class={
                "w-full px-3 py-2 text-z outline-none transition sm:w-48 " +
                (props.atRoot ? "bg-z-field" : "bg-z-body")
              }
              type="text"
              value={props.get().cs}
              onInput={(event) =>
                props.set((previous) => ({
                  ...previous,
                  cs: event.currentTarget.value,
                  setFromDefinitionField: false,
                }))
              }
            />

            <input
              class={
                "w-full flex-1 border-t border-dashed border-z px-3 py-2 text-z outline-none transition sm:border-l sm:border-t-0 " +
                (props.atRoot ? "bg-z-field" : "bg-z-body")
              }
              type="text"
              ref={(el) => {
                createEffect(() => {
                  const value = props.get()

                  if (!value.setFromDefinitionField) {
                    const affix = affixesMap.get(value.cs)

                    if (affix) {
                      el.value =
                        affix.degrees[value.degree] ||
                        affix.abbreviation + "/" + value.degree
                    } else {
                      el.value = "(no info found)"
                    }
                  }
                })
              }}
              onInput={(event) => {
                const searched = affixSearcher.search(
                  event.currentTarget.value,
                )[0]

                props.set((previous) => ({
                  ...previous,
                  setFromDefinitionField: true,
                  cs: searched?.cs || "N/A",
                  degree: searched?.degree || 0,
                }))
              }}
              onBlur={() => {
                props.set((previous) => ({
                  ...previous,
                  setFromDefinitionField: false,
                }))
              }}
            />
          </div>

          <select
            class="sr-only"
            onInput={(event) => {
              const degree = +event.currentTarget.value

              if (has(ALL_AFFIX_DEGREES, degree)) {
                props.set((previous) => ({
                  ...previous,
                  degree,
                  setFromDefinitionField: false,
                }))
              }
            }}
            value={props.get().degree}
          >
            {([1, 2, 3, 4, 5, 6, 7, 8, 9, 0] satisfies AffixDegree[]).map(
              (degree) => (
                <option value={degree}>
                  {(() => {
                    const { cs } = props.get()

                    const affix = affixesMap.get(cs)

                    if (!affix) {
                      return "Degree " + degree
                    }

                    const value = affix.degrees[degree]

                    return (
                      affix.abbreviation +
                      "/" +
                      degree +
                      (value ? ": " + value : "")
                    )
                  })()}
                </option>
              ),
            )}
          </select>

          <p
            class={
              "z-field relative flex w-[7.5rem] items-center whitespace-nowrap text-z transition" +
              (props.atRoot ? "" : " bg-z-body")
            }
            aria-hidden
          >
            <span class="mr-auto">Degree {props.get().degree}</span>

            <Fa
              class="h-3 w-3"
              icon={faChevronDown}
              title="Lower the degree by 1"
            />

            <select
              class="absolute bottom-0 left-0 right-0 top-0 cursor-pointer opacity-0"
              onInput={(event) => {
                const degree = +event.currentTarget.value

                if (has(ALL_AFFIX_DEGREES, degree)) {
                  props.set((previous) => ({
                    ...previous,
                    degree,
                    setFromDefinitionField: false,
                  }))
                }
              }}
              value={props.get().degree}
            >
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 0] satisfies AffixDegree[]).map(
                (degree) => (
                  <option value={degree}>
                    {(() => {
                      const { cs } = props.get()

                      const affix = affixesMap.get(cs)

                      if (!affix) {
                        return "Degree " + degree
                      }

                      const value = affix.degrees[degree]

                      return (
                        affix.abbreviation +
                        "/" +
                        degree +
                        (value ? ": " + value : "")
                      )
                    })()}
                  </option>
                ),
              )}
            </select>
          </p>

          <div>
            <SelectField
              class="flex"
              get={() => props.get().type}
              id="affix-type"
              name={undefined}
              options={[1, 2, 3]}
              labels={["", "T1", "T2", "T3"] as const}
              set={(v) =>
                props.set((previous) => ({
                  ...previous,
                  setFromDefinitionField: false,
                  type: typeof v == "function" ? 1 : v,
                }))
              }
            />
          </div>
        </div>
      </div>

      <CircleButton
        onClick={() => props.insert()}
        icon={faAdd}
        title="Add Affix"
        class="left-[100%] top-0"
      />

      <CircleButton
        onClick={() => props.remove()}
        icon={faClose}
        title="Remove Affix"
        class="left-0 top-[50%]"
      />
    </div>
  )
}

function CaSelector(props: {
  boxed?: boolean
  get(): PartialCA
  set(value: PartialCA): void
}) {
  return (
    <div
      class={
        "flex flex-col gap-4 transition" +
        (props.boxed ? " rounded bg-z-body-selected p-4 pt-3" : "")
      }
    >
      <SelectField
        class="flex flex-wrap"
        get={() => props.get().configuration || "UPX"}
        id="configuration"
        name="Configuration"
        options={ALL_CONFIGURATIONS}
        set={(configuration) =>
          props.set({
            ...props.get(),
            configuration:
              typeof configuration == "function" ? "UPX" : configuration,
          })
        }
      />

      <div class="flex flex-wrap gap-4">
        <SelectField
          class="flex flex-col flex-wrap"
          get={() => props.get().affiliation || "CSL"}
          id="affiliation"
          name="Affiliation"
          options={ALL_AFFILIATIONS}
          labels={AFFILIATION_TO_NAME_MAP}
          set={(affiliation) =>
            props.set({
              ...props.get(),
              affiliation:
                typeof affiliation == "function" ? "CSL" : affiliation,
            })
          }
        />

        <SelectField
          class="flex flex-col flex-wrap"
          get={() => props.get().extension || "DEL"}
          id="extension"
          name="Extension"
          options={ALL_EXTENSIONS}
          labels={EXTENSION_TO_NAME_MAP}
          set={(extension) =>
            props.set({
              ...props.get(),
              extension: typeof extension == "function" ? "DEL" : extension,
            })
          }
        />

        <SelectField
          class="flex flex-col flex-wrap"
          get={() => props.get().perspective || "M"}
          id="perspective"
          name="Perspective"
          options={ALL_PERSPECTIVES}
          labels={PERSPECTIVE_TO_NAME_MAP}
          set={(perspective) =>
            props.set({
              ...props.get(),
              perspective: typeof perspective == "function" ? "M" : perspective,
            })
          }
        />

        <SelectField
          class="flex flex-col flex-wrap"
          get={() => props.get().essence || "NRM"}
          id="essence"
          name="Essence"
          options={ALL_ESSENCES}
          labels={ESSENCE_TO_NAME_MAP}
          set={(essence) =>
            props.set({
              ...props.get(),
              essence: typeof essence == "function" ? "NRM" : essence,
            })
          }
        />
      </div>
    </div>
  )
}

function getVnGroup(value: VN) {
  if (has(ALL_VALENCES, value)) {
    return "Valence"
  } else if (has(ALL_PHASES, value)) {
    return "Phase"
  } else if (has(ALL_EFFECTS, value)) {
    return "Effect"
  } else if (has(ALL_LEVELS, value)) {
    return "Level"
  } else {
    const index = ALL_ASPECTS.indexOf(value)

    if (index < 9) {
      return "Aspects I"
    } else if (index < 18) {
      return "Aspects II"
    } else if (index < 27) {
      return "Aspects III"
    } else {
      return "Aspects IV"
    }
  }
}

function VnSelector(props: { get(): VN; set(value: VN): void }) {
  return (
    <div class="[&>:first-child>:nth-child(2)]:rounded-b-none [&>:nth-child(2)>:first-child]:rounded-t-none [&>:nth-child(2)>:first-child]:border-t-0">
      <SelectField
        class="flex flex-wrap"
        get={() => getVnGroup(props.get())}
        id="vn-type"
        name="Vn"
        options={[
          "Valence",
          "Phase",
          "Effect",
          "Level",
          "Aspects I",
          "Aspects II",
          "Aspects III",
          "Aspects IV",
        ]}
        set={(value) => {
          const previous = untrack(props.get)

          const previousGroup = getVnGroup(previous)

          const previousIndex =
            (previousGroup == "Valence" ? ALL_VALENCES
            : previousGroup == "Phase" ? ALL_PHASES
            : previousGroup == "Effect" ? ALL_EFFECTS
            : previousGroup == "Level" ? ALL_LEVELS
            : ALL_ASPECTS
            ).indexOf(previous as any as never) % 9

          props.set(
            (value == "Valence" ? ALL_VALENCES
            : value == "Phase" ? ALL_PHASES
            : value == "Effect" ? ALL_EFFECTS
            : value == "Level" ? ALL_LEVELS
            : value == "Aspects I" ? ALL_ASPECTS
            : value == "Aspects II" ? ALL_ASPECTS.slice(9, 18)
            : value == "Aspects III" ? ALL_ASPECTS.slice(18, 27)
            : ALL_ASPECTS.slice(27, 36))[previousIndex] || "MNO",
          )
        }}
      />

      <SelectField
        class="flex flex-wrap"
        get={props.get}
        id="vn"
        labels={{
          ...VALENCE_TO_NAME_MAP,
          ...PHASE_TO_NAME_MAP,
          "1:BEN": "Benef. to me",
          "2:BEN": "Benef. to you",
          "3:BEN": "Benef. to 3rd",
          "SLF:BEN": "Benef. to self",
          UNK: "Unknown Effect",
          "SLF:DET": "Detri. to self",
          "3:DET": "Detri. to 3rd",
          "2:DET": "Detri. to you",
          "1:DET": "Detri. to me",
          ...LEVEL_TO_NAME_MAP,
          ...ASPECT_TO_NAME_MAP,
        }}
        name={undefined}
        options={(() => {
          const value = props.get()

          const group = getVnGroup(value)

          return (
            group == "Valence" ? ALL_VALENCES
            : group == "Phase" ? ALL_PHASES
            : group == "Effect" ? ALL_EFFECTS
            : group == "Level" ? ALL_LEVELS
            : group == "Aspects I" ? ALL_ASPECTS.slice(0, 9)
            : group == "Aspects II" ? ALL_ASPECTS.slice(9, 18)
            : group == "Aspects III" ? ALL_ASPECTS.slice(18, 27)
            : ALL_ASPECTS.slice(27, 36)
          )
        })()}
        set={props.set}
      />
    </div>
  )
}

const caseGroups = /* @__PURE__ */ deepFreeze([
  "Transrelative",
  "Appositive",
  "Associative",
  "Adverbial",
  "Relational",
  "Affinitive",
  "Spatio-Temporal I",
  "Spatio-Temporal II",
])

function CaseSelector(props: {
  get(): Case
  set(value: Case | ((value: Case) => Case)): void
}) {
  return (
    <div class="[&>:first-child>:nth-child(2)]:rounded-b-none [&>:nth-child(2)>:first-child]:rounded-t-none [&>:nth-child(2)>:first-child]:border-t-0">
      <SelectField
        class="flex flex-wrap"
        get={() =>
          Math.floor(ALL_CASES_SKIPPING_DEGREE_8.indexOf(props.get()) / 9)
        }
        id="case-group"
        labels={caseGroups}
        name="Case"
        options={[0, 1, 2, 3, 4, 5, 6, 7]}
        set={(value) =>
          props.set(
            (x) =>
              ALL_CASES_SKIPPING_DEGREE_8[
                9 * +value + (ALL_CASES_SKIPPING_DEGREE_8.indexOf(x) % 9)
              ] ||
              ALL_CASES_SKIPPING_DEGREE_8[9 * +value + 8] ||
              "THM",
          )
        }
      />

      <SelectField
        class="flex flex-wrap"
        get={props.get}
        id="case"
        labels={CASE_TO_NAME_MAP}
        name={undefined}
        options={ALL_CASES_SKIPPING_DEGREE_8.slice(
          9 * Math.floor(ALL_CASES_SKIPPING_DEGREE_8.indexOf(props.get()) / 9),
          9 * Math.floor(ALL_CASES_SKIPPING_DEGREE_8.indexOf(props.get()) / 9) +
            9,
        ).filter((x): x is Case => x as any as boolean)}
        set={props.set}
      />
    </div>
  )
}

function IllocutionOrValidationSelector(props: {
  get(): IllocutionOrValidation
  set(value: IllocutionOrValidation): void
}) {
  return (
    <div
      class={
        "[&>:first-child>:nth-child(2)]:rounded-b-none [&>:nth-child(2)>:first-child]:rounded-t-none [&>:nth-child(2)>:first-child]:border-t-0" +
        (has(ALL_VALIDATIONS, props.get()) ? "" : (
          " [&>:nth-child(2)>:first-child]:opacity-30"
        ))
      }
    >
      <SelectField
        class="flex flex-wrap"
        get={() => {
          const value = props.get()

          if (has(ALL_VALIDATIONS, value)) {
            return "ASR"
          } else {
            return value
          }
        }}
        id="illocution"
        labels={{ ...ILLOCUTION_TO_NAME_MAP, ...VALIDATION_TO_NAME_MAP }}
        name="Illocution & Validation"
        options={ALL_ILLOCUTIONS}
        set={(value) => {
          const previous = untrack(props.get)

          if (value == "ASR") {
            if (!has(ALL_VALIDATIONS, previous)) {
              props.set("OBS")
            }

            return
          }

          props.set(typeof value == "function" ? "OBS" : value)
        }}
      />

      <SelectField
        class="flex flex-wrap"
        get={props.get}
        id="validation"
        labels={{ ...ILLOCUTION_TO_NAME_MAP, ...VALIDATION_TO_NAME_MAP }}
        name={undefined}
        options={ALL_VALIDATIONS}
        set={props.set}
      />
    </div>
  )
}

function AffixGroupSelector(props: {
  get: Accessor<readonly PlainAffix[]>
  set: Setter<readonly PlainAffix[]>
  label: string
}) {
  return (
    <div
      class="relative -mx-4 border-x border-dashed border-z p-4 py-2"
      classList={{ "pb-3": props.get().length == 0 }}
    >
      <p class="mb-1 text-sm text-z-subtitle transition">{props.label}</p>

      <Index each={props.get()}>
        {(item, index) => (
          <PlainAffixSelector
            get={item}
            insert={() =>
              props.set((previous) => {
                const copy = previous.slice()

                copy.splice(index, 0, {
                  cs: "t",
                  degree: 4,
                  setFromDefinitionField: false,
                  type: 1,
                })

                return copy
              })
            }
            remove={() =>
              props.set((previous) => {
                const copy = previous.slice()

                copy.splice(index, 1)

                return copy
              })
            }
            set={(affix) => {
              props.set((previous) => {
                const copy = previous.slice()

                if (typeof affix == "function") {
                  copy[index] = affix(copy[index]!)
                } else {
                  copy[index] = affix
                }

                return copy
              })
            }}
            atRoot={false}
          />
        )}
      </Index>

      <CircleButton
        onClick={() =>
          props.set((x) => [
            ...x,
            { cs: "t", degree: 4, setFromDefinitionField: false, type: 1 },
          ])
        }
        icon={faAdd}
        title="Add Affix"
        class={
          props.get().length ?
            "left-[100%] top-[calc(100%_-_0.5rem)]"
          : "left-[100%] top-[calc(50%_+_0.125rem)]"
        }
      />
    </div>
  )
}

export function Main() {
  const [fullGloss, setFullGloss] = createSignal(false)

  // Slot I
  const [relation, setRelation] = createSignal<
    "UNF/C" | "UNF/K" | "FRM" | "T1" | "T2"
  >("UNF/C")

  // Slot II
  const [version, setVersion] = createSignal<Version>("PRC")
  const [stem, setStem] = createSignal<Stem>(1)
  const [affixShortcut, setAffixShortcut] = createSignal<
    AffixShortcut | undefined
  >()
  const [otherShortcut, setOtherShortcut] = createSignal<
    "Ca" | "MCS" | undefined
  >()

  // Slot III
  const [root, setRoot] = createSignal({
    setFromDefinitionField: false,
    root: "t",
  })

  // Slot IV
  const [function_, setFunction] = createSignal<Function>("STA")
  const [specification, setSpecification] = createSignal<Specification>("BSC")
  const [context, setContext] = createSignal<Context>("EXS")

  // Slot V
  const [v, setV] = createSignal<readonly PlainAffix[]>([])

  // Slot VI
  const [ca_, setCa] = createSignal<PartialCA>({})

  // Slot VII
  const [vii, setVII] = createSignal<readonly PlainAffix[]>([])

  // Slot VIII
  const [vn, setVn] = createSignal<VN>("MNO")
  const [mood, setMood] = createSignal<Mood>("FAC")
  const [caseScope, setCaseScope] = createSignal<CaseScope>("CCN")

  // Slot IX
  const [case_, setCase] = createSignal<Case>("THM")
  const [illocutionValidation_, setIllocutionValidation] =
    createSignal<IllocutionOrValidation>("OBS")

  const word = createMemo<PartialFormative>(() => {
    const rel = relation()

    const ca = ca_()

    const affixShortcut_ = affixShortcut()

    let otherShortcut_ = otherShortcut()

    if (
      otherShortcut_ == "MCS" &&
      ((ca.affiliation || "CSL") != "CSL" ||
        (ca.configuration || "UPX") != "UPX" ||
        (ca.extension || "DEL") != "DEL" ||
        (ca.perspective || "M") != "M" ||
        ca.essence != "RPV")
    ) {
      otherShortcut_ = undefined
    }

    if (
      otherShortcut_ == "Ca" &&
      !(
        (ca.configuration || "UPX") == "UPX" &&
        (ca.affiliation || "CSL") == "CSL" &&
        ((ca.essence != "RPV" && (ca.extension || "DEL") == "DEL") ||
          (ca.extension == "PRX" && (ca.perspective || "M") == "M") ||
          ((ca.extension || "DEL") == "DEL" &&
            ((ca.perspective || "M") == "M" || ca.perspective == "G") &&
            ca.essence == "RPV"))
      )
    ) {
      otherShortcut_ = undefined
    }

    const finalSlotVIIAffix: Affix | undefined =
      affixShortcut_ == "NEG/4" ? { cs: "r", degree: 4, type: 1 }
      : affixShortcut_ == "DCD/4" ? { cs: "t", degree: 4, type: 1 }
      : affixShortcut_ == "DCD/5" ? { cs: "t", degree: 5, type: 1 }
      : undefined

    return {
      type: rel == "UNF/K" || rel == "FRM" ? rel : "UNF/C",
      shortcut:
        affixShortcut_ ?
          otherShortcut_ == "MCS" ?
            "VII+VIII"
          : "VII"
        : otherShortcut_ == "MCS" ? "VIII"
        : otherShortcut_ == "Ca" ? "IV/VI"
        : undefined,

      concatenationType:
        rel == "T1" ? 1
        : rel == "T2" ? 2
        : undefined,

      version: version(),
      stem: stem(),

      root: root().root,

      function: function_(),
      specification: specification(),
      context: context(),

      slotVAffixes: v() as readonly Affix[],

      ca,

      slotVIIAffixes: (vii() as readonly Affix[]).concat(
        finalSlotVIIAffix ? [finalSlotVIIAffix] : [],
      ),

      vn: vn(),
      caseScope: caseScope(),
      mood: mood(),

      case: case_(),
      illocutionValidation: illocutionValidation_(),
    }
  })

  function makeFooter(sticky: boolean) {
    return (
      <div
        class={
          "bottom-0 mt-4 -translate-x-8 bg-z-body px-8 py-4 shadow-[0_-15px_10px_-10px_rgba(0,0,0,0.1)] transition " +
          (sticky ?
            "invisible sticky w-[calc(100%_+_4rem)]"
          : "fixed w-[calc(min(64rem,100%)_+_4rem)]")
        }
        aria-hidden={sticky}
      >
        <p class="text-center text-lg font-bold text-z transition">
          {wordToIthkuil(word())}
        </p>

        <button
          onClick={() => setFullGloss((x) => !x)}
          class="block w-full select-none text-center text-sm text-z-subtitle transition"
        >
          {glossWord(word())[fullGloss() ? "full" : "short"]}
        </button>
      </div>
    )
  }

  const node = (
    <div class="flex flex-col gap-4">
      <h1 class="text-center text-lg font-light">
        Ithkuil Formative Generator
      </h1>

      <SelectField
        class="flex flex-wrap [&>:nth-child(4)]:flex-[1.5] [&>:nth-child(5)]:flex-[1.5]"
        get={relation}
        id="relation"
        name="Relation"
        options={["UNF/C", "UNF/K", "FRM", "T1", "T2"]}
        set={setRelation}
        labels={{
          "UNF/C": "Noun",
          "UNF/K": "Verb",
          FRM: "Framed Verb",
          T1: "Type-1 Concatenated",
          T2: "Type-2 Concatenated",
        }}
      />

      <div class="flex flex-wrap gap-4">
        <SelectField
          class="flex flex-col"
          get={version}
          set={setVersion}
          id="version"
          labels={VERSION_TO_NAME_MAP}
          name="Version"
          options={ALL_VERSIONS}
        />

        <SelectField
          class="flex flex-col"
          get={stem}
          set={(x) => {
            setStem(x)
            setRoot(({ root }) => ({ root, setFromDefinitionField: false }))
          }}
          id="stem"
          labels={["Stem Zero", "Stem 1", "Stem 2", "Stem 3"]}
          name="Stem"
          options={ALL_STEMS}
        />

        <SelectField
          class="flex flex-col"
          get={affixShortcut}
          set={(affixShortcut) => {
            const output = setAffixShortcut(affixShortcut)

            if (output) {
              setOtherShortcut((otherShortcut) =>
                otherShortcut == "Ca" ? undefined : otherShortcut,
              )
            }
          }}
          id="affixShortcut"
          labels={{
            undefined: "None",
            "DCD/4": "“the X”",
            "NEG/4": "relative negation",
            "DCD/5": "head of relative clause",
          }}
          name="Affix Shortcut"
          options={[undefined, "DCD/4", "NEG/4", "DCD/5"]}
        />

        <Show
          fallback={
            <SelectField
              class="flex flex-col"
              get={otherShortcut}
              set={setOtherShortcut}
              id="otherShortcut"
              labels={{
                undefined: "None",
                MCS: "Mood/Case-Scope",
                Ca: "a+Ca shortcut",
              }}
              name="Other Shortcut"
              options={[undefined, "MCS"]}
            />
          }
          when={affixShortcut() == undefined}
        >
          <SelectField
            class="flex flex-col"
            get={otherShortcut}
            set={setOtherShortcut}
            id="otherShortcut"
            labels={{
              undefined: "None",
              MCS: "Mood/Case-Scope",
              Ca: "a+Ca shortcut",
            }}
            name="Other Shortcut"
            options={[undefined, "MCS", "Ca"]}
          />
        </Show>
      </div>

      <label>
        <p class="mb-1 text-sm text-z-subtitle transition">Root</p>

        <div class="z-field flex w-full flex-col items-baseline overflow-hidden p-0 sm:flex-row">
          <input
            class="w-full bg-z-field px-3 py-2 text-z outline-none transition sm:w-48"
            type="text"
            value={root().root}
            onInput={(event) =>
              setRoot({
                setFromDefinitionField: false,
                root: event.currentTarget.value,
              })
            }
          />

          <input
            class="w-full flex-1 border-t border-dashed border-z bg-z-field px-3 py-2 text-z outline-none transition sm:border-l sm:border-t-0"
            type="text"
            ref={(el) => {
              createEffect(() => {
                const value = root()
                const stem_ = stem()

                if (!value.setFromDefinitionField) {
                  el.value =
                    rootsMap.get(value.root)?.stems[stem_] || "(no info found)"
                }
              })
            }}
            onInput={(event) => {
              const searched = rootSearcher.search(event.currentTarget.value)[0]

              batch(() => {
                if (searched) {
                  setStem(searched.stem)
                }

                setRoot({
                  setFromDefinitionField: true,
                  root: searched?.cr || "N/A",
                })
              })
            }}
            onBlur={() => {
              setRoot({
                setFromDefinitionField: false,
                root: untrack(root).root,
              })
            }}
          />
        </div>
      </label>

      <div class="flex flex-wrap gap-4">
        <SelectField
          class="flex flex-col"
          get={function_}
          set={setFunction}
          id="function"
          labels={FUNCTION_TO_NAME_MAP}
          name="Function"
          options={ALL_FUNCTIONS}
        />

        <SelectField
          class="flex flex-col"
          get={specification}
          set={setSpecification}
          id="specification"
          labels={SPECIFICATION_TO_NAME_MAP}
          name="Specification"
          options={ALL_SPECIFICATIONS}
        />

        <SelectField
          class="flex flex-col"
          get={context}
          set={setContext}
          id="context"
          labels={CONTEXT_TO_NAME_MAP}
          name="Context"
          options={ALL_CONTEXTS}
        />
      </div>

      <AffixGroupSelector get={v} set={setV} label="Slot V Affixes" />

      <CaSelector get={ca_} set={setCa} />

      <AffixGroupSelector get={vii} set={setVII} label="Slot VII Affixes" />

      <VnSelector get={vn} set={setVn} />

      <Show
        fallback={
          <SelectField
            class="flex flex-wrap"
            get={caseScope}
            id="case-scope"
            labels={CASE_SCOPE_TO_NAME_MAP}
            name="Case Scope"
            options={ALL_CASE_SCOPES}
            set={setCaseScope}
          />
        }
        when={relation() == "UNF/K"}
      >
        <SelectField
          class="flex flex-wrap"
          get={mood}
          id="mood"
          labels={MOOD_TO_NAME_MAP}
          name="Mood"
          options={ALL_MOODS}
          set={setMood}
        />
      </Show>

      <Show
        fallback={<CaseSelector get={case_} set={setCase} />}
        when={relation() == "UNF/K"}
      >
        <IllocutionOrValidationSelector
          get={illocutionValidation_}
          set={setIllocutionValidation}
        />
      </Show>

      {makeFooter(true)}
      {makeFooter(false)}
    </div>
  )

  for (const el of document.body.getElementsByClassName("q8s7")) {
    el.remove()
  }

  return node
}
