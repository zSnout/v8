import { pray } from "@/components/pray"
import { State } from "ts-fsrs"
import { App } from "./state"
import { AnyCard, Conf, Deck } from "./types"

export class Scheduler {
  new!: AnyCard[]
  learning!: AnyCard[]
  review!: AnyCard[]
  lastGather!: number

  constructor(
    readonly main: Deck,
    readonly decks: Deck[],
    readonly conf: Conf,
    readonly app: App,
    now: number,
  ) {
    this.gather(now)
  }

  // FIXME: keep in line with `bucketOf`
  bucketOf(today: number, card: AnyCard): CardBucket {
    if (card.state == State.New) {
      return 0
    } else if (card.state == State.Learning || card.state == State.Relearning) {
      if (card.scheduled_days == 0) {
        return 1
      } else {
        return 2
      }
    } else if (this.app.prefs.startOfDay(card.due) <= today) {
      return 2
    } else {
      return null
    }
  }

  gather(now: number) {
    const today = (this.lastGather = this.app.prefs.startOfDay(now))
    const b0: AnyCard[] = (this.new = [])
    const b1: AnyCard[] = (this.learning = [])
    const b2: AnyCard[] = (this.review = [])

    const {
      app: {
        cards: { byDid },
      },
      decks,
    } = this

    for (const deck of decks) {
      const cards = byDid[deck.id]
      if (!cards) continue

      for (const card of cards) {
        // FIXME: keep in line with `bucketOf`
        if (card.state == State.New) {
          b0.push(card)
        } else if (
          card.state == State.Learning ||
          card.state == State.Relearning
        ) {
          if (card.scheduled_days == 0) {
            b1.push(card)
          } else {
            b2.push(card)
          }
        } else if (this.app.prefs.startOfDay(card.due) <= today) {
          b2.push(card)
        }
      }
    }
  }

  /** Returns `true` if the buckets changed, and `false` otherwise. */
  regather(now: number): boolean {
    const today = this.app.prefs.startOfDay(now)

    if (today == this.lastGather) {
      return false
    }

    this.gather(today)
    return true
  }

  newCardsSeenToday(now: number) {
    let seen = 0

    for (const deck of this.decks) {
      if (this.app.prefs.isSameDay(deck.today, now)) {
        seen += deck.new_today
      }
    }

    return seen
  }

  newCardsLeft(now: number) {
    if (!this.app.prefs.isSameDay(this.main.today, now)) {
      return this.conf.new.per_day
    }

    const limit = this.main.custom_newcard_limit ?? this.conf.new.per_day
    const seen = this.newCardsSeenToday(now)

    return Math.max(0, limit - seen)
  }

  /**
   * Provides a fast lower bound for the number of reviews today. Could be
   * significantly improved, but doesn't need to be.
   */
  estimatedReviewsLeft(now: number) {
    const newLeft = this.newCardsLeft(now)
    const learningLeft = this.learning.length
    const reviewsLeft = this.review.length
    return newLeft + learningLeft + reviewsLeft
  }

  /** Picks a learning card due before `now`. */
  private pickLearningWithin(now: number) {
    const possible = this.learning.filter((x) => x.due <= now)
    if (possible.length == 0) {
      return null
    }

    const card = possible[Math.floor(Math.random() * possible.length)]
    if (!card) {
      return null
    }

    // Could be optimized, but I'd rather finish the project.
    const index = this.learning.indexOf(card)

    return new DueCard(card, this, 1, index, false)
  }

  /** Picks a review card. */

  /** Selects a card to review. This may be a learning or review card. */
  nextReview() {}
}

type CardBucket =
  | 0 // new
  | 1 // learning
  | 2 // review
  | null // none

const BUCKETS = ["new", "learning", "review"] as const

export class DueCard {
  constructor(
    readonly card: AnyCard,
    private scheduler: Scheduler,
    private bucket: CardBucket,
    private index: number,
    private saved: boolean,
  ) {}

  /**
   * Removes this card from its old bucket. Regathers. Returns true if
   * regathering happened.
   */
  private remove(now: number) {
    const haveBucketsBeenReplaced = this.scheduler.regather(now)

    if (haveBucketsBeenReplaced) {
      return true
    }

    if (this.bucket == null) {
      return false
    }

    const bucket = this.scheduler[BUCKETS[this.bucket]]
    pray(bucket[this.index]?.id == this.card.id, "Card ids should match.")
    bucket.splice(this.index, 1)
    return false
  }

  /** Inserts this card into a new bucket. Does not regather. */
  private add(now: number) {
    const bucketIndex = this.scheduler.bucketOf(
      this.scheduler.app.prefs.startOfDay(now),
      this.card,
    )

    if (bucketIndex == null) {
      this.index = -1
      return
    }

    const bucket = this.scheduler[BUCKETS[bucketIndex]]
    bucket.push(this.card)
  }

  /**
   * If the scheduler is tampered with before `.save()` is called, its results
   * will be unpredictable.
   *
   * The `DueCard` should not be used after calling `.save()`.
   */
  save(now: number) {
    if (this.saved) {
      throw new Error("A `DueCard` cannot be saved twice.")
    } else {
      this.saved = true
    }

    const didRegather = this.remove(now)

    if (!didRegather) {
      this.add(now)
    }
  }
}

/**
 * Algorithm for picking cards
 *
 * BASE SELECTION
 * 1. If any learning cards with a 0-day interval are due, show the oldest one.
 * 2. Pick a random learning or review card and show it.
 *
 * NEW CARD INSERTION
 * 3. Evenly distribute new cards throughout the session.
 */
