import { Fa } from "@/components/Fa"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { JSX } from "solid-js"
import { useLayers } from "./Layers"

export function Icon(
  props:
    | {
        icon: IconDefinition
        label: string
        onClick?: undefined
        layer: (pop: () => void) => JSX.Element
      }
    | {
        icon: IconDefinition
        label: string
        onClick?: () => void
        layer?: undefined
      },
) {
  const onClick =
    (props.layer &&
      (
        (layers) => () =>
          layers.push(props.layer)
      )(useLayers())) ||
    props.onClick

  return (
    <button
      class="flex w-[4.25rem] flex-col items-center gap-1 rounded-lg bg-z-body-selected px-2 pb-1 pt-2 text-center"
      onClick={onClick}
    >
      <Fa class="size-8" icon={props.icon} title={false} />

      <p class="text-sm text-z-subtitle">{props.label}</p>
    </button>
  )
}

export function Icons(props: { children: JSX.Element }) {
  // TODO: make this work on mobile
  return <div class="flex justify-center gap-2">{props.children}</div>
}
