import { MonotypeExpandableTree } from "@/components/Expandable"
import { unwrap } from "@/components/result"
import { createCollection } from "./lib/defaults"
import { createExpr } from "./lib/expr"
import { App } from "./lib/state"

const app = new App(createCollection(Date.now()))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nope")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nuh uh")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nuh uh::72")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Wow::23")))
unwrap(app.decks.push(app.decks.create(Date.now(), "45")))

export function Main() {
  const [tree] = createExpr(() => app.decks.tree(Date.now()).tree)

  return (
    <div class="relative flex flex-col gap-1">
      <MonotypeExpandableTree
        z={10}
        tree={tree()}
        isExpanded={({ data }) => !data.collapsed}
        setExpanded={({ data }, expanded) => (data.collapsed = !expanded)}
        node={({ data }) => (
          <>
            <p class="bg-z-body-selected">{data.name.split("::").at(-1)}</p>
          </>
        )}
        sort={([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)}
      />
    </div>
  )
}
