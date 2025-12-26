import { DPR } from "@/components/pixel-ratio"
import type { Result } from "../../result"
import type { Coordinates, Point } from "../types"
import { WebGLCanvas, WebGLCanvasOptions } from "./base"

export interface WebGLCoordinateCoordinateCanvasOptions
  extends WebGLCanvasOptions {
  left?: number
  top?: number
  bottom?: number
  right?: number
}

export class WebGLCoordinateCanvas extends WebGLCanvas {
  static override vertMods =
    super.vertMods +
    "in vec4 i_coords;out vec4 coords;in vec4 i_coords_for_dual;out vec4 coords_for_dual;"

  static override vertMainMods =
    super.vertMainMods + "coords=i_coords;coords_for_dual=i_coords_for_dual;"

  static override of(
    canvas: HTMLCanvasElement,
    options?: WebGLCoordinateCoordinateCanvasOptions,
  ): Result<WebGLCoordinateCanvas> {
    return super.of(canvas, options) as Result<WebGLCoordinateCanvas>
  }

  #top = 1
  #right = 1
  #bottom = 0
  #left = 0

  constructor(
    canvas: HTMLCanvasElement,
    context: WebGL2RenderingContext,
    options: WebGLCoordinateCoordinateCanvasOptions = {},
  ) {
    super(canvas, context, options)

    if (options.left != null) {
      this.#left = options.left
    }

    if (options.right != null) {
      this.#right = options.right
    }

    if (options.top != null) {
      this.#top = options.top
    }

    if (options.bottom != null) {
      this.#bottom = options.bottom
    }
  }

  override draw() {
    const { top, right, bottom, left } = this.coordsNormalizedToCanvasSize()

    this.setAttribute("i_coords", {
      lt: [left, top],
      rt: [right, top],
      lb: [left, bottom],
      rb: [right, bottom],
    })

    this.setAttribute("i_coords_for_dual", {
      lt: [2 * (left - right) + right, 2 * (top - bottom) + bottom],
      rt: [right, 2 * (top - bottom) + bottom],
      lb: [2 * (left - right) + right, bottom],
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
      x: (x / this.canvas.width) * DPR() * (right - left) + left,
      y: (1 - (y / this.canvas.height) * DPR()) * (top - bottom) + bottom,
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
