import type { JSX } from "solid-js"
import { clsx } from "./clsx"

export function FormTitle(props: { children: JSX.Element; class?: string }) {
  return (
    <h1
      class={clsx(
        "text-center text-lg font-semibold text-z-heading",
        props.class,
      )}
    >
      {props.children}
    </h1>
  )
}
