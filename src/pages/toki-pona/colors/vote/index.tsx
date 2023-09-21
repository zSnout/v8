import { Heading } from "@/components/Heading"
import { createSignal } from "solid-js"
import { isServer } from "solid-js/web"

interface Color {
  readonly r: number
  readonly g: number
  readonly b: number
  readonly hex: string
}

function pickColor(): Color {
  if (isServer) {
    return {
      r: 0,
      g: 0,
      b: 0,
      hex: "#808080",
    }
  }

  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)

  return {
    r,
    g,
    b,
    hex: "#" + (256 * (256 * r + g) + b).toString(16).padStart(6, "0"),
  }
}

function pickNextColor(old: Color, minimumChange: number): Color {
  for (let i = 0; i < 100; i++) {
    const next = pickColor()

    if (
      Math.abs(next.r - old.r) >= minimumChange ||
      Math.abs(next.g - old.g) >= minimumChange ||
      Math.abs(next.b - old.b) >= minimumChange
    ) {
      return next
    }
  }

  return pickColor()
}

export function Main() {
  const [color, setColor] = createSignal(pickColor())

  function ColorWord(props: { children: string }) {
    return (
      <button class="bg-z-field px-3 py-2 transition focus:bg-z-body-selected focus:outline-none">
        {props.children}
      </button>
    )
  }

  return (
    <div class="m-auto w-96 max-w-full">
      <Heading center>toki pona color voter</Heading>

      <div
        class="mb-8 aspect-video w-full rounded-lg shadow transition"
        style={{ "background-color": color().hex }}
      />

      <p class="mb-1 text-sm text-z-subtitle transition">
        Choose the color word that you think best represents this color, or
        "ante" if none of them match.
      </p>

      <div class="z-field grid grid-cols-3 gap-px overflow-hidden bg-z-border p-0 transition">
        <ColorWord>loje</ColorWord>
        <ColorWord>jelo</ColorWord>
        <ColorWord>laso</ColorWord>

        <ColorWord>walo</ColorWord>
        <ColorWord>ante</ColorWord>
        <ColorWord>pimeja</ColorWord>
      </div>
    </div>
  )
}
