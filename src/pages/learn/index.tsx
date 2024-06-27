import { MonotypeExpandableTree } from "@/components/Expandable"
import { createCollection } from "./lib/defaults"
import { Application } from "./lib/state"

const app = new Application(createCollection(Date.now()))

// TODO: use same expandable behavior as checkbox tree

export function Main() {
  return (
    <div class="flex flex-col gap-1">
      <MonotypeExpandableTree
        tree={app.decks.tree(Date.now()).tree}
        isExpanded={({ data }) => !data.collapsed}
        setExpanded={({ data }, expanded) => (data.collapsed = !expanded)}
        node={({ data }) => <p>{data.name.split("::").at(-1)}</p>}
      />
    </div>
  )
}
