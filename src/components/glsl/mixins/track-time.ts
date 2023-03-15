import { createSignal, onCleanup } from "solid-js"
import type { WebGLCoordinateCanvas } from "../canvas/coordinate"

export function trackTime(gl: WebGLCoordinateCanvas) {
  const start = Date.now()
  const [time, setTime] = createSignal(0)

  gl.setReactiveUniform("u_time[0]", time)

  const intervalId = setInterval(() => {
    setTime(Date.now() - start)
  })

  onCleanup(() => clearInterval(intervalId))

  return time
}
