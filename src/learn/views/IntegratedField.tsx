import { JSX } from "solid-js"
import { randomId } from "../id"
import { sanitize } from "../sanitize"

export function IntegratedField(props: {
  label: JSX.Element
  type: "html" | "text" | "number"
  placeholder?: string
  font?: string
  sizePx?: number
  rtl: boolean
  value?: string
  onInput?: (value: string) => void
  emptyBg?: boolean
}) {
  const id = randomId().toString()
  let el!: HTMLDivElement

  return (
    <div
      class="z-field flex cursor-text flex-col rounded-lg p-0 shadow-none"
      classList={{
        "bg-z-body-selected": !props.emptyBg,
        "border-transparent": !props.emptyBg,
      }}
      onMouseDown={(event) => {
        if (event.currentTarget == event.target) {
          event.preventDefault()
          el.focus()
        }
      }}
    >
      <div
        id={id}
        class="mb-1 w-full select-none px-2 pt-1 text-sm text-z-subtitle"
        onMouseDown={(event) => {
          event.preventDefault()
          el.focus()
        }}
        contentEditable={false}
      >
        {props.label}
      </div>

      {props.type == "html" ? (
        <div
          ref={(e) => {
            el = e
            el.innerHTML = sanitize(props.value ?? "")
          }}
          aria-labelledby={id}
          class="-mt-1 w-full bg-transparent px-2 pb-1 focus:outline-none"
          contentEditable
          tabIndex={0}
          style={{
            "font-family": props.font,
            "font-size": props.sizePx ? `${props.sizePx / 16}rem` : "",
          }}
          dir={props.rtl ? "rtl" : "ltr"}
          onInput={(el) => props.onInput?.(el.currentTarget.innerHTML)}
        />
      ) : (
        <input
          ref={(e) => (el = e)}
          type={props.type}
          class="z-field-number -mt-1 block w-full bg-transparent px-2 pb-1 placeholder:text-z-subtitle placeholder:opacity-30 focus:outline-none"
          aria-labelledby={id}
          onInput={(el) => props.onInput?.(el.currentTarget.value)}
          value={props.value}
          placeholder={props.placeholder}
          style={{
            "font-family": props.font,
            "font-size": props.sizePx ? `${props.sizePx / 16}rem` : "",
          }}
        />
      )}
    </div>
  )
}
