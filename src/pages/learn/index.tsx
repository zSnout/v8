import { MatchResult } from "@/components/MatchResult"
import { Result, error, ok } from "@/components/result"
import css from "@/layouts/index.postcss?inline"
import { For, Show, createEffect, createMemo, createSignal } from "solid-js"
import {
  Rating,
  RecordLog,
  createEmptyCard,
  fsrs,
  type Card as BaseCard,
} from "ts-fsrs"
import {
  ContentCard,
  ContentError,
  Full,
  Response,
  ResponseGray,
  ResponsesGrid,
  Shortcut,
} from "../quiz/layout"
import { timestampDist } from "../quiz/shared"
import cardStyle from "./card.postcss?inline"
import {
  ERR_NO_NEW_CARDS_AVAILABLE,
  ERR_WAITING_FOR_REVIEWS,
} from "./scheduler"

export interface Card extends Readonly<Omit<BaseCard, "due" | "last_review">> {
  readonly cid: string
  readonly due?: Date | number
  readonly last_review?: Date | number
  readonly deck: string
  readonly front: string
  readonly back: string
  readonly style: string
}

export function Main() {
  function __nextCardRawDoNotUsedUnsafeDangerouslyInnerHtmlSetReact(
    now = Date.now(),
    c = cards(),
  ): Result<[Card, number]> {
    if (!c.length) {
      return error(ERR_NO_NEW_CARDS_AVAILABLE)
    }

    const delay = now + forcedDelay()

    let output: Card | undefined
    let outputDue: number | undefined
    let index = -1

    for (let i = 0; i < c.length; i++) {
      const card = c[i]!
      const due = card.due?.valueOf() ?? now

      // if it is due too far in the future, ignore it
      if (due > delay) {
        continue
      }

      // if there is a card already there
      if (output) {
        // and we're due sooner, replace it
        if (due < outputDue!) {
          output = card
          outputDue = due
          index = i
        }
      }

      // otherwise, set the card to this one
      else {
        output = card
        outputDue = due
        index = i
      }
    }

    if (output) {
      return ok([output, index])
    }

    return error(ERR_WAITING_FOR_REVIEWS)
  }

  interface NextCardData {
    card: Card
    log: RecordLog
    now: number
    index: number
  }

  function createCard(): Card {
    return {
      ...createEmptyCard<BaseCard>(),
      due: undefined,
      cid: crypto.randomUUID(),
      front: "<div class='front'>wow</div>",
      back: "<div class='front'>wow</div><hr class='hr'/><div class='back'>no</div>",
      deck: "hi::world",
      style: cardStyle,
    }
  }

  const [cards, setCards] = createSignal<readonly Card[]>(
    Array.from({ length: 10 }, createCard),
  )

  const [forcedDelay, setForcedDelay] = createSignal(1000 * 60 * 20)

  const f = fsrs({
    w: [
      0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
      0.34, 1.26, 0.29, 2.61,
    ],
  })

  const nextCard = createMemo((): Result<NextCardData> => {
    const now = Date.now()

    const c = __nextCardRawDoNotUsedUnsafeDangerouslyInnerHtmlSetReact(
      now,
      cards(),
    )

    if (!c.ok) {
      return c
    }

    const {
      value: [card, index],
    } = c

    const log = f.repeat({ ...card, due: card.due ?? now }, now)

    return ok({ card, log, now, index })
  })

  const frame = (
    <iframe
      class="min-h-full w-full"
      src="about:blank"
      sandbox="allow-same-origin"
    />
  ) as HTMLIFrameElement

  const [answerShown, setAnswerShown] = createSignal(false)

  createEffect(() => {
    if (typeof HTMLIFrameElement != "function") {
      return
    }

    const result = nextCard()
    if (!result.ok) {
      return
    }

    const shown = answerShown()

    const { card } = result.value
    frame.srcdoc = `<style>${escape(css)}</style><style>${escape(
      card.style,
    )}</style>${shown ? card.back : card.front}`
    setFrameSize()
  })

  function escape(text: string) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;")
  }

  function setFrameSize() {
    const doc = frame.contentDocument!
    frame.height = "0"
    frame.height = doc.body.scrollHeight + "px"
  }

  return (
    <Full
      content={
        <MatchResult
          fallback={(error) => <ContentError>{error()}</ContentError>}
          result={nextCard()}
        >
          {() => <ContentCard fullFront source={["learn"]} front={frame} />}
        </MatchResult>
      }
      responses={
        <MatchResult
          fallback={(error) => (
            <ResponseGray>
              TODO: add onclick
              <br />
              See error message.
            </ResponseGray>
          )}
          result={nextCard()}
        >
          {(card) => (
            <Show
              fallback={
                <ResponseGray onClick={() => setAnswerShown(true)}>
                  Reveal Answer
                  <Shortcut key="Space" />
                </ResponseGray>
              }
              when={answerShown()}
            >
              <ResponsesGrid class="grid-cols-4">
                <For
                  each={
                    [
                      ["bg-red-300 text-red-900", Rating.Again, 1],
                      ["bg-[#ffcc91] text-yellow-900", Rating.Hard, 2],
                      ["bg-green-300 text-green-900", Rating.Good, 3],
                      ["bg-blue-300 text-blue-900", Rating.Easy, 4],
                    ] as const
                  }
                >
                  {([className, rating, key]) => (
                    <Response
                      class={className}
                      onClick={() => {
                        const data = card()
                        const now = Date.now()
                        const input = {
                          ...data.card,
                          due: data.card.due ?? now,
                        }
                        const log = f.repeat(input, now)[rating]
                        setCards((x) => x.with(data.index, log.card as Card))
                        setAnswerShown(false)
                      }}
                    >
                      {Rating[rating]}
                      <br />
                      {timestampDist(
                        Math.floor(
                          (card().log[rating].card.due.valueOf() - card().now) /
                            1000,
                        ),
                      )}
                      <Shortcut key={"" + key} />
                    </Response>
                  )}
                </For>
              </ResponsesGrid>
            </Show>
          )}
        </MatchResult>
      }
      sidebar={
        <div class="grid grid-cols-[repeat(3,auto)] gap-x-4">
          <For
            each={cards()
              .slice()
              .sort(
                (a, b) =>
                  (a.due?.valueOf() ?? Date.now()) -
                  (b.due?.valueOf() ?? Date.now()),
              )}
          >
            {(item) => (
              <>
                <p class="font-mono">{item.cid.slice(0, 8)}</p>
                <span class="h-full w-px bg-z-border" />
                <p>
                  {item.due
                    ? timestampDist((item.due.valueOf() - Date.now()) / 1000)
                    : "new"}
                </p>
              </>
            )}
          </For>
        </div>
      }
    />
  )
}
