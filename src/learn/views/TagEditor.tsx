import { createEffect, createSignal, For } from "solid-js"
import { randomId } from "../id"

export function TagEditor(props: {
  value?: string
  onChange?: (value: string) => void
}) {
  const [tags, __unsafeSetTags] = createSignal(
    props.value?.split(/\s+/g).filter((x) => x) || [],
  )
  const setTags = (tags: string[] | ((x: string[]) => string[])) => {
    props.onChange?.(__unsafeSetTags(tags).join(" "))
  }
  createEffect(() => {
    if (props.value != tags().join(" ")) {
      setTags(props.value?.split(/\s+/g).filter((x) => x) || [])
    }
  })
  let el: HTMLInputElement
  const id = randomId() + ""

  return (
    <div class="flex flex-col">
      <label
        for={id}
        class="mb-1 w-full select-none text-sm text-z-subtitle"
        onMouseDown={(event) => {
          event.preventDefault()
          el.focus()
        }}
        contentEditable={false}
      >
        Tags
      </label>

      <div
        class="flex flex-wrap gap-1"
        onKeyDown={(event) => {
          if (event.metaKey || event.altKey || event.ctrlKey) {
            return
          }

          if (event.target instanceof HTMLInputElement) {
            if (
              (event.key == "ArrowLeft" || event.key == "Backspace") &&
              (event.target.selectionStart != event.target.selectionEnd ||
                event.target.selectionStart != 0)
            ) {
              return
            }

            if (
              event.key == "Right" &&
              (event.target.selectionStart != event.target.selectionEnd ||
                event.target.selectionStart != event.target.value.length)
            ) {
              return
            }
          }

          if (event.key == "ArrowLeft") {
            const tag = event.target.previousElementSibling
            if (tag && tag instanceof HTMLElement) {
              tag.focus()
              event.preventDefault()
              return
            }
          }

          if (event.key == "ArrowRight") {
            const tag = event.target.nextElementSibling
            if (tag && tag instanceof HTMLElement) {
              tag.focus()
              event.preventDefault()
              return
            }
          }

          if (event.key == "Backspace") {
            const { target } = event
            if (target instanceof HTMLButtonElement) {
              const next = (target.previousElementSibling ||
                target.nextElementSibling) as HTMLElement
              setTags((tags) => {
                const next = tags.slice()
                next.splice(+target.dataset["index"]!, 1)
                return next
              })
              next.focus()
              event.preventDefault()
              return
            } else if (target instanceof HTMLInputElement) {
              const tag = event.target.previousElementSibling
              if (tag && tag instanceof HTMLElement) {
                tag.focus()
                event.preventDefault()
                return
              }
            }
          }
        }}
      >
        <For each={tags()}>
          {(tag, index) => (
            <button
              class="flex-1 select-none rounded-lg border border-transparent bg-z-body-selected px-2 py-1 text-center hover:invert focus:outline-none focus:invert"
              tabIndex={-1}
              data-index={index()}
              onClick={() => setTags((tags) => tags.toSpliced(index(), 1))}
            >
              {tag}
            </button>
          )}
        </For>

        <input
          type="text"
          ref={(e) => (el = e)}
          class="z-field min-w-[min(8rem,100%)] flex-[1000] px-2 py-1 shadow-none"
          contentEditable
          tabIndex={0}
          onInput={(el) => {
            const { value } = el.currentTarget
            if (!/\s/.test(value)) {
              return
            }

            const list = value.split(/\s+/g)
            const last = list.pop()!
            setTags((tags) => tags.concat(list.filter((x) => x)))
            el.currentTarget.value = last
          }}
          onKeyDown={(el) => {
            if (el.altKey || el.ctrlKey || el.metaKey || el.key != "Enter") {
              return
            }

            const { value } = el.currentTarget
            if (!/\S/.test(value)) {
              return
            }

            const list = value.split(/\s+/g)
            setTags((tags) => tags.concat(list.filter((x) => x)))
            el.currentTarget.value = ""
          }}
          onBlur={(el) => {
            const { value } = el.currentTarget
            if (!/\S/.test(value)) {
              return
            }

            const list = value.split(/\s+/g)
            setTags((tags) => tags.concat(list.filter((x) => x)))
            el.currentTarget.value = ""
          }}
        />
      </div>
    </div>
  )
}
