// This file should work in the worker AND main thread.
// JSX code to render the charts should go elsewhere.

import type { ChartMainAxis } from "./types"

// @deprecated is used here to mark properties which haven't been used yet.
// This provides a helpful to-do list.

export type Data = [label: number | string, values: number[]][]
export type Colors = [light: string, dark: string][]

// export interface ChartBar extends ChartBase<"bar"> {
//   /** Whether to space bars. */ space: boolean
//   rounded: boolean
// }

// export interface ChartLine extends ChartBase<"line"> {
//   /** @deprecated Fill type. */ fill: "none" | "solid" | "gradient"
//   /** @deprecated Sharpness of the line. */ mode: "sharp" | "curve" | "step"
//   /** @deprecated Whether to show dots. */ dots: true | false | "hole"
// }

// export interface ChartPie extends ChartBase<"pie"> {
//   /** @deprecated What to show in the center. */
//   center:
//     | { title: number | string; subtitle: number | string | null }
//     | "hole"
//     | "filled"
// }

/** Each element of `data[...][1]` is interpreted to be a count value. */
export function groupData(data: Data, axis: ChartMainAxis): Data {
  if (axis.groupSize == null) {
    return data
  }

  const min = axis.min ?? data.reduce((a, [b]) => Math.min(a, +b), 0)
  const max = axis.max ?? data.reduce((a, [b]) => Math.max(a, +b), 0)
  const size =
    axis.groupSizeIsPercentage ?
      (axis.groupSize / 100) * (max - min)
    : axis.groupSize

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min > max ||
    !Number.isFinite(size) ||
    size <= (max - min) / 200
  ) {
    return data.map(([a, b]) => [+a, b])
  }

  const els = data[0]?.[1].length

  if (els == null) {
    return []
  }

  const bucketCount = Math.floor((max - min) / size) + 1

  const bucketOf = (x: number) => {
    if (x == max) {
      return bucketCount - 1
    }
    const index = Math.floor((x - min) / size)
    return index
  }

  const retval: Data = Array.from({ length: bucketCount }, (_, index) => [
    min + index * size,
    Array.from({ length: els }, () => 0),
  ])

  for (const [label, values] of data) {
    const idx = bucketOf(+label)
    if (idx < 0 || idx >= bucketCount) {
      continue
    }
    for (let i = 0; i < values.length; i++) {
      retval[idx]![1][i]! += values[i]!
    }
  }

  return retval
}
