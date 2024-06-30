import { MonotypeExpandableTree } from "@/components/Expandable"
import { Fa } from "@/components/Fa"
import { notNull } from "@/components/pray"
import { unwrap } from "@/components/result"
import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  JSX,
  Show,
} from "solid-js"
import { Grade, Rating, State } from "ts-fsrs"
import { timestampDist } from "../quiz/shared"
import { createCollection } from "./lib/defaults"
import { createExpr } from "./lib/expr"
import { Id, randomId } from "./lib/id"
import { Layers, useLayers, withCurrentOwner } from "./lib/layerable"
import { App } from "./lib/state"
import * as Template from "./lib/template"
import { AnyCard } from "./lib/types"

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
unwrap(app.decks.push(app.decks.create(Date.now(), "Definitely not real")))
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

function TagEditor() {
  const [tags, setTags] = createSignal<string[]>([])
  const [field, setField] = createSignal("")
  let el: HTMLInputElement
  const id = randomId() + ""

  return (
    <div class="flex flex-col">
      <label
        for={id}
        class="mb-1 w-full select-none text-sm text-z-subtitle"
        onMouseDown={(event) => {
          event.preventDefault()
          el.focus()
        }}
        contentEditable={false}
      >
        Tags
      </label>

      <div
        class="flex flex-wrap gap-1"
        onKeyDown={(event) => {
          if (event.metaKey || event.altKey || event.ctrlKey) {
            return
          }

          if (event.key == "ArrowLeft") {
            const tag = event.target.previousElementSibling
            if (tag && tag instanceof HTMLElement) {
              tag.focus()
              event.preventDefault()
              return
            }
          }

          if (event.key == "ArrowRight") {
            const tag = event.target.nextElementSibling
            if (tag && tag instanceof HTMLElement) {
              tag.focus()
              event.preventDefault()
              return
            }
          }

          if (event.key == "Backspace") {
            const { target } = event
            if (target instanceof HTMLDivElement) {
              const next = (target.previousElementSibling ||
                target.nextElementSibling) as HTMLElement
              setTags((tags) => {
                const next = tags.slice()
                next.splice(+target.dataset.index!, 1)
                return next
              })
              next.focus()
              event.preventDefault()
              return
            }
          }
        }}
      >
        <For each={tags()}>
          {(tag, index) => (
            <div
              class="flex-1 rounded-lg border border-transparent bg-z-body-selected px-2 py-1 text-center focus:outline-none focus:invert"
              tabIndex={-1}
              data-index={index()}
            >
              {tag}
            </div>
          )}
        </For>

        <input
          type="text"
          ref={(e) => (el = e)}
          class="z-field min-w-[min(8rem,100%)] flex-[1000] px-2 py-1 shadow-none"
          contentEditable
          tabIndex={0}
          onInput={(el) => {
            const { value } = el.currentTarget
            if (!/\s/.test(value)) {
              return
            }

            const list = value.split(/\s+/g)
            const last = list.pop()!
            setTags((tags) => tags.concat(list.filter((x) => x)))
            el.currentTarget.value = last
          }}
        />
      </div>
    </div>
  )
}

export function PrevDebug() {
  const [decks] = createExpr(() => app.decks)
  const tree = createMemo(() => decks().tree(Date.now()).tree)
  const [models] = createExpr(() => app.models.byId)
  const [notes, reloadNotes] = createExpr(() => app.notes.byId)
  const [cards, reloadCards] = createExpr(() => app.cards.byNid)
  const [confs] = createExpr(() => app.confs.byId)
  const layers = useLayers()

  function CreateNotePretty() {
    const [deck, setDeck] = createSignal(
      app.decks.byId[Object.keys(app.decks.byId)[0]!]!,
    )
    const [model, setModel] = createSignal(
      app.models.byId[Object.keys(app.models.byId)[0]!]!,
    )
    const [fields, setFields] = createSignal(model().fields.map(() => ""))

    return (
      <div class="flex flex-col gap-4">
        <div class="grid gap-4 gap-y-3 sm:grid-cols-2">
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

          <label>
            <p class="mb-1 text-sm text-z-subtitle">Model</p>
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
        </div>

        <div class="flex flex-col gap-1">
          <For each={model().fields}>
            {(field, index) => {
              const id = randomId() + ""
              let el: HTMLDivElement
              return (
                <div class="z-field cursor-text rounded-lg border-z p-0 shadow-none">
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

        <TagEditor />
      </div>
    )
  }

  function CreateNote() {
    const [deck, setDeck] = createSignal(
      app.decks.byId[Object.keys(app.decks.byId)[0]!]!,
    )
    const [model, setModel] = createSignal(
      app.models.byId[Object.keys(app.models.byId)[0]!]!,
    )
    const [fields, setFields] = createSignal(model().fields.map(() => ""))

    return (
      <div class="flex flex-col gap-1">
        <select
          class="rounded bg-z-body-selected px-2 py-1"
          onInput={(x) => setDeck(app.decks.byId[x.currentTarget.value]!)}
        >
          <For each={Object.entries(decks().byId)}>
            {(deck) => <option value={deck[0]}>{deck[1].name}</option>}
          </For>
        </select>

        <select
          class="rounded bg-z-body-selected px-2 py-1"
          onInput={(x) => {
            const model = setModel(app.models.byId[x.currentTarget.value]!)
            setFields(model.fields.map(() => ""))
          }}
        >
          <For each={Object.entries(models())}>
            {(model) => <option value={model[0]}>{model[1].name}</option>}
          </For>
        </select>

        <For each={model().fields}>
          {(field, index) => (
            <div class="z-field flex flex-col rounded border-transparent bg-z-body-selected p-0 shadow-none">
              <div class="px-2 pt-1 text-sm text-z-subtitle">{field.name}</div>
              <div
                contentEditable
                class="px-2 py-1 focus:outline-none"
                onInput={(event) =>
                  setFields((x) =>
                    x.with(index(), event.currentTarget.innerHTML),
                  )
                }
              ></div>
            </div>
          )}
        </For>

        <button
          class="rounded bg-z-body-selected px-2 py-1"
          onClick={() => {
            const { note, cards } = unwrap(
              app.notes.create({
                now: Date.now(),
                mid: model().id,
                fields: fields(),
                did: deck().id,
              }),
            )

            app.notes.push(note)
            for (const card of cards) {
              app.cards.set(card)
            }

            batch(() => {
              reloadNotes()
              reloadCards()
            })
          }}
        >
          add note
        </button>
      </div>
    )
  }

  function Card({ card }: { card: AnyCard }) {
    const info = app.cards.repeat(card, Date.now(), 0)
    const note = app.notes.byId[card.nid]!
    const front = unwrap(
      Template.generate(
        unwrap(Template.parse(models()[note.mid]!.tmpls[card.tid]!.qfmt)),
        unwrap(Template.fieldRecord(models()[note.mid]!.fields, note.fields)),
      ),
    )
    const back = unwrap(
      Template.generate(
        unwrap(Template.parse(models()[note.mid]!.tmpls[card.tid]!.afmt)),
        {
          ...unwrap(
            Template.fieldRecord(models()[note.mid]!.fields, note.fields),
          ),
          FrontSide: front,
        },
      ),
    )
    return (
      <div class="flex flex-col rounded bg-z-body px-2 py-1 text-xs">
        <Template.Render
          class="mb-1 border-b border-z pb-1 text-center text-base"
          html={front}
        />
        <Template.Render
          class="mb-1 border-b border-z pb-1 text-center text-base"
          html={back}
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

        {/* Deck confs */}
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
                  <For each={note.fields}>{(field) => <p>{field}</p>}</For>
                </p>
                <p>last_edited? {note.last_edited}</p>
                <p>mid? {note.mid}</p>
                <p>sort_field? {note.sort_field}</p>
                <p>tags? {note.tags}</p>
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

  const Inner = withCurrentOwner((pop: () => void) => {
    return (
      <div>
        hello world
        <button onClick={pop}>or close it</button>
        <button onClick={() => layers.push(Inner)}>or add another</button>
        {Array(100)
          .fill(0)
          .map(() => (
            <p>hi</p>
          ))}
      </div>
    )
  })

  return (
    <div class="flex flex-col gap-8">
      <CreateNotePretty />
      <div class="h-[100dvh]" />
      <CreateNote />
      <RawInformation />
    </div>
  )
}

export function Debug() {
  return (
    <Layers.Root>
      <PrevDebug />
    </Layers.Root>
  )
}

function AutocompleteBox<T extends string>(props: {
  options: readonly T[]
  value?: string
  onInput?: (value: string) => void
  onChange?: (value: T) => void
}): JSX.Element {
  const [field, setField] = createSignal(
    props.options.includes(props.value as T) ? props.value! : "",
  )

  const matchingRaw = createMemo(() => {
    const f = field().toLowerCase()

    const result = props.options
      .map((option) => {
        const index = option.toLowerCase().indexOf(f)
        return [option, index == -1 ? 1 / 0 : index] as const
      })
      .sort(([, a], [, b]) => a - b)

    const infinity = result.findIndex(([, v]) => v == 1 / 0)

    return { result, infinity }
  })

  const matching = () => matchingRaw().result
  const infIndex = () => matchingRaw().infinity

  const [selected, setSelected] = createSignal(0)

  const [attemptedBlur, setAttemptedBlur] = createSignal<1>()

  return (
    <div class="h-[calc(2rem_+_2px)]">
      <div class="z-field relative z-10 overflow-clip p-0 shadow-none">
        <input
          class="peer w-full px-2 py-1 focus:outline-none"
          type="text"
          onKeyDown={(event) => {
            if (event.metaKey || event.ctrlKey || event.altKey) {
              return
            }

            if (event.key == "ArrowUp" || event.key == "ArrowDown") {
              const dir = event.key == "ArrowUp" ? -1 : 1
              setSelected((x) => {
                const matches = matching().length
                return (x + dir + matches) % matches
              })
              event.preventDefault()
              return
            }

            if (event.key == "Enter") {
              const choice = matching()[selected()]
              if (choice) {
                setField(() => choice[0])
                setAttemptedBlur()
                props.onInput?.(choice[0])
                props.onChange?.(choice[0])
                setSelected(0)
              }
              event.preventDefault()
              event.currentTarget.blur()
              return
            }
          }}
          onInput={(event) => {
            if (event.currentTarget.textContent?.includes("\n")) {
              event.currentTarget.textContent =
                event.currentTarget.textContent.replaceAll("\n", "")
            }

            setField(event.currentTarget.value)
            setAttemptedBlur()
            props.onInput?.(event.currentTarget.value)
            setSelected(0)
          }}
          onBlur={(event) => {
            const choice = matching()[selected()]
            if (choice) {
              setField(() => choice[0])
              setAttemptedBlur()
              props.onInput?.(choice[0])
              props.onChange?.(choice[0])
              setSelected(0)
              return
            }

            if (props.options.includes(field() as T)) {
              props.onChange?.(field() as T)
              return
            }

            setAttemptedBlur(1)
            event.currentTarget.focus()
          }}
          value={field()}
        />

        <div class="pointer-events-none absolute right-0 top-0 flex h-8 w-8 items-center justify-center">
          <Fa class="h-4 w-4" icon={faChevronDown} title="show dropdown" />
        </div>

        <div class="hidden max-h-48 select-none flex-col overflow-y-auto rounded-b-lg border-t border-z bg-z-body transition-all peer-focus:flex">
          <For
            each={matching()}
            fallback={
              <div class="px-2 py-0.5 italic">
                That option does not exist.
                <Show when={attemptedBlur()}>
                  <br />
                  Select an option to continue.
                </Show>
              </div>
            }
          >
            {([match, pos], index) => (
              <button
                class="border-dashed border-z px-2 py-0.5 text-left"
                classList={{
                  "bg-z-body-selected": index() == selected(),
                  "border-t": index() != 0 && infIndex() == index(),
                  "-mt-px": index() != 0 && infIndex() == index(),
                }}
                ref={(el) => {
                  createEffect(() => {
                    if (index() == selected()) {
                      el.scrollIntoView({ block: "nearest", inline: "nearest" })
                    }
                  })
                }}
                onClick={(event) => {
                  setField(() => match)
                  setAttemptedBlur()
                  props.onInput?.(match)
                  props.onChange?.(match)
                  setSelected(0)
                  event.currentTarget.blur()
                }}
                onMouseOver={() => {
                  setSelected(index())
                }}
                tabIndex={-1}
              >
                <span>{match.slice(0, pos)}</span>
                <span class="font-semibold text-z-heading">
                  {match.slice(pos, pos + field().length)}
                </span>
                <span>{match.slice(pos + field().length)}</span>
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
