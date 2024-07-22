/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { notNull } from "@/components/pray"
import { faPlus, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { batch, createEffect, createSignal, For, untrack } from "solid-js"
import { createStore } from "solid-js/store"
import type { Worker } from "../db"
import { AutocompleteBox } from "../el/AutocompleteBox"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { IntegratedField } from "../el/IntegratedField"
import { useLayers } from "../el/Layers"
import { createLoading } from "../el/Loading"
import type { Id } from "../lib/id"
import { mapRecord } from "../lib/record"
import { fieldRecord } from "../lib/template"
import { Model, type Deck, type NoteFields } from "../lib/types"
import { EditModelFields } from "./EditModelFields"
import { EditModelTemplates } from "./EditModelTemplates"
import { ManageModels } from "./ManageModels"

// FEAT: fields can be collapsed

export const CreateNote = createLoading(
  (worker: Worker, _, state: { did?: Id; mid?: Id }) =>
    worker.post("create_note_load", state),
  (
    worker,
    { deckCurrent, modelCurrent, decksByName, modelsByName },
    pop,
    state,
  ) => {
    const layers = useLayers()
    let fieldsEl!: HTMLDivElement

    const [deck, setDeck] = createSignal(deckCurrent)
    const [model, setModel] = createSignal(modelCurrent)
    const [fields, setFields] = createStore(
      mapRecord(model().fields, (x) => x.sticky ?? ""),
    )
    const [sticky, setSticky] = createStore(
      mapRecord(model().fields, (x) => !!x.sticky),
    )
    const [showHtml, setShowHtml] = createStore(
      mapRecord(model().fields, (x) => x.html),
    )
    const [tags, setTags] = createSignal(model().tags)

    createEffect(() => {
      const current = untrack(tags)
      if (current.length == 0) {
        setTags(model().tags)
      }
    })

    return {
      el: (
        <div
          class="flex min-h-full flex-1 flex-col gap-8"
          onKeyDown={(event) => {
            if (event.shiftKey || event.altKey || event.key != "Enter") {
              return
            }

            if (event.ctrlKey == event.metaKey) {
              return
            }

            addCard()
          }}
        >
          <div class="grid gap-4 gap-y-4 sm:grid-cols-2">
            <div class="grid grid-cols-3 gap-1">
              <div class="col-span-3">
                <AutocompleteBox
                  label="Model"
                  options={Object.keys(modelsByName).sort()}
                  onChange={(name) => {
                    const model = notNull(
                      modelsByName[name],
                      "The selected model does not exist.",
                    )

                    onExternalModelUpdate(setModel(model))
                    state.mid = model.id
                  }}
                  value={model().name}
                />
              </div>

              <button
                class="z-field border-transparent bg-z-body-selected px-2 py-1 shadow-none"
                onClick={() => {
                  layers.push(EditModelFields, {
                    worker,
                    mid: model().id,
                  })
                }}
              >
                Fields...
              </button>

              <button
                class="z-field border-transparent bg-z-body-selected px-2 py-1 shadow-none"
                onClick={() =>
                  layers.push(EditModelTemplates, {
                    worker,
                    mid: model().id,
                    fields: fieldRecord(model().fields, { ...fields }),
                  })
                }
              >
                Cards...
              </button>

              <button
                class="z-field border-transparent bg-z-body-selected px-2 py-1 shadow-none"
                onClick={() => layers.push(ManageModels, worker)}
              >
                Manage...
              </button>
            </div>

            <AutocompleteBox
              label="Deck"
              options={Object.keys(decksByName).sort()}
              onChange={(name) => {
                const deck = notNull(
                  decksByName[name],
                  "The selected deck does not exist.",
                )
                setDeck(deck)
                state.did = deck.id
              }}
              value={deck().name}
            />
          </div>

          <div class="flex flex-col gap-1" ref={fieldsEl}>
            <For each={Object.values(model().fields)}>
              {(field) => (
                <IntegratedField
                  label={field.name}
                  rtl={field.rtl}
                  font={field.font ?? undefined}
                  sizePx={field.size ?? undefined}
                  type="html"
                  onInput={(value) => setFields(field.id + "", value)}
                  placeholder={field.desc}
                  value={fields[field.id]}
                  sticky={sticky[field.id]}
                  onSticky={(sticky) => setSticky(field.id + "", sticky)}
                  showHtml={showHtml[field.id]}
                  onShowHtml={(show) => setShowHtml(field.id + "", show)}
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
            value={model().tags.join(" ")}
            onInput={(tags) => setTags(tags.split(/\s+/g).filter((x) => x))}
          />

          <TwoBottomButtons>
            <Action
              icon={faRightFromBracket}
              label="Exit"
              center
              onClick={() => pop()}
            />

            <Action icon={faPlus} label="Add Card" center onClick={addCard} />
          </TwoBottomButtons>
        </div>
      ),
      // TODO: detect if fields are nonempty
      // TODO: ensure core.tags is updated
      onForcePop: () => true,
    }

    async function addCard() {
      const lastTags = tags()
      const lastFields = untrack(() => ({ ...fields }))
      const lastSticky = untrack(() => ({ ...sticky }))

      const result = createNote(
        worker,
        lastTags,
        lastFields,
        model(),
        deck(),
        lastSticky,
      )

      onExternalModelUpdate(result.model)
      fieldsEl.querySelector<HTMLElement>("[contenteditable]")?.focus()
      await result.done
    }

    function onExternalModelUpdate(model: Model) {
      batch(() => {
        for (const key in fields) setFields(key, undefined!)
        for (const key in model.fields)
          setFields(key, model.fields[key]!.sticky)

        for (const key in sticky) setSticky(key, undefined!)
        for (const k in model.fields) setSticky(k, !!model.fields[k]!.sticky)

        for (const key in showHtml) setShowHtml(key, undefined!)
        for (const key in model.fields)
          setShowHtml(key, model.fields[key]!.html)
      })
    }
  },
)

function nextModel(
  tags: string[],
  fields: NoteFields,
  model: Model,
  sticky: Record<string, boolean>,
): Model {
  return {
    ...model,
    tags,
    fields: mapRecord(model.fields, (field) => ({
      ...field,
      sticky: (sticky[field.id] && fields[field.id]) || "",
    })),
  }
}

function createNote(
  worker: Worker,
  tags: string[],
  fields: NoteFields,
  model: Model,
  deck: Deck,
  sticky: Record<string, boolean>,
) {
  const m2 = nextModel(tags, fields, model, sticky)
  return {
    model: m2,
    done: worker.post("create_note", tags, fields, m2, deck),
  }
}
