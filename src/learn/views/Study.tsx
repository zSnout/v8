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
import { batch, createMemo, createSignal, Show } from "solid-js"
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
    )
  }

  function Responses() {
    return (
      // TODO: this should change based on `answerShown`

      <Show
        fallback={
          <ResponseGray onClick={close}>
            Close
            <Shortcut key="0" />
          </ResponseGray>
        }
        when={card()}
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
}
