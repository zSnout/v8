import type { Json } from "@/components/basic-tree"
import { pray } from "@/components/pray"
import { Result, error, ok } from "@/components/result"
import {
  DateInput,
  Grade,
  Grades,
  Rating,
  State,
  fsrs,
  type Card as BaseCard,
  type RecordLog as BaseRecordLog,
} from "ts-fsrs"
import * as z from "zod"
import cardStyle from "./card.postcss?inline"
import type { AnyCard, DeckOptions, NewCard, ReviewedCard } from "./types"

export function cardAfterHandler(base: BaseCard): NewCard {
  return {
    ...base,
    due: undefined,
    last_review: undefined,
    cid: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    front: "<div class='front'>wow</div>",
    back: "<div class='front'>wow</div><hr class='hr'/><div class='back'>no</div>",
    deck: "hi::world",
    style: cardStyle,
  }
}

export function recordAfterHandler(recordLog: BaseRecordLog): RecordLog {
  const output = {} as RecordLog

  for (const grade of Grades) {
    const { log, card: baseCard } = recordLog[grade]
    const card = baseCard as ReviewedCard

    output[grade] = {
      card,
      log: { ...log, cid: card.cid },
    }
  }

  return output
}

export class Scheduler {
  private readonly f = fsrs({
    // w: [
    //   0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
    //   0.34, 1.26, 0.29, 2.61,
    // ],
    enable_fuzz: true,
  })

  repeat(card: AnyCard, now: DateInput): RecordLog {
    return this.f.repeat(
      { ...card, due: card.due ?? now },
      now,
      recordAfterHandler,
    )
  }
}

export function defaultDeckOptions(): DeckOptions {
  return {
    newCards: { perDay: 30, method: "sequential" },
    today: { newCardsSeen: 0, date: 0 },
    reviews: { delay: 1000 * 60 * 20 },
    dayStart: 1000 * 60 * 60 * 4,
  }
}

export const ERR_NO_NEW_CARDS_AVAILABLE = "No new cards available today."
export const ERR_WAITING_FOR_REVIEWS = "Waiting for reviews to be due."

export class DeckManager {
  private readonly scheduler = new Scheduler()

  constructor(
    private name: string,
    private cards: AnyCard[],
    private log: ReviewLog[],
    private options: DeckOptions,
  ) {}

  private nextNewCard(
    possibleIndices: number[],
  ): Result<{ card: NewCard; index: number }> {
    if (possibleIndices.length == 0) {
      return error(ERR_NO_NEW_CARDS_AVAILABLE)
    }

    const index =
      possibleIndices[
        {
          sequential: 0,
          random: Math.floor(Math.random() * possibleIndices.length),
        }[this.options.newCards.method]
      ]!

    const card = this.cards[index]!

    pray(card.due == null, "Card must be a new card.")
    card satisfies NewCard

    return ok({ card, index })
  }

  beginningOfDay(now: number | Date): number {
    const date = new Date(now)
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(this.options.dayStart)
    let value = date.valueOf()
    if (value > now.valueOf()) {
      value -= 1000 * 60 * 60 * 24
    }
    return value
  }

  newCardsSeenToday(now: number): number {
    const {
      today: { date, newCardsSeen },
    } = this.options

    const beginningToday = this.beginningOfDay(now)
    const beginningThen = this.beginningOfDay(date)

    // rounded a minute just in case decimals are weird
    const diff = Math.round(((beginningToday - beginningThen) / 1000) * 60)

    if (diff == 0) {
      return newCardsSeen
    } else {
      return 0
    }
  }

  newCardsLeftToday(now: number): number {
    const {
      today: { date, newCardsSeen },
      newCards: { perDay },
    } = this.options

    const beginningToday = this.beginningOfDay(now)
    const beginningThen = this.beginningOfDay(date)

    // rounded a minute just in case decimals are weird
    const diff = Math.round(((beginningToday - beginningThen) / 1000) * 60)

    if (diff < 0) {
      return 0
    } else if (diff > 0) {
      return perDay
    } else {
      return Math.max(perDay - newCardsSeen, 0)
    }
  }

  nextCard(now: number): Result<{ card: AnyCard; index: number }> {
    let output: { card: ReviewedCard; index: number; due: number } | undefined
    const newCards: number[] = []
    const earliestAllowedReview = now + this.options.reviews.delay

    for (let index = 0; index < this.cards.length; index++) {
      const card = this.cards[index]!
      const { due } = card

      if (due == null) {
        newCards.push(index)
        continue
      }

      if (due.valueOf() > earliestAllowedReview) {
        continue
      }

      if (!output || due.valueOf() < output.due) {
        output = { card, index, due: due.valueOf() }
        continue
      }
    }

    if (
      (!output || (output.due < now && newCards.length)) &&
      this.newCardsLeftToday(now) > 0
    ) {
      return this.nextNewCard(newCards)
    }

    if (output) {
      return ok({ card: output.card, index: output.index })
    }

    return error(ERR_NO_NEW_CARDS_AVAILABLE)
  }

  saveReview(card: AnyCard, index: number, rating: Grade, now: number) {
    pray(this.cards[index]?.cid == card.cid, "index matches card")
    const log = this.scheduler.repeat(card, now)[rating]
    this.cards[index] = log.card
    this.log.push(log.log)
    if (card.due == null) {
      this.options.today = {
        date: now,
        newCardsSeen: this.newCardsSeenToday(now) + 1,
      }
    }
  }

  toJSON() {
    const { name, cards, log, options } = this
    return { name, cards, log, options }
  }

  static fromJSON(json: Json) {
    const value = deckManagerData.safeParse(json)

    if (value.success) {
      const { name, cards, log, options } = value.data
      return ok(new DeckManager(name, cards, log, options))
    } else {
      return error(value.error)
    }
  }
}

const deckManagerData = z.object({
  name: z.string(),
  cards: z
    .object({
      stability: z.number(),
      difficulty: z.number(),
      elapsed_days: z.number(),
      scheduled_days: z.number(),
      reps: z.number(),
      lapses: z.number(),
      state: z.nativeEnum(State),
      cid: z.number(),
      due: z.undefined().optional(),
      last_review: z.undefined().optional(),
      deck: z.string(),
      front: z.string(),
      back: z.string(),
      style: z.string(),
    })
    .or(
      z.object({
        stability: z.number(),
        difficulty: z.number(),
        elapsed_days: z.number(),
        scheduled_days: z.number(),
        reps: z.number(),
        lapses: z.number(),
        state: z.nativeEnum(State),
        cid: z.number(),
        due: z.number().or(z.date()),
        last_review: z.number().or(z.date()),
        deck: z.string(),
        front: z.string(),
        back: z.string(),
        style: z.string(),
      }),
    )
    .array(),
  log: z
    .object({
      rating: z.nativeEnum(Rating),
      state: z.nativeEnum(State),
      due: z.date().or(z.number()),
      stability: z.number(),
      difficulty: z.number(),
      elapsed_days: z.number(),
      last_elapsed_days: z.number(),
      scheduled_days: z.number(),
      review: z.date().or(z.number()),
      cid: z.number(),
    })
    .array(),
  options: z.object({
    newCards: z.object({
      perDay: z.number(),
      method: z.enum(["sequential", "random"]),
    }),
    today: z.object({
      newCardsSeen: z.number(),
      date: z.number().or(z.date()),
    }),
    reviews: z.object({
      delay: z.number(),
    }),
    dayStart: z.number(),
  }),
})
