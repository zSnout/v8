import { createEventListener } from "./create-event-listener"
import type { Point } from "./glsl/canvas/base"

const interactiveTags = ["A", "BUTTON", "INPUT", "TEXTAREA"]

function isInteractive(event: Event) {
  for (const el of event.composedPath()) {
    if (
      el instanceof HTMLElement &&
      (interactiveTags.includes(el.tagName) || el.dataset.zInteractive != null)
    ) {
      return true
    }
  }

  return false
}

export function draggable(element: HTMLElement) {
  createEventListener(element, "pointerdown", init)

  function init(event: PointerEvent) {
    if (isInteractive(event)) {
      return
    }

    element.removeEventListener("pointerdown", init)

    const { x, y } = element.getBoundingClientRect()
    let top = y
    let left = x

    element.classList.add("fixed")
    element.style.top = top + "px"
    element.style.left = left + "px"
    element.style.maxWidth = "calc(100% - 1rem)"

    let pointersDown = 0
    let moveStart: Point | undefined
    let moveStartOffset: Point = { x: 0, y: 0 }

    function setPosition(newLeft: number, newTop: number) {
      const { width, height } = element.getBoundingClientRect()

      top = newTop
      left = newLeft

      element.style.top =
        Math.min(innerHeight - height - 8, Math.max(8, newTop)) + "px"

      element.style.left =
        Math.min(innerWidth - width - 8, Math.max(8, newLeft)) + "px"
    }

    createEventListener(element, "pointermove", (event) => {
      event.preventDefault()

      if (pointersDown != 1) {
        return
      }

      if (!moveStart) {
        return
      }

      setPosition(
        event.clientX - moveStart.x + moveStartOffset.x,
        event.clientY - moveStart.y + moveStartOffset.y,
      )
    })

    function onPointerDown(event: PointerEvent) {
      if (isInteractive(event)) {
        return
      }

      pointersDown++

      const { width, height } = element.getBoundingClientRect()
      top = Math.min(innerHeight - height - 8, Math.max(8, top))
      left = Math.min(innerWidth - width - 8, Math.max(8, left))

      moveStart = { x: event.clientX, y: event.clientY }
      moveStartOffset = { x: left, y: top }
      element.setPointerCapture(event.pointerId)
    }

    createEventListener(element, "pointerdown", onPointerDown)

    createEventListener(document, "pointerup", () => {
      pointersDown--

      if (pointersDown <= 0) {
        pointersDown = 0
      }

      moveStart = undefined
    })

    createEventListener(document, "resize", () => {
      setPosition(left, top)
    })

    onPointerDown(event)
  }
}
