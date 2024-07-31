import { getSearchParam, setSearchParam } from "@/components/search-params"
import { createEventListener } from "../../create-event-listener"
import type { Result } from "../../result"
import type { Coordinates, Point } from "../types"
import {
  WebGLCoordinateCanvas,
  WebGLCoordinateCoordinateCanvasOptions,
} from "./coordinate"

function prevent(event: Event) {
  event.preventDefault()
}

export interface WebGLInteractiveCoordinateCanvasOptions
  extends WebGLCoordinateCoordinateCanvasOptions {
  saveCoordinates?: boolean
}

export class WebGLInteractiveCoordinateCanvas extends WebGLCoordinateCanvas {
  static override of(
    canvas: HTMLCanvasElement,
    options?: WebGLInteractiveCoordinateCanvasOptions,
  ): Result<WebGLInteractiveCoordinateCanvas> {
    return super.of(canvas, options) as Result<WebGLInteractiveCoordinateCanvas>
  }

  #saveCoordinates: boolean

  constructor(
    canvas: HTMLCanvasElement,
    context: WebGL2RenderingContext,
    options: WebGLInteractiveCoordinateCanvasOptions = {},
  ) {
    super(canvas, context, options)

    if (options.saveCoordinates) {
      const coords = this.getCoords()

      this.setCoords({
        top: +(
          getSearchParam("yStart") ?? +(getSearchParam("top") ?? coords.top)
        ),
        right: +(
          getSearchParam("xEnd") ?? +(getSearchParam("right") ?? coords.right)
        ),
        bottom: +(
          getSearchParam("yEnd") ?? +(getSearchParam("bottom") ?? coords.bottom)
        ),
        left: +(
          getSearchParam("xStart") ?? +(getSearchParam("left") ?? coords.left)
        ),
      })

      setSearchParam("xStart", null)
      setSearchParam("xEnd", null)
      setSearchParam("yStart", null)
      setSearchParam("yEnd", null)

      this.#saveCoordinates = true
    } else {
      this.#saveCoordinates = false
    }

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

      function onPointerUp() {
        pointersDown--

        if (pointersDown < 0) {
          pointersDown = 0
        }

        moveStart = undefined
      }

      createEventListener(document, "pointerup", onPointerUp)
      createEventListener(document, "contextmenu", onPointerUp)
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
          (b.clientY - a.clientY) ** 2,
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

  override setCoords(coords: Coordinates): void {
    super.setCoords(coords)

    if (this.#saveCoordinates) {
      setSearchParam("top", "" + coords.top)
      setSearchParam("right", "" + coords.right)
      setSearchParam("bottom", "" + coords.bottom)
      setSearchParam("left", "" + coords.left)
    }
  }
}
