import { App } from "./state"
import { AnyCard, Conf, Deck } from "./types"

export class Scheduler {
  readonly cards: AnyCard[]

  constructor(
    readonly main: Deck,
    readonly decks: Deck[],
    readonly conf: Conf,
    private app: App,
  ) {
    this.cards = this.decks.flatMap((x) => app.cards.byDid[x.id] ?? [])
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

// export class SCard {}
