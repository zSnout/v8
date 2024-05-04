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
    x: 5,
    y: 2,
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

  function drawAxes() {
    ctx.beginPath()
    ctx.strokeStyle = "black"
    ctx.lineWidth = 1.5 * scale()
    const { x, y } = convertGraphToCanvas(0, 0)
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height())
    ctx.moveTo(0, y)
    ctx.lineTo(width(), y)
    ctx.stroke()
  }

  function drawRaw() {
    canvas.width = width()
    canvas.height = height()
    ctx.imageSmoothingEnabled = true
    drawAxes()
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

/** Lambdas
 *
 * In Desmos, functions must be declared statically. If a function `f` relies on
 * a function `g`, and you need to call `f` but with a different function `g`,
 * you need to create a new instance of both `f` and `g`. This makes code
 * unwieldy and prone to errors and overduplication.
 *
 * This calculator aims to fix that with lambda functions. Lambda functions are
 * functions which can be passed around at will. Instead of `f` relying on `g`,
 * `f` could take an argument of `g`, and we could pass any lambda to it, or the
 * definition of a standalone function. `f` might be defined as `f(x,g)=g(x)^2`,
 * so that it can be reused for any function `g`. The example is simple, but you
 * can see how it would scale to larger projects.
 */
