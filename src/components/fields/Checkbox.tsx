import { faCheck } from "@fortawesome/free-solid-svg-icons"
import type { JSX } from "solid-js/jsx-runtime"
import { Fa } from "../Fa"

export type CheckboxProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type"
>

export function Checkbox(props: CheckboxProps) {
  return (
    <>
      <input
        {...props}
        checked={props.checked}
        class={(props.class || "") + " peer/checkbox sr-only"}
        type="checkbox"
      />

      <div
        aria-hidden="true"
        class="z-field flex h-6 w-6 cursor-pointer items-center justify-center rounded p-0 ring-z-focus peer-focus-visible/checkbox:border-z-focus peer-focus-visible/checkbox:ring"
        data-z-interactive
      >
        <Fa
          class="h-4 w-4 opacity-0 icon-z [.peer\/checkbox:checked~*>&]:opacity-100"
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
