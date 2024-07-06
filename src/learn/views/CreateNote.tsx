/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { notNull } from "@/components/pray"
import { unwrap } from "@/components/result"
import { faPlus, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { createEffect, createSignal, For, untrack } from "solid-js"
import { AutocompleteBox } from "../el/AutocompleteBox"
import { Action, BottomButtons } from "../el/BottomButtons"
import { IntegratedField } from "../el/IntegratedField"
import { useLayers } from "../el/Layers"
import { mapRecord } from "../lib/record"
import { App } from "../lib/state"
import { fieldRecord } from "../lib/template"
import { EditModelFields } from "./EditModelFields"
import { EditModelTemplates } from "./EditModelTemplates"

export function CreateNote(props: {
  /** The `app` to add notes to. */
  app: App

  /**
   * Called when the `CreateNote` layer is closed. External layers should assume
   * that all data in `app` is fresh and should thus refresh all data signals.
   */
  close: () => void
}) {
  const { app } = props
  const layers = useLayers()

  const [deck, setDeck] = createSignal(app.prefs.currentDeck(Date.now()))
  const [model, setModel] = createSignal(app.prefs.currentModel(Date.now()))
  const [fields, setFields] = createSignal(
    mapRecord(model().fields, (x) => x.sticky ?? ""),
  )
  const [sticky, setSticky] = createSignal(
    mapRecord(model().fields, (x) => !!x.sticky),
  )
  const [showHtml, setShowHtml] = createSignal(
    mapRecord(model().fields, (x) => x.html),
  )
  const [tags, setTags] = createSignal(model().tags)

  createEffect(() => {
    const current = untrack(tags)
    if (current == "") {
      setTags(model().tags)
    }
  })

  function addCard() {
    const lastTags = tags()
    const lastFields = fields()

    const { note, cards } = unwrap(
      app.notes.create({
        now: Date.now(),
        mid: model().id,
        fields: lastFields,
        tags: lastTags,
        did: deck().id,
      }),
    )

    app.notes.push(note)
    for (const card of cards) {
      app.cards.set(card)
    }

    const nextModel = setModel((model) => ({
      ...model,
      tags: lastTags,
      fields: mapRecord(model.fields, (field) =>
        field.sticky
          ? { ...field, sticky: lastFields[field.id] ?? field.sticky }
          : field,
      ),
    }))
    unwrap(app.models.set(nextModel, Date.now()))

    onExternalModelUpdate()
  }

  return (
    <div class="flex min-h-full flex-1 flex-col gap-8">
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
                onExternalModelUpdate()
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
                      setModel(model)
                      onExternalModelUpdate()
                    }
                    pop()
                  }}
                />
              ))
            }
          >
            Edit fields...
          </button>

          <button
            class="z-field border-transparent bg-z-body-selected px-2 py-1 shadow-none"
            onClick={() =>
              layers.push((pop) => (
                <EditModelTemplates
                  model={model()}
                  fields={fieldRecord(model().fields, fields())}
                  close={(model) => {
                    if (model != null) {
                      unwrap(app.models.set(model, Date.now()))
                      setModel(model)
                      onExternalModelUpdate()
                    }
                    pop()
                  }}
                />
              ))
            }
          >
            Edit templates...
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

      <div class="flex flex-col gap-1">
        <For each={Object.values(model().fields)}>
          {(field) => (
            <IntegratedField
              label={field.name}
              rtl={field.rtl}
              font={field.font}
              sizePx={field.size}
              type="html"
              onInput={(value) => {
                setFields((fields) => ({ ...fields, [field.id]: value }))
              }}
              placeholder={field.desc}
              value={fields()[field.id]}
              sticky={sticky()[field.id]}
              onSticky={(sticky) => {
                setSticky((fields) => ({ ...fields, [field.id]: sticky }))
              }}
              showHtml={showHtml()[field.id]}
              onShowHtml={(showHtml) => {
                setShowHtml((fields) => ({ ...fields, [field.id]: showHtml }))
              }}
            />
          )}
        </For>
      </div>

      {/* provides 4rem extra space */}
      <div />
      <div class="flex-1" />

      <IntegratedField
        type="tags"
        label="Tags"
        value={model().tags}
        onInput={(tags) => setTags(tags)}
      />

      <BottomButtons class="grid w-full gap-1 xs:grid-cols-[min(18rem,50%),auto,min(18rem,50%)]">
        {/* TODO: pressing cmd-enter should also run `addCard` */}
        <Action icon={faPlus} label="Add Card" center onClick={addCard} />

        {/* spacer */}
        <div />

        <Action
          icon={faRightFromBracket}
          label="Exit"
          center
          onClick={() => props.close()}
        />
      </BottomButtons>
    </div>
  )

  function onExternalModelUpdate() {
    setFields((prev) =>
      mapRecord(model().fields, ({ id, sticky }) => prev[id] ?? sticky ?? ""),
    )

    setSticky((prev) =>
      mapRecord(model().fields, ({ id, sticky }) => prev[id] ?? !!sticky),
    )

    setShowHtml((prev) =>
      mapRecord(model().fields, ({ id, html }) => prev[id] ?? html),
    )
  }
}
