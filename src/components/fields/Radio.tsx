import {
  createEffect,
  createMemo,
  createSignal,
  For,
  JSX,
  untrack,
} from "solid-js"

export function Radio<T extends string>(props: {
  class?: string
  label: string
  options: readonly T[]
  get: () => T
  set: (value: T) => void
}) {
  const [container, setContainer] = createSignal<HTMLDivElement>()

  const [left, setLeft] = createSignal(0)
  const [top, setTop] = createSignal(0)
  const [width, setWidth] = createSignal(0)
  const [height, setHeight] = createSignal(0)

  return (
    <div
      class={
        "z-field relative flex w-full cursor-pointer flex-wrap gap-0.5 rounded-lg border border-z bg-z-body p-0.5 shadow transition " +
        (props.class || "")
      }
      role="radiogroup"
      aria-label={props.label}
      ref={setContainer}
      data-z-interactive
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key == "ArrowLeft" ||
          event.key == "ArrowRight" ||
          event.key == "ArrowUp" ||
          event.key == "ArrowDown"
        ) {
          let index = props.options.indexOf(props.get())

          if (index == -1) {
            index =
              event.key == "ArrowLeft" || event.key == "ArrowUp"
                ? props.options.length
                : -1
          }

          const newIndex =
            (index +
              (event.key == "ArrowLeft" || event.key == "ArrowUp" ? -1 : 1) +
              props.options.length) %
            props.options.length

          props.set(props.options[newIndex]!)
        }
      }}
    >
      <div
        class="absolute rounded bg-z-body-selected transition-all"
        style={{
          left: `${left() - 1}px`,
          top: `${top() - 1}px`,
          width: `${width()}px`,
          height: `${height()}px`,
        }}
      />

      <For each={props.options}>
        {(option) => {
          const isActive = createMemo(() => props.get() == option)

          return (
            <div
              aria-checked={isActive()}
              class="relative flex-1 rounded px-1 py-1 text-center font-mono text-xs text-z transition"
              onClick={() => props.set(option)}
              role="radio"
              ref={(button) => {
                createEffect(() => {
                  if (isActive()) {
                    const containerBox = container()?.getBoundingClientRect()

                    if (!containerBox) {
                      return
                    }

                    const myBox = button.getBoundingClientRect()

                    setLeft(myBox.left - containerBox.left)
                    setTop(myBox.top - containerBox.top)
                    setWidth(myBox.width)
                    setHeight(myBox.height)
                  }
                })
              }}
            >
              {option}
            </div>
          )
        }}
      </For>
    </div>
  )
}

export function CheckboxGroup(props: {
  class?: string
  options: readonly (readonly [
    label: JSX.Element,
    get: () => boolean,
    set: (value: boolean) => void,
  ])[]
}) {
  return (
    <div
      class={
        "z-field relative flex w-full cursor-pointer flex-wrap gap-0.5 rounded-lg border border-z bg-z-body p-0.5 shadow transition " +
        (props.class || "")
      }
    >
      <For each={props.options}>
        {([label, get, set]) => {
          return (
            <button
              aria-checked={get()}
              class="relative flex-1 rounded px-1 py-1 text-center font-mono text-xs text-z transition"
              classList={{
                "bg-z-body-selected": get(),
              }}
              onClick={() => set(!untrack(get))}
              role="checkbox"
            >
              {label}
            </button>
          )
        }}
      </For>
    </div>
  )
}
