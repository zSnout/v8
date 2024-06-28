import { MonotypeExpandableTree } from "@/components/Expandable"
import { unwrap } from "@/components/result"
import { For } from "solid-js"
import { createCollection } from "./lib/defaults"
import { createExpr } from "./lib/expr"
import { App } from "./lib/state"

const app = new App(createCollection(Date.now()))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nope")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nuh uh")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nuh uh::72")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Wow::23")))
unwrap(app.decks.push(app.decks.create(Date.now(), "45")))

export function Debug() {
  const [decks] = createExpr(() => app.decks.tree(Date.now()).tree)
  const [models] = createExpr(() => app.models.byId)

  return (
    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-1 rounded-lg border border-z px-6 py-4">
        <MonotypeExpandableTree
          z={10}
          tree={decks()}
          isExpanded={({ data }) => !data.collapsed}
          setExpanded={({ data }, expanded) => (data.collapsed = !expanded)}
          node={({ data }) => (
            <p class="rounded bg-z-body-selected px-2">
              {data.name.split("::").at(-1)}
            </p>
          )}
          sort={([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)}
        />
      </div>

      <div class="flex flex-col gap-4 rounded-lg">
        <For each={Object.values(models())}>
          {(model) => (
            <div class="grid grid-cols-3 gap-px overflow-clip rounded-lg bg-z-border">
              <div class="col-span-2 flex items-center justify-center bg-z-body-selected px-2 font-semibold text-z-heading">
                {model.name}
              </div>
              <pre class="row-span-3 bg-z-body-selected px-2 py-1 text-xs">
                {model.css}
              </pre>
              <div class="bg-z-body-selected px-2">id {model.id}</div>
              <div class="bg-z-body-selected px-2">
                sort field {model.sort_field}
              </div>
              <pre class="bg-z-body-selected px-2 py-1 text-xs">
                {JSON.stringify(model.latex) ||
                  "<uses mathquill settings for latex>"}
              </pre>
              <pre class="bg-z-body-selected px-2 py-1 text-xs">
                {model.tmpls.length} templates{"\n"}
                {model.fields.length} fields
              </pre>
              <div class="col-span-3 flex gap-2 overflow-x-auto bg-z-body-selected p-2">
                <For each={model.fields}>
                  {(field) => (
                    <div class="flex w-56 flex-col rounded bg-z-body px-2 py-1 text-xs">
                      <div class="mb-1 border-b border-z pb-1 text-center text-base">
                        {field.name}
                      </div>
                      <div>rtl? {field.rtl + ""}</div>
                      <div>font? {field.font + ""}</div>
                      <div>size? {field.size + ""}</div>
                      <div>sticky? {field.sticky + ""}</div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
