import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { createSignal } from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { Fa } from "../Fa"

export type CheckboxProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>
}

export function Checkbox(props: CheckboxProps) {
  const [checked, setChecked] = createSignal(props.checked ?? false)

  return (
    <>
      <input
        {...props}
        checked={checked()}
        class={(props.class || "") + " peer/checkbox sr-only"}
        onInput={(event) => {
          setChecked(event.currentTarget.checked)
          props.onInput?.(event)
        }}
        type="checkbox"
      />

      <div
        aria-hidden="true"
        class="field flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm p-0 ring-z-focus peer-focus-visible/checkbox:border-z-focus peer-focus-visible/checkbox:ring"
        data-z-interactive
      >
        <Fa
          class="h-4 w-4 opacity-0 icon-stroke-z [.peer\/checkbox:checked~*>&]:opacity-100"
          icon={faCheck}
          title="Checkbox"
        />
      </div>
    </>
  )
}

export function LabeledCheckbox(props: CheckboxProps & { label: string }) {
  return (
    <label class="flex select-none gap-2.5">
      <Checkbox {...props} />

      {props.label}
    </label>
  )
}
