import { Accessor, createMemo, createSignal } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { OverflowMainWidth } from "../OverflowMainWidth"

export interface RadioItemOption<T> {
  value: Exclude<T, Function>
  name: string
  description: JSX.Element
}

export interface DetailedRadioItemProps<T> extends RadioItemOption<T> {
  class?: string
  selected(): T
  setSelected?(value: T): void
}

export function DetailedRadioItem<const T>(props: DetailedRadioItemProps<T>) {
  const checked = createMemo(() => props.selected() === props.value)

  return (
    <label
      class={
        "min-w-[13rem] max-w-[13rem] flex-1 cursor-pointer rounded px-3 py-2 transition " +
        (props.class || "")
      }
      classList={{
        "bg-z-radio": !checked(),
        "hover:bg-z-radio-active": !checked(),
        "bg-z-radio-selected": checked(),
      }}
    >
      <input
        checked={checked()}
        class="sr-only"
        type="radio"
        onInput={() => props.setSelected?.(props.value)}
      />

      <div class="flex gap-2.5 pb-2">
        <div
          class="mt-1 flex h-4 w-4 items-center justify-center rounded transition"
          classList={{
            "bg-z-body": !checked(),
            "bg-z-radio-selected-item": checked(),
          }}
        >
          <div
            class="h-1.5 w-1.5 rounded-sm transition"
            classList={{
              "bg-z-body": checked(),
            }}
          />
        </div>

        <p>{props.name}</p>
      </div>

      <div class="text-sm text-z-subtitle">{props.description}</div>
    </label>
  )
}

export interface DetailedRadioGroupProps<T> {
  class?: string
  value?: T
  onChange?(value: T): void
  options: readonly [RadioItemOption<T>, ...RadioItemOption<T>[]]
}

export function DetailedRadioGroup<const T>(props: DetailedRadioGroupProps<T>) {
  const [selected, setRawSelected] = createSignal<T>(
    props.value || props.options[0].value,
  )

  function setSelected(value: Exclude<T, Function>) {
    setRawSelected(value)
    props.onChange?.(value)
  }

  return (
    <OverflowMainWidth>
      <div
        class={(props.class || "") + " flex min-w-full justify-center gap-4"}
      >
        {props.options.map((item) =>
          DetailedRadioItem({ ...item, selected, setSelected }),
        )}
      </div>
    </OverflowMainWidth>
  )
}

export function LabeledDetailedRadioGroup<const T>(
  props: DetailedRadioGroupProps<T> & { label: string },
) {
  return (
    <div class={"mt-6 " + (props.class || "")}>
      <p class="mb-4 border-b border-z text-lg font-bold">{props.label}</p>

      <DetailedRadioGroup
        onChange={props.onChange}
        options={props.options}
        value={props.value}
      />
    </div>
  )
}

export interface QuadRadioGroupProps<T> extends DetailedRadioGroupProps<T> {
  options: readonly [
    RadioItemOption<T>,
    RadioItemOption<T>,
    RadioItemOption<T>,
    RadioItemOption<T>,
  ]
}

export function QuadRadioGroup<const T>(props: QuadRadioGroupProps<T>) {
  const [selected, setRawSelected] = createSignal<T>(
    props.value || props.options[0].value,
  )

  function setSelected(value: Exclude<T, Function>) {
    setRawSelected(value)
    props.onChange?.(value)
  }

  return (
    <div
      class={
        (props.class || "") + " grid grid-cols-[13rem,13rem] grid-rows-2 gap-1"
      }
    >
      <DetailedRadioItem
        {...props.options[0]}
        class="rounded-sm rounded-tl-lg"
        selected={selected}
        setSelected={setSelected}
      />

      <DetailedRadioItem
        {...props.options[1]}
        class="rounded-sm rounded-tr-lg"
        selected={selected}
        setSelected={setSelected}
      />

      <DetailedRadioItem
        {...props.options[2]}
        class="rounded-sm rounded-bl-lg"
        selected={selected}
        setSelected={setSelected}
      />

      <DetailedRadioItem
        {...props.options[3]}
        class="rounded-sm rounded-br-lg"
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  )
}

export function LabeledQuadRadioGroup<const T>(
  props: QuadRadioGroupProps<T> & { label: string },
) {
  return (
    <div class={"mt-6 flex w-min flex-col " + (props.class || "")}>
      <p class="mb-1 text-center text-lg font-bold">{props.label}</p>

      <QuadRadioGroup
        onChange={props.onChange}
        options={props.options}
        value={props.value}
      />
    </div>
  )
}

export function createLabeledQuadRadioGroup<const T>(
  props: QuadRadioGroupProps<T> & { label: string },
): [Accessor<T>, JSX.Element] {
  const [get, set] = createSignal<T>(props.value || props.options[0].value)

  return [get, <LabeledQuadRadioGroup {...props} onChange={set} />]
}
