import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  untrack,
} from "solid-js"

export type MutableExpression =
  | { type: "variable"; name: string }
  | { type: "number"; value: string }
  | { type: "lambda"; params: string[]; body: MutableExpression }
  | { type: "call"; name: MutableExpression; args: MutableExpression[] }
  | { type: "add"; lhs: MutableExpression; rhs: MutableExpression }

export function mergeArrays<T>(a: T[], b: readonly T[]): T[] {
  for (const el of b) {
    if (!a.includes(el)) {
      a.push(el)
    }
  }

  return a
}

export function detectFreeVariables(
  expression: MutableExpression,
): readonly string[] {
  switch (expression.type) {
    case "variable":
      return [expression.name]

    case "number":
      return []

    case "lambda":
      return detectFreeVariables(expression.body)

    case "call":
      return expression.args.reduce(
        (a, b) => mergeArrays(a, detectFreeVariables(b)),
        detectFreeVariables(expression.name) as string[],
      )

    case "add":
      return mergeArrays(
        detectFreeVariables(expression.lhs) as string[],
        detectFreeVariables(expression.rhs),
      )
  }

  // @ts-expect-error no expressions should reach here
  throw new Error("Unknown expression type.")
}

export interface Position {
  readonly x: number
  readonly y: number
  readonly w: number
}

export interface Dragging {
  readonly mx: number
  readonly my: number
}

const THEME_MAIN_AXIS_WIDTH = 1.5
const THEME_MAJOR_LINE_ALPHA = 0.3
const THEME_MINOR_LINE_ALPHA = 0.1

const THEME_AXIS_NUMBER_SIZE = 0.875
const THEME_AXIS_NUMBER_STROKE_COLOR = "white"
const THEME_AXIS_NUMBER_STROKE_WIDTH = 4
const THEME_AXIS_NUMBER_ONSCREEN = "black"
const THEME_AXIS_NUMBER_OFFSCREEN = "#8e8e8e"
const THEME_AXIS_NUMBER_NEGATIVE_X_OFFSET = -2.5

const THEME_ZOOM_ZERO_SNAP_DISTANCE = 16

function ref(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!

  const [scale, setScale] = createSignal(window.devicePixelRatio || 1)
  const [rawDimensions, setRawDimensions] = createSignal({
    w: canvas.clientWidth,
    h: canvas.clientHeight,
  })
  const width = createMemo(() => rawDimensions().w * scale())
  const height = createMemo(() => rawDimensions().h * scale())
  const [rawPosition, setRawPosition] = createSignal<Position>({
    w: 0.5545064108147902,
    x: -1.930509291345103,
    y: 0,
  })
  const position = createMemo(() => {
    const { x, y, w } = rawPosition()
    const cw = width()
    const ch = height()
    const h = (ch / cw) * w

    return {
      x,
      xmin: x - w / 2,
      xmax: x + w / 2,
      y,
      ymin: y - h / 2,
      ymax: y + h / 2,
      w,
      h,
    }
  })

  function superscript(value: string): string {
    return value
      .replace(/-/g, "⁻")
      .replace(/0/g, "⁰")
      .replace(/1/g, "¹")
      .replace(/2/g, "²")
      .replace(/3/g, "³")
      .replace(/4/g, "⁴")
      .replace(/5/g, "⁵")
      .replace(/6/g, "⁶")
      .replace(/7/g, "⁷")
      .replace(/8/g, "⁸")
      .replace(/9/g, "⁹")
  }

  function toString(value: number): string {
    if (Math.abs(value) <= 0.0001) {
      const exp = Math.floor(Math.log10(Math.abs(value)))
      const mantissa = value / 10 ** exp

      return `${mantissa}×10${superscript(exp.toString())}`
    } else {
      return value.toString()
    }
  }

  function addDragLogic() {
    const [, setDragging] = createSignal<Dragging>()

    canvas.addEventListener("pointerdown", (event) => {
      event.preventDefault()
      event.stopImmediatePropagation()

      setDragging({
        mx: event.clientX,
        my: event.clientY,
      })
    })

    addEventListener("pointermove", (event) => {
      setDragging((dragged) => {
        if (!dragged) {
          return
        }

        const { mx, my } = dragged

        const dx = ((event.clientX - mx) / innerWidth) * position().w

        const dy =
          (((event.clientY - my) / innerHeight) * position().w * height()) /
          width()

        setRawPosition(({ x, y, w }) => ({ x: x - dx, y: y + dy, w }))

        return {
          mx: event.clientX,
          my: event.clientY,
        }
      })

      draw()
    })

    addEventListener("pointerup", () => setDragging())
  }

  function addZoomLogic() {
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault()

      const { x: xpos, y: ypos, w } = rawPosition()
      const h = (height() / width()) * w

      const { x: x0, y: y0 } = convertGraphToCanvas(0, 0)

      const xp =
        (Math.abs(x0 / scale() - event.clientX) < THEME_ZOOM_ZERO_SNAP_DISTANCE
          ? x0 / scale()
          : event.clientX) / canvas.clientWidth

      const yp =
        (Math.abs(y0 / scale() - event.clientY) < THEME_ZOOM_ZERO_SNAP_DISTANCE
          ? y0 / scale()
          : event.clientY) / canvas.clientHeight

      const n = event.deltaY > 0 ? 1.08 : 0.92

      setRawPosition({
        x: xpos + w * (n - 1) * (0.5 - xp),
        y: ypos - h * (n - 1) * (0.5 - yp),
        w: w * n,
      })

      draw()
    })
  }

  function convertGraphToCanvas(x: number, y: number) {
    const { xmin, ymin, w, h } = position()
    const xp = (x - xmin) / w
    const yp = 1 - (y - ymin) / h

    return {
      x: xp * width(),
      y: yp * height(),
    }
  }

  function drawScreenLineX(x: number, w: number) {
    const l = Math.floor(x - w / 2)
    ctx.fillStyle = "black"
    ctx.rect(l, 0, w, height())
  }

  function drawScreenLineY(y: number, h: number) {
    const t = Math.floor(y - h / 2)
    ctx.fillStyle = "black"
    ctx.fillRect(0, t, width(), h)
  }

  function drawAxes() {
    ctx.beginPath()
    ctx.globalAlpha = 1
    const { x, y } = convertGraphToCanvas(0, 0)
    drawScreenLineX(x, THEME_MAIN_AXIS_WIDTH * scale())
    drawScreenLineY(y, THEME_MAIN_AXIS_WIDTH * scale())
    ctx.fill()
  }

  function getGridlineSize(graphSize: number, canvasSize: number) {
    const MIN_GRIDLINE_SIZE = 16 * scale()

    const graphUnitsInGridlineSize =
      (MIN_GRIDLINE_SIZE * graphSize) / canvasSize

    const exp = 10 ** Math.floor(Math.log10(graphUnitsInGridlineSize))
    const mantissa = graphUnitsInGridlineSize / exp
    if (mantissa < 2) {
      return { minor: 2 * exp, major: 10 * exp }
    } else if (mantissa < 4) {
      return { minor: 5 * exp, major: 20 * exp }
    } else {
      return { minor: 10 * exp, major: 50 * exp }
    }
  }

  function drawGridlinesX() {
    const { w } = position()
    const { minor, major } = getGridlineSize(w, width())

    ctx.strokeStyle = "black"
    ctx.lineWidth = scale()

    const { xmin, xmax } = position()

    ctx.beginPath()
    ctx.globalAlpha = THEME_MAJOR_LINE_ALPHA
    const majorStart = Math.floor(xmin / major) * major
    const majorEnd = Math.ceil(xmax / major) * major
    for (let line = majorStart; line < majorEnd; line += major) {
      if (Math.abs(line) < 10 ** -15) {
        continue
      }
      const { x } = convertGraphToCanvas(line, 0)
      drawScreenLineX(x, 1 * scale())
    }
    ctx.fill()

    ctx.beginPath()
    ctx.globalAlpha = THEME_MINOR_LINE_ALPHA
    const minorStart = Math.floor(xmin / minor) * minor
    const minorEnd = Math.ceil(xmax / minor) * minor
    for (let line = minorStart; line < minorEnd; line += minor) {
      if (Math.abs(line) < 10 ** -15) {
        continue
      }
      const { x } = convertGraphToCanvas(line, 0)
      drawScreenLineX(x, 1 * scale())
    }
    ctx.fill()

    ctx.globalAlpha = 1
  }

  function drawGridlinesY() {
    const { h } = position()
    const { minor, major } = getGridlineSize(h, height())

    ctx.strokeStyle = "black"
    ctx.lineWidth = scale()

    const { ymin, ymax } = position()

    ctx.beginPath()
    ctx.globalAlpha = THEME_MAJOR_LINE_ALPHA
    const majorStart = Math.floor(ymin / major) * major
    const majorEnd = Math.ceil(ymax / major) * major
    for (let line = majorStart; line < majorEnd; line += major) {
      if (Math.abs(line) < 10 ** -15) {
        continue
      }
      const { y } = convertGraphToCanvas(0, line)
      drawScreenLineY(y, 1 * scale())
    }
    ctx.fill()

    ctx.beginPath()
    ctx.globalAlpha = THEME_MINOR_LINE_ALPHA
    const minorStart = Math.floor(ymin / minor) * minor
    const minorEnd = Math.ceil(ymax / minor) * minor
    for (let line = minorStart; line < minorEnd; line += minor) {
      if (Math.abs(line) < 10 ** -15) {
        continue
      }
      const { y } = convertGraphToCanvas(0, line)
      drawScreenLineY(y, 1 * scale())
    }
    ctx.fill()

    ctx.globalAlpha = 1
  }

  function drawAxisNumbersX() {
    const { w } = position()
    const { major } = getGridlineSize(w, width())

    ctx.beginPath()

    ctx.strokeStyle = THEME_AXIS_NUMBER_STROKE_COLOR
    ctx.lineWidth = THEME_AXIS_NUMBER_STROKE_WIDTH * scale()
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.font = `${THEME_AXIS_NUMBER_SIZE * scale()}rem sans-serif`

    const { xmin, xmax } = position()
    const majorStart = Math.floor(xmin / major) * major
    const majorEnd = Math.ceil(xmax / major) * major

    const zeroMetrics = ctx.measureText("0")
    const letterSize =
      zeroMetrics.fontBoundingBoxDescent - zeroMetrics.fontBoundingBoxAscent

    const { y } = convertGraphToCanvas(0, 0)

    const pos =
      y + 7.5 * scale() + letterSize > height()
        ? "bottom"
        : y + 1.5 * scale() < 0
        ? "top"
        : "middle"

    if (pos == "middle") {
      ctx.fillStyle = THEME_AXIS_NUMBER_ONSCREEN
    } else {
      ctx.fillStyle = THEME_AXIS_NUMBER_OFFSCREEN

      if (pos == "bottom") {
        ctx.textBaseline = "bottom"
      }
    }

    for (let line = majorStart; line < majorEnd; line += major) {
      if (Math.abs(line) < 10 ** -15) {
        continue
      }

      const value = toString(line)
      let { x } = convertGraphToCanvas(line, 0)
      if (line < 0) {
        x += THEME_AXIS_NUMBER_NEGATIVE_X_OFFSET * scale()
      }

      if (pos == "bottom") {
        ctx.strokeText(value, x, height() - 3 * scale())
        ctx.fillText(value, x, height() - 3 * scale())
      } else if (pos == "top") {
        ctx.strokeText(value, x, 3 * scale())
        ctx.fillText(value, x, 3 * scale())
      } else {
        ctx.strokeText(value, x, y + 3 * scale())
        ctx.fillText(value, x, y + 3 * scale())
      }
    }
  }

  function drawAxisNumbersY() {
    const { h } = position()
    const { major } = getGridlineSize(h, height())

    ctx.beginPath()

    ctx.strokeStyle = THEME_AXIS_NUMBER_STROKE_COLOR
    ctx.lineWidth = THEME_AXIS_NUMBER_STROKE_WIDTH * scale()
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.font = `${THEME_AXIS_NUMBER_SIZE * scale()}rem sans-serif`

    const { ymin, ymax } = position()
    const majorStart = Math.floor(ymin / major) * major
    const majorEnd = Math.ceil(ymax / major) * major

    for (let line = majorStart; line < majorEnd; line += major) {
      if (Math.abs(line) < 10 ** -15) {
        continue
      }

      const value = toString(line)
      let { x, y } = convertGraphToCanvas(0, line)
      x -= 6 * scale()

      const metrics = ctx.measureText(value)
      const xleft = x - metrics.width

      if (xleft < 6 * scale()) {
        ctx.textAlign = "left"
        ctx.fillStyle = THEME_AXIS_NUMBER_OFFSCREEN
        ctx.strokeText(value, 6 * scale(), y)
        ctx.fillText(value, 6 * scale(), y)
      } else if (x > width() - 6 * scale()) {
        ctx.textAlign = "right"
        ctx.fillStyle = THEME_AXIS_NUMBER_OFFSCREEN
        ctx.strokeText(value, width() - 6 * scale(), y)
        ctx.fillText(value, width() - 6 * scale(), y)
      } else {
        ctx.textAlign = "right"
        ctx.fillStyle = THEME_AXIS_NUMBER_ONSCREEN
        ctx.strokeText(value, x, y)
        ctx.fillText(value, x, y)
      }
    }
  }

  function drawGridlines() {
    drawGridlinesX()
    drawGridlinesY()
    drawAxisNumbersX()
    drawAxisNumbersY()
    drawAxes()
  }

  function drawRaw() {
    ctx.reset()
    if (width() != canvas.width) {
      canvas.width = width()
    }
    if (height() != canvas.height) {
      canvas.height = height()
    }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "low"
    drawGridlines()
  }

  function draw() {
    untrack(drawRaw)
  }

  draw()

  new ResizeObserver(() => {
    batch(() => {
      setRawDimensions({
        w: canvas.clientWidth,
        h: canvas.clientHeight,
      })

      setScale(window.devicePixelRatio || 1)
    })

    draw()
  }).observe(canvas)

  addDragLogic()
  addZoomLogic()

  createEffect(() => console.log(position()))
}

export function Graph(props: { class?: string | undefined }) {
  return <canvas class={props.class} ref={ref} />
}
