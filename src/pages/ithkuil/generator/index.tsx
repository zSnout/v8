import type { Specification } from "@zsnout/ithkuil/generate"
import { Lines, Primary } from "@zsnout/ithkuil/script"
import { createMemo, createSignal } from "solid-js"

export function Main() {
  const [specification, setSpecification] = createSignal<Specification>("BSC")

  const primary = createMemo(() => {
    return Primary({
      specification: specification(),
    })
  })

  const node = (
    <div class="m-auto flex items-center justify-center">
      <svg class="w-[36rem] max-w-full" viewBox="-100 -100 200 200">
        <Lines width={200} height={0} />

        <g
          onClick={(event) => {
            if (event.target == event.currentTarget.children[0]?.children[0]) {
              setSpecification((spec) =>
                spec == "BSC"
                  ? "CTE"
                  : spec == "CTE"
                  ? "CSV"
                  : spec == "CSV"
                  ? "OBJ"
                  : "BSC",
              )
            }
          }}
        >
          {primary()}
        </g>
      </svg>
    </div>
  )

  for (const el of document.body.getElementsByClassName("q8s7")) {
    el.remove()
  }

  return node
}
