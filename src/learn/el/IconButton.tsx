import { Fa } from "@/components/Fa"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { JSX } from "solid-js"

export function Icon(props: {
  icon: IconDefinition
  label: string
  onClick: () => void
}) {
  return (
    <button
      class="flex w-[4.25rem] flex-col items-center gap-1 rounded-lg bg-z-body-selected px-2 pb-1 pt-2 text-center"
      onClick={props.onClick}
    >
      <Fa class="size-8" icon={props.icon} title={false} />
      <p class="text-sm text-z-subtitle">{props.label}</p>
    </button>
  )
}

export function Icons(props: { children: JSX.Element }) {
  return <div class="flex justify-center gap-2">{props.children}</div>
}
