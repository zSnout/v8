import { createEffect, createSignal, untrack } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"

export function SearchBarCore(props: {
  class?: string
  open: boolean
  main: JSX.Element
  drawer: (active: () => number) => JSX.Element
  options: number
}) {
  const [active, setActive] = createSignal(0)

  createEffect(() => {
    const choiceCount = props.options
    const currentChoice = untrack(active)

    if (currentChoice >= choiceCount) {
      setActive(choiceCount - 1)
    }
  })

  return (
    <div
      class={
        "relative rounded-lg border border-z text-z shadow transition focus-within:border-z-focus focus-within:ring focus-within:ring-z-focus" +
        (props.class ? " " + props.class : "")
      }
    >
      <div
        onKeyDown={(event) => {
          if (event.key == "ArrowDown") {
            setActive((x) => (x + 1) % props.options)
          } else if (event.key == "ArrowUp") {
            setActive((x) => {
              const choices = props.options
              return (((x - 1) % choices) + choices) % choices
            })
          } else {
            setActive(0)
          }
        }}
      >
        {props.main}
      </div>

      <div class="absolute left-0 top-full flex w-full translate-y-4 flex-col overflow-clip rounded-lg border border-z text-z shadow transition">
        {props.drawer(active)}
      </div>
    </div>
  )
}
