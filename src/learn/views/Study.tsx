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
            Back to Decks
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

  function Sidebar() {
    return (
      <div class="w-full flex-1">
        <h1 class="text-center">Quick Actions</h1>
        <button onClick={close}>Exit</button>
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
