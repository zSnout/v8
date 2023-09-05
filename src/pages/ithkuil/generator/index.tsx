import { roots } from "@zsnout/ithkuil/data/roots-latest.js"
import { rootsMap } from "@zsnout/ithkuil/data/roots-map.js"
import {
  AFFILIATION_TO_NAME_MAP,
  ALL_AFFILIATIONS,
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
  Affix,
  AffixShortcut,
  CASE_SCOPE_TO_NAME_MAP,
  CASE_TO_NAME_MAP,
  CONTEXT_TO_NAME_MAP,
  Case,
  CaseScope,
  Context,
  ESSENCE_TO_NAME_MAP,
  EXTENSION_TO_NAME_MAP,
  FUNCTION_TO_NAME_MAP,
  Function,
  ILLOCUTION_TO_NAME_MAP,
  IllocutionOrValidation,
  LEVEL_TO_NAME_MAP,
  MOOD_TO_NAME_MAP,
  Mood,
  PERSPECTIVE_TO_NAME_MAP,
  PHASE_TO_NAME_MAP,
  PartialCA,
  PartialFormative,
  SPECIFICATION_TO_NAME_MAP,
  Stem,
  VALENCE_TO_NAME_MAP,
  VALIDATION_TO_NAME_MAP,
  VERSION_TO_NAME_MAP,
  VN,
  Version,
  deepFreeze,
  has,
  wordToIthkuil,
  type Specification,
} from "@zsnout/ithkuil/generate"
import { glossWord } from "@zsnout/ithkuil/gloss"
import { Searcher } from "fast-fuzzy"
import {
  Index,
  Show,
  batch,
  createEffect,
  createMemo,
  createSignal,
  untrack,
} from "solid-js"

const searcher = new Searcher(
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
          "field w-full rounded-md bg-z-body p-1 shadow transition " +
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
            (previousGroup == "Valence"
              ? ALL_VALENCES
              : previousGroup == "Phase"
              ? ALL_PHASES
              : previousGroup == "Effect"
              ? ALL_EFFECTS
              : previousGroup == "Level"
              ? ALL_LEVELS
              : ALL_ASPECTS
            ).indexOf(previous as any as never) % 9

          props.set(
            (value == "Valence"
              ? ALL_VALENCES
              : value == "Phase"
              ? ALL_PHASES
              : value == "Effect"
              ? ALL_EFFECTS
              : value == "Level"
              ? ALL_LEVELS
              : value == "Aspects I"
              ? ALL_ASPECTS
              : value == "Aspects II"
              ? ALL_ASPECTS.slice(9, 18)
              : value == "Aspects III"
              ? ALL_ASPECTS.slice(18, 27)
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

          return group == "Valence"
            ? ALL_VALENCES
            : group == "Phase"
            ? ALL_PHASES
            : group == "Effect"
            ? ALL_EFFECTS
            : group == "Level"
            ? ALL_LEVELS
            : group == "Aspects I"
            ? ALL_ASPECTS.slice(0, 9)
            : group == "Aspects II"
            ? ALL_ASPECTS.slice(9, 18)
            : group == "Aspects III"
            ? ALL_ASPECTS.slice(18, 27)
            : ALL_ASPECTS.slice(27, 36)
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
        (has(ALL_VALIDATIONS, props.get())
          ? ""
          : " [&>:nth-child(2)>:first-child]:opacity-30")
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

  // Slot VI
  const [ca_, setCa] = createSignal<PartialCA>({})

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
      affixShortcut_ == "NEG/4"
        ? { cs: "r", degree: 4, type: 1 }
        : affixShortcut_ == "DCD/4"
        ? { cs: "t", degree: 4, type: 1 }
        : affixShortcut_ == "DCD/5"
        ? { cs: "t", degree: 5, type: 1 }
        : undefined

    return {
      type: rel == "UNF/K" || rel == "FRM" ? rel : "UNF/C",
      shortcut: affixShortcut_
        ? otherShortcut_ == "MCS"
          ? "VII+VIII"
          : "VII"
        : otherShortcut_ == "MCS"
        ? "VIII"
        : otherShortcut_ == "Ca"
        ? "IV/VI"
        : undefined,

      concatenationType: rel == "T1" ? 1 : rel == "T2" ? 2 : undefined,

      version: version(),
      stem: stem(),

      root: root().root,

      function: function_(),
      specification: specification(),
      context: context(),

      ca,

      slotVIIAffixes: finalSlotVIIAffix && [finalSlotVIIAffix],

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
          (sticky
            ? "invisible sticky w-[calc(100%_+_4rem)]"
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
      <h1 class="text-center text-lg font-light">Ithkuil Word Generator</h1>

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

        <div class="field flex w-full  flex-col items-baseline overflow-hidden p-0 sm:flex-row">
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
              const searched = searcher.search(event.currentTarget.value)[0]

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

      <hr class="my-4 w-full border-t border-dashed border-z transition" />

      <CaSelector get={ca_} set={setCa} />

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
