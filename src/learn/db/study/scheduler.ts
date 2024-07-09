import { Id } from "@/learn/lib/id"
import { Conf, Deck } from "@/learn/lib/types"
import { DB } from ".."

export class Scheduler {
  new!: Id[]
  learning!: Id[]
  review!: Id[]
  lastGather!: number

  constructor(
    readonly main: Deck,
    readonly decks: Deck[],
    readonly conf: Conf,
    readonly db: DB,
    now: number,
  ) {
    this.gather(now)
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
        if (card.queue == 1 || card.queue == 2) {
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

      // FIXME: this is `this.learning` in the main site
      const index = this.new.indexOf(card)
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
