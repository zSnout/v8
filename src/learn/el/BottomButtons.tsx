import { Fa } from "@/components/Fa"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { JSX } from "solid-js"

export function BottomButtons(props: { class: string; children: JSX.Element }) {
  return (
    <div class="mt-auto flex w-full justify-center">
      <div class={props.class}>{props.children}</div>
    </div>
  )
}

export function TwoBottomButtons(props: { children: JSX.Element }) {
  return (
    <BottomButtons class="grid w-full max-w-96 gap-1 xs:grid-cols-2">
      {props.children}
    </BottomButtons>
  )
}

export function Action(props: {
  icon: IconDefinition
  label: string
  onClick?: () => void
  shrinks?: boolean
  center?: boolean
}) {
  return (
    <button
      class="z-field flex w-full items-center gap-2 border-transparent bg-z-body-selected px-2 py-1 shadow-none"
      classList={{ "justify-center": props.center }}
      onClick={props.onClick}
    >
      <div class="flex h-6 items-center justify-center">
        <Fa class="h-4 w-4" icon={props.icon} title={false} />
      </div>
      <div classList={{ "max-sm:sr-only": props.shrinks }}>{props.label}</div>
    </button>
  )
}
