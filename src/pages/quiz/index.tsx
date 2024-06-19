import { Fa } from "@/components/Fa"
import {
  faCheck,
  faChevronRight,
  faMinus,
} from "@fortawesome/free-solid-svg-icons"
import { JSX, Show, createEffect, createSignal } from "solid-js"

export type Json =
  | string
  | number
  | boolean
  | null
  | readonly Json[]
  | { readonly [x: string]: Json }

export interface Card {
  front: JSX.Element
  back: JSX.Element
  group: string
  id: Json
  answerShown: boolean
}

export function Main() {
  const [card, setCard] = createSignal<Card>({
    front: "7:00",
    back: "しちじ",
    group: "jp::time::oclock",
    id: 7,
    answerShown: true,
  })

  const [expanded, setExpanded] = createSignal(false)
  const [expanded2, setExpanded2] = createSignal(false)

  return (
    <div class="flex flex-1 items-start gap-6">
      <div class="flex h-full w-full flex-1 flex-col items-start gap-4">
        <div class="flex w-full flex-1 flex-col gap-4">
          <div class="text-center text-6xl font-semibold text-z-heading sm:text-7xl md:text-8xl lg:text-9xl">
            {card().front}
          </div>

          <Show when={card().answerShown}>
            <hr class="border-z" />

            <div class="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              {card().back}
            </div>
          </Show>
        </div>

        <div class="sticky bottom-0 -mb-8 flex w-full flex-col pb-8">
          <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

          <div class="-mb-8 w-full bg-z-body pb-8">
            <Show
              fallback={
                <button
                  class="rounded bg-z-body-selected py-2"
                  onClick={() => setCard((c) => ({ ...c, answerShown: true }))}
                >
                  Show Answer
                </button>
              }
              when={card().answerShown}
            >
              <div class="grid grid-cols-3 gap-1 text-base/[1.25] md:gap-2">
                <button class="rounded bg-red-300 py-2 text-red-900">
                  Again
                </button>
                <button class="rounded bg-[#ffcc91] py-2 text-yellow-900">
                  Hard
                </button>
                <button class="rounded bg-green-300 py-2 text-green-900">
                  Good
                </button>
              </div>
            </Show>
          </div>
        </div>
      </div>

      <div class="hidden w-48 sm:flex md:w-72">
        <div class="fixed bottom-8 right-0 top-20 flex w-[13.5rem] flex-col overflow-y-auto border-l border-z px-4 py-2 md:w-[19.5rem]">
          <ul class="flex flex-col gap-1">
            <CheckboxGroup
              label="Hiragana"
              expanded={expanded()}
              onExpanded={setExpanded}
            >
              <CheckboxItem label="Basic" />

              <CheckboxItem label="Dakuten" />

              <CheckboxItem label="Combinations" />

              <CheckboxGroup
                label="Obscure"
                expanded={expanded2()}
                onExpanded={setExpanded2}
              >
                <CheckboxItem label="wi we" />
                <CheckboxItem label="yi ye wu" />
              </CheckboxGroup>
            </CheckboxGroup>

            <CheckboxGroup
              label="Katakana"
              expanded={expanded()}
              onExpanded={setExpanded}
            />

            <CheckboxGroup
              label="Numbers"
              expanded={expanded()}
              onExpanded={setExpanded}
            />
          </ul>
        </div>
      </div>
    </div>
  )
}

function Checkbox(props: {
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

function CheckboxGroup(props: {
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

function CheckboxItem(props: {
  label: string
  onInput?(value: boolean): void
  children?: JSX.Element
}) {
  return (
    <li class="flex flex-col">
      <label class="flex w-full gap-2 pl-5">
        <Checkbox onInput={props.onInput} />

        <span>{props.label}</span>
      </label>

      <div class="relative" inert>
        <ul class="flex flex-col gap-1 pl-6 [&>:first-child]:mt-1">
          {props.children}
        </ul>
      </div>
    </li>
  )
}
