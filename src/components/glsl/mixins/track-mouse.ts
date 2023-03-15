import { createEventListener } from "@/components/create-event-listener"
import { createSignal } from "solid-js"
import type { WebGLCoordinateCanvas } from "../canvas/coordinate"
import type { Vec2 } from "../types"

export function trackMouse(gl: WebGLCoordinateCanvas) {
  const [mouse, setMouse] = createSignal<Vec2>([0, 0])

  gl.setReactiveUniformArray("u_mouse", mouse)

  createEventListener(document, "pointermove", ({ clientX, clientY }) => {
    const box = gl.canvas.getBoundingClientRect()

    const { x, y } = gl.offsetToCoords(clientX - box.x, clientY - box.y)

    setMouse([x, y])
  })

  return mouse
}
