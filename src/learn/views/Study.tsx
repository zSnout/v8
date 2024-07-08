import { Fa } from "@/components/Fa"
import {
  Modal,
  ModalButtons,
  ModalCancel,
  ModalConfirm,
  ModalDescription,
  ModalRef,
  ModalTitle,
} from "@/components/Modal"
import { notNull, prayTruthy } from "@/components/pray"
import { unwrap } from "@/components/result"
import {
  ContentCard,
  Full,
  Response,
  ResponseGray,
  ResponsesGrid,
  Shortcut,
} from "@/pages/quiz/layout"
import { timestampDist } from "@/pages/quiz/shared"
import {
  faBackward,
  faBook,
  faBrain,
  faCalendar,
  faClock,
  faCopy,
  faEarListen,
  faEyeSlash,
  faFlag,
  faForward,
  faInfoCircle,
  faMicrophone,
  faPause,
  faPen,
  faPersonDigging,
  faPlay,
  faRightFromBracket,
  faSliders,
  faSync,
  faTags,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import {
  batch,
  createMemo,
  createSignal,
  For,
  getOwner,
  JSX,
  Owner,
  runWithOwner,
  Show,
} from "solid-js"
import { createStore, unwrap as unwrapSolid } from "solid-js/store"
import { Grade, Rating } from "ts-fsrs"
import { Layerable } from "../el/Layers"
import * as Flags from "../lib/flags"
import { Scheduler } from "../lib/scheduler"
import { App } from "../lib/state"
import * as Template from "../lib/template"

// TODO: keyboard shortcuts should have `keydown` listeners
// TODO: screen for when no cards are left
// TODO: adjust shortcuts for mac/windows
// TODO: add an `onbeforeunload` handler

export const Study = (({ app, scheduler }, pop) => {
  const owner = getOwner()
  const [card, __unsafeRawSetCard] = createSignal({
    card: scheduler.nextCard(Date.now()),
    shownAt: Date.now(),
  })
  function nextCard() {
    __unsafeRawSetCard({
      card: scheduler.nextCard(Date.now()),
      shownAt: Date.now(),
    })
  }
  function notifyOfCardUpdate() {
    __unsafeRawSetCard((x) => ({ ...x }))
  }
  const [answerShown, setAnswerShown] = createSignal(false)
  const tmpl = createMemo(() => {
    const { card: c } = card()
    if (!c) {
      return { qhtml: "", ahtml: "", css: "", source: [] }
    }

    const deck = notNull(
      app.decks.byId[c.card.did],
      "Card must be linked to a deck which exists.",
    )

    const note = notNull(
      app.notes.byId[c.card.nid],
      "Card must be linked to a note which exists.",
    )

    const model = notNull(
      app.models.byId[note.mid],
      "Note must be linked to a model which exists.",
    )

    const fields = Template.fieldRecord(model.fields, note.fields)

    const tmpl = notNull(
      model.tmpls[c.card.tid],
      "Card must be linked to a template which exists.",
    )

    const qc = unwrap(Template.parse(tmpl.qfmt))
    const ac = unwrap(Template.parse(tmpl.afmt))
    const qhtml = Template.generate(qc, fields, { FrontSide: undefined })
    const ahtml = Template.generate(ac, fields, { FrontSide: qhtml })

    return { qhtml, ahtml, css: model.css, source: [deck.name] }
  })
  const repeat = createMemo(() => {
    const now = Date.now()
    return { info: card().card?.repeat(now, 0), now }
  })
  const [now, setNow] = createSignal(Date.now())
  const [prefs, _______unsafeRawSetPrefs] = createStore(app.prefs.prefs)
  const setPrefs = function (this: any) {
    _______unsafeRawSetPrefs.apply(this, arguments as never)
    app.prefs.set(unwrapSolid(prefs))
  } as typeof _______unsafeRawSetPrefs
  setInterval(() => setNow(Date.now()), 30_000)

  return {
    el: (
      <div class="flex min-h-full w-full flex-1 flex-col">
        <Full
          layer
          responses={Responses()}
          content={Content()}
          sidebar={Sidebar()}
          sidebarState={app.prefs.prefs.sidebar_state}
          onSidebarState={(state) =>
            void (app.prefs.prefs.sidebar_state = state)
          }
        />
      </div>
    ),
    onForcePop() {
      return true
    },
  }

  function Content() {
    return (
      <Show fallback={<NullCard />} when={card().card}>
        <ContentCard
          fullFront
          source={prefs.show_deck_name && tmpl().source}
          front={
            <Template.Render
              html={tmpl()[answerShown() ? "ahtml" : "qhtml"]}
              css={tmpl().css}
              class="flex-1"
              theme="auto"
            />
          }
        />
      </Show>
    )
  }

  function Responses() {
    return (
      <Show
        fallback={
          <ResponseGray onClick={pop}>
            Exit Session
            <Shortcut key="0" />
          </ResponseGray>
        }
        when={card().card}
      >
        <Show
          fallback={
            <ResponseGray onClick={() => setAnswerShown(true)}>
              Reveal Answer
              <Shortcut key="0" />
            </ResponseGray>
          }
          when={answerShown()}
        >
          <ResponsesGrid class="grid-cols-4">
            <Button
              class="bg-red-300 text-red-900"
              rating={Rating.Again}
              label="Again"
              shortcut="1"
            />

            <Button
              class="bg-[#ffcc91] text-yellow-900"
              rating={Rating.Hard}
              label="Hard"
              shortcut="2"
            />

            <Button
              class="bg-green-300 text-green-900"
              rating={Rating.Good}
              label="Good"
              shortcut="3"
            />

            <Button
              class="bg-blue-300 text-blue-900"
              rating={Rating.Easy}
              label="Easy"
              shortcut="4"
            />
          </ResponsesGrid>
        </Show>
      </Show>
    )
  }

  function answer(grade: Grade) {
    const { card: c, shownAt } = card()
    prayTruthy(c, "Cannot answer a `null` card.")
    const now = Date.now()
    unwrap(c.review(now, Math.max(0, now - shownAt), grade))
    batch(() => {
      nextCard()
      setAnswerShown(false)
    })
  }

  function Button(props: {
    class: string
    rating: Grade
    shortcut: string
    label: string
  }) {
    return (
      <Response class={props.class} onClick={() => answer(props.rating)}>
        {props.label}
        <br />
        {(() => {
          const r = repeat()
          if (!r.info) {
            return "<null>"
          }

          const q = r.info[props.rating]
          return timestampDist((q.card.due - r.now) / 1000)
        })()}
        <Shortcut key={props.shortcut} />
      </Response>
    )
  }

  function QuickAction(props: {
    icon: IconDefinition
    label: string
    onClick?: () => void
    shortcut?: string
    disabled?: boolean
  }) {
    const { shortcut = "" } = props
    const mods = shortcut.match(/[⇧⌘⌥⌫]/g)?.join("") ?? ""
    const keys = shortcut.match(/[^⇧⌘⌥⌫]/g)?.join("") ?? ""

    return (
      <button
        class="z-field mx-[calc(-0.5rem_-_1px)] flex items-center gap-2 border-transparent bg-transparent px-2 py-0.5 text-z shadow-none transition hover:enabled:bg-z-body-selected"
        onClick={props.onClick}
        disabled={props.disabled || !props.onClick}
      >
        <Fa class="h-4 w-4" icon={props.icon} title={false} />
        <span class="flex-1 text-left">{props.label}</span>
        <span class="text-right text-sm text-z-subtitle">
          {mods}
          <span class="font-mono">{keys}</span>
        </span>
      </button>
    )
  }

  function QuickActionLine() {
    return <hr class="my-2 border-z" />
  }

  function FlagsSelector() {
    return (
      <div class="mb-1 flex gap-2">
        <For each={Flags.ALL_FLAGS}>
          {(flag) => {
            const checked = createMemo(() => {
              const c = card().card?.card
              if (!c) {
                return false
              }
              return Flags.has(c.flags, flag)
            })

            return (
              <button
                class={`flex aspect-square flex-1 items-center justify-center rounded-lg border border-current ${flag.text} ${flag.bg} z-field p-0 shadow-none`}
                classList={{ "opacity-30": !checked() }}
                role="checkbox"
                aria-checked={checked()}
                aria-label={flag.color + " flag"}
                onClick={() => {
                  const c = card().card
                  if (!c) {
                    return
                  }
                  c.merge({ flags: Flags.toggle(c.card.flags, flag) })
                  notifyOfCardUpdate()
                }}
              >
                <Show when={checked()}>
                  <Fa
                    class="h-4 w-4 icon-current"
                    icon={faFlag}
                    title={false}
                  />
                </Show>
              </button>
            )
          }}
        </For>
      </div>
    )
  }

  function MarksSelector() {
    return (
      <div class="mb-1 flex gap-2">
        <For each={Flags.ALL_MARKS}>
          {(mark) => {
            const checked = createMemo(() => {
              const c = card().card?.note
              if (!c) {
                return false
              }
              return Flags.has(c.marks, mark)
            })

            return (
              <button
                class={`z-field flex aspect-square flex-1 items-center justify-center rounded-lg border p-0 shadow-none`}
                classList={{
                  "opacity-30": !checked(),
                  "bg-z-body-selected": checked(),
                  // "border-transparent": checked(),
                }}
                role="checkbox"
                aria-checked={checked()}
                aria-label={mark.shape + " mark"}
                onClick={() => {
                  const c = card().card
                  if (!c) {
                    return
                  }
                  c.note.marks = Flags.toggle(c.note.marks, mark)
                  notifyOfCardUpdate()
                }}
              >
                <Fa
                  class="h-4 w-4 icon-current"
                  icon={checked() ? mark.fill : mark.outline}
                  title={false}
                />
              </button>
            )
          }}
        </For>
      </div>
    )
  }

  // TODO: undo
  function Sidebar() {
    return (
      <div class="flex w-full flex-1 flex-col">
        <h1 class="pb-0.5 text-center">Quick Actions</h1>
        <QuickActionLine />
        <QuickAction
          icon={faRightFromBracket}
          label="Exit Session"
          shortcut="Esc"
          onClick={pop}
        />
        <QuickAction icon={faSync} label="Sync" shortcut="Y" />
        <QuickActionLine />
        <QuickAction icon={faSliders} label="Deck Options" shortcut="O" />
        <QuickAction
          icon={faBook}
          label="Toggle Deck Name"
          shortcut="N"
          onClick={() => setPrefs("show_deck_name", (v) => !v)}
        />
        <QuickAction
          icon={faClock}
          label="Toggle Per-Card Timer"
          shortcut="C"
        />
        <QuickAction icon={faForward} label="Auto Advance" shortcut="⇧A" />
        <QuickActionLine />
        {/* <Show when={prefs.show_flags_in_sidebar}> */}
        <FlagsSelector />
        {/* </Show> */}
        {/* <QuickAction
          icon={faFlag}
          label="Toggle Flags in Sidebar"
          onClick={() => setPrefs("show_flags_in_sidebar", (x) => !x)}
        /> */}
        <QuickAction
          icon={faPersonDigging}
          label="Bury Card"
          shortcut="-"
          onClick={() => {
            card().card?.bury(Date.now())
            nextCard()
          }}
          disabled={!card().card}
        />
        <QuickAction
          icon={faBrain}
          label="Forget Card..."
          shortcut="⌥⌘N"
          onClick={async () => {
            const mode = await selectForgetMode(owner)
            if (mode == null) {
              return
            }
            card().card?.reviewForget(
              Date.now(),
              Math.max(0, Date.now() - card().shownAt),
              mode,
            )
            nextCard()
          }}
        />
        <QuickAction icon={faCalendar} label="Set Due Date..." shortcut="⇧⌘D" />
        <QuickAction
          icon={faEyeSlash}
          label="Suspend Card"
          shortcut="@"
          onClick={() => {
            card().card?.suspend(Date.now())
            nextCard()
          }}
          disabled={!card().card}
        />
        <QuickAction icon={faInfoCircle} label="Card Info" shortcut="I" />
        <QuickAction
          icon={faInfoCircle}
          label="Previous Card Info"
          shortcut="⌥⌘I"
        />
        <QuickActionLine />
        {/* <Show when={prefs.show_marks_in_sidebar}> */}
        <MarksSelector />
        {/* </Show> */}
        {/* <QuickAction
          icon={faBookmark}
          label="Toggle Marks in Sidebar"
          shortcut="M"
          onClick={() => setPrefs("show_marks_in_sidebar", (x) => !x)}
        /> */}
        <QuickAction
          icon={faPersonDigging}
          label="Bury Note"
          shortcut="="
          onClick={() => {
            const c = card().card
            if (!c) {
              return
            }
            const all = app.cards.byNid[c.card.nid]
            if (!all) {
              return
            }
            for (const card of all) {
              // don't bury suspended cards
              if (card.queue == 0) {
                card.queue = 1
              }
            }
            nextCard()
          }}
          disabled={!card().card}
        />
        <QuickAction
          icon={faEyeSlash}
          label="Suspend Note"
          shortcut="!"
          onClick={() => {
            const c = card().card
            if (!c) {
              return
            }
            const all = app.cards.byNid[c.card.nid]
            if (!all) {
              return
            }
            for (const card of all) {
              card.queue = 2
            }
            nextCard()
          }}
          disabled={!card().card}
        />
        <QuickAction icon={faCopy} label="Create Copy..." shortcut="⌥⌘E" />
        <QuickAction icon={faTrash} label="Delete Note" shortcut="⌘⌫" />
        <QuickAction icon={faPen} label="Edit Note" shortcut="E" />
        <QuickAction icon={faTags} label="Edit Tags" shortcut="T" />
        <QuickActionLine />
        {/* play audio should change to replay audio sometimes */}
        <QuickAction icon={faPlay} label="Play Audio" shortcut="R" />
        <QuickAction icon={faPause} label="Pause Audio" shortcut="5" />
        <QuickAction icon={faBackward} label="Audio -5s" shortcut="6" />
        <QuickAction icon={faForward} label="Audio +5s" shortcut="7" />
        <QuickAction
          icon={faMicrophone}
          label="Record Own Voice"
          shortcut="⇧V"
        />
        <QuickAction icon={faEarListen} label="Replay Own Voice" shortcut="V" />
      </div>
    )
  }

  function NullCard() {
    return (
      <div class="flex w-full flex-1 flex-col items-center justify-center gap-8">
        <p class="text-8xl">🎉</p>
        <h1 class="text-center text-xl font-semibold text-z-heading">
          Congratulations! You have finished this deck for now.
        </h1>
        <div class="mx-auto flex w-full max-w-md flex-col gap-2">
          <Show when={scheduler.new.length}>
            <NullMoreNewAvailable />
          </Show>
          <Show when={scheduler.learning.length}>
            <NullMoreLearningAvailable />
          </Show>
          <Show when={scheduler.review.length}>
            <NullMoreReviewBacklogAvailable />
          </Show>
          <p>
            If you wish to study outside of the regular schedule, you can use
            the <InlineButton>custom study</InlineButton> feature.
          </p>
        </div>
      </div>
    )
  }

  function NullMoreNewAvailable() {
    return (
      <p>
        There are more new cards available, but the daily limit has been
        reached. You may <InlineButton>increase today's limit</InlineButton> if
        you wish, but beware that adding too many new cards will make your daily
        reviews in the near future skyrocket.
      </p>
    )
  }

  function NullMoreLearningAvailable() {
    const earliest = scheduler.learning.length
      ? scheduler.learning.reduce((a, b) => (a.due < b.due ? a : b))
      : undefined

    return (
      <p>
        There are still some learning cards left, but they aren't due for{" "}
        {earliest
          ? timestampDist((earliest.due - now()) / 1000)
          : "<unknown time>"}
        .
      </p>
    )
  }

  function NullMoreReviewBacklogAvailable() {
    return (
      <p>
        There are more review cards due today, but the daily limit has been
        reached. You may <InlineButton>increase today's limit</InlineButton> if
        you wish, which can help if you have a large backlog.
      </p>
    )
  }

  function InlineButton(props: {
    children: JSX.Element
    onClick?: () => void
  }) {
    return (
      <button
        class="whitespace-normal text-z-link underline underline-offset-2"
        onClick={props.onClick}
      >
        {props.children}
      </button>
    )
  }
}) satisfies Layerable<{
  app: App
  scheduler: Scheduler
}>

async function selectForgetMode(owner: Owner | null) {
  return await new Promise<null | boolean>((resolve) => {
    let modal: ModalRef
    let portal: HTMLDivElement

    runWithOwner(owner, () => (
      <Modal
        ref={(e) => (modal = e)}
        refPortal={(e) => (portal = e)}
        onClose={(value) => {
          resolve(value == "false" ? false : value == "true" ? true : null)
          portal.ontransitionend = () => portal.remove()
        }}
      >
        <ModalTitle>Reset review and lapse counts?</ModalTitle>
        <ModalDescription>
          By the way, forgetting a card means that it will be treated as a new
          card.
        </ModalDescription>
        <ModalButtons>
          <ModalCancel onClick={() => modal.close("null")}>Cancel</ModalCancel>
          <ModalCancel onClick={() => modal.close("false")}>
            Yes, reset
          </ModalCancel>
          <ModalConfirm onClick={() => modal.close("true")}>
            No, keep them
          </ModalConfirm>
        </ModalButtons>
      </Modal>
    ))

    setTimeout(() => modal!.showModal(), 1)
  })
}
