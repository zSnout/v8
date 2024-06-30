import { notNull } from "@/components/pray"
import { createEffect, createSignal, For, untrack } from "solid-js"
import { randomId } from "../id"
import { App } from "../state"
import { AutocompleteBox } from "./AutocompleteBox"
import { TagEditor } from "./TagEditor"

export function CreateNote({ app }: { app: App }) {
  const [deck, setDeck] = createSignal(
    app.decks.byId[Object.keys(app.decks.byId)[0]!]!,
  )
  const [model, setModel] = createSignal(
    app.models.byId[Object.keys(app.models.byId)[0]!]!,
  )
  const [fields, setFields] = createSignal(model().fields.map(() => ""))
  const [tags, setTags] = createSignal(model().tags)

  createEffect(() => {
    const current = untrack(tags)
    if (current == "") {
      setTags(model().tags)
    }
  })

  return (
    <div class="flex flex-col gap-4">
      <div class="grid gap-4 gap-y-3 sm:grid-cols-2">
        <label>
          <p class="mb-1 text-sm text-z-subtitle">Type</p>
          <AutocompleteBox
            options={Object.keys(app.models.byName).sort()}
            onChange={(name) => {
              setModel(
                notNull(
                  app.models.byName[name],
                  "The selected model does not exist.",
                ),
              )
            }}
            value={model().name}
          />
        </label>

        <label>
          <p class="mb-1 text-sm text-z-subtitle">Deck</p>
          <AutocompleteBox
            options={Object.keys(app.decks.byName).sort()}
            onChange={(name) => {
              setDeck(
                notNull(
                  app.decks.byName[name],
                  "The selected deck does not exist.",
                ),
              )
            }}
            value={deck().name}
          />
        </label>
      </div>

      <hr class="border-z" />

      <div class="flex flex-col gap-1">
        <For each={model().fields}>
          {(field, index) => {
            const id = randomId() + ""
            let el: HTMLDivElement
            return (
              <div class="z-field cursor-text rounded-lg border-transparent bg-z-body-selected p-0 shadow-none">
                <p
                  id={id}
                  class="mb-1 w-full select-none px-2 pt-1 text-sm text-z-subtitle"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    el.focus()
                  }}
                  contentEditable={false}
                >
                  {field.name}
                </p>

                <div
                  ref={(e) => (el = e)}
                  aria-labelledby={id}
                  class="-mt-1 px-2 pb-1 focus:outline-none"
                  contentEditable
                  tabIndex={0}
                  style={{
                    "font-family": field.font,
                    "font-size": field.size
                      ? field.size / 16 + "px"
                      : undefined,
                  }}
                  dir={field.rtl ? "rtl" : "ltr"}
                  onInput={(el) =>
                    setFields((fields) =>
                      fields.with(index(), el.currentTarget.innerHTML),
                    )
                  }
                />
              </div>
            )
          }}
        </For>
      </div>

      <TagEditor value={tags()} onChange={(tags) => setTags(tags)} />
    </div>
  )
}
