import { Fa } from "@/components/Fa"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { createEffect, createMemo, createSignal, For, Show } from "solid-js"

export function AutocompleteBox<T extends string>(props: {
  options: readonly T[]
  value?: string
  onInput?: (value: string) => void
  onChange?: (value: T) => void
}) {
  const [field, setField] = createSignal(
    props.options.includes(props.value as T) ? props.value! : "",
  )

  const matchingRaw = createMemo(() => {
    const f = field().toLowerCase()

    const result = props.options
      .map((option) => {
        const index = option.toLowerCase().indexOf(f)
        return [option, index == -1 ? 1 / 0 : index] as const
      })
      .sort(([, a], [, b]) => a - b)

    const infinity = result.findIndex(([, v]) => v == 1 / 0)

    return { result, infinity }
  })

  const matching = () => matchingRaw().result
  const infIndex = () => matchingRaw().infinity

  const [selected, setSelected] = createSignal(0)

  const [attemptedBlur, setAttemptedBlur] = createSignal<1>()

  return (
    <div class="h-[calc(2rem_+_2px)]">
      <div class="z-field relative z-10 overflow-clip border-z-bg-body-selected p-0 shadow-none">
        <input
          class="peer w-full bg-z-body-selected px-2 py-1 text-z transition focus:bg-z-body focus:outline-none"
          type="text"
          onKeyDown={(event) => {
            if (event.metaKey || event.ctrlKey || event.altKey) {
              return
            }

            if (event.key == "ArrowUp" || event.key == "ArrowDown") {
              const dir = event.key == "ArrowUp" ? -1 : 1
              setSelected((x) => {
                const matches = matching().length
                return (x + dir + matches) % matches
              })
              event.preventDefault()
              return
            }

            if (event.key == "Enter") {
              const choice = matching()[selected()]
              if (choice) {
                setField(() => choice[0])
                setAttemptedBlur()
                props.onInput?.(choice[0])
                props.onChange?.(choice[0])
                setSelected(0)
              }
              event.preventDefault()
              event.currentTarget.blur()
              return
            }
          }}
          onInput={(event) => {
            if (event.currentTarget.textContent?.includes("\n")) {
              event.currentTarget.textContent =
                event.currentTarget.textContent.replaceAll("\n", "")
            }

            setField(event.currentTarget.value)
            setAttemptedBlur()
            props.onInput?.(event.currentTarget.value)
            setSelected(0)
          }}
          onBlur={(event) => {
            const choice = matching()[selected()]
            if (choice) {
              setField(() => choice[0])
              setAttemptedBlur()
              props.onInput?.(choice[0])
              props.onChange?.(choice[0])
              setSelected(0)
              return
            }

            if (props.options.includes(field() as T)) {
              props.onChange?.(field() as T)
              return
            }

            setAttemptedBlur(1)
            event.currentTarget.focus()
          }}
          value={field()}
        />

        <div class="pointer-events-none absolute right-0 top-0 flex h-8 w-8 items-center justify-center">
          <Fa class="h-4 w-4" icon={faChevronDown} title="show dropdown" />
        </div>

        <div class="hidden max-h-48 select-none flex-col overflow-y-auto rounded-b-lg border-t border-z bg-z-body transition-all peer-focus:flex">
          <For
            each={matching()}
            fallback={
              <div class="px-2 py-0.5 italic">
                That option does not exist.
                <Show when={attemptedBlur()}>
                  <br />
                  Select an option to continue.
                </Show>
              </div>
            }
          >
            {([match, pos], index) => (
              <button
                class="border-dashed border-z px-2 py-0.5 text-left"
                classList={{
                  "bg-z-body-selected": index() == selected(),
                  "border-t": index() != 0 && infIndex() == index(),
                  "-mt-px": index() != 0 && infIndex() == index(),
                }}
                ref={(el) => {
                  createEffect(() => {
                    if (index() == selected()) {
                      el.scrollIntoView({ block: "nearest", inline: "nearest" })
                    }
                  })
                }}
                onClick={(event) => {
                  setField(() => match)
                  setAttemptedBlur()
                  props.onInput?.(match)
                  props.onChange?.(match)
                  setSelected(0)
                  event.currentTarget.blur()
                }}
                onMouseOver={() => {
                  setSelected(index())
                }}
                tabIndex={-1}
              >
                <span>{match.slice(0, pos)}</span>
                <span class="font-semibold text-z-heading">
                  {match.slice(pos, pos + field().length)}
                </span>
                <span>{match.slice(pos + field().length)}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
