import { createSignal, For, JSX } from "solid-js"
import { randomId } from "../id"
import { sanitize } from "../sanitize"

function IntegratedTagField(
  props: {
    placeholder?: string
    font?: string
    sizePx?: number
    value?: string
    onInput?: (value: string) => void
    emptyBg?: boolean
  },
  id: string,
): JSX.Element {
  const [tags, setTags] = createSignal(
    props.value
      ?.split(/\s+/g)
      .map((x) => x.trim())
      .filter((x) => x) || [],
  )

  function value(field: string) {
    const a = tags().join(" ")
    if (a && field) {
      return a + " " + field
    } else {
      return a || field
    }
  }

  return (
    <div class="flex flex-wrap gap-1 px-2 pb-2">
      <For each={tags()}>
        {(word) => (
          <div class="flex-1 rounded bg-z-body px-1 text-center">{word}</div>
        )}
      </For>

      <input
        type="text"
        class="-mb-2 -mt-1 block min-w-[min(12rem,100%)] flex-[1024] bg-transparent pb-1 placeholder:text-z-subtitle placeholder:opacity-30 focus:outline-none"
        aria-labelledby={id}
        onInput={(el) => {
          const rawValue = el.currentTarget.value
          const values = rawValue.split(/\s+/g)
          if (values.length > 1) {
            const last = values.pop()!
            const next = values.map((x) => x.trim()).filter((x) => x)
            setTags((tags) => tags.concat(next))
            el.currentTarget.value = last
          }
          props.onInput?.(value(el.currentTarget.value))
        }}
        onBlur={(el) => {
          const rawValue = el.currentTarget.value
          const values = rawValue.split(/\s+/g)
          const next = values.map((x) => x.trim()).filter((x) => x)
          setTags((tags) => tags.concat(next))
          el.currentTarget.value = ""
          props.onInput?.(value(el.currentTarget.value))
        }}
        onKeyDown={(el) => {
          if (el.ctrlKey || el.altKey || el.metaKey || el.key != "Enter") {
            return
          }

          const rawValue = el.currentTarget.value
          const values = rawValue.split(/\s+/g)
          const next = values.map((x) => x.trim()).filter((x) => x)
          setTags((tags) => tags.concat(next))
          el.currentTarget.value = ""
          props.onInput?.(value(el.currentTarget.value))
        }}
        placeholder={tags().length == 0 ? props.placeholder : ""}
        style={{
          "font-family": props.font,
          "font-size": props.sizePx ? `${props.sizePx / 16}rem` : "",
        }}
      />
    </div>
  )
}

export function IntegratedField(props: {
  label: JSX.Element
  type: "html" | "tags" | "text" | "number"
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
      ) : props.type == "tags" ? (
        IntegratedTagField(props, id)
      ) : (
        <input
          ref={(e) => (el = e)}
          type={props.type}
          class="z-field-number -mt-1 block w-full bg-transparent px-2 pb-1 placeholder:text-z-subtitle placeholder:opacity-30 focus:outline-none"
          aria-labelledby={id}
          onInput={(el) => props.onInput?.(el.currentTarget.value)}
          value={props.value ?? ""}
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
