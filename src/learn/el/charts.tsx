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
              <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
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
  const floating = () => card.style.titleLocation.startsWith("floating")
  const border = () => card.style.titleBorder == "normal"
  const padded = () => card.style.padded
  return (
    <div
      class="relative transform overflow-hidden border-z transition"
      classList={{
        "bg-z-body-selected": card.style.layered,
        "p-2": padded(),
        "pb-0": !card.chart.inlineLabels,
        "rounded-2xl": card.style.roundCard,
        border: card.style.bordered,
      }}
    >
      <div
        class="fixed z-10 max-w-full whitespace-nowrap border-z"
        classList={{
          "bg-z-body": floating() && card.style.layered,
          "bg-z-body-selected": floating() && !card.style.layered,
          "px-2": floating(),

          hidden: card.style.titleLocation == "hidden",
          fixed: floating(),
          border: border() && floating(),
          "border-b": border(),
          "pb-0.5": !floating(),
          "mb-1": !border() && !floating(),
          "mb-2": border() && !floating(),
          "-mt-1": !floating(),
          "rounded-t-md": card.style.titleLocation == "floating",
          "rounded-b-md": floating(),
          "top-1": !padded() && card.style.titleLocation == "floating",
          "top-2": padded() && card.style.titleLocation == "floating",
          "top-0": card.style.titleLocation == "floating-anchored",
          "text-2xl": card.style.titleLocation == "inline-big",

          "text-left": card.style.titleAlign == "left",
          "text-center": card.style.titleAlign == "center",
          "text-right": card.style.titleAlign == "right",
          "left-2":
            padded() &&
            card.style.titleLocation == "floating" &&
            card.style.titleAlign == "left",
          "right-2":
            padded() &&
            card.style.titleLocation == "floating" &&
            card.style.titleAlign == "right",
          "left-1":
            !padded() &&
            card.style.titleLocation == "floating" &&
            card.style.titleAlign == "left",
          "right-1":
            !padded() &&
            card.style.titleLocation == "floating" &&
            card.style.titleAlign == "right",
          "left-0":
            card.style.titleLocation == "floating-anchored" &&
            card.style.titleAlign == "left",
          "pl-2":
            card.style.titleLocation == "floating-anchored" &&
            card.style.titleAlign == "left",
          "right-0":
            card.style.titleLocation == "floating-anchored" &&
            card.style.titleAlign == "right",
          "pr-2":
            card.style.titleLocation == "floating-anchored" &&
            card.style.titleAlign == "right",
          "left-1/2": floating() && card.style.titleAlign == "center",
          "-translate-x-1/2": floating() && card.style.titleAlign == "center",
          "rounded-tr-xl":
            card.style.titleLocation == "floating" &&
            !padded() &&
            card.style.roundCard &&
            card.style.titleAlign == "right",
          "rounded-tl-xl":
            card.style.titleLocation == "floating" &&
            !padded() &&
            card.style.roundCard &&
            card.style.titleAlign == "left",
          "rounded-tr-lg":
            card.style.titleLocation == "floating" &&
            padded() &&
            card.style.roundCard &&
            card.style.titleAlign == "right",
          "rounded-tl-lg":
            card.style.titleLocation == "floating" &&
            padded() &&
            card.style.roundCard &&
            card.style.titleAlign == "left",
          "rounded-tr-md":
            card.style.titleLocation == "floating-anchored" &&
            !padded() &&
            card.style.titleAlign == "right",
          "rounded-tl-md":
            card.style.titleLocation == "floating-anchored" &&
            !padded() &&
            card.style.titleAlign == "left",
          "rounded-br-none":
            card.style.titleLocation == "floating-anchored" &&
            !padded() &&
            card.style.titleAlign == "right",
          "rounded-bl-none":
            card.style.titleLocation == "floating-anchored" &&
            !padded() &&
            card.style.titleAlign == "left",
        }}
      >
        {card.title}
      </div>
      {DrawChartBar(card.chart, card.style, data, colors)}
    </div>
  )
}
