import {
  faCheck,
  faChevronRight,
  faMinus,
} from "@fortawesome/free-solid-svg-icons"
import { JSX, createEffect, createSignal } from "solid-js"
import { Fa } from "../Fa"

export function Checkbox(props: {
  onInput?(value: boolean): void
  marksGroup?: boolean
  checked?: boolean
  disabled?: boolean
  indeterminate?: boolean
}) {
  // TODO: hover and focus styles
  return (
    <>
      <input
        class="sr-only"
        classList={{ "z-group-checkbox": props.marksGroup }}
        type="checkbox"
        onInput={(event) => props.onInput?.(event.currentTarget.checked)}
        checked={props.checked}
        ref={(el) => {
          createEffect(() => (el.indeterminate = !!props.indeterminate))
        }}
        disabled={props.disabled}
      />

      <div
        class="group-checkbox flex h-6 cursor-pointer select-none items-center justify-center"
        role="button"
      >
        <div class="flex h-5 w-5 items-center justify-center rounded [:checked+.group-checkbox_&]:bg-[--z-bg-checkbox-selected] [:indeterminate+.group-checkbox_&]:bg-[--z-bg-checkbox-selected]">
          <div class="h-full w-full rounded border border-z [:checked+.group-checkbox_&]:hidden [:indeterminate+.group-checkbox_&]:hidden"></div>

          <Fa
            class="hidden h-4 w-4 icon-[--z-text-checkbox-selected] [:checked:not(:indeterminate)+.group-checkbox_&]:block"
            icon={faCheck}
            title="expand section"
          />

          <Fa
            class="hidden h-4 w-4 icon-[--z-text-checkbox-selected] [:indeterminate+.group-checkbox_&]:block"
            icon={faMinus}
            title="expand section"
          />
        </div>
      </div>
    </>
  )
}

export function CheckboxGroup(props: {
  label: string
  onExpanded?(value: boolean): void
  children?: JSX.Element
  expanded?: boolean
}) {
  const [expanding, setExpanding] = createSignal(false)
  const [checked, setChecked] = createSignal(false)
  const [indeterminate, setIndeterminate] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  let getInputs: () => HTMLCollectionOf<HTMLInputElement>

  return (
    <li class="flex flex-col" classList={{ "z-expanding": expanding() }}>
      <div class="flex w-full gap-2">
        <button onClick={() => props.onExpanded?.(!props.expanded)}>
          <Fa
            class={"h-3 w-3 transition" + (props.expanded ? " rotate-90" : "")}
            icon={faChevronRight}
            title="expand section"
          />
        </button>

        <label class="flex w-full gap-2">
          <Checkbox
            checked={checked()}
            indeterminate={indeterminate()}
            disabled={disabled()}
            marksGroup
            onInput={(checked) => {
              const cbs = Array.from(getInputs()).filter(
                (el) =>
                  el.type == "checkbox" &&
                  !el.classList.contains("z-group-checkbox"),
              )

              cbs.forEach((x) => {
                x.checked = checked
                x.dispatchEvent(new InputEvent("input", { bubbles: true }))
              })
            }}
          />

          <span>{props.label}</span>
        </label>
      </div>

      <div
        class="overflow-clip transition-[max-height]"
        classList={{
          "max-h-[--height]": props.expanded,
          "[&:has(.z-expanding)]:max-h-none": props.expanded,
          "max-h-0": !props.expanded,
        }}
        onTransitionStart={() => setExpanding(true)}
        onTransitionEnd={() => setExpanding(false)}
        inert={!props.expanded}
        aria-hidden={!props.expanded}
      >
        <ul
          class="flex flex-col gap-1 pl-6 [&>:first-child]:mt-1"
          ref={(el) => {
            const observer = new ResizeObserver(([entry]) => {
              const { height } = entry!.contentRect || entry!.contentBoxSize
              el.parentElement?.style.setProperty("--height", height + "px")
            })
            observer.observe(el, { box: "content-box" })

            const checkboxes = el.getElementsByTagName("input")
            function updateSelf() {
              const cbs = Array.from(checkboxes).filter(
                (el) =>
                  el.type == "checkbox" &&
                  !el.classList.contains("z-group-checkbox"),
              )

              const hasUnchecked = cbs.some((x) => !x.checked)
              const hasChecked = cbs.some((x) => x.checked)

              setIndeterminate(hasUnchecked && hasChecked)
              setChecked(!hasUnchecked)
              setDisabled(!hasUnchecked && !hasChecked)
            }

            updateSelf()
            el.addEventListener("input", updateSelf)

            getInputs = () => checkboxes
          }}
        >
          {props.children}
        </ul>
      </div>
    </li>
  )
}

export function CheckboxItem(props: {
  label: string
  onInput?(value: boolean): void
}) {
  return (
    <li class="flex flex-col">
      <label class="flex w-full gap-2 pl-5">
        <Checkbox onInput={props.onInput} />

        <span>{props.label}</span>
      </label>
    </li>
  )
}
