import {
  faCheck,
  faChevronRight,
  faMinus,
} from "@fortawesome/free-solid-svg-icons"
import {
  Accessor,
  For,
  JSX,
  Setter,
  createEffect,
  createSignal,
  untrack,
} from "solid-js"
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
          "max-h-[--max-height]": props.expanded,
          "[&:has(.z-expanding)]:max-h-auto": props.expanded,
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
              el.parentElement?.style.setProperty("--max-height", height + "px")
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
  checked?: boolean
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

type Json = string | number | boolean | null | readonly Json[] | JsonObject

type JsonObject = { readonly [x: string]: Json }

export type TreeOf<T> = { [name: string]: TreeOf<T> | T }

export type DataV1 = {
  version: 1
  enabled: TreeOf<boolean>
  expanded: TreeOf<boolean>
}

export class Tree<T> {
  enabled: Accessor<TreeOf<boolean>>
  setEnabled: Setter<TreeOf<boolean>>

  // the "" key is used in these trees to mark whether a group is expanded
  expanded: Accessor<TreeOf<boolean>>
  setExpanded: Setter<TreeOf<boolean>>

  constructor(readonly tree: TreeOf<T>) {
    ;[this.enabled, this.setEnabled] = createSignal(Object.create(null))
    ;[this.expanded, this.setExpanded] = createSignal(Object.create(null))
  }

  toggleEnabled(parent: readonly string[], key: string, enabled: boolean) {
    const full = structuredClone(this.enabled())
    let obj = full

    for (const k of parent) {
      const next = obj[k]

      if (typeof next == "object") {
        obj = next
      } else {
        obj = obj[k] = {}
      }
    }

    obj[key] = enabled

    this.setEnabled(full)
  }

  toggleExpanded(parent: readonly string[], key: string, expanded: boolean) {
    const full = structuredClone(this.expanded())
    let obj = full

    for (const k of [...parent, key]) {
      const next = obj[k]

      if (typeof next == "object") {
        obj = next
      } else {
        obj = obj[k] = {}
      }
    }

    obj[""] = expanded

    this.setExpanded(full)
  }

  isEnabled(parent: readonly string[], key: string) {
    let obj = this.enabled()

    for (const k of parent) {
      const next = obj[k]

      if (typeof next == "object") {
        obj = next
      } else {
        return false
      }
    }

    const next = obj[key]

    if (typeof next == "boolean") {
      return next
    }

    return false
  }

  isExpanded(parent: readonly string[], key: string) {
    let obj = this.expanded()

    for (const k of parent) {
      const next = obj[k]

      if (typeof next == "object") {
        obj = next
      } else {
        return false
      }
    }

    const next = obj[key]

    if (typeof next == "object") {
      const final = next[""]

      if (typeof final == "boolean") {
        return final
      }
    }

    return false
  }

  importV1(data: object) {
    function checkIsBoolTree(tree: unknown): tree is TreeOf<boolean> {
      if (
        typeof tree != "object" ||
        tree == null ||
        // instanceof satisfies TypeScript, Array.isArray satisfies the browser
        tree instanceof Array ||
        Array.isArray(tree)
      ) {
        return false
      }

      for (const key in tree) {
        const val = (tree as Record<string, unknown>)[key]

        if (
          typeof val == "object"
            ? !checkIsBoolTree(val)
            : typeof val != "boolean"
        ) {
          return false
        }
      }

      return true
    }

    if ("enabled" in data && checkIsBoolTree(data.enabled)) {
      this.setEnabled(data.enabled)
    }

    if ("expanded" in data && checkIsBoolTree(data.expanded)) {
      this.setExpanded(data.expanded)
    }
  }

  importJSON(data: unknown) {
    if (
      typeof data != "object" ||
      data == null ||
      !("version" in data) ||
      typeof data.version != "number"
    ) {
      throw new Error("Expected an object with a `version` property.")
    }

    if (data.version == 1) {
      return this.importV1(data)
    }

    throw new Error(
      "Unknown data storage version. Reload the page and try again.",
    )
  }

  toJSON(): DataV1 & Json {
    return {
      version: 1,
      enabled: untrack(this.enabled),
      expanded: untrack(this.expanded),
    }
  }
}

export function CheckboxNode<T>(props: {
  key: string
  parent: readonly string[]
  isLeaf: (value: TreeOf<T> | T) => value is T
  node: TreeOf<T> | T
  tree: Tree<T>
}) {
  if (props.isLeaf(props.node)) {
    return (
      <CheckboxItem
        label={props.key}
        checked={props.tree.isEnabled(props.parent, props.key)}
        onInput={(enabled) =>
          props.tree.toggleEnabled(props.parent, props.key, enabled)
        }
      />
    )
  } else {
    return (
      <CheckboxGroup
        label={props.key}
        expanded={props.tree.isExpanded(props.parent, props.key)}
        onExpanded={(enabled) =>
          props.tree.toggleExpanded(props.parent, props.key, enabled)
        }
      >
        <For each={Object.entries(props.node)}>
          {([key, node]) => (
            <CheckboxNode<T>
              key={key}
              isLeaf={props.isLeaf}
              node={node}
              tree={props.tree}
              parent={props.parent.concat(props.key)}
            />
          )}
        </For>
      </CheckboxGroup>
    )
  }
}

export function CheckboxTree<T>(props: {
  isLeaf: (value: TreeOf<T> | T) => value is T
  tree: Tree<T>
}) {
  return (
    <For each={Object.entries(props.tree.tree)}>
      {([key, node]) => (
        <CheckboxNode<T>
          key={key}
          isLeaf={props.isLeaf}
          node={node}
          tree={props.tree}
          parent={[]}
        />
      )}
    </For>
  )
}
