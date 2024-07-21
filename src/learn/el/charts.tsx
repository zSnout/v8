import { isDark } from "@/stores/theme"
import { For, Show } from "solid-js"
import type { Colors, Data } from "../lib/charts"
import type { ChartBar, ChartStyle, StatCard } from "../lib/types"

// The v-axis is the value-axis, and the l-axis is the label-axis.

function display(value: number, places: number) {
  return places ? value.toPrecision(places) : value
}

export function DrawChartBar(
  chart: ChartBar,
  style: ChartStyle,
  data: Data,
  colors: Colors,
) {
  const color = (index: number) => colors[index % colors.length]?.[+isDark()]

  // TODO: these should be affected by baselineZero
  const minV = () => data.reduce((a, [, b]) => Math.min(a, ...b), 0)
  const maxV = () => data.reduce((a, [, b]) => Math.max(a, ...b), 0)

  return (
    <div
      class="relative flex aspect-video transform"
      classList={{ "gap-2": chart.space }}
    >
      <For each={data}>
        {([label, values], labelIndex) => (
          <div class="relative flex h-full flex-1 transform flex-col">
            <div class="flex flex-1 gap-1 overflow-hidden">
              <For each={values}>
                {(value, index) => {
                  const prev = () =>
                    index() == 0 ?
                      data[labelIndex() - 1]?.[1].at(-1)
                    : values[index() - 1]!

                  const next = () =>
                    index() == values.length - 1 ?
                      data[labelIndex() + 1]?.[1][0]
                    : values[index() + 1]!

                  return (
                    <div class="flex flex-1 flex-col">
                      <div
                        class="relative mt-auto transform transition"
                        classList={{
                          "rounded-bl-lg":
                            chart.rounded &&
                            (chart.space ||
                              (labelIndex() == 0 && index() == 0) ||
                              prev() == 0),
                          "rounded-br-lg":
                            chart.rounded &&
                            (chart.space ||
                              (labelIndex() == data.length - 1 &&
                                index() == values.length - 1) ||
                              next() == 0),
                          "rounded-tl-lg":
                            chart.rounded &&
                            (chart.space || prev() == null || prev()! < value),
                          "rounded-tr-lg":
                            chart.rounded &&
                            (chart.space || next() == null || next()! < value),
                        }}
                        style={{
                          height: `${(value! / (maxV() - minV())) * 100}%`,
                          background: color(index()),
                        }}
                      >
                        <Show
                          when={
                            chart.rounded &&
                            !chart.space &&
                            value != 0 &&
                            next() != null &&
                            next()! > value
                          }
                        >
                          <div
                            class="fixed -top-2 right-0 size-2 transition"
                            style={{ background: color(index()) }}
                          />

                          <div
                            class="fixed -top-2 right-0 size-2 rounded-br-lg transition"
                            classList={{
                              "bg-z-body": !style.layered,
                              "bg-z-body-selected": style.layered,
                            }}
                          />
                        </Show>

                        <Show
                          when={
                            chart.rounded &&
                            !chart.space &&
                            value != 0 &&
                            prev() != null &&
                            prev()! > value
                          }
                        >
                          <div
                            class="fixed -top-2 left-0 size-2 transition"
                            style={{ background: color(index()) }}
                          />

                          <div
                            class="fixed -top-2 left-0 size-2 rounded-bl-lg transition"
                            classList={{
                              "bg-z-body": !style.layered,
                              "bg-z-body-selected": style.layered,
                            }}
                          />
                        </Show>
                      </div>
                    </div>
                  )
                }}
              </For>
            </div>

            <div
              class="relative bottom-0 w-full max-w-full transform overflow-hidden py-0.5 text-center text-sm"
              classList={{
                "text-z-subtitle": !chart.inlineLabels,
                "text-z-bg-body": chart.inlineLabels,
                fixed: chart.inlineLabels,
                "pb-1": chart.inlineLabels,
                "[text-shadow:_0_1px_0_var(--tw-shadow-color)]":
                  chart.inlineLabels,
              }}
            >
              &nbsp;
              <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {typeof label == "string" ?
                  label
                : display(label, chart.decimalPlaces)}
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

export function DrawStatCard(
  card: Omit<StatCard, "query">,
  data: Data,
  colors: Colors,
) {
  return (
    <div
      class="relative transform overflow-hidden border-z transition"
      classList={{
        "bg-z-body-selected": card.style.layered,
        "p-2": card.style.padded,
        "pb-0": !card.chart.inlineLabels,
        "rounded-2xl": card.style.roundCard,
        border: card.style.bordered,
      }}
    >
      <div
        class="fixed left-1/2 top-1 z-10 max-w-full -translate-x-1/2 whitespace-nowrap rounded-md border border-z bg-z-body-selected px-2 text-center"
        classList={{ "rounded-t-md": !card.style.padded }}
      >
        {card.title}
      </div>
      {DrawChartBar(card.chart, card.style, data, colors)}
    </div>
  )
}
