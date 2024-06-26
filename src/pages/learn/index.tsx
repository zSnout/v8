import { RenderUniformTree } from "@/components/tree"
import { Application } from "./lib/application"
import { createCollection } from "./lib/defaults"

const app = new Application(createCollection(Date.now()))

// TODO: use same expandable behavior as checkbox tree

export function Main() {
  return (
    <div class="flex flex-col">
      <RenderUniformTree tree={app.decks.tree(Date.now())}>
        {({ children, data }) => {}}
      </RenderUniformTree>
    </div>
  )
}
