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
        // FIXME: keep in line with `bucketOf`
        if (card.state == State.New) {
          b0.push(card)
        } else if (
          card.state == State.Learning ||
          card.state == State.Relearning
        ) {
          b1.push(card)
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

  /** The `DueCard` should not be used after calling `.save()`. */
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
