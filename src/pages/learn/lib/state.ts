import { notNull, pray, prayTruthy } from "@/components/pray"
import { error, ok, Result } from "@/components/result"
import { Tree } from "@/components/tree"
import { FSRS } from "ts-fsrs"
import { createConf, createDeck } from "./defaults"
import { Id, randomId } from "./id"
import { __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered } from "./repeat"
import {
  AnyCard,
  Cards,
  Collection,
  Conf,
  Confs,
  Deck,
  Decks,
  Models,
  Notes,
  Prefs,
  RepeatInfo,
} from "./types"

// FIXME: filter blank cards like anki does
// FIXME: add cloze support
// FIXME: add image occlusion support
// FIXME: report global errors as small popups at bottom of screen
// FIXME: put an ErrorBoundary around the entire application
// FIXME: allow importing anki decks
// FIXME: circular times
// FIXME: integration with graphing tools
// FIXME: randomly generated cards
// FIXME: online deck shares

// export function recordAfterHandler(recordLog: BaseRecordLog): RecordLog {
//   const output = {} as RecordLog

//   for (const grade of Grades) {
//     const { log, card: baseCard } = recordLog[grade]
//     const card = baseCard as ReviewedCard

//     output[grade] = {
//       card,
//       log: { ...log, cid: card.cid },
//     }
//   }

//   return output
// }

export class App {
  readonly cards: AppCards
  readonly confs: AppConfs
  readonly decks: AppDecks
  readonly models: AppModels
  readonly notes: AppNotes
  readonly prefs: AppPrefs

  constructor(private c: Readonly<Collection>) {
    this.confs = new AppConfs(c.confs)
    this.decks = new AppDecks(c.decks, this.confs)
    this.prefs = new AppPrefs(c.prefs)
    this.models = new AppModels(c.models)
    this.notes = new AppNotes(c.notes)
    this.cards = new AppCards(
      c.cards,
      this.notes,
      this.decks,
      this.confs,
      this.prefs,
      this.models,
    )
  }

  toJSON(): Collection {
    return this.c
  }
}

export class AppConfs {
  /** Record from conf names to confs */
  private names: Record<string, Conf> = Object.create(null)

  /** Record from conf ids to confs */
  private ids: Record<string, Conf> = Object.create(null)

  constructor(confs: Confs) {
    this.ids = confs
    for (const key in confs) {
      const conf = confs[key]!
      this.names[conf.name] = conf
    }
  }

  create(now: number, id: Id, name: string): Conf {
    const conf = createConf(now)
    conf.id = id
    conf.name = name
    return conf
  }

  push(conf: Conf): Result<void> {
    if (conf.name in this.names) {
      return error("A deck with that name already exists.")
    }

    if (conf.id in this.ids) {
      return error("A deck with that id already exists.")
    }

    this.ids[conf.id] = this.names[conf.name] = conf

    return ok()
  }

  byId(id: Id): Conf | undefined {
    return this.ids[id]
  }

  getDefault(now: number): Conf {
    const byName = this.names["Default"]
    if (byName) {
      return byName
    }

    const byId = this.ids[1]
    if (byId) {
      return byId
    }

    const firstKey = Object.keys(this.ids)[0]
    if (firstKey) {
      const first = this.ids[firstKey]
      if (first) {
        return first
      }
    }

    const conf = this.create(now, 1 as Id, "Default")
    this.push(conf)
    return conf
  }
}

export class AppDecks {
  /** Record from deck names to decks */
  private n: Record<string, Deck> = Object.create(null)

  /** Record from deck ids to decks */
  readonly byId: Record<string, Deck> = Object.create(null)

  constructor(decks: Decks, private c: AppConfs) {
    this.byId = decks
    for (const key in decks) {
      const deck = decks[key]!
      this.n[deck.name] = deck
    }
  }

  create(now: number, name: string): Deck {
    const id = randomId()
    return {
      id,
      collapsed: false,
      desc: "",
      is_filtered: false,
      last_edited: now,
      name,
      new_today: 0,
      conf: this.c.getDefault(now).id,
    }
  }

  push(deck: Deck): Result<void> {
    if (deck.name in this.n) {
      return error("A deck with that name already exists.")
    }

    if (deck.id in this.byId) {
      return error("A deck with that id already exists.")
    }

    this.byId[deck.id] = this.n[deck.name] = deck

    return ok()
  }

  private pushForce(deck: Deck) {
    pray(!(deck.name in this.n), "A deck with that name already exists.")
    pray(!(deck.id in this.byId), "A deck with that id already exists.")
    this.byId[deck.id] = this.n[deck.name] = deck
  }

  byNameOrCreate(name: string, now: number): Deck {
    const existing = this.n[name]
    if (existing) {
      return existing
    }

    const id = randomId()
    const deck = createDeck(now, name, id)
    this.pushForce(deck)
    return deck
  }

  tree(now: number): Tree<Deck, Deck> {
    const tree = new Tree<Deck, Deck>()

    for (const id in this.byId) {
      const deck = this.byId[id]!
      console.log(deck.name)

      tree.set(
        deck.name.split("::"),
        deck,
        (x) => x,
        (path) => this.byNameOrCreate(path.join("::"), now),
        () => deck,
        () => deck,
      )
    }

    return tree
  }
}

export class AppPrefs {
  constructor(private p: Prefs) {}

  /** Returns milliseconds between start of local day and Unix epoch */
  startOfDay(now: number | Date): number {
    const date = new Date(now)
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(this.p.day_start)
    let value = date.valueOf()
    if (value > now.valueOf()) {
      value -= 1000 * 60 * 60 * 24
    }
    return value
  }

  /**
   * Computes the number of days between two dates, taking local timezone and
   * `prefs.day_start` into account
   */
  daysBetween(
    start: number | Date | undefined,
    end: number | Date | undefined,
  ) {
    if (start == null || end == null) {
      return 0
    }

    start = this.startOfDay(start)
    end = this.startOfDay(end)

    return Math.round((end - start) / (1000 * 60 * 60 * 24))
  }
}

export class AppCards {
  constructor(
    private c: Cards,
    private notes: AppNotes,
    private decks: AppDecks,
    private confs: AppConfs,
    private prefs: AppPrefs,
    private models: AppModels,
  ) {}

  repeat(card: AnyCard, now: number, reviewTime: number): RepeatInfo {
    const deck = notNull(
      this.decks.byId[card.did],
      "This card is linked to a nonexistent deck.",
    )

    const conf = notNull(
      this.confs.byId(deck.conf),
      "This card's deck is linked to a nonexistent configuration.",
    )

    return __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered(
      card,
      conf,
      this.prefs,
      new FSRS({
        enable_fuzz: true,
        maximum_interval: conf.review.max_review_interval,
      }),
      now,
      reviewTime,
    )
  }

  set(card: AnyCard) {
    const deck = this.decks.byId[card.did]
    prayTruthy(deck, "Card must be associated with a deck which exists.")

    const note = this.notes.byId[card.nid]
    prayTruthy(note, "Card must be associated with a note which exists.")

    const model = this.models.byId[note.mid]
    prayTruthy(model, "Card's must be associated with a model which exists.")

    const tmpl = model.tmpls[card.tid]
    prayTruthy(tmpl, "Card must be associated with a template which exists.")

    this.c[card.id] = card
  }

  // no `create` method since cards can only be created by corresponding notes
}

export class AppModels {
  constructor(readonly byId: Models) {}
}

export class AppNotes {
  constructor(readonly byId: Notes) {}
}
