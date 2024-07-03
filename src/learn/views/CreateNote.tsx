/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { notNull } from "@/components/pray"
import { unwrap } from "@/components/result"
import { createEffect, createSignal, For, untrack } from "solid-js"
import { App } from "../state"
import { AutocompleteBox } from "./AutocompleteBox"
import { EditModelFields } from "./EditModelFields"
import { IntegratedField } from "./IntegratedField"
import { useLayers } from "./Layers"
import { TagEditor } from "./TagEditor"

export function CreateNote({ app }: { app: App }) {
  const layers = useLayers()

  const [deck, setDeck] = createSignal(
    app.decks.byId[Object.keys(app.decks.byId)[0]!]!,
  )
  const [model, setModel] = createSignal(
    app.models.byId[Object.keys(app.models.byId)[0]!]!,
  )
  const [fields, setFields] = createSignal(model().fields.map(() => ""))
  const [tags, setTags] = createSignal(model().tags)

  // TODO: tags should use the same IntegratedField style

  createEffect(() => {
    const current = untrack(tags)
    if (current == "") {
      setTags(model().tags)
    }
  })

  return (
    <div class="flex flex-col gap-4">
      <div class="grid gap-4 gap-y-3 sm:grid-cols-2">
        <div class="grid grid-cols-2 gap-1">
          <div class="col-span-2">
            <AutocompleteBox
              label="Type"
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
          </div>

          <button
            class="z-field border-transparent bg-z-body-selected px-2 py-1 shadow-none"
            onClick={() =>
              layers.push((pop) => (
                <EditModelFields
                  model={model()}
                  close={(model) => {
                    if (model != null) {
                      unwrap(app.models.set(model, Date.now()))
                    }
                    pop()
                  }}
                />
              ))
            }
          >
            Edit fields...
          </button>
        </div>

        <AutocompleteBox
          label="Deck"
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
      </div>

      <hr class="border-z" />

      <div class="flex flex-col gap-1">
        <For each={model().fields}>
          {(field, index) => (
            <IntegratedField
              label={field.name}
              rtl={field.rtl}
              font={field.font}
              sizePx={field.size}
              type="html"
              onInput={(value) =>
                setFields((fields) => fields.with(index(), value))
              }
              placeholder={field.desc}
              value={field.sticky}
            />
          )}
        </For>
      </div>

      <TagEditor value={tags()} onChange={(tags) => setTags(tags)} />
    </div>
  )
}
