import { Fa } from "@/components/Fa"
import { Checkbox } from "@/components/fields/CheckboxGroup"
import { MatchResult } from "@/components/MatchResult"
import { Unmain } from "@/components/Prose"
import { error, ok, type Result } from "@/components/result"
import { sql, SQLite } from "@codemirror/lang-sql"
import { EditorView } from "@codemirror/view"
import {
  faMagnifyingGlassChart,
  faPenToSquare,
  faPlus,
  faRightFromBracket,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import type { SqlValue } from "@sqlite.org/sqlite-wasm"
import {
  createMemo,
  createResource,
  createSignal,
  For,
  Show,
  untrack,
  type JSX,
} from "solid-js"
import { createStore } from "solid-js/store"
import { parse } from "valibot"
import type { Worker } from "../db/worker"
import { Action } from "../el/BottomButtons"
import { DrawStatCard } from "../el/charts"
import { IntegratedCodeField } from "../el/IntegratedField"
import { useLayers, type LayerOutput } from "../el/Layers"
import { InlineLoading } from "../el/Loading"
import { groupData, type Colors, type Data } from "../lib/charts"
import {
  ChartTitleAlign,
  ChartTitleBorder,
  ChartTitleLocation,
  type StatCard,
} from "../lib/types"
import { Query } from "./Query"

const COLORS: Colors = [
  ["hsl(173 58% 39%)", "hsl(220 70% 50%)"],
  ["hsl(12 76% 61%)", "hsl(160 60% 45%)"],
  ["hsl(197 37% 24%)", "hsl(30 80% 55%)"],
  ["hsl(43 74% 66%)", "hsl(280 65% 60%)"],
  ["hsl(27 87% 67%)", "hsl(340 75% 55%)"],
]

export function Stats(worker: Worker, pop: () => void): LayerOutput {
  const layers = useLayers()
  const [stats, setStats] = createSignal(fetch())
  const [editing, setEditing] = createSignal(false)
  let current: StatCard[] | undefined

  return {
    el: (
      <div class="flex flex-1 flex-col gap-4">
        <TopActions />
        <Charts />
      </div>
    ),
    onForcePop: () => true,
    onReturn: () => setStats(fetch()),
  }

  function fetch() {
    return worker.post("stats_get")
  }

  function TopActions() {
    return (
      <div class="mx-auto grid w-full max-w-xl grid-cols-2 gap-1 xs:grid-cols-3">
        <Action
          class="col-span-2 xs:col-span-1"
          center
          icon={faRightFromBracket}
          label="Back"
          onClick={pop}
        />

        <Action
          class="col-span-2 xs:col-span-1"
          center
          icon={faMagnifyingGlassChart}
          label="Query"
          onClick={() => layers.push(Query, worker)}
        />

        <Action
          center
          icon={faPenToSquare}
          label="Rearrange"
          onClick={() => {
            if (editing()) {
              setEditing(false)
              setStats(fetch())
            } else {
              setEditing(true)
            }
          }}
        />
      </div>
    )
  }

  function Error(props: { children: JSX.Element }) {
    return (
      <pre class="flex min-h-full w-full flex-1 flex-col items-center justify-center whitespace-pre-wrap rounded-xl bg-red-100 px-2 py-1 text-sm text-red-800 transition dark:bg-red-900 dark:text-red-200">
        {props.children}
      </pre>
    )
  }

  function Stat(card: StatCard) {
    const data = worker
      .post("user_query_safe", card.query)
      .then((x) => ok(x), error)

    return (
      <InlineLoading data={data}>
        {(data) => (
          <div
            style={{
              "grid-column": "span " + card.style.width,
              "grid-row": "span " + card.style.height,
            }}
          >
            <Show
              when={editing()}
              fallback={untrack(() => StatDisplayed(card, data))}
            >
              <StatEditing card={card} data={data} />
            </Show>
          </div>
        )}
      </InlineLoading>
    )
  }

  function StatEditing(props: {
    card: StatCard
    data: Result<{ columns: string[]; values: SqlValue[][] }[]>
  }) {
    const [card, rawSetCard] = createStore(props.card)

    const setCard = function (this: any) {
      rawSetCard.apply(this, arguments as never)
      save()
    } as typeof rawSetCard

    const [data] = createResource(
      () => card.query,
      (q) => worker.post("user_query_safe", q).then((x) => ok(x), error),
      { initialValue: props.data },
    )

    return (
      <div class="flex flex-col gap-1">
        <div class="flex flex-col rounded-lg bg-z-body-selected pb-2">
          <div class="flex min-h-20 w-full overflow-auto border-b border-z pl-0 pr-1">
            {IntegratedCodeField(
              {
                value: untrack(() => card.query),
                onInput: (q) => setCard("query", q),
              },
              {
                alone: true,
                noBorderTop: true,
                lang: sql({ dialect: SQLite, upperCaseKeywords: true }),
                exts: [EditorView.lineWrapping],
              },
            )}
          </div>

          <div class="grid grid-cols-2 gap-2 px-2 pb-1 pt-1">
            <div class="flex flex-col gap-1">
              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.chart.rounded}
                  onInput={(x) => setCard("chart", "rounded", x)}
                />

                <p>Rounded bars?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.chart.inlineLabels}
                  onInput={(x) => setCard("chart", "inlineLabels", x)}
                />

                <p>Inline labels?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.chart.space}
                  onInput={(x) => setCard("chart", "space", x)}
                />

                <p>Spaced bars?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.chart.persistentValues}
                  onInput={(x) => setCard("chart", "persistentValues", x)}
                />

                <p>Persistent values?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.chart.showTotal}
                  onInput={(x) => setCard("chart", "showTotal", x)}
                />

                <p>Graph total?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.chart.stacked}
                  onInput={(x) => setCard("chart", "stacked", x)}
                />

                <p>Stack bars?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.chart.zeroBaseline}
                  onInput={(x) => setCard("chart", "zeroBaseline", x)}
                />

                <p>Zero baseline?</p>
              </label>
            </div>

            <div class="flex flex-col gap-1">
              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.style.bordered}
                  onInput={(x) => setCard("style", "bordered", x)}
                />

                <p>Draw border?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.style.padded}
                  onInput={(x) => setCard("style", "padded", x)}
                />

                <p>Add padding?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.style.roundCard}
                  onInput={(x) => setCard("style", "roundCard", x)}
                />

                <p>Round card?</p>
              </label>

              <label class="flex w-full gap-2">
                <Checkbox
                  checked={card.style.layered}
                  onInput={(x) => setCard("style", "layered", x)}
                />

                <p>Grey background?</p>
              </label>
            </div>
          </div>

          <div class="mt-2 flex flex-col gap-1 px-2">
            <label class="flex w-full items-baseline gap-2">
              <p class="flex-1 text-right text-sm text-z-subtitle">
                Card title:
              </p>

              <input
                class="z-field flex-[3] rounded border-transparent bg-z-body px-1 py-0 shadow-none"
                value={card.title}
                onInput={(x) => setCard("title", x.currentTarget.value)}
              />
            </label>

            <label class="flex w-full items-baseline gap-2">
              <p class="flex-1 text-right text-sm text-z-subtitle">
                Title position:
              </p>

              <select
                class="z-field flex-[3] rounded border-transparent bg-z-body px-1 py-0.5 shadow-none"
                value={card.style.titleLocation}
                onInput={(x) => {
                  setCard(
                    "style",
                    "titleLocation",
                    parse(ChartTitleLocation, x.currentTarget.value),
                  )
                }}
              >
                <option value="hidden">Hidden</option>
                <option value="floating">Floating</option>
                <option value="floating-anchored">Floating at top</option>
                <option value="inline">Above chart</option>
                <option value="inline-big">Above chart, but big</option>
              </select>
            </label>

            <label class="flex w-full items-baseline gap-2">
              <p class="flex-1 text-right text-sm text-z-subtitle">
                Title border:
              </p>

              <select
                class="z-field flex-[3] rounded border-transparent bg-z-body px-1 py-0.5 shadow-none"
                value={card.style.titleBorder}
                onInput={(x) => {
                  setCard(
                    "style",
                    "titleBorder",
                    parse(ChartTitleBorder, x.currentTarget.value),
                  )
                }}
              >
                <option value="normal">Normal</option>
                <option value="none">Hidden</option>
              </select>
            </label>

            <label class="flex w-full items-baseline gap-2">
              <p class="flex-1 text-right text-sm text-z-subtitle">
                Title align:
              </p>

              <select
                class="z-field flex-[3] rounded border-transparent bg-z-body px-1 py-0.5 shadow-none"
                value={card.style.titleAlign}
                onInput={(x) => {
                  setCard(
                    "style",
                    "titleAlign",
                    parse(ChartTitleAlign, x.currentTarget.value),
                  )
                }}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </label>

            <label class="flex w-full items-baseline gap-2">
              <p class="flex-1 text-right text-sm text-z-subtitle">
                Chunk size:
              </p>

              <input
                class="z-field flex-[3] rounded border-transparent bg-z-body px-1 py-0 shadow-none"
                type="number"
                value={card.chart.chunkSize?.toString()}
                onInput={(x) => {
                  const v = +x.currentTarget.valueAsNumber
                  if (Number.isFinite(v) && v > 0) {
                    setCard("chart", "chunkSize", v)
                  } else {
                    setCard("chart", "chunkSize", null)
                  }
                }}
              />
            </label>

            <label class="flex w-full items-baseline gap-2">
              <p class="flex-1 text-right text-sm text-z-subtitle">
                Digits shown:
              </p>

              <input
                class="z-field flex-[3] rounded border-transparent bg-z-body px-1 py-0 shadow-none"
                type="number"
                value={card.chart.decimalPlaces?.toString()}
                onInput={(x) => {
                  const v = +x.currentTarget.valueAsNumber
                  if (Number.isSafeInteger(v) && v > 0) {
                    setCard("chart", "decimalPlaces", v)
                  } else {
                    setCard("chart", "decimalPlaces", 0)
                  }
                }}
              />
            </label>

            <label class="flex w-full items-baseline gap-2">
              <p class="flex-1 text-right text-sm text-z-subtitle">
                Labels each:
              </p>

              <input
                class="z-field flex-[3] rounded border-transparent bg-z-body px-1 py-0 shadow-none"
                type="number"
                value={card.chart.labelsEach?.toString()}
                onInput={(x) => {
                  const v = +x.currentTarget.valueAsNumber
                  if (Number.isSafeInteger(v) && v > 1) {
                    setCard("chart", "labelsEach", v)
                  } else {
                    setCard("chart", "labelsEach", 1)
                  }
                }}
              />
            </label>
          </div>
        </div>

        {StatDisplayed(card, data(), () => card.chart.chunkSize)}
      </div>
    )
  }

  function StatDisplayed(
    card: StatCard,
    data: Result<{ columns: string[]; values: SqlValue[][] }[]>,
    chunkSize = () => card.chart.chunkSize,
  ) {
    return (
      <MatchResult fallback={(err) => <Error>{err()}</Error>} result={data}>
        {(result) => {
          const row = result().at(-1)
          if (row == null) {
            return <Error>The query returned no tables.</Error>
          }

          try {
            const raw = row.values.map<Data[number]>(([label, ...values]) => {
              if (!(typeof label == "string" || typeof label == "number")) {
                throw new TypeError(
                  "Chart labels must be strings or small numbers.",
                )
              }

              if (values.every((x) => typeof x == "number")) {
                return [label, values]
              } else {
                throw new TypeError("Chart values must be numbers.")
              }
            })

            const data = createMemo(() => {
              const cs = chunkSize()
              if (cs) {
                return groupData(raw, cs)
              } else {
                return raw
              }
            })

            function Inner() {
              return DrawStatCard(card, data(), COLORS)
            }

            return <Inner />
          } catch (e) {
            return <Error>{error(e).reason}</Error>
          }
        }}
      </MatchResult>
    )
  }

  function save() {
    if (!current) {
      return
    }

    worker.post("stats_set", current)
  }

  function Charts() {
    return (
      <InlineLoading
        data={stats()}
        fallback={
          <div class="flex w-full flex-1 flex-col items-center justify-center gap-8 rounded-lg bg-z-body-selected">
            <Fa
              class="size-8 animate-[faspinner_1s_linear_infinite]"
              icon={faSpinner}
              title={false}
            />
          </div>
        }
      >
        {(stats) => {
          current = stats
          return (
            <Unmain>
              <div class="flex px-6">
                <div class="mx-auto grid w-full max-w-[80rem] grid-cols-[repeat(auto-fill,minmax(min(24rem,100%),1fr))] gap-4">
                  <For each={stats}>{Stat}</For>
                  <Show when={editing}>
                    <button
                      class="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-z"
                      onClick={async () => {
                        await worker.post(
                          "stats_add",
                          "New card",
                          "SELECT 1, 2",
                        )
                        setStats(fetch())
                      }}
                    >
                      <Fa class="size-8" icon={faPlus} title="New Card" />
                      <p class="text-sm text-z-subtitle">New Card</p>
                    </button>
                  </Show>
                </div>
              </div>
            </Unmain>
          )
        }}
      </InlineLoading>
    )
  }
}
