import {
  type Accessor,
  createSignal,
  onCleanup,
  type Setter,
  untrack,
} from "solid-js"
import type { WebGLCoordinateCanvas } from "../canvas/coordinate"

export function trackTime(
  gl: WebGLCoordinateCanvas,
): readonly [
  time: Accessor<number>,
  speed: Accessor<number>,
  setSpeed: Setter<number>,
] {
  const start = Date.now()
  const [time, setTime] = createSignal(0)
  const [speed, setSpeed] = createSignal(1)

  gl.setReactiveUniformArray("u_time", () => [time(), 0])

  const intervalId = setInterval(() => {
    setTime(((Date.now() - start) / 1000) * untrack(speed))
  })

  onCleanup(() => clearInterval(intervalId))

  return [time, speed, setSpeed]
}
