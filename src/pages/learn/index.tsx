import { Expandable } from "@/components/expandable"
import { createSignal } from "solid-js"
import { createCollection } from "./lib/defaults"
import { Application } from "./lib/state"

const app = new Application(createCollection(Date.now()))

// TODO: use same expandable behavior as checkbox tree

export function Main() {
  const [a, setA] = createSignal(false)
  const [b, setB] = createSignal(false)
  const [c, setC] = createSignal(false)
  const [d, setD] = createSignal(false)

  return (
    <div class="flex flex-col gap-1">
      <Expandable label="hi" expanded={a()} setExpanded={setA}>
        <p>world</p>
        <Expandable label="earth" expanded={b()} setExpanded={setB}>
          <p>god</p>
          <p>the divine</p>
        </Expandable>
      </Expandable>

      <Expandable label="before the shrine" expanded={c()} setExpanded={setC}>
        <p>prepare to be dazzled</p>
        <Expandable label="the shrine" expanded={d()} setExpanded={setD}>
          <p>kijetesantakalu</p>
          <p>racoons</p>
        </Expandable>
        <p>you have been dazzled</p>
      </Expandable>

      <p>you may have been dazzled</p>

      {/* <RenderUniformTree tree={app.decks.tree(Date.now())}>
        {({ children, data }) => {}}
      </RenderUniformTree> */}
    </div>
  )
}
