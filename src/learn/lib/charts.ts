// This file should work in the worker AND main thread.
// JSX code to render the charts should go elsewhere.

// @deprecated is used here to mark properties which haven't been used yet.
// This provides a helpful to-do list.

export type NumberedData = [label: number, values: number[]][]
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
export function groupData(data: Data, size: number): NumberedData {
  const min = data.reduce((a, [b]) => Math.min(a, +b), 0)
  const max = data.reduce((a, [b]) => Math.max(a, +b), 0)

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    min > max ||
    !Number.isFinite(size) ||
    size <= (max - min) / 1000
  ) {
    return data.map(([a, b]) => [+a, b])
  }

  const els = data[0]?.[1].length

  if (els == null) {
    return []
  }

  const bucketCount = Math.ceil((max - min) / size)
  console.log(max, min, bucketCount)

  const bucketOf = (x: number) => {
    const index = Math.floor((x - min) / size)
    return Math.min(index, bucketCount - 1)
  }

  const retval: NumberedData = Array.from(
    { length: bucketCount },
    (_, index) => [min + index * size, Array.from({ length: els }, () => 0)],
  )

  for (const [label, values] of data) {
    const idx = bucketOf(+label)
    for (let i = 0; i < values.length; i++) {
      retval[idx]![1][i]! += values[i]!
    }
  }

  return retval
}
