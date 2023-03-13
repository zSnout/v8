import type { IconDefinition } from "@fortawesome/free-regular-svg-icons"

export function Fa(props: {
  class?: string
  icon: IconDefinition
  title: string
}) {
  return (
    <svg
      class={`overflow-visible transition ${props.class || ""}`}
      fill="var(--icon-stroke)"
      role="img"
      viewBox={`0 0 ${props.icon.icon[0]} ${props.icon.icon[1]}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{props.title}</title>
      <path d={"" + props.icon.icon[4]}></path>
    </svg>
  )
}
