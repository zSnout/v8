import { Fa } from "@/components/Fa"
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
  faBookmark,
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
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { batch, createMemo, createSignal, JSX, Show } from "solid-js"
import { Grade, Rating } from "ts-fsrs"
import { Scheduler } from "../lib/scheduler"
import { App } from "../lib/state"
import * as Template from "../lib/template"

// TODO: keyboard shortcuts
// TODO: screen for when no cards are left

export function Study({
  app,
  scheduler,
  close,
}: {
  app: App
  scheduler: Scheduler
  close: () => void
}) {
  const [card, setCard] = createSignal({
    card: scheduler.nextCard(Date.now()),
    shownAt: Date.now(),
  })
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
  const repeat = createMemo(() => card().card?.repeat(Date.now(), 0))
  const [now, setNow] = createSignal(Date.now())
  setInterval(() => setNow(Date.now()), 30_000)

  return (
    <div class="flex min-h-full w-full flex-1 flex-col">
      <Full
        layer
        responses={Responses()}
        content={Content()}
        sidebar={Sidebar()}
        sidebarState={app.prefs.prefs.sidebar_state}
        onSidebarState={(state) => void (app.prefs.prefs.sidebar_state = state)}
      />
    </div>
  )

  function Content() {
    return (
      <Show fallback={<NullCard />} when={card().card}>
        <ContentCard
          fullFront
          source={tmpl().source}
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
      // TODO: this should change based on `answerShown`

      <Show
        fallback={
          <ResponseGray onClick={close}>
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
      setCard({ card: scheduler.nextCard(now), shownAt: now })
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
          if (!r) {
            return "<null>"
          }

          const q = r[props.rating]
          return timestampDist((q.card.due - q.card.last_review) / 1000)
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
  }) {
    const { shortcut = "" } = props
    const mods = shortcut.match(/[⇧⌘⌥⌫]/g)?.join("") ?? ""
    const keys = shortcut.match(/[^⇧⌘⌥⌫]/g)?.join("") ?? ""

    return (
      <button
        class="z-field mx-[calc(-0.5rem_-_1px)] flex items-center gap-2 border-transparent bg-transparent px-2 py-0.5 text-z shadow-none transition hover:enabled:bg-z-body-selected"
        onClick={props.onClick}
        disabled={!props.onClick}
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

  function Sidebar() {
    return (
      <div class="flex w-full flex-1 flex-col">
        <h1 class="pb-0.5 text-center">Quick Actions</h1>
        <QuickActionLine />
        <QuickAction
          icon={faRightFromBracket}
          label="Exit Session"
          shortcut="Esc"
          onClick={close}
        />
        <QuickAction icon={faSync} label="Sync" shortcut="Y" />
        <QuickActionLine />
        <QuickAction icon={faSliders} label="Deck Options" shortcut="O" />
        <QuickAction icon={faClock} label="Toggle Timer" shortcut="T" />
        <QuickAction icon={faForward} label="Auto Advance" shortcut="⇧A" />
        <QuickActionLine />
        <QuickAction icon={faFlag} label="Flag Card..." />
        <QuickAction icon={faPersonDigging} label="Bury Card" shortcut="-" />
        <QuickAction icon={faBrain} label="Forget Card..." shortcut="⌥⌘N" />
        <QuickAction icon={faCalendar} label="Set Due Date..." shortcut="⇧⌘D" />
        <QuickAction icon={faEyeSlash} label="Suspend Card" shortcut="@" />
        <QuickAction icon={faInfoCircle} label="Card Info" shortcut="I" />
        <QuickAction
          icon={faInfoCircle}
          label="Previous Card Info"
          shortcut="⌥⌘I"
        />
        <QuickActionLine />
        <QuickAction icon={faBookmark} label="Mark Note" shortcut="*" />
        <QuickAction icon={faPersonDigging} label="Bury Note" shortcut="=" />
        <QuickAction icon={faEyeSlash} label="Suspend Note" shortcut="!" />
        <QuickAction icon={faCopy} label="Create Copy..." shortcut="⌥⌘E" />
        <QuickAction icon={faTrash} label="Delete Note" shortcut="⌘⌫" />
        <QuickAction icon={faPen} label="Edit Note" shortcut="E" />
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
}
