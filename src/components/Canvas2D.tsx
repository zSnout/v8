import { createEffect, onCleanup, untrack } from "solid-js"

export function Canvas2D(props: {
  class?: string
  pixelation?: () => number
  draw: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
}) {
  return (
    <canvas
      class={props.class}
      ref={(canvas) => {
        const context = canvas.getContext("2d")!

        if (!context) {
          return
        }

        function draw() {
          canvas.width =
            canvas.clientWidth * devicePixelRatio * (props.pixelation?.() ?? 1)

          canvas.height =
            canvas.clientHeight * devicePixelRatio * (props.pixelation?.() ?? 1)

          context.clearRect(0, 0, canvas.width, canvas.height)

          props.draw(context, canvas)
        }

        createEffect(draw)

        const observer = new ResizeObserver(() => untrack(draw))
        observer.observe(canvas, { box: "border-box" })
        onCleanup(() => observer.disconnect())
      }}
    />
  )
}
