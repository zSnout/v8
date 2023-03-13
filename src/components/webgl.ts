import { createEffect, onCleanup } from "solid-js"
import { createEventListener } from "./create-event-listener"
import { error, ok, Result } from "./result"

function resize(canvas: HTMLCanvasElement) {
  const { width, height } = canvas.getBoundingClientRect()
  canvas.width = width * devicePixelRatio
  canvas.height = height * devicePixelRatio
}

export class WebGLCanvas {
  static fragMods = ""
  static fragMainMods = ""
  static vertMods = ""
  static vertMainMods = ""

  static of(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("webgl2")

    if (context == null) {
      return error(
        "It looks like your browser doesn't support WebGL2. Try upgrading to the latest version of Chrome, Safari, Firefox, or Edge to resolve the issue."
      )
    }

    return ok(new this(canvas, context))
  }

  readonly #canvas: HTMLCanvasElement
  readonly #gl: WebGL2RenderingContext

  #isDrawQueued = false
  #program?: WebGLProgram
  #attributeLocations = new Map<string, GLint>()
  #uniformLocations = new Map<string, WebGLUniformLocation>()

  constructor(canvas: HTMLCanvasElement, context: WebGL2RenderingContext) {
    this.#canvas = canvas
    this.#gl = context

    const observer = new ResizeObserver(this.onResize.bind(this))
    observer.observe(canvas, { box: "border-box" })
    onCleanup(() => observer.disconnect())
  }

  onResize() {
    const canvas = this.#canvas
    resize(canvas)
    this.#setViewport()
    this.draw()
  }

  get canvas() {
    return this.#canvas
  }

  get gl() {
    return this.#gl
  }

  #createShader(type: "fragment" | "vertex", source: string) {
    const gl = this.#gl

    const C = this.constructor as typeof WebGLCanvas

    const match = source.match(/void\s+main\(\)\s*{/)

    if (match) {
      source =
        source.slice(0, match.index) +
        (type == "fragment" ? C.fragMods : C.vertMods) +
        match[0] +
        (type == "fragment" ? C.fragMainMods : C.vertMainMods) +
        source.slice(match.index! + match[0].length)
    } else {
      source += type == "fragment" ? C.fragMods : C.vertMods
    }

    const shader = gl.createShader(
      type == "fragment" ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER
    )

    if (!shader) {
      return error("Failed to create " + type + " shader.")
    }

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

    if (success) {
      return ok(shader)
    } else {
      console.log(gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)

      return error("Failed to compile " + type + " shader.")
    }
  }

  #createProgram(vertexSource: string, fragmentSource: string) {
    const gl = this.#gl

    const vertex = this.#createShader("vertex", vertexSource)

    if (!vertex.ok) {
      return vertex
    }

    const fragment = this.#createShader("fragment", fragmentSource)

    if (!fragment.ok) {
      return fragment
    }

    const program = gl.createProgram()

    if (!program) {
      return error("Failed to create WebGL program.")
    }

    gl.attachShader(program, vertex.value)
    gl.attachShader(program, fragment.value)
    gl.linkProgram(program)

    const success = gl.getProgramParameter(program, gl.LINK_STATUS)

    if (success) {
      this.#program = program
      this.#attributeLocations = new Map()
      return ok(program)
    } else {
      console.log(gl.getProgramInfoLog(program))
      gl.deleteProgram(program)

      return error("Failed to link WebGL program.")
    }
  }

  #getAttributeLocation(name: string) {
    if (this.#program == null) {
      return error(
        "Cannot get an attribute location without an active program."
      )
    }

    const location = this.#attributeLocations.get(name)

    if (location != null) {
      return ok(location)
    }

    const actual = this.#gl.getAttribLocation(this.#program, name)

    this.#attributeLocations.set(name, actual)

    return ok(actual)
  }

  #getUniformLocation(name: string) {
    if (this.#program == null) {
      return error("Cannot get a uniform location without an active program.")
    }

    const location = this.#uniformLocations.get(name)

    if (location != null) {
      return ok(location)
    }

    const actual = this.#gl.getUniformLocation(this.#program, name)

    if (actual == null) {
      return error("Could not get location of uniform " + name + ".")
    }

    this.#uniformLocations.set(name, actual)

    return ok(actual)
  }

  setAttribute(
    name: string,
    values: {
      lt: [number]
      rt: [number]
      lb: [number]
      rb: [number]
    }
  ): Result<undefined>

  setAttribute(
    name: string,
    values: {
      lt: [number, number]
      rt: [number, number]
      lb: [number, number]
      rb: [number, number]
    }
  ): Result<undefined>

  setAttribute(
    name: string,
    values: {
      lt: [number, number, number]
      rt: [number, number, number]
      lb: [number, number, number]
      rb: [number, number, number]
    }
  ): Result<undefined>

  setAttribute(
    name: string,
    values: {
      lt: [number, number, number, number]
      rt: [number, number, number, number]
      lb: [number, number, number, number]
      rb: [number, number, number, number]
    }
  ): Result<undefined>

  setAttribute(
    name: string,
    values: {
      lt: number[]
      rt: number[]
      lb: number[]
      rb: number[]
    }
  ) {
    const location = this.#getAttributeLocation(name)

    if (!location.ok) {
      return location
    }

    const gl = this.#gl

    const buffer = gl.createBuffer()

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        ...values.lb,
        ...values.lt,
        ...values.rb,
        ...values.rt,
        ...values.lt,
        ...values.rb,
      ]),
      gl.STATIC_DRAW
    )

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

    gl.vertexAttribPointer(
      location.value,
      values.lb.length,
      gl.FLOAT,
      false,
      0,
      0
    )

    gl.enableVertexAttribArray(location.value)

    return ok(undefined)
  }

  setUniform(name: string, ...values: readonly number[]) {
    const location = this.#getUniformLocation(name)

    if (!location.ok) {
      return
    }

    this.#gl[`uniform${values.length as 1 | 2 | 3 | 4}f`](
      location.value,
      ...(values as readonly [number, number, number, number])
    )

    this.queueDraw()
  }

  setReactiveUniform(name: string, value: () => number) {
    createEffect(() => {
      const location = this.#getUniformLocation(name)

      if (!location.ok) {
        return
      }

      this.#gl.uniform1f(location.value, value())
      this.queueDraw()
    })
  }

  setReactiveUniformArray(name: string, value: () => readonly number[]) {
    createEffect(() => this.setUniform(name, ...value()))
  }

  load(fragmentSource: string) {
    const program = this.#createProgram(
      `#version 300 es
in vec4 a_position;out vec4 position;void main(){gl_Position=position=a_position;}`,
      fragmentSource
    )

    if (!program.ok) {
      return program
    }

    const gl = this.#gl

    this.setAttribute("a_position", {
      lt: [0, 1],
      rt: [1, 1],
      lb: [0, 0],
      rb: [1, 0],
    })

    gl.useProgram(program.value)
    this.#setViewport()

    return ok(undefined)
  }

  #setViewport() {
    const canvas = this.#canvas

    this.#gl.viewport(
      -canvas.width,
      -canvas.height,
      2 * canvas.width,
      2 * canvas.height
    )
  }

  draw() {
    this.#isDrawQueued = false

    if (this.#program == null) {
      return
    }

    const gl = this.#gl
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }

  queueDraw() {
    if (!this.#isDrawQueued) {
      requestAnimationFrame(() => {
        if (this.#isDrawQueued) {
          this.draw()
        }
      })
    }

    this.#isDrawQueued = true
  }
}

export interface Point {
  x: number
  y: number
}

export interface Coordinates {
  top: number
  right: number
  bottom: number
  left: number
}

export class WebGLCoordinateCanvas extends WebGLCanvas {
  static override vertMods =
    super.vertMods + "in vec4 i_coords;out vec4 coords;"

  static override vertMainMods = super.vertMainMods + "coords=i_coords;"

  static override of(canvas: HTMLCanvasElement): Result<WebGLCoordinateCanvas> {
    return super.of(canvas) as Result<WebGLCoordinateCanvas>
  }

  #top = 1
  #right = 1
  #bottom = 0
  #left = 0

  override draw() {
    const { top, right, bottom, left } = this.coordsNormalizedToCanvasSize()

    this.setAttribute("i_coords", {
      lt: [left, top],
      rt: [right, top],
      lb: [left, bottom],
      rb: [right, bottom],
    })

    super.draw()
  }

  getCoords(): Coordinates {
    return {
      top: this.#top,
      right: this.#right,
      bottom: this.#bottom,
      left: this.#left,
    }
  }

  setCoords(coords: Coordinates) {
    this.#top = coords.top
    this.#right = coords.right
    this.#bottom = coords.bottom
    this.#left = coords.left
    this.queueDraw()
  }

  coordsNormalizedToCanvasSize(): Coordinates {
    const { width, height } = this.canvas
    const size = this.#right - this.#left

    let top = this.#top
    let right = this.#right
    let bottom = this.#bottom
    let left = this.#left

    if (width < height) {
      const verticalChange = 0.5 * (height / width - 1) * size
      top += verticalChange
      bottom -= verticalChange
    }

    if (height < width) {
      const horizontalChange = 0.5 * (width / height - 1) * size
      left -= horizontalChange
      right += horizontalChange
    }

    return { top, right, bottom, left }
  }

  // (0, 0) will be bottom-left, (1, 1) will be top-right.
  // This behavior is the opposite of `offsetToCoords`.
  percentToCoords(x: number, y: number): Point {
    const { top, right, bottom, left } = this.coordsNormalizedToCanvasSize()

    return {
      x: x * (right - left) + left,
      y: y * (top - bottom) + bottom,
    }
  }

  // (0, 0) will be top-left, (width, height) will be bottom-right.
  // This behavior is the opposite of `percentToCoords`.
  offsetToCoords(x: number, y: number): Point {
    const { top, right, bottom, left } = this.coordsNormalizedToCanvasSize()

    return {
      x: (x / this.canvas.width) * devicePixelRatio * (right - left) + left,
      y:
        (1 - (y / this.canvas.height) * devicePixelRatio) * (top - bottom) +
        bottom,
    }
  }

  eventToCoords(event: { offsetX: number; offsetY: number }) {
    return this.offsetToCoords(event.offsetX, event.offsetY)
  }

  zoom(target: Point, scale: number) {
    const { top, right, bottom, left } = this.getCoords()

    const xCenter = (left + right) / 2
    const yCenter = (top + bottom) / 2
    const xAdj = (target.x - xCenter) * (1 - scale) + xCenter
    const yAdj = (target.y - yCenter) * (1 - scale) + yCenter

    this.setCoords({
      top: scale * (top - yCenter) + yAdj,
      right: scale * (right - xCenter) + xAdj,
      bottom: scale * (bottom - yCenter) + yAdj,
      left: scale * (left - xCenter) + xAdj,
    })
  }
}

function prevent(event: Event) {
  event.preventDefault()
}

export class WebGLInteractiveCoordinateCanvas extends WebGLCoordinateCanvas {
  static override of(canvas: HTMLCanvasElement): Result<WebGLCoordinateCanvas> {
    return super.of(canvas) as Result<WebGLCoordinateCanvas>
  }

  constructor(canvas: HTMLCanvasElement, context: WebGL2RenderingContext) {
    super(canvas, context)

    createEventListener(canvas, "wheel", (event: WheelEvent) => {
      event.preventDefault()

      const scale =
        0.99 -
        (Math.sqrt(Math.abs(event.deltaY)) * -Math.sign(event.deltaY)) / 100

      this.zoom(this.eventToCoords(event), scale)
    })

    createEventListener(canvas, "scroll", prevent)

    // Handles movement from pointers
    {
      let moveStart: Point | undefined
      let pointersDown = 0

      createEventListener(canvas, "pointermove", (event) => {
        event.preventDefault()

        if (pointersDown != 1) {
          return
        }

        if (!moveStart) {
          return
        }

        const { x, y } = this.eventToCoords(event)
        const { top, right, bottom, left } = this.getCoords()

        this.setCoords({
          top: top - (y - moveStart.y),
          right: right - (x - moveStart.x),
          bottom: bottom - (y - moveStart.y),
          left: left - (x - moveStart.x),
        })
      })

      createEventListener(canvas, "pointerdown", (event) => {
        pointersDown++
        moveStart = this.eventToCoords(event)
        this.canvas.setPointerCapture(event.pointerId)
      })

      createEventListener(document, "pointerup", () => {
        pointersDown--

        if (pointersDown < 0) {
          pointersDown = 0
        }

        moveStart = undefined
      })
    }

    // Handles movement and zooming from touchscreens
    {
      let previousDistance: number | undefined

      createEventListener(canvas, "touchmove", (event) => {
        event.preventDefault()

        const {
          touches: [a, b, c],
        } = event

        if (!a || c) {
          return
        }

        if (!b) {
          return
        }

        const { x, y } = canvas.getBoundingClientRect()

        const distance = Math.hypot(
          b.clientX - a.clientX,
          (b.clientY - a.clientY) ** 2
        )

        if (!previousDistance) {
          previousDistance = distance
          return
        }

        const xCenter = (a.clientX - x + b.clientX - x) / 2
        const yCenter = (a.clientY - y + b.clientY - y) / 2
        const center = this.offsetToCoords(xCenter, yCenter)

        if (distance > previousDistance) {
          this.zoom(center, 0.9)
        } else {
          this.zoom(center, 1.1)
        }

        previousDistance = distance
      })
    }
  }
}
