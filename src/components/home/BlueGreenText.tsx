import { Show } from "solid-js"

export function BlueGreenText(props: { href?: string; name: string }) {
  return (
    <Show
      fallback={
        <p class="bg-gradient-to-br from-green-500 via-blue-500 to-blue-500 bg-clip-text font-bold [-webkit-text-fill-color:transparent]">
          {props.name[0]?.toUpperCase() + props.name.slice(1)}
        </p>
      }
      when={props.href}
    >
      <a
        href={props.href}
        class="bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 bg-clip-text font-bold [-webkit-text-fill-color:transparent]"
      >
        {props.name[0]?.toUpperCase() + props.name.slice(1)}
      </a>
    </Show>
  )
}
