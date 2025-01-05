import { ErrorBoundary } from "@/components/Error"
import { WebGLInteractiveCoordinateCanvas } from "@/components/glsl/canvas/interactive"
import { trackMouse } from "@/components/glsl/mixins/track-mouse"
import { trackTime } from "@/components/glsl/mixins/track-time"
import { unwrap } from "@/components/result"
import fragmentSource from "./fragment.glsl"

export function Main() {
  return (
    <>
      <ErrorBoundary>
        <canvas
          class="h-full w-full touch-none"
          ref={(canvas) => {
            const gl = unwrap(
              class extends WebGLInteractiveCoordinateCanvas {
                override draw() {
                  const { bottom, left, right, top } =
                    this.coordsNormalizedToCanvasSize()

                  const gridWidth = right - left
                  const gridHeight = top - bottom

                  this.setUniform(
                    "u_pixel",
                    gridWidth / this.canvas.clientWidth,
                    gridHeight / this.canvas.clientHeight,
                  )

                  super.draw()
                }
              }.of(canvas, {
                saveCoordinates: true,
                top: 10,
                right: 10,
                bottom: -10,
                left: -10,
              }),
            )

            gl.load(fragmentSource)
            gl.draw()

            trackMouse(gl)
            trackTime(gl)

            gl.draw()
          }}
        />
      </ErrorBoundary>
    </>
  )
}
