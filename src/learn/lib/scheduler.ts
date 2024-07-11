import { notNull, pray } from "@/components/pray"
import { ok } from "@/components/result"
import { Grade, State } from "ts-fsrs"
import { App } from "./state"
import { AnyCard, Conf, Deck, Note } from "./types"

// TODO: handle unburying cards

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

  // keep in line with algorithm in `.gather()`
  bucketOf(today: number, card: AnyCard): CardBucket {
    if (card.queue != 0) {
      return null
    }

    if (card.state == State.New) {
      return 0
    } else if (
      (card.state == State.Learning || card.state == State.Relearning) &&
      card.scheduled_days == 0
    ) {
      return 1
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
        if (card.queue != 0) {
          continue
        }

        if (card.state == State.New) {
          b0.push(card)
        } else if (
          (card.state == State.Learning || card.state == State.Relearning) &&
          card.scheduled_days == 0
        ) {
          b1.push(card)
        } else if (this.app.prefs.startOfDay(card.due) <= today) {
          b2.push(card)
        }
      }
    }

    b0.sort((a, b) => a.due - b.due)
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
        seen += deck.new_today.length
      }
    }

    return seen
  }

  reviewsToday(now: number) {
    let seen = 0

    for (const deck of this.decks) {
      if (this.app.prefs.isSameDay(deck.today, now)) {
        seen += deck.revcards_today.length
      }
    }

    return seen
  }

  newCardsLeft(now: number) {
    const count = this.new.length

    if (!this.app.prefs.isSameDay(this.main.today, now)) {
      return Math.min(count, this.conf.new.per_day)
    }

    const limit = this.main.custom_newcard_limit ?? this.conf.new.per_day
    const seen = this.newCardsSeenToday(now)

    return Math.min(count, Math.max(0, limit - seen))
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
  private pickLearningBefore(now: number) {
    const possible = this.learning.filter((x) => x.due <= now)
    const card = possible[Math.floor(Math.random() * possible.length)]
    if (!card) {
      return null
    }

    const index = this.learning.indexOf(card)
    return new DueCard(card, this, 1, index)
  }

  /** Picks a review card. */
  private pickReview() {
    const card = this.review[Math.floor(Math.random() * this.review.length)]
    if (!card) {
      return null
    }

    const index = this.learning.indexOf(card)
    return new DueCard(card, this, 2, index)
  }

  /** Picks a new card. */
  private pickNew() {
    if (this.conf.new.pick_at_random) {
      const card = this.new[Math.floor(Math.random() * this.new.length)]
      if (!card) {
        return null
      }

      const index = this.learning.indexOf(card)
      return new DueCard(card, this, 0, index)
    } else {
      const card = this.new[0]
      if (!card) {
        return null
      }

      return new DueCard(card, this, 0, 0)
    }
  }

  /** Selects a review card to show. */
  private nextReview(now: number) {
    return (
      this.pickLearningBefore(now) ??
      this.pickReview() ??
      this.pickLearningBefore(now + this.app.prefs.prefs.collapse_time * 1000)
    )
  }

  // TODO: limit number of reviews each day
  /** Picks the next card to show. */
  nextCard(now: number) {
    this.regather(now)

    const reviewsDone = this.reviewsToday(now)
    const reviewsLeft = this.estimatedReviewsLeft(now)
    const reviewsTotal = reviewsDone + reviewsLeft

    const newDone = this.newCardsSeenToday(now)
    const newLeft = this.newCardsLeft(now)
    const newTotal = newDone + newLeft

    /** When `true`, indicates that a new card should be shown. */
    const preferNew =
      newLeft >= 0 && newLeft / newTotal >= reviewsLeft / reviewsTotal

    return (
      (preferNew && newLeft >= 0 && this.pickNew()) ||
      this.nextReview(now) ||
      this.pickNew()
    )
  }
}

type CardBucket =
  | 0 // new
  | 1 // learning
  | 2 // review
  | null // none

const BUCKETS = ["new", "learning", "review"] as const

export class DueCard {
  private saved = false
  readonly note: Note

  constructor(
    public card: AnyCard,
    private scheduler: Scheduler,
    private bucket: CardBucket,
    private index: number,
  ) {
    this.note = notNull(
      this.scheduler.app.notes.byId[card.nid],
      "Card is not attached to a note.",
    )
  }

  merge(card: Omit<Partial<AnyCard>, "id">) {
    Object.assign(this.card, card)
  }

  private set(card: AnyCard) {
    const result = this.scheduler.app.cards.set(card)
    if (!result.ok) {
      return result
    }
    this.card = card
    if (this.bucket != null) {
      this.scheduler[BUCKETS[this.bucket]][this.index] = card
    }
    return ok()
  }

  suspend(now: number) {
    this.merge({ queue: 2 })
    this.save(now)
    return ok()
  }

  bury(now: number) {
    this.merge({ queue: 1 })
    this.save(now)
    return ok()
  }

  repeat(now: number, repeatTime: number) {
    return this.scheduler.app.cards.repeat(this.card, now, repeatTime)
  }

  review(now: number, repeatTime: number, grade: Grade) {
    if (this.saved) {
      throw new Error("A `DueCard` cannot be saved twice.")
    }

    const entry = this.repeat(now, repeatTime)[grade]
    const result = this.set(entry.card)
    if (!result.ok) {
      return result
    }
    this.save(now)
    this.scheduler.app.revLog.push(entry.log)
    return ok()
  }

  reviewForget(now: number, repeatTime: number, reset_count: boolean) {
    if (this.saved) {
      throw new Error("A `DueCard` cannot be saved twice.")
    }

    const entry = this.scheduler.app.cards.forget(
      this.card,
      now,
      repeatTime,
      reset_count,
    )
    const result = this.set(entry.card)
    if (!result.ok) {
      return result
    }
    this.save(now)
    this.scheduler.app.revLog.push(entry.log)
    return ok()
  }

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
    if (bucketIndex == 0) {
      // keep `new` bucket sorted properly
      bucket.sort((a, b) => a.due - b.due)
    }
  }

  /**
   * If the scheduler is tampered with before `.save()` is called, its results
   * will be unpredictable.
   *
   * The `DueCard` should not be used after calling `.save()`.
   */
  private save(now: number) {
    // TODO: this needs to update the properties of its corresponding deck

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
