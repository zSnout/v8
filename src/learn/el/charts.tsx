import { isDark } from "@/stores/theme"
import { For } from "solid-js"
import type { ChartBar } from "../lib/charts"

// The v-axis is the value-axis, and the l-axis is the label-axis.

export function DrawChartBar(props: ChartBar) {
  const color = (index: number) =>
    props.colors[index % props.colors.length]?.[+isDark()]

  // TODO: these should be affected by baselineZero
  const minV = () => props.data.reduce((a, [, b]) => Math.min(a, ...b), 0)
  const maxV = () => props.data.reduce((a, [, b]) => Math.max(a, ...b), 0)

  return (
    <div>
      <div class="flex aspect-video gap-2">
        <For each={props.data}>
          {([label, [value]]) => (
            <div class="flex flex-1 flex-col">
              <div
                class="mt-auto rounded-lg transition"
                style={{
                  height: `${(value! / (maxV() - minV())) * 100}%`,
                  background: color(0),
                }}
              />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
