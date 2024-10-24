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
import { For, Show, type JSX } from "solid-js"

export function Main() {
  return (
    <div class="flex h-[11in] w-[8.5in] whitespace-nowrap rounded bg-white px-8 py-4 text-center font-[Carlito,ui-sans-serif,system-ui,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Noto_Color_Emoji'] text-black outline outline-purple-500">
      <div class="grid flex-1 grid-cols-[repeat(20,1fr)] grid-rows-[repeat(4,4fr),repeat(18,3fr),repeat(24,4fr)] gap-px outline outline-1 outline-black">
        <VowelForms class="col-[span_20] row-[span_23]" />
        <Ca class="col-span-8 row-span-10" />
        <CaAllomorphs class="col-span-8 row-span-5" />
        <Vh class="col-span-4 row-span-7" />
        <CaseAffixes class="col-span-8 row-span-2" />
        <AffixualAdjunctScope class="col-span-8 row-span-3" />
        <Ref class="col-span-4 row-[span_13]" />
        <CaGemRules class="col-span-8 row-span-11" />
        <ComboRef class="col-span-2 row-span-4" />
        <CarrierAdj class="col-span-2 row-span-4" />
        <VhScope class="col-span-2 row-span-4" />
        <ParsingAdjunct class="col-span-2 row-span-4" />
        <SuppletiveRefs class="col-span-8 row-span-1" />
        <CaGemPairs class="col-span-8 row-span-6" />
        <ComboThm class="col-span-4 row-span-1" />
        <Credits class="col-[span_16] row-span-2" />
        <SentenceJuncture class="col-span-4 row-span-2" />
      </div>
    </div>
  )

  function Credits(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-2 grid-rows-2 gap-x-4 py-1"]}>
        <Td align="right">new ithkuil cheat sheet</Td>
        <Td align="left">compiled by sakawi</Td>
        <Td align="right">updated to morphology v1.3.2</Td>
        <Td align="left">october 23, 2024</Td>
      </Block>
    )
  }

  function SuppletiveRefs(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-1 grid-rows-1"]}>
        <Td>suppletive refs. prefix a- in combo, else üo-</Td>
      </Block>
    )
  }

  function ComboThm(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-1 grid-rows-1"]}>
        <Td>THM is -üa in combos</Td>
      </Block>
    )
  }

  function CaGemRules(props: { class?: ClsxItem }) {
    return (
      <BlockLight
        class={clsx(props.class, "grid grid-cols-1 grid-rows-1 items-center")}
      >
        <ol class="list-decimal whitespace-normal pl-6 text-left text-base/5 marker:font-bold">
          <li>Geminate single consonants.</li>
          <li>tļ → ttļ.</li>
          <li>
            If the C<sub>A</sub> starts with a stop followed by a
            liquid/approximant, geminate the stop.
          </li>
          <li>If there is a sibilant, geminate it.</li>
          <li>
            If a non-sibilant fricative/nasal is the first letter, geminate it.
          </li>
          <li>
            If the C<sub>A</sub> starts with t/k/p and a fricative, geminate the
            fricative.
          </li>
          <li>
            If the C<sub>A</sub> ends in a combination to the right, substitute
            it.
          </li>
          <li>
            If the C<sub>A</sub> begins with l/r/ř, geminate the rest. If it's
            invalid, geminate the l/r/ř.
          </li>
        </ol>
      </BlockLight>
    )
  }

  function CaGemPairs(props: { class?: ClsxItem }) {
    return (
      <BlockLight
        class={[props.class, "grid grid-cols-3 grid-rows-subgrid gap-px"]}
      >
        <Td>pt → bbḑ</Td>
        <Td>kt → ggḑ</Td>
        <Td>tk → ḑvv</Td>
        <Td>pk → bbv</Td>
        <Td>kp → ggv</Td>
        <Td>tp → ddv</Td>

        <Td>pm → vvm</Td>
        <Td>km → xxm</Td>
        <Td>tm → ḑḑm</Td>
        <Td>pn → vvn</Td>
        <Td>kn → xxn</Td>
        <Td>tn → ḑḑn</Td>

        <Td>bm → mmw</Td>
        <Td>gm → ňňw</Td>
        <Td>dm → nnw</Td>
        <Td>bn → mml</Td>
        <Td>gn → ňňl</Td>
        <Td>dn → nnl</Td>
      </BlockLight>
    )
  }

  function ComboRef(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
        <Td class="pl-2">BSC</Td>
        <Td>x</Td>
        <Td class="pl-2">CTE</Td>
        <Td>xt</Td>
        <Td class="pl-2">CSV</Td>
        <Td>xp</Td>
        <Td class="pl-2">OBJ</Td>
        <Td>xx</Td>
      </Block>
    )
  }

  function CarrierAdj(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
        <Td class="pl-2">CAR</Td>
        <Td>hl</Td>
        <Td class="pl-2">QUO</Td>
        <Td>hm</Td>
        <Td class="pl-2">NAM</Td>
        <Td>hn</Td>
        <Td class="pl-2">PHR</Td>
        <Td>hň</Td>
      </Block>
    )
  }

  function VhScope(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
        <Td class="pl-2">form.</Td>
        <Td>a</Td>
        <Td class="pl-2">MCS</Td>
        <Td>e</Td>
        <Td class="pl-2">&lt;adj</Td>
        <Td>i/u</Td>
        <Td class="pl-2">&gt;adj</Td>
        <Td>o</Td>
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
        <Td align="right">mono.</Td>
        <Td class="pl-2.5 pr-3">a’</Td>
        <Td align="right">ultim.</Td>
        <Td class="pl-2.5 pr-3">e’</Td>
        <Td align="right">penult.</Td>
        <Td class="pl-2.5 pr-3">o’</Td>
        <Td align="right">antep.</Td>
        <Td class="pl-2.5 pr-3">u’</Td>
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
        <Td class="pl-1">w → çw</Td>
        <Td>[C] → çë[C]</Td>
        <Td class="pl-1">y → çç</Td>
        <Td>[V] → ç[V]</Td>
      </Block>
    )
  }

  function Vh(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
        <BlockLight class="col-span-4 grid grid-cols-subgrid grid-rows-subgrid">
          <Td class="col-span-2">
            C<sub>N</sub>
          </Td>
          <Td class="col-span-2">
            V<sub>H</sub>
          </Td>
        </BlockLight>

        <Td>FAC</Td>
        <Td>CCN</Td>
        <Td class="font-bold">(h)</Td>
        <Td class="font-bold">w/y</Td>

        <Td>SUB</Td>
        <Td>CCA</Td>
        <Td class="font-bold">hl</Td>
        <Td class="font-bold">hw</Td>

        <Td>ASM</Td>
        <Td>CCS</Td>
        <Td class="font-bold">hr</Td>
        <Td class="font-bold">hrw</Td>

        <Td>SPC</Td>
        <Td>CCQ</Td>
        <Td class="font-bold">hm</Td>
        <Td class="font-bold">hmw</Td>

        <Td>COU</Td>
        <Td>CCP</Td>
        <Td class="font-bold">hn</Td>
        <Td class="font-bold">hnw</Td>

        <Td>HYP</Td>
        <Td>CCV</Td>
        <Td class="font-bold">hň</Td>
        <Td class="font-bold">hňw</Td>
      </Block>
    )
  }

  function Block(props: { class?: ClsxItem; children?: JSX.Element }) {
    return (
      <div
        class={clsx(
          props.class,
          "relative z-10 outline outline-1 outline-black",
        )}
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
    class?: ClsxItem
    children?: JSX.Element
    outline?: boolean
    align?: "left" | "right"
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

  function VowelForms(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-subgrid grid-rows-subgrid"]}>
        <FormativeS1 class="col-span-5 row-span-4" />
        <VXHeader class="col-[span_15] row-span-4" />
        <VXSidebar class="col-[span_5] row-[span_18]" />
        <VXBody class="col-[span_15] row-[span_18]" />
        <VXFooter class="col-[span_20]" />
      </Block>
    )
  }

  function FormativeS1(props: { class?: ClsxItem }) {
    return (
      <Block class={[props.class, "grid grid-cols-4 grid-rows-subgrid gap-px"]}>
        <Td outline>
          C<sub>C</sub>
        </Td>
        <Td outline />
        <Td outline>W</Td>
        <Td outline>Y</Td>

        <Td outline />
        <Td outline>’</Td>
        <Td outline>w</Td>
        <Td outline>y</Td>

        <Td outline>T1</Td>
        <Td outline>h</Td>
        <Td outline>hl</Td>
        <Td outline>hm</Td>

        <Td outline>T2</Td>
        <Td outline>hw</Td>
        <Td outline>hr</Td>
        <Td outline>hn</Td>
      </Block>
    )
  }

  function VXHeader(props: { class?: ClsxItem }) {
    return (
      <div
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
        <Td outline class="col-span-4">
          affixual STA.PRC
        </Td>
        <Td outline class="col-span-4">
          affixual STA.CPT
        </Td>
        <Td outline class="col-span-4">
          affixual DYN.PRC
        </Td>
        <Td outline class="col-span-3">
          affixual DYN.CPT
        </Td>

        <Td outline class="col-span-4">
          [default] / PRX
        </Td>
        <Td outline class="col-span-4">
          G / RPV
        </Td>
        <Td outline class="col-span-4">
          N / A
        </Td>
        <Td outline class="col-span-3">
          G.RPV / PRX.RPV
        </Td>

        <Td outline>EXS</Td>
        <Td outline>T1</Td>
        <Td outline class="col-span-2" />

        <Td outline>FNC</Td>
        <Td outline>T2</Td>
        <Td outline class="col-span-2">
          NEG/4
        </Td>

        <Td outline>RPS</Td>
        <Td outline>T3</Td>
        <Td outline class="col-span-2">
          DCD/4
        </Td>

        <Td outline>AMG</Td>
        <Td outline class="col-span-2">
          DCD/5
        </Td>

        <Td outline>
          V<sub>N</sub>
        </Td>
        <Td outline>
          V<sub>C</sub>
        </Td>
        <Td outline>
          V<sub>K</sub>
        </Td>
        <Td outline>V</Td>

        <Td outline>
          V<sub>N</sub>
        </Td>
        <Td outline>
          V<sub>C</sub>
        </Td>
        <Td outline>
          V<sub>K</sub>
        </Td>
        <Td outline>V</Td>

        <Td outline>
          V<sub>N</sub>
        </Td>
        <Td outline>
          V<sub>C</sub>
        </Td>
        <Td outline class="col-span-2">
          V
        </Td>

        <Td outline>
          V<sub>N</sub>
        </Td>
        <Td outline>
          V<sub>C</sub>
        </Td>
        <Td outline>V</Td>
      </div>
    )
  }

  function VXSidebar(props: { class?: ClsxItem }) {
    return (
      <div
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-9 gap-px")}
      >
        <Td outline class="row-span-2">
          S1
        </Td>
        <Td outline>PRC</Td>
        <Td outline class="row-span-4">
          STA
        </Td>
        <Td outline>BSC</Td>
        <Td outline>D1</Td>

        <Td outline>CPT</Td>
        <Td outline>CTE</Td>
        <Td outline>D2</Td>

        <Td outline class="row-span-2">
          S2
        </Td>
        <Td outline>PRC</Td>
        <Td outline>CSV</Td>
        <Td outline>D3</Td>

        <Td outline>CPT</Td>
        <Td outline>OBJ</Td>
        <Td outline>D4</Td>

        <Td outline class="col-span-4">
          affixual V<sub>V</sub>
        </Td>
        <Td outline>D5</Td>

        <Td outline class="row-span-2">
          S0
        </Td>
        <Td outline>CPT</Td>
        <Td outline class="row-span-4">
          DYN
        </Td>
        <Td outline>OBJ</Td>
        <Td outline>D6</Td>

        <Td outline>PRC</Td>
        <Td outline>CSV</Td>
        <Td outline>D7</Td>

        <Td outline class="row-span-2">
          S3
        </Td>
        <Td outline>CPT</Td>
        <Td outline>CTE</Td>
        <Td outline>D8</Td>

        <Td outline>PRC</Td>
        <Td outline>BSC</Td>
        <Td outline>D9</Td>
      </div>
    )
  }

  function VXBody(props: { class?: ClsxItem }) {
    return (
      <div
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
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
      <div
        class={clsx(
          props.class,
          "grid grid-cols-subgrid grid-rows-subgrid outline outline-1 outline-z",
        )}
      >
        <Td>
          {props.vn1.endsWith(":BEN") ?
            props.vn1.slice(0, -4) + "+"
          : props.vn1.endsWith(":DET") ?
            props.vn1.slice(0, -4) + "-"
          : props.vn1}
        </Td>
        <Td>{props.vc1}</Td>
        <Show when={props.vk !== undefined}>
          <Td class="row-span-2">{props.vk}</Td>
        </Show>
        <Td
          class={[props.vWide && "col-span-2", "row-span-2 text-2xl font-bold"]}
        >
          {props.v[0] == "(" ? props.v.slice(1, -1) : props.v}
        </Td>
        <Td>{props.vn2}</Td>
        <Td>{props.vc2}</Td>
      </div>
    )
  }

  function VXFooter(props: { class?: ClsxItem }) {
    return (
      <div
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
        <Td outline class="col-span-4">
          referential V<sub>V</sub>
        </Td>
        <Td outline>D0</Td>

        <Td outline class="col-span-3">
          PRC referent
        </Td>
        <Td outline class="font-bold">
          ae
        </Td>

        <Td outline class="col-span-3">
          CPT referent
        </Td>
        <Td outline class="font-bold">
          ea
        </Td>

        <Td outline class="col-span-3" />
        <Td outline class="font-bold">
          üo
        </Td>

        <Td outline class="col-span-2">
          C<sub>A</sub> stacking
        </Td>
        <Td outline class="font-bold">
          üö
        </Td>
      </div>
    )
  }

  function Ca(props: { class?: ClsxItem }) {
    return (
      <BlockLight
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
        <div class="col-span-4 row-span-10 grid grid-cols-subgrid grid-rows-subgrid">
          <BlockLight class="col-span-2 row-span-4 grid grid-cols-subgrid grid-rows-subgrid">
            <Td>CSL</Td>
            <Td />
            <Td>ASO</Td>
            <Td>l (nļ)</Td>
            <Td>COA</Td>
            <Td>r (rļ)</Td>
            <Td>VAR</Td>
            <Td>ř (ň)</Td>
          </BlockLight>

          <BlockLight class="col-span-2 row-span-10 grid grid-cols-3 grid-rows-subgrid gap-px">
            <Td> </Td>
            <Td />
            <Td>s</Td>

            <Td>SS</Td>
            <Td>t</Td>
            <Td>c</Td>

            <Td>SC</Td>
            <Td>k</Td>
            <Td>ks</Td>

            <Td>SF</Td>
            <Td>p</Td>
            <Td>ps</Td>

            <Td>DS</Td>
            <Td>ţ</Td>
            <Td>ţs</Td>

            <Td>DC</Td>
            <Td>f</Td>
            <Td>fs</Td>

            <Td>DF</Td>
            <Td>ç</Td>
            <Td>š</Td>

            <Td>FS</Td>
            <Td>z</Td>
            <Td>č</Td>

            <Td>FC</Td>
            <Td>ž</Td>
            <Td>kš</Td>

            <Td>FF</Td>
            <Td>ẓ</Td>
            <Td>pš</Td>
          </BlockLight>

          <BlockLight class="col-span-2 row-span-6 grid grid-cols-subgrid grid-rows-subgrid">
            <Td>DEL</Td>
            <Td />

            <Td>PRX</Td>
            <Td>
              t/d<sub>1</sub>
            </Td>

            <Td>ICP</Td>
            <Td>
              k/g<sub>1</sub>
            </Td>

            <Td>ATV</Td>
            <Td>
              p/b<sub>1</sub>
            </Td>

            <Td>GRA</Td>
            <Td>
              g/gz<sub>1</sub>
            </Td>

            <Td>DPL</Td>
            <Td>
              b/bz<sub>1</sub>
            </Td>
          </BlockLight>
        </div>

        <BlockLight class="col-span-4 row-span-5 grid grid-cols-subgrid grid-rows-subgrid">
          <Td> </Td>
          <Td>NRM</Td>
          <Td>RPV</Td>
          <Td>ref.</Td>

          <Td>M</Td>
          <Td>— (l)</Td>
          <Td>l (tļ)</Td>
          <Td />

          <Td>G</Td>
          <Td>r</Td>
          <Td>ř</Td>
          <Td>ļ / tļ</Td>

          <Td>N</Td>
          <Td>w (v)</Td>
          <Td>
            m/h<sub>2</sub>
          </Td>
          <Td>ç / x</Td>

          <Td>A</Td>
          <Td>y (j)</Td>
          <Td>
            n/ç<sub>2</sub>
          </Td>
          <Td>w / y</Td>
        </BlockLight>

        <BlockLight class="col-span-4 row-span-3 grid grid-cols-subgrid grid-rows-subgrid">
          <Td align="right">(...)</Td>
          <Td align="left" class="col-span-3 pl-2">
            standalone
          </Td>

          <Td align="right">
            ...<sub>1</sub>
          </Td>
          <Td align="left" class="col-span-3 pl-2">
            when uniplex
          </Td>

          <Td align="right">
            ...<sub>2</sub>
          </Td>
          <Td align="left" class="col-span-3 pl-2">
            [C]t/k/p-
          </Td>
        </BlockLight>

        <BlockLight class="col-span-4 row-span-2 grid">
          <Td class="whitespace-normal text-base/5" align="left">
            Geminate when slots V and VI are present:
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
        <Td>pp → mp</Td>
        <Td>pb → mb</Td>
        <Td>rr → ns</Td>
        <Td>[C]gm → [C]x</Td>

        <Td>tt → nt</Td>
        <Td>kg → ng</Td>
        <Td>rř → nš</Td>
        <Td>[C]gn → [C]ň</Td>

        <Td>kk → nk</Td>
        <Td>çy → nd</Td>
        <Td>řr → ňs</Td>
        <Td>[C]bm → [C]v</Td>

        <Td>ll → pļ</Td>
        <Td>nhn → ňn</Td>
        <Td>řř → ňš</Td>
        <Td>[C]çx → [C]xw</Td>

        <div class="col-span-4 row-span-1 grid grid-cols-3 grid-rows-subgrid gap-px">
          <Td>fbm → vw</Td>
          <Td>ţbn → ḑy</Td>
          <Td>[C]bn → [C]ḑ</Td>
        </div>
      </BlockLight>
    )
  }

  function Ref(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(props.class, "grid grid-cols-subgrid grid-rows-subgrid")}
      >
        <Td>ref.</Td>
        <Td>NEU</Td>
        <Td>BEN</Td>
        <Td>DET</Td>

        <For each={ALL_REFERENT_TARGETS}>
          {(target) => (
            <>
              <Td>{target}</Td>
              <Td>
                {target == "pi" ?
                  "ẓ"
                : referentToIthkuil(`${target}:NEU`, false)}
              </Td>
              <Td>{referentToIthkuil(`${target}:BEN`, false)}</Td>
              <Td>{referentToIthkuil(`${target}:DET`, false)}</Td>
            </>
          )}
        </For>

        <Td class="col-span-4 px-1" outline>
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
        <BlockLight class="col-span-3 row-span-3 grid grid-cols-subgrid grid-rows-subgrid">
          <Td class="col-span-3">case accessor</Td>
          <Td>s-</Td>
          <Td>z-</Td>
          <Td>č-</Td>
        </BlockLight>
        <BlockLight class="col-span-3 row-span-3 grid grid-cols-subgrid grid-rows-subgrid">
          <Td class="col-span-3">inverse accessor</Td>
          <Td>š-</Td>
          <Td>ž-</Td>
          <Td>j-</Td>
        </BlockLight>
        <BlockLight class="row-span-3 grid grid-cols-subgrid grid-rows-subgrid">
          <Td>stack</Td>
          <Td>l-</Td>
        </BlockLight>
      </Block>
    )
  }

  function AffixualAdjunctScope(props: { class?: ClsxItem }) {
    return (
      <Block
        class={clsx(props.class, "grid grid-cols-7 grid-rows-subgrid gap-px")}
      >
        <Td>V+</Td>
        <Td>V-</Td>
        <Td>VII+</Td>
        <Td>VII-</Td>
        <Td>word</Td>
        <Td>adj.</Td>
        <Td>
          = C<sub>Z</sub>
        </Td>

        <Td>a</Td>
        <Td>u</Td>
        <Td>e</Td>
        <Td>i</Td>
        <Td>o</Td>
        <Td>ö</Td>
        <Td>ai</Td>

        <Td>h</Td>
        <Td>’h</Td>
        <Td>’hl</Td>
        <Td>’hr</Td>
        <Td>hw</Td>
        <Td>’hw</Td>
      </Block>
    )
  }
}
