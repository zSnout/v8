import { clsx, type ClsxItem } from "@/components/clsx"
import {
  ALL_ASPECTS,
  ALL_CASES_SKIPPING_DEGREE_8,
  ALL_EFFECTS,
  ALL_ILLOCUTIONS,
  ALL_LEVELS,
  ALL_PHASES,
  ALL_REFERENT_TARGETS,
  ALL_VALENCES,
  ALL_VALIDATIONS,
  referentToIthkuil,
  type Aspect,
  type Case,
  type Effect,
  type Illocution,
  type Level,
  type Phase,
  type Valence,
  type Validation,
} from "@zsnout/ithkuil/generate"
import { VowelForm } from "@zsnout/ithkuil/parse"
import { For, Show, Switch, type JSX } from "solid-js"

function Block(props: { class?: ClsxItem; children?: JSX.Element }) {
  return (
    <div
      class={clsx(props.class, "relative z-10 outline outline-1 outline-black")}
    >
      {props.children}
    </div>
  )
}

function BlockLight(props: { class?: ClsxItem; children?: JSX.Element }) {
  return (
    <div class={clsx(props.class, "outline outline-1 outline-z")}>
      {props.children}
    </div>
  )
}

function Td(props: {
  class?: string
  children?: JSX.Element
  outline?: boolean
  align?: "left" | "right"
  for: "form" | "ca" | "ref" | "adjunct" | "meta" | "affix" | "vowel"
}) {
  return (
    <div
      class={clsx(
        props.outline && "outline outline-1 outline-z",
        props.class,
        "flex",
      )}
    >
      <span class="relative flex-1">
        <span
          class={clsx(
            "absolute top-1/2 -translate-y-1/2",
            props.align == "left" ? "left-0"
            : props.align == "right" ? "right-0"
            : "left-1/2 -translate-x-1/2",
          )}
        >
          {props.children ?? "—"}
        </span>
      </span>
    </div>
  )
}

function Sheet(props: {
  landscape?: boolean
  class?: ClsxItem
  children?: JSX.Element
}) {
  return (
    <div
      class={clsx(
        props.landscape ? "h-[8.5in] w-[11in]" : "h-[11in] w-[8.5in]",
        "flex whitespace-nowrap rounded bg-white px-8 py-4 text-center font-[Carlito,ui-sans-serif,system-ui,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Noto_Color_Emoji'] text-black outline outline-purple-500",
      )}
    >
      <div
        class={clsx(
          "grid flex-1 gap-px outline outline-1 outline-black",
          props.class,
        )}
      >
        {props.children}
      </div>
    </div>
  )
}

function Sheet01Conj(props: { landscape?: boolean }) {
  const outer = props

  return (
    <Sheet
      landscape={props.landscape}
      class={
        props.landscape ?
          "grid-cols-[repeat(24,1fr)] grid-rows-[repeat(35,1fr)]" // 840
        : "grid-cols-[repeat(20,1fr)] grid-rows-[repeat(42,1fr)]" // 840
      }
    >
      <VowelForms class="col-[span_20] row-[span_19]" />
      <Aside />

      <Show
        when={props.landscape}
        fallback={
          <>
            <SuppletiveRefs class="col-span-8 row-span-1" />
            <AffixualAdjunctScope class="col-span-8 row-span-3" />
            <CaseAffixes class="col-span-8 row-span-2" />
            <Credits class="col-span-8 row-span-4" />
            <FourCols />
          </>
        }
      >
        <SuppletiveRefs class="col-span-8 row-span-1" />
        <FourCols />
        <AffixualAdjunctScope class="col-span-8 row-span-3" />
        <CaseAffixes class="col-span-8 row-span-2" />
        <Credits class="col-span-8 row-span-4" />
      </Show>
    </Sheet>
  )

  function FourCols() {
    return (
      <>
        <ComboRef class="col-span-2 row-span-4" />
        <CarrierAdj class="col-span-2 row-span-4" />
        <VhScope class="col-span-2 row-span-4" />
        <ParsingAdjunct class="col-span-2 row-span-4" />
      </>
    )
  }

  function Aside() {
    return (
      <>
        <Show when={props.landscape}>
          <Vh class="col-span-4 row-span-7" />
          <Ref class="col-span-4 row-[span_13]" />
        </Show>
        <Ca />
        <Show when={!props.landscape}>
          <Block class="subgrid col-span-4 row-[span_23]">
            <Vh class="col-span-4 row-span-7" />
            <Ref class="col-span-4 row-[span_13]" />
            <ComboThm class="col-span-4 row-span-1" />
            <SentenceJuncture class="col-span-4 row-span-2" />
          </Block>
        </Show>

        <Show when={props.landscape}>
          <SentenceJuncture class="col-span-4 row-span-2" />
          <ComboThm class="col-span-4 row-span-1" />
        </Show>
      </>
    )
  }

  function Ca() {
    return (
      <Block class="subgrid col-[span_16] row-[span_16]">
        <CaCore class="col-span-8 row-span-10" />
        <CaAllomorphs class="col-span-8 row-span-5" />
        <CaGemRules class="col-span-8 row-span-11 overflow-clip text-base/5" />
        <CaGemPairs class="col-span-8 row-span-6" />
      </Block>
    )
  }

  function Credits(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-2 grid-rows-4 gap-x-4 py-1"]}>
        <Td for="meta" align="right">
          new ithkuil overview
        </Td>
        <Td for="meta" align="left">
          compiled by sakawi
        </Td>
        <Td for="meta" align="right">
          morphology v1.3.2
        </Td>
        <Td for="meta" align="left">
          october 24, 2024
        </Td>
        <Td for="meta" align="right">
          {outer.landscape ? "landscape" : "portrait"} edition
        </Td>
        <Td for="meta" align="left">
          grammar sheet
        </Td>
        <Td for="meta" class="col-span-2">
          https://v8.zsnout.com/ithkuil/sheet
        </Td>
      </Block>
    )
  }

  function SuppletiveRefs(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-1 grid-rows-1"]}>
        <Td for="ref">suppletive refs. prefix a- in combo, else üo-</Td>
      </Block>
    )
  }

  function ComboThm(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-1 grid-rows-1"]}>
        <Td for="ref">THM is -üa in combos</Td>
      </Block>
    )
  }

  function CaGemRules(props: { class?: ClsxItem }) {
    return (
      <BlockLight class={clsx(props.class, "grid grid-cols-1 grid-rows-1")}>
        <Td for="ca" class="w-full *:*:w-full">
          <ol class="list-decimal whitespace-normal pl-6 text-left marker:font-bold">
            <li>Geminate single consonants.</li>
            <li>tļ → ttļ.</li>
            <li>
              If there is an initial stop followed by [lrřwy], geminate the
              stop.
            </li>
            <li>If there is a sibilant, geminate it.</li>
            <li>Geminate an initial non-sibilant fricative/nasal.</li>
            {/* </ol>
        <ol
          class="list-decimal whitespace-normal pl-6 text-left marker:font-bold"
          start={6}
        > */}
            <li>
              If the C<sub>A</sub> starts with [tkp] and a fricative, geminate
              the fricative.
            </li>
            <li>
              If the C<sub>A</sub> ends in a combination to the left, substitute
              it.
            </li>
            <li>
              If the C<sub>A</sub> begins with [lrř], geminate the rest. If it's
              invalid, geminate the [lrř].
            </li>
          </ol>
        </Td>
      </BlockLight>
    )
  }

  function CaGemPairs(props: { class?: ClsxItem }) {
    return (
      <BlockLight
        class={[props.class, "grid grid-cols-3 grid-rows-subgrid gap-px"]}
      >
        <Td for="ca">pt → bbḑ</Td>
        <Td for="ca">kt → ggḑ</Td>
        <Td for="ca">tk → ḑvv</Td>
        <Td for="ca">pk → bbv</Td>
        <Td for="ca">kp → ggv</Td>
        <Td for="ca">tp → ddv</Td>

        <Td for="ca">pm → vvm</Td>
        <Td for="ca">km → xxm</Td>
        <Td for="ca">tm → ḑḑm</Td>
        <Td for="ca">pn → vvn</Td>
        <Td for="ca">kn → xxn</Td>
        <Td for="ca">tn → ḑḑn</Td>

        <Td for="ca">bm → mmw</Td>
        <Td for="ca">gm → ňňw</Td>
        <Td for="ca">dm → nnw</Td>
        <Td for="ca">bn → mml</Td>
        <Td for="ca">gn → ňňl</Td>
        <Td for="ca">dn → nnl</Td>
      </BlockLight>
    )
  }

  function ComboRef(props: { class?: ClsxItem }) {
    return (
      <Block class={clsx(props.class, "subgrid")}>
        <Td for="ref" class="pl-2">
          BSC
        </Td>
        <Td for="ref">x</Td>
        <Td for="ref" class="pl-2">
          CTE
        </Td>
        <Td for="ref">xt</Td>
        <Td for="ref" class="pl-2">
          CSV
        </Td>
        <Td for="ref">xp</Td>
        <Td for="ref" class="pl-2">
          OBJ
        </Td>
        <Td for="ref">xx</Td>
      </Block>
    )
  }

  function CarrierAdj(props: { class?: ClsxItem }) {
    return (
      <Block class={clsx(props.class, "subgrid")}>
        <Td for="adjunct" class="pl-2">
          CAR
        </Td>
        <Td for="adjunct">hl</Td>
        <Td for="adjunct" class="pl-2">
          QUO
        </Td>
        <Td for="adjunct">hm</Td>
        <Td for="adjunct" class="pl-2">
          NAM
        </Td>
        <Td for="adjunct">hn</Td>
        <Td for="adjunct" class="pl-2">
          PHR
        </Td>
        <Td for="adjunct">hň</Td>
      </Block>
    )
  }

  function VhScope(props: { class?: ClsxItem }) {
    return (
      <Block class={clsx(props.class, "subgrid")}>
        <Td for="adjunct" class="pl-2">
          form.
        </Td>
        <Td for="adjunct">a</Td>
        <Td for="adjunct" class="pl-2">
          MCS
        </Td>
        <Td for="adjunct">e</Td>
        <Td for="adjunct" class="pl-2">
          &lt;adj
        </Td>
        <Td for="adjunct">i/u</Td>
        <Td for="adjunct" class="pl-2">
          &gt;adj
        </Td>
        <Td for="adjunct">o</Td>
      </Block>
    )
  }

  function ParsingAdjunct(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(
          props.class,
          "grid grid-cols-[1fr,min-content] grid-rows-subgrid gap-px",
        )}
      >
        <Td for="adjunct" align="right">
          mono.
        </Td>
        <Td for="adjunct" class="pl-2.5 pr-3">
          a’
        </Td>
        <Td for="adjunct" align="right">
          ultim.
        </Td>
        <Td for="adjunct" class="pl-2.5 pr-3">
          e’
        </Td>
        <Td for="adjunct" align="right">
          penult.
        </Td>
        <Td for="adjunct" class="pl-2.5 pr-3">
          o’
        </Td>
        <Td for="adjunct" align="right">
          antep.
        </Td>
        <Td for="adjunct" class="pl-2.5 pr-3">
          u’
        </Td>
      </Block>
    )
  }

  function SentenceJuncture(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(
          props.class,
          "grid grid-cols-[3fr,4fr] grid-rows-subgrid gap-px",
        )}
      >
        <Td for="adjunct" class="pl-1">
          w → çw
        </Td>
        <Td for="adjunct">[C] → çë[C]</Td>
        <Td for="adjunct" class="pl-1">
          y → çç
        </Td>
        <Td for="adjunct">[V] → ç[V]</Td>
      </Block>
    )
  }

  function Vh(props: { class?: ClsxItem }) {
    return (
      <Block class={clsx(props.class, "subgrid")}>
        <BlockLight class="subgrid col-span-4">
          <Td for="form" class="col-span-2">
            C<sub>N</sub>
          </Td>
          <Td for="form" class="col-span-2">
            V<sub>H</sub>
          </Td>
        </BlockLight>

        <Td for="form">FAC</Td>
        <Td for="form">CCN</Td>
        <Td for="form" class="font-bold">
          (h)
        </Td>
        <Td for="form" class="font-bold">
          w/y
        </Td>

        <Td for="form">SUB</Td>
        <Td for="form">CCA</Td>
        <Td for="form" class="font-bold">
          hl
        </Td>
        <Td for="form" class="font-bold">
          hw
        </Td>

        <Td for="form">ASM</Td>
        <Td for="form">CCS</Td>
        <Td for="form" class="font-bold">
          hr
        </Td>
        <Td for="form" class="font-bold">
          hrw
        </Td>

        <Td for="form">SPC</Td>
        <Td for="form">CCQ</Td>
        <Td for="form" class="font-bold">
          hm
        </Td>
        <Td for="form" class="font-bold">
          hmw
        </Td>

        <Td for="form">COU</Td>
        <Td for="form">CCP</Td>
        <Td for="form" class="font-bold">
          hn
        </Td>
        <Td for="form" class="font-bold">
          hnw
        </Td>

        <Td for="form">HYP</Td>
        <Td for="form">CCV</Td>
        <Td for="form" class="font-bold">
          hň
        </Td>
        <Td for="form" class="font-bold">
          hňw
        </Td>
      </Block>
    )
  }

  function VowelForms(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "subgrid"]}>
        <FormativeS1 class="col-span-5 row-span-4" />
        <VXHeader class="col-[span_15] row-span-4" />
        <div class="subgrid col-[span_20] row-[span_14] grid-rows-[repeat(18,1fr)] gap-px">
          <VXSidebar class="col-[span_5] row-[span_18]" />
          <VXBody class="col-[span_15] row-[span_18]" />
        </div>
        <VXFooter class="col-[span_20]" />
      </Block>
    )
  }

  function FormativeS1(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-4 grid-rows-subgrid gap-px"]}>
        <Td for="form">
          C<sub>C</sub>
        </Td>
        <Td for="form" />
        <Td for="form">W</Td>
        <Td for="form">Y</Td>

        <Td for="form" />
        <Td for="form">’</Td>
        <Td for="form">w</Td>
        <Td for="form">y</Td>

        <Td for="form">T1</Td>
        <Td for="form">h</Td>
        <Td for="form">hl</Td>
        <Td for="form">hm</Td>

        <Td for="form">T2</Td>
        <Td for="form">hw</Td>
        <Td for="form">hr</Td>
        <Td for="form">hn</Td>
      </Block>
    )
  }

  function VXHeader(props: { class?: ClsxItem }) {
    return (
      <div class={clsx(props.class, "subgrid")}>
        <Td for="form" outline class="col-span-4">
          affixual STA.PRC
        </Td>
        <Td for="form" outline class="col-span-4">
          affixual STA.CPT
        </Td>
        <Td for="form" outline class="col-span-4">
          affixual DYN.PRC
        </Td>
        <Td for="form" outline class="col-span-3">
          affixual DYN.CPT
        </Td>

        <Td for="form" outline class="col-span-4">
          [default] / PRX
        </Td>
        <Td for="form" outline class="col-span-4">
          G / RPV
        </Td>
        <Td for="form" outline class="col-span-4">
          N / A
        </Td>
        <Td for="form" outline class="col-span-3">
          G.RPV / PRX.RPV
        </Td>

        <Td for="form" outline>
          EXS
        </Td>
        <Td for="affix" outline>
          T1
        </Td>
        <Td for="form" outline class="col-span-2" />

        <Td for="form" outline>
          FNC
        </Td>
        <Td for="affix" outline>
          T2
        </Td>
        <Td for="form" outline class="col-span-2">
          NEG/4
        </Td>

        <Td for="form" outline>
          RPS
        </Td>
        <Td for="affix" outline>
          T3
        </Td>
        <Td for="form" outline class="col-span-2">
          DCD/4
        </Td>

        <Td for="form" outline>
          AMG
        </Td>
        <Td for="form" outline class="col-span-2">
          DCD/5
        </Td>

        <Td for="form" outline>
          V<sub>N</sub>
        </Td>
        <Td for="form" outline>
          V<sub>C</sub>
        </Td>
        <Td for="form" outline>
          V<sub>K</sub>
        </Td>
        <Td for="vowel" outline>
          V
        </Td>

        <Td for="form" outline>
          V<sub>N</sub>
        </Td>
        <Td for="form" outline>
          V<sub>C</sub>
        </Td>
        <Td for="form" outline>
          V<sub>K</sub>
        </Td>
        <Td for="vowel" outline>
          V
        </Td>

        <Td for="form" outline>
          V<sub>N</sub>
        </Td>
        <Td for="form" outline>
          V<sub>C</sub>
        </Td>
        <Td for="vowel" outline class="col-span-2">
          V
        </Td>

        <Td for="form" outline>
          V<sub>N</sub>
        </Td>
        <Td for="form" outline>
          V<sub>C</sub>
        </Td>
        <Td for="vowel" outline>
          V
        </Td>
      </div>
    )
  }

  function VXSidebar(props: { class?: ClsxItem }) {
    return (
      <div
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-9 gap-px")}
      >
        <Td for="form" outline class="row-span-2">
          S1
        </Td>
        <Td for="form" outline>
          PRC
        </Td>
        <Td for="form" outline class="row-span-4">
          STA
        </Td>
        <Td for="form" outline>
          BSC
        </Td>
        <Td for="affix" outline>
          D1
        </Td>

        <Td for="form" outline>
          CPT
        </Td>
        <Td for="form" outline>
          CTE
        </Td>
        <Td for="affix" outline>
          D2
        </Td>

        <Td for="form" outline class="row-span-2">
          S2
        </Td>
        <Td for="form" outline>
          PRC
        </Td>
        <Td for="form" outline>
          CSV
        </Td>
        <Td for="affix" outline>
          D3
        </Td>

        <Td for="form" outline>
          CPT
        </Td>
        <Td for="form" outline>
          OBJ
        </Td>
        <Td for="affix" outline>
          D4
        </Td>

        <Td for="form" outline class="col-span-4">
          affixual V<sub>V</sub>
        </Td>
        <Td for="affix" outline>
          D5
        </Td>

        <Td for="form" outline class="row-span-2">
          S0
        </Td>
        <Td for="form" outline>
          CPT
        </Td>
        <Td for="form" outline class="row-span-4">
          DYN
        </Td>
        <Td for="form" outline>
          OBJ
        </Td>
        <Td for="affix" outline>
          D6
        </Td>

        <Td for="form" outline>
          PRC
        </Td>
        <Td for="form" outline>
          CSV
        </Td>
        <Td for="affix" outline>
          D7
        </Td>

        <Td for="form" outline class="row-span-2">
          S3
        </Td>
        <Td for="form" outline>
          CPT
        </Td>
        <Td for="form" outline>
          CTE
        </Td>
        <Td for="affix" outline>
          D8
        </Td>

        <Td for="form" outline>
          PRC
        </Td>
        <Td for="form" outline>
          BSC
        </Td>
        <Td for="affix" outline>
          D9
        </Td>
      </div>
    )
  }

  function VXBody(props: { class?: ClsxItem }) {
    return (
      <div class={clsx(props.class, "subgrid")}>
        <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9] as const}>
          {(degree) => (
            <For each={[1, 2, 3, 4] as const}>
              {(row) => (
                <V
                  class={
                    row == 4 ? "col-span-3 row-span-2" : "col-span-4 row-span-2"
                  }
                  vn1={
                    [ALL_VALENCES, ALL_PHASES, ALL_EFFECTS, ALL_LEVELS][
                      row - 1
                    ]![degree - 1]!
                  }
                  vn2={ALL_ASPECTS[9 * (row - 1) + (degree - 1)]!}
                  vc1={
                    ALL_CASES_SKIPPING_DEGREE_8[9 * (row - 1) + (degree - 1)]!
                  }
                  vc2={
                    ALL_CASES_SKIPPING_DEGREE_8[
                      36 + 9 * (row - 1) + (degree - 1)
                    ]!
                  }
                  vk={
                    row == 1 ? ALL_VALIDATIONS[degree - 1]
                    : row == 2 ?
                      degree == 5 ?
                        null
                      : degree == 4 ?
                        "VER"
                      : degree > 4 ?
                        ALL_ILLOCUTIONS[degree - 1]
                      : ALL_ILLOCUTIONS[degree]
                    : undefined
                  }
                  vWide={row == 3}
                  v={new VowelForm(row, degree).toString(false).toString()}
                />
              )}
            </For>
          )}
        </For>
      </div>
    )
  }

  function V(props: {
    class?: ClsxItem
    vn1: Valence | Phase | Effect | Level
    vn2: Aspect
    vc1: Case
    vc2: Case | undefined
    vk?: Illocution | Validation | "VER" | null
    vWide?: boolean
    v: string
  }) {
    return (
      <div class={clsx(props.class, "subgrid outline outline-1 outline-z")}>
        <Td for="form">
          {props.vn1.endsWith(":BEN") ?
            props.vn1.slice(0, -4) + "+"
          : props.vn1.endsWith(":DET") ?
            props.vn1.slice(0, -4) + "-"
          : props.vn1}
        </Td>
        <Td for="form">{props.vc1}</Td>
        <Show when={props.vk !== undefined}>
          <Td for="form" class="row-span-2">
            {props.vk}
          </Td>
        </Show>
        <Td
          for="vowel"
          class={clsx(
            props.vWide && "col-span-2",
            "row-span-2 text-2xl font-bold",
          )}
        >
          {props.v[0] == "(" ? props.v.slice(1, -1) : props.v}
        </Td>
        <Td for="form">{props.vn2}</Td>
        <Td for="form">{props.vc2}</Td>
      </div>
    )
  }

  function VXFooter(props: { class?: ClsxItem }) {
    return (
      <div class={clsx(props.class, "subgrid")}>
        <Td for="form" outline class="col-span-4">
          referential V<sub>V</sub>
        </Td>
        <Td for="affix" outline>
          D0
        </Td>

        <Td for="form" outline class="col-span-3">
          PRC referent
        </Td>
        <Td for="vowel" outline class="font-bold">
          ae
        </Td>

        <Td for="form" outline class="col-span-3">
          CPT referent
        </Td>
        <Td for="vowel" outline class="font-bold">
          ea
        </Td>

        <Td for="form" outline class="col-span-3" />
        <Td for="vowel" outline class="font-bold">
          üo
        </Td>

        <Td for="affix" outline class="col-span-2">
          C<sub>A</sub> stacking
        </Td>
        <Td for="vowel" outline class="font-bold">
          üö
        </Td>
      </div>
    )
  }

  function CaCore(props: { class?: ClsxItem }) {
    return (
      <BlockLight class={clsx(props.class, "subgrid")}>
        <div class="subgrid col-span-4 row-span-10">
          <BlockLight class="subgrid col-span-2 row-span-4">
            <Td for="ca">CSL</Td>
            <Td for="ca" />
            <Td for="ca">ASO</Td>
            <Td for="ca">l (nļ)</Td>
            <Td for="ca">COA</Td>
            <Td for="ca">r (rļ)</Td>
            <Td for="ca">VAR</Td>
            <Td for="ca">ř (ň)</Td>
          </BlockLight>

          <BlockLight class="col-span-2 row-span-10 grid grid-cols-3 grid-rows-subgrid gap-px">
            <Td for="ca"> </Td>
            <Td for="ca" />
            <Td for="ca">s</Td>

            <Td for="ca">SS</Td>
            <Td for="ca">t</Td>
            <Td for="ca">c</Td>

            <Td for="ca">SC</Td>
            <Td for="ca">k</Td>
            <Td for="ca">ks</Td>

            <Td for="ca">SF</Td>
            <Td for="ca">p</Td>
            <Td for="ca">ps</Td>

            <Td for="ca">DS</Td>
            <Td for="ca">ţ</Td>
            <Td for="ca">ţs</Td>

            <Td for="ca">DC</Td>
            <Td for="ca">f</Td>
            <Td for="ca">fs</Td>

            <Td for="ca">DF</Td>
            <Td for="ca">ç</Td>
            <Td for="ca">š</Td>

            <Td for="ca">FS</Td>
            <Td for="ca">z</Td>
            <Td for="ca">č</Td>

            <Td for="ca">FC</Td>
            <Td for="ca">ž</Td>
            <Td for="ca">kš</Td>

            <Td for="ca">FF</Td>
            <Td for="ca">ẓ</Td>
            <Td for="ca">pš</Td>
          </BlockLight>

          <BlockLight class="subgrid col-span-2 row-span-6">
            <Td for="ca">DEL</Td>
            <Td for="ca" />

            <Td for="ca">PRX</Td>
            <Td for="ca">
              t/d<sub>1</sub>
            </Td>

            <Td for="ca">ICP</Td>
            <Td for="ca">
              k/g<sub>1</sub>
            </Td>

            <Td for="ca">ATV</Td>
            <Td for="ca">
              p/b<sub>1</sub>
            </Td>

            <Td for="ca">GRA</Td>
            <Td for="ca">
              g/gz<sub>1</sub>
            </Td>

            <Td for="ca">DPL</Td>
            <Td for="ca">
              b/bz<sub>1</sub>
            </Td>
          </BlockLight>
        </div>

        <BlockLight class="subgrid col-span-4 row-span-5">
          <Td for="ca"> </Td>
          <Td for="ca">NRM</Td>
          <Td for="ca">RPV</Td>
          <Td for="ca">ref.</Td>

          <Td for="ca">M</Td>
          <Td for="ca">— (l)</Td>
          <Td for="ca">l (tļ)</Td>
          <Td for="ca" />

          <Td for="ca">G</Td>
          <Td for="ca">r</Td>
          <Td for="ca">ř</Td>
          <Td for="ca">ļ / tļ</Td>

          <Td for="ca">N</Td>
          <Td for="ca">w (v)</Td>
          <Td for="ca">
            m/h<sub>2</sub>
          </Td>
          <Td for="ca">ç / x</Td>

          <Td for="ca">A</Td>
          <Td for="ca">y (j)</Td>
          <Td for="ca">
            n/ç<sub>2</sub>
          </Td>
          <Td for="ca">w / y</Td>
        </BlockLight>

        <BlockLight class="subgrid col-span-4 row-span-3">
          <Td for="ca" align="right">
            (...)
          </Td>
          <Td for="ca" align="left" class="col-span-3 pl-2">
            standalone
          </Td>

          <Td for="ca" align="right">
            ...<sub>1</sub>
          </Td>
          <Td for="ca" align="left" class="col-span-3 pl-2">
            when uniplex
          </Td>

          <Td for="ca" align="right">
            ...<sub>2</sub>
          </Td>
          <Td for="ca" align="left" class="col-span-3 pl-2">
            [C]t/k/p-
          </Td>
        </BlockLight>

        <BlockLight class="col-span-4 row-span-2 grid">
          <Td for="ca" class="whitespace-normal text-base/5" align="left">
            Geminate if slots V and VI are present:
          </Td>
        </BlockLight>
      </BlockLight>
    )
  }

  function CaAllomorphs(props: { class?: ClsxItem }) {
    return (
      <BlockLight
        class={clsx(
          props.class,
          "grid grid-cols-[1fr,1fr,1fr,1.5fr] grid-rows-subgrid gap-px",
        )}
      >
        <Td for="ca">pp → mp</Td>
        <Td for="ca">pb → mb</Td>
        <Td for="ca">rr → ns</Td>
        <Td for="ca">[C]gm → [C]x</Td>

        <Td for="ca">tt → nt</Td>
        <Td for="ca">kg → ng</Td>
        <Td for="ca">rř → nš</Td>
        <Td for="ca">[C]gn → [C]ň</Td>

        <Td for="ca">kk → nk</Td>
        <Td for="ca">çy → nd</Td>
        <Td for="ca">řr → ňs</Td>
        <Td for="ca">[C]bm → [C]v</Td>

        <Td for="ca">ll → pļ</Td>
        <Td for="ca">nhn → ňn</Td>
        <Td for="ca">řř → ňš</Td>
        <Td for="ca">[C]çx → [C]xw</Td>

        <div class="col-span-4 row-span-1 grid grid-cols-3 grid-rows-subgrid gap-px">
          <Td for="ca">fbm → vw</Td>
          <Td for="ca">ţbn → ḑy</Td>
          <Td for="ca">[C]bn → [C]ḑ</Td>
        </div>
      </BlockLight>
    )
  }

  function Ref(props: { class?: ClsxItem }) {
    return (
      <Block class={clsx(props.class, "subgrid")}>
        <Td for="ref">ref.</Td>
        <Td for="ref">NEU</Td>
        <Td for="ref">BEN</Td>
        <Td for="ref">DET</Td>

        <For each={ALL_REFERENT_TARGETS}>
          {(target) => (
            <>
              <Td for="ref">{target}</Td>
              <Td for="ref">
                {target == "pi" ?
                  "ẓ"
                : referentToIthkuil(`${target}:NEU`, false)}
              </Td>
              <Td for="ref">{referentToIthkuil(`${target}:BEN`, false)}</Td>
              <Td for="ref">{referentToIthkuil(`${target}:DET`, false)}</Td>
            </>
          )}
        </For>

        <Td for="ref" class="col-span-4 px-1" outline>
          affixes use [lrřmnň]ç
        </Td>
      </Block>
    )
  }

  function CaseAffixes(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(props.class, "grid grid-cols-7 grid-rows-subgrid gap-px")}
      >
        <BlockLight class="subgrid col-span-3 row-span-3">
          <Td for="affix" class="col-span-3">
            case accessor
          </Td>
          <Td for="affix">s-</Td>
          <Td for="affix">z-</Td>
          <Td for="affix">č-</Td>
        </BlockLight>
        <BlockLight class="subgrid col-span-3 row-span-3">
          <Td for="affix" class="col-span-3">
            inverse accessor
          </Td>
          <Td for="affix">š-</Td>
          <Td for="affix">ž-</Td>
          <Td for="affix">j-</Td>
        </BlockLight>
        <BlockLight class="subgrid row-span-3">
          <Td for="affix">stack</Td>
          <Td for="affix">l-</Td>
        </BlockLight>
      </Block>
    )
  }

  function AffixualAdjunctScope(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(props.class, "grid grid-cols-7 grid-rows-subgrid gap-px")}
      >
        <Td for="adjunct">V+</Td>
        <Td for="adjunct">V-</Td>
        <Td for="adjunct">VII+</Td>
        <Td for="adjunct">VII-</Td>
        <Td for="adjunct">word</Td>
        <Td for="adjunct">adj.</Td>
        <Td for="adjunct">
          = C<sub>Z</sub>
        </Td>

        <Td for="adjunct">a</Td>
        <Td for="adjunct">u</Td>
        <Td for="adjunct">e</Td>
        <Td for="adjunct">i</Td>
        <Td for="adjunct">o</Td>
        <Td for="adjunct">ö</Td>
        <Td for="adjunct">ai</Td>

        <Td for="adjunct">h</Td>
        <Td for="adjunct">’h</Td>
        <Td for="adjunct">’hl</Td>
        <Td for="adjunct">’hr</Td>
        <Td for="adjunct">hw</Td>
        <Td for="adjunct">’hw</Td>
      </Block>
    )
  }
}

export function Main() {
  return (
    <>
      <Sheet01Conj />
      <Sheet01Conj landscape />
    </>
  )
}
