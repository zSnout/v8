import { Fa } from "@/components/Fa"
import { Checkbox } from "@/components/fields/CheckboxGroup"
import { MatchResult } from "@/components/MatchResult"
import { confirm, ModalDescription } from "@/components/Modal"
import { Unmain } from "@/components/Prose"
import { error, ok, type Result } from "@/components/result"
import { json as jsonLang } from "@codemirror/lang-json"
import { sql, SQLite } from "@codemirror/lang-sql"
import { EditorView } from "@codemirror/view"
import { faFaceMehBlank } from "@fortawesome/free-regular-svg-icons"
import {
  faMagnifyingGlassChart,
  faPenToSquare,
  faPlus,
  faRightFromBracket,
  faSpinner,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import {
  createResource,
  createSignal,
  For,
  getOwner,
  Show,
  untrack,
  type JSX,
} from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import { parse } from "valibot"
import type { Worker } from "../db"
import { Action } from "../el/BottomButtons"
import { DrawStatCard } from "../el/Charts"
import { ContextMenuItem } from "../el/ContextMenu"
import { defineLayer } from "../el/DefineLayer"
import { IntegratedCodeField } from "../el/IntegratedField"
import { useLayers } from "../el/Layers"
import { InlineLoading } from "../el/Loading"
import {
  ChartCard,
  ChartTitleAlign,
  ChartTitleBorder,
  ChartTitleLocation,
  type ChartColors,
  type ChartComputedInfo,
} from "../lib/types"
import { LAYER_QUERY } from "./Query"

const COLORS: ChartColors = [
  ["hsl(173 58% 39%)", "hsl(220 70% 50%)"],
  ["hsl(12 76% 61%)", "hsl(160 60% 45%)"],
  ["hsl(197 37% 24%)", "hsl(30 80% 55%)"],
  ["hsl(43 74% 66%)", "hsl(280 65% 60%)"],
  ["hsl(27 87% 67%)", "hsl(340 75% 55%)"],
]

export const LAYER_STATS = defineLayer({
  init(_: Worker) {},
  load() {},
  render({ onReturn, props: worker, pop }) {
    onReturn(() => {
      setCharts(fetch())
      return "preserve-data"
    })

    const layers = useLayers()
    const [charts, setCharts] = createSignal(fetch())
    const [editing, setEditing] = createSignal(false)
    const [json, setJson] = createSignal(true)
    const owner = getOwner()
    let current: ChartCard[] | undefined

    return (
      <div class="flex min-h-full flex-1 flex-col gap-4">
        <TopActions />
        <Charts />
      </div>
    )

    function fetch() {
      return worker.post("charts_get")
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
            onClick={() => layers.push(LAYER_QUERY, { worker })}
          />

          <Action
            center
            icon={faPenToSquare}
            label="Rearrange"
            onClick={() => {
              if (editing()) {
                setEditing(false)
                setCharts(fetch())
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

    function Stat(card: ChartCard) {
      const data = worker.post("chart_compute", card).then((x) => ok(x), error)

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
      card: ChartCard
      data: Result<ChartComputedInfo | null>
    }) {
      const [card, rawSetCard] = createStore(props.card)

      const setCard = function (this: any) {
        rawSetCard.apply(this, arguments as never)
        save()
      } as typeof rawSetCard

      const [data] = createResource(
        () => (
          card.query,
          card.chart.mainAxis.min,
          card.chart.mainAxis.max,
          card.chart.mainAxis.groupSize,
          card.chart.mainAxis.groupSizeIsPercentage,
          card.chart.crossAxis.min,
          card.chart.crossAxis.max,
          card.options,
          Math.random() // random value so solid doesn't cache us
        ),
        () =>
          worker.post("chart_compute", unwrap(card)).then((x) => ok(x), error),
        { initialValue: props.data },
      )

      return (
        <div class="flex flex-col gap-1">
          <div class="relative flex transform flex-col rounded-lg bg-z-body-selected pb-2">
            <Show when={json()} fallback={<NormalEditView />}>
              <JsonEditView />
            </Show>
          </div>

          {StatDisplayed({ ...card }, data())}
        </div>
      )

      function DeleteButton() {
        return (
          <button
            class="fixed right-1 top-1 size-6 rounded bg-red-500 p-1"
            onClick={async () => {
              if (
                !(await confirm({
                  owner,
                  title: "Are you sure?",
                  get description() {
                    return (
                      <>
                        <ModalDescription>
                          This will delete the statistic{" "}
                          <strong class="text-z underline">{card.title}</strong>{" "}
                          from your statistics page. You can always add it back
                          later, but it might take a while to set up the correct
                          configuration. For reference, its query is this:
                        </ModalDescription>

                        <pre class="mt-2 whitespace-pre-wrap rounded-md bg-z-body-selected px-2 py-1 text-sm text-z">
                          {card.query}
                        </pre>
                      </>
                    )
                  },
                  cancelText: "No, cancel",
                  okText: "Yes, delete",
                }))
              ) {
                return
              }
              current?.splice(current.indexOf(props.card, 1))
              save()
              setCharts(fetch())
            }}
          >
            <Fa class="size-4 icon-white" icon={faTrash} title="Delete Card" />
          </button>
        )
      }

      function JsonEditView() {
        return (
          <>
            <div class="-mb-2 flex max-h-72 min-h-48 w-full overflow-auto pl-0 pr-8">
              {IntegratedCodeField(
                {
                  value: untrack(() => JSON.stringify(card, undefined, 2)),
                  onInput: (q) => {
                    try {
                      setCard(parse(ChartCard, JSON.parse(q)))
                    } catch {}
                  },
                },
                {
                  alone: true,
                  noBorderTop: true,
                  lang: jsonLang(),
                  exts: [EditorView.lineWrapping],
                },
              )}
            </div>

            <DeleteButton />
          </>
        )
      }

      function NormalEditView() {
        return (
          <>
            <div class="flex min-h-20 w-full overflow-auto border-b border-z pl-0 pr-8">
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

            <DeleteButton />

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
                    checked={card.chart.space}
                    onInput={(x) => setCard("chart", "space", x)}
                  />

                  <p>Spaced bars?</p>
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

              <Field
                name="Label group size:"
                get={() => card.chart.mainAxis.groupSize}
                set={(x) => setCard("chart", "mainAxis", "groupSize", x)}
              />
            </div>
          </>
        )
      }

      function float(
        set: (x: number) => void,
        minValue: number,
        defaultValue = 0,
      ) {
        return (value: string) => {
          const v = +value
          if (Number.isFinite(v) && v >= minValue) {
            set(v)
          } else {
            set(defaultValue)
          }
        }
      }

      function int(
        set: (x: number) => void,
        minValue: number,
        defaultValue = 0,
      ) {
        return (value: string) => {
          const v = +value
          if (Number.isSafeInteger(v) && v >= minValue) {
            set(v)
          } else {
            set(defaultValue)
          }
        }
      }

      function Field(props: {
        name: string
        get: () => string | number | null | undefined
        set: (x: string) => void
        numeric?: boolean
      }) {
        return (
          <label class="flex w-full items-baseline gap-2">
            <p class="flex-1 text-right text-sm text-z-subtitle">
              {props.name}
            </p>

            <input
              class="z-field flex-[3] rounded border-transparent bg-z-body px-1 py-0 shadow-none"
              type={props.numeric ? "number" : "text"}
              value={props.get()?.toString() ?? ""}
              onInput={(x) => props.set(x.currentTarget.value)}
            />
          </label>
        )
      }
    }

    function StatDisplayed(
      card: ChartCard,
      data: Result<ChartComputedInfo | null>,
    ) {
      return (
        <MatchResult
          fallback={(err) => <Error>{err()}</Error>}
          result={data.ok ? ok({ v: data.value }) : data}
        >
          {(result) => (
            <div
              class="contents"
              onCtx={({ detail }) =>
                detail(() => (
                  <ContextMenuItem
                    onClick={() =>
                      layers.push(LAYER_QUERY, { worker, initial: card.query })
                    }
                  >
                    Preview in Query
                  </ContextMenuItem>
                ))
              }
            >
              {DrawStatCard(card, result().v, COLORS)}
            </div>
          )}
        </MatchResult>
      )
    }

    function save() {
      if (!current) {
        return
      }

      worker.post("charts_set", current)
    }

    async function create() {
      await worker.post(
        "charts_add",
        "# of cards by number of reviews",
        "SELECT reps, COUNT() from cards GROUP BY reps",
      )
      setCharts(fetch())
    }

    function Charts() {
      return (
        <InlineLoading
          data={charts()}
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
          {(charts) => {
            current = charts
            return (
              <Show
                when={charts.length > 0 || editing()}
                fallback={
                  <div class="flex w-full flex-1 flex-col items-center justify-center gap-4 rounded-lg">
                    <Fa class="size-12" icon={faFaceMehBlank} title={false} />
                    <p class="text-center">
                      It's looking a bit empty here.
                      <br />
                      Want to{" "}
                      <button
                        class="whitespace-normal text-z-link underline underline-offset-2"
                        onClick={create}
                      >
                        add a statistic?
                      </button>
                    </p>
                  </div>
                }
              >
                <Unmain>
                  <div class="flex px-6">
                    <div class="mx-auto grid w-full max-w-[100rem] grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                      <For each={charts}>{Stat}</For>
                      <Show when={editing()}>
                        <button
                          class="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-z"
                          onClick={create}
                        >
                          <Fa class="size-8" icon={faPlus} title="New Card" />
                          <p class="text-sm text-z-subtitle">New Card</p>
                        </button>
                      </Show>
                    </div>
                  </div>
                </Unmain>
              </Show>
            )
          }}
        </InlineLoading>
      )
    }
  },
})
