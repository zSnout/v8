import { MonotypeExpandableTree } from "@/components/Expandable"
import { unwrap } from "@/components/result"
import { timestampDist } from "@/pages/quiz/shared"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import { createMemo, For } from "solid-js"
import { Grade, Rating, State } from "ts-fsrs"
import { Action } from "../el/BottomButtons"
import { Layerable } from "../el/Layers"
import { createExpr } from "../lib/expr"
import { App } from "../lib/state"
import * as Template from "../lib/template"
import { AnyCard } from "../lib/types"

const grades: { grade: Grade; bg: string; text: string }[] = [
  { grade: Rating.Again, bg: "bg-red-300", text: "text-red-900" },
  { grade: Rating.Hard, bg: "bg-[#ffcc91]", text: "text-yellow-900" },
  { grade: Rating.Good, bg: "bg-green-300", text: "text-green-900" },
  { grade: Rating.Easy, bg: "bg-blue-300", text: "text-blue-900" },
]

export const Debug = (({ app }: { app: App }, pop) => {
  const [decks] = createExpr(() => app.decks)
  const tree = createMemo(() => decks().tree(Date.now()).tree)
  const [models] = createExpr(() => app.models.byId)
  const [notes] = createExpr(() => app.notes.byId)
  const [cards, reloadCards] = createExpr(() => app.cards.byNid)
  const [confs] = createExpr(() => app.confs.byId)

  return {
    el: (
      <div class="flex flex-col gap-8">
        <Action icon={faXmark} label="Exit" center onClick={pop} />
        <RawInformation />
      </div>
    ),
    onForcePop: () => true,
  }

  function Card({ card }: { card: AnyCard }) {
    const info = app.cards.repeat(card, Date.now(), 0)
    const note = app.notes.byId[card.nid]!
    const model = models()[note.mid]!
    const tmpl = model.tmpls[card.tid]!
    const fields = Template.fieldRecord(model.fields, note.fields)
    const front = Template.generate(unwrap(Template.parse(tmpl.qfmt)), fields, {
      FrontSide: undefined,
    })
    const back = Template.generate(unwrap(Template.parse(tmpl.afmt)), fields, {
      FrontSide: front,
    })
    const css = model.css
    return (
      <div class="flex flex-col rounded bg-z-body px-2 py-1 text-xs">
        <Template.Render
          class="mb-1 border-b border-z pb-1 text-center text-base"
          html={front}
          css={css}
          theme="auto"
        />
        <Template.Render
          class="mb-1 border-b border-z pb-1 text-center text-base"
          html={back}
          css={css}
          theme="auto"
        />
        <div>did? {card.did}</div>
        <div>tid? {card.tid}</div>
        <div>lapses? {card.lapses}</div>
        <div>difficulty? {card.difficulty}</div>
        <div>stability? {card.stability}</div>
        <div>reps? {card.reps}</div>
        <div>state? {State[card.state]}</div>
        <div>due? {timestampDist((card.due - Date.now()) / 1000)}</div>
        <div class="-mx-1 mt-1 grid grid-cols-4 gap-1">
          <For each={grades}>
            {({ grade, bg, text }) => (
              <button
                class={`rounded-sm px-1 ${bg} ${text}`}
                onClick={() => {
                  const info = app.cards.repeat(card, Date.now(), 0)
                  app.cards.set(info[grade].card)
                  reloadCards()
                }}
              >
                {timestampDist((info[grade].card.due - Date.now()) / 1000)}
              </button>
            )}
          </For>
        </div>
      </div>
    )
  }

  function RawInformation() {
    return (
      <>
        {/* Decks */}
        <div class="flex flex-col gap-1">
          <MonotypeExpandableTree
            z={10}
            tree={tree()}
            isExpanded={({ data }) => !data.collapsed}
            setExpanded={({ data }, expanded) => (data.collapsed = !expanded)}
            node={({ data }) => (
              <div class="grid w-full grid-cols-3 rounded-lg bg-z-body-selected px-2 py-1 text-xs">
                <p class="col-span-3 mb-1 border-b border-z pb-1 text-base font-semibold text-z-heading">
                  {data.name.split("::").at(-1)}
                </p>
                <p>conf? {data.cfid}</p>
                <p>custom_newcard_limit? {data.custom_newcard_limit}</p>
                <p>custom_revcard_limit? {data.custom_revcard_limit}</p>
                <p>desc? {data.desc}</p>
                <p>id? {data.id}</p>
                <p>is_filtered? {data.is_filtered}</p>
                <p>last_edited? {data.last_edited}</p>
                <p>new_today? {data.new_today.length}</p>
              </div>
            )}
            sort={([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)}
          />
        </div>

        {/* Deck confs */}
        <div class="flex flex-col gap-1">
          <For each={Object.values(confs())}>
            {(conf) => (
              <div class="grid w-full grid-cols-6 rounded-lg bg-z-body-selected px-2 py-1 text-xs">
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

        {/* Models */}
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
                  {Object.keys(model.tmpls).length} templates{"\n"}
                  {Object.keys(model.fields).length} fields
                </pre>
                <For each={Object.values(model.tmpls)}>
                  {(tmpl) => (
                    <div class="bg-z-body-selected px-2">
                      <pre class="py-1 text-xs">{tmpl.qfmt}</pre>
                      <hr class="border-z" />
                      <pre class="py-1 text-xs">{tmpl.afmt}</pre>
                    </div>
                  )}
                </For>
                <div class="col-span-3 flex gap-2 overflow-x-auto bg-z-body-selected p-2">
                  <For each={Object.values(model.fields)}>
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

        {/* Notes */}
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
                  <For each={Object.values(note.fields)}>
                    {(field) => <p>{field}</p>}
                  </For>
                </p>
                <p>last_edited? {note.last_edited}</p>
                <p>mid? {note.mid}</p>
                <p>sort_field? {note.sort_field}</p>
                <p>tags? {note.tags.join(", ")}</p>
                <div class="col-span-3 mt-1 grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2 overflow-x-auto border-t border-z pb-1 pt-2 text-base">
                  <For each={cards()[note.id]?.toSorted((a, b) => a.id - b.id)}>
                    {(card) => <Card card={card} />}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Cards by due date */}
        <div class="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2 rounded-lg bg-z-body-selected p-2">
          <p class="col-span-full -my-1">Cards by due date</p>
          <For
            each={Object.values(cards())
              .flat()
              .toSorted((a, b) => a.due - b.due)}
          >
            {(card) => <Card card={card} />}
          </For>
        </div>

        {/* Cards by id */}
        <div class="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-2 rounded-lg bg-z-body-selected p-2">
          <p class="col-span-full -my-1">Cards by id</p>
          <For
            each={Object.values(cards())
              .flat()
              .toSorted((a, b) => a.id - b.id)}
          >
            {(card) => <Card card={card} />}
          </For>
        </div>
      </>
    )
  }
}) satisfies Layerable<{ app: App }>
