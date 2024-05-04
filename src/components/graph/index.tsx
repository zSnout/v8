import { batch, createMemo, createSignal, untrack } from "solid-js"

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
    x: 0,
    y: 0,
    w: 20,
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
    ctx.rect(0, t, width(), h)
  }

  function drawAxes() {
    ctx.beginPath()
    const { x, y } = convertGraphToCanvas(0, 0)
    drawScreenLineX(x, 1.5 * scale())
    drawScreenLineY(y, 1.5 * scale())
    ctx.fill()
  }

  function drawGridX() {
    ctx.strokeStyle = "black"
    ctx.lineWidth = scale()

    const { xmin, xmax } = position()

    ctx.beginPath()
    ctx.globalAlpha = 0.3
    const major = 2
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
    ctx.globalAlpha = 0.1
    const minor = 0.5
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

    ctx.globalAlpha = 0
  }

  function drawGridY() {
    ctx.strokeStyle = "black"
    ctx.lineWidth = scale()

    const { ymin, ymax } = position()

    ctx.beginPath()
    ctx.globalAlpha = 0.3
    const major = 2
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
    ctx.globalAlpha = 0.1
    const minor = 0.5
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

    ctx.globalAlpha = 0
  }

  function drawGridLines() {
    drawGridX()
    drawGridY()
  }

  function drawRaw() {
    canvas.width = width()
    canvas.height = height()
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "low"
    drawAxes()
    drawGridLines()
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
}

export function Graph(props: { class?: string | undefined }) {
  return <canvas class={props.class} ref={ref} />
}
