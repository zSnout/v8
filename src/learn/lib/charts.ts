// This file should work in the worker AND main thread.
// JSX code to render the charts should go elsewhere.

// @deprecated is used here to mark properties which haven't been used yet.
// This provides a helpful to-do list.

export interface ChartBase<T extends string> {
  data: [label: number | string, values: number[]][]
  type: T
  colors: string[]
  /** @deprecated The direction of the chart. */ dir: "tb" | "bt" | "lr" | "rl"
  /** @deprecated How many decimal places to show. */ decimalPlaces: number
  /** @deprecated Every nth entry gets a label. */ labelsEach: number
  /** @deprecated Show labels in each bar. */ inlineLabels: boolean
  /** @deprecated Show values above each bar. */ persistentValues: boolean
  /** @deprecated Show a cummulative total in the background. */ showTotal: boolean
  /** @deprecated Stack bars when multiple values are present. */ stacked: boolean
  /** @deprecated Whether to use zero as the baseline value. */ zeroBaseline: boolean
  /** @deprecated Whether to space numeric labels according to their values. */ spaceNumerically: boolean
}

export interface ChartBar extends ChartBase<"bar"> {
  /** @deprecated Whether to space bars. */ space: boolean
}

export interface ChartLine extends ChartBase<"line"> {
  /** @deprecated Fill type. */ fill: "none" | "solid" | "gradient"
  /** @deprecated Sharpness of the line. */ mode: "sharp" | "curve" | "step"
  /** @deprecated Whether to show dots. */ dots: true | false | "hole"
}

export interface ChartPie extends ChartBase<"pie"> {
  /** @deprecated What to show in the center. */
  center:
    | { title: number | string; subtitle: number | string | null }
    | "hole"
    | "filled"
}

export type Chart = ChartBar | ChartLine | ChartPie

export interface StatCard {
  /** @deprecated */ title: string
  /** @deprecated */ chart: Chart
}

// CHART difficulty FROM cards GROUP BY difficulty
