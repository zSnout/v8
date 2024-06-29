import { MonotypeExpandableTree } from "@/components/Expandable"
import { unwrap } from "@/components/result"
import { For } from "solid-js"
import { Grade, Rating, State } from "ts-fsrs"
import { timestampDist } from "../quiz/shared"
import { createCollection } from "./lib/defaults"
import { createExpr } from "./lib/expr"
import { Id } from "./lib/id"
import { App } from "./lib/state"
import * as Template from "./lib/template"

const diff = Date.prototype.diff
Date.prototype.diff = function (a, b) {
  console.log({ this: this, a, b })
  return diff.call(this, a, b)
}

const grades: { grade: Grade; bg: string; text: string }[] = [
  { grade: Rating.Again, bg: "bg-red-300", text: "text-red-900" },
  { grade: Rating.Hard, bg: "bg-[#ffcc91]", text: "text-yellow-900" },
  { grade: Rating.Good, bg: "bg-green-300", text: "text-green-900" },
  { grade: Rating.Easy, bg: "bg-blue-300", text: "text-blue-900" },
]

const app = new App(createCollection(Date.now()))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nope")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nuh uh")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nuh uh::72")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Wow::23")))
unwrap(app.decks.push(app.decks.create(Date.now(), "45")))

const { note, cards } = unwrap(
  app.notes.create({
    now: Date.now(),
    mid: 2 as Id,
    did: 1 as Id,
    fields: ["text", "words"],
  }),
)

unwrap(app.notes.push(note))
cards.map((x) => unwrap(app.cards.set(x)))

export function Debug() {
  const [decks] = createExpr(() => app.decks.tree(Date.now()).tree)
  const [models] = createExpr(() => app.models.byId)
  const [notes] = createExpr(() => app.notes.byId)
  const [cards, reloadCards] = createExpr(() => app.cards.byNid)
  const [confs] = createExpr(() => app.confs.byId)

  return (
    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-1">
        <MonotypeExpandableTree
          z={10}
          tree={decks()}
          isExpanded={({ data }) => !data.collapsed}
          setExpanded={({ data }, expanded) => (data.collapsed = !expanded)}
          node={({ data }) => (
            <div class="grid w-full grid-cols-3 rounded bg-z-body-selected px-2 py-1 text-xs">
              <p class="col-span-3 mb-1 border-b border-z pb-1 text-base font-semibold text-z-heading">
                {data.name.split("::").at(-1)}
              </p>
              <p>conf? {data.conf}</p>
              <p>custom_newcard_limit? {data.custom_newcard_limit}</p>
              <p>custom_revcard_limit? {data.custom_revcard_limit}</p>
              <p>desc? {data.desc}</p>
              <p>id? {data.id}</p>
              <p>is_filtered? {data.is_filtered}</p>
              <p>last_edited? {data.last_edited}</p>
              <p>new_today? {data.new_today}</p>
            </div>
          )}
          sort={([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)}
        />
      </div>

      <div class="flex flex-col gap-1">
        <For each={Object.values(confs())}>
          {(conf) => (
            <div class="grid w-full grid-cols-6 rounded bg-z-body-selected px-2 py-1 text-xs">
              <p class="col-span-6 mb-1 border-b border-z pb-1 text-base font-semibold text-z-heading">
                {conf.id}
              </p>
              <pre class="col-span-3">
                {JSON.stringify(conf.new, undefined, 2)}
              </pre>
              <pre class="col-span-3">
                {JSON.stringify(conf.review, undefined, 2)}
              </pre>
              <p class="col-span-2">name? {conf.name}</p>
              <p class="col-span-2">
                autoplay_audio? {conf.autoplay_audio + ""}
              </p>
              <p class="col-span-2">last_edited? {conf.last_edited}</p>
              <p class="col-span-2">
                replay_question_audio? {conf.replay_question_audio}
              </p>
              <p class="col-span-2">
                show_global_timer? {conf.show_global_timer}
              </p>
              <p class="col-span-2">timer_per_card? {conf.timer_per_card}</p>
            </div>
          )}
        </For>
      </div>

      <div class="flex flex-col gap-1">
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

      <div class="flex flex-col gap-1">
        <For each={Object.values(notes())}>
          {(note) => (
            <div class="grid w-full grid-cols-3 rounded bg-z-body-selected px-2 py-1 text-xs">
              <p class="col-span-3 mb-1 border-b border-z pb-1 text-base font-semibold text-z-heading">
                {note.id}
              </p>
              <p>creation? {note.creation}</p>
              <p>csum? {note.csum}</p>
              <p class="row-span-3 border-l border-z pl-1">
                <For each={note.fields}>{(field) => <p>{field}</p>}</For>
              </p>
              <p>last_edited? {note.last_edited}</p>
              <p>mid? {note.mid}</p>
              <p>sort_field? {note.sort_field}</p>
              <p>tags? {note.tags}</p>
              <div class="col-span-3 mt-1 flex gap-2 overflow-x-auto border-t border-z pb-1 pt-2 text-base">
                <For each={cards()[note.id]}>
                  {(card) => {
                    const info = app.cards.repeat(card, Date.now(), 0)
                    return (
                      <div class="flex w-56 flex-col rounded bg-z-body px-2 py-1 text-xs">
                        <div class="mb-1 border-b border-z pb-1 text-center text-base">
                          {
                            unwrap(
                              Template.generate(
                                unwrap(
                                  Template.parse(
                                    models()[note.mid]!.tmpls[card.tid]!.qfmt,
                                  ),
                                ),
                                unwrap(
                                  Template.fieldRecord(
                                    models()[note.mid]!.fields,
                                    note.fields,
                                  ),
                                ),
                              ),
                            ).html
                          }
                        </div>
                        <div>did? {card.did}</div>
                        <div>tid? {card.tid}</div>
                        <div>lapses? {card.lapses}</div>
                        <div>difficulty? {card.difficulty}</div>
                        <div>stability? {card.stability}</div>
                        <div>reps? {card.reps}</div>
                        <div>state? {State[card.state]}</div>
                        <div>
                          due? {timestampDist((card.due - Date.now()) / 1000)}
                        </div>
                        <div>
                          back?{" "}
                          {
                            unwrap(
                              Template.generate(
                                unwrap(
                                  Template.parse(
                                    models()[note.mid]!.tmpls[card.tid]!.afmt,
                                  ),
                                ),
                                unwrap(
                                  Template.fieldRecord(
                                    models()[note.mid]!.fields,
                                    note.fields,
                                  ),
                                ),
                              ),
                            ).html
                          }
                        </div>
                        <div class="-mx-1 mt-1 grid grid-cols-4 gap-1">
                          <For each={grades}>
                            {({ grade, bg, text }) => (
                              <button
                                class={`rounded-sm px-1 ${bg} ${text}`}
                                onClick={() => {
                                  const info = app.cards.repeat(
                                    card,
                                    Date.now(),
                                    0,
                                  )
                                  app.cards.set(info[grade].card)
                                  reloadCards()
                                }}
                              >
                                {timestampDist(
                                  (info[grade].card.due - Date.now()) / 1000,
                                )}
                              </button>
                            )}
                          </For>
                        </div>
                      </div>
                    )
                  }}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
