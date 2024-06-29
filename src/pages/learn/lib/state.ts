import { notNull } from "@/components/pray"
import { error, ok, Result } from "@/components/result"
import { Tree } from "@/components/tree"
import { createEmptyCard, FSRS, State } from "ts-fsrs"
import { createConf, createDeck } from "./defaults"
import { Id, randomId } from "./id"
import { __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered } from "./repeat"
import * as Template from "./template"
import {
  AnyCard,
  Cards,
  Collection,
  Conf,
  Confs,
  Deck,
  Decks,
  Models,
  NewCard,
  Note,
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
    this.notes = new AppNotes(
      c.notes,
      this.models,
      // note: this needs to be set manually later
      0 as any,
      this.decks,
      this.prefs,
    )
    this.cards = new AppCards(
      c.cards,
      this.notes,
      this.decks,
      this.confs,
      this.prefs,
      this.models,
    )
    // note: this is later
    ;(this.notes as any).cards = this.cards
  }

  toJSON(): Collection {
    return this.c
  }
}

export class AppConfs {
  /** Record from conf names to confs */
  readonly byName: Record<string, Conf> = Object.create(null)

  /** Record from conf ids to confs */
  readonly byId: Record<string, Conf> = Object.create(null)

  constructor(confs: Confs) {
    this.byId = confs
    for (const key in confs) {
      const conf = confs[key]!
      this.byName[conf.name] = conf
    }
  }

  create(now: number, id: Id, name: string): Conf {
    const conf = createConf(now)
    conf.id = id
    conf.name = name
    return conf
  }

  push(conf: Conf): Result<void> {
    if (conf.name in this.byName) {
      return error("A deck with that name already exists.")
    }

    if (conf.id in this.byId) {
      return error("A deck with that id already exists.")
    }

    this.byId[conf.id] = this.byName[conf.name] = conf

    return ok()
  }

  getDefault(now: number): Conf {
    const byName = this.byName["Default"]
    if (byName) {
      return byName
    }

    const byId = this.byId[1]
    if (byId) {
      return byId
    }

    const firstKey = Object.keys(this.byId)[0]
    if (firstKey) {
      const first = this.byId[firstKey]
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
    // pray(!(deck.name in this.n), "A deck with that name already exists.")
    // pray(!(deck.id in this.byId), "A deck with that id already exists.")
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
  readonly byNid: Record<string, AnyCard[]>

  constructor(
    readonly byId: Cards,
    private notes: AppNotes,
    private decks: AppDecks,
    private confs: AppConfs,
    private prefs: AppPrefs,
    private models: AppModels,
  ) {
    this.byNid = Object.create(null)
    for (const id in byId) {
      const card = byId[id]!
      ;(this.byNid[card.nid] ||= []).push(card)
    }
  }

  repeat(card: AnyCard, now: number, reviewTime: number): RepeatInfo {
    const deck = notNull(
      this.decks.byId[card.did],
      "This card is linked to a nonexistent deck.",
    )

    const conf = notNull(
      this.confs.byId[deck.conf],
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

  private __unsafeForceSet(card: AnyCard) {
    const old = this.byId[card.id]
    if (old) {
      const oldNidGroup = this.byNid[old.nid]
      if (oldNidGroup) {
        const oldNidGroupIndex = oldNidGroup.indexOf(old)
        if (oldNidGroupIndex != -1) {
          oldNidGroup.splice(oldNidGroupIndex, 1)
        }
      }
    }

    this.byId[card.id] = card
    ;(this.byNid[card.nid] ||= []).push(card)
  }

  set(card: AnyCard): Result<void> {
    const deck = this.decks.byId[card.did]
    if (!deck) {
      return error("Card must be associated with a deck which exists.")
    }

    const note = this.notes.byId[card.nid]
    if (!note) {
      return error("Card must be associated with a note which exists.")
    }

    const model = this.models.byId[note.mid]
    if (!model) {
      return error("Note must be associated with a model which exists.")
    }

    const tmpl = model.tmpls[card.tid]
    if (!tmpl) {
      return error("Card must be associated with a template which exists.")
    }

    // TODO: update new_today in corresponding deck
    this.__unsafeForceSet(card)
    return ok()
  }

  // no `create` method since cards can only be created by corresponding notes
}

export class AppModels {
  constructor(readonly byId: Models) {}
}

export class AppNotes {
  constructor(
    readonly byId: Notes,
    readonly models: AppModels,
    /**
     * This is initially null when set by `new Application`, so don't use it in
     * the constructor. This is because `notes` and `cards` depend on each other
     * in a circular relationship, so one (`notes`) is not initially
     * instantiated fully.
     */
    readonly cards: AppCards,
    readonly decks: AppDecks,
    readonly prefs: AppPrefs,
  ) {}

  push(note: Note): Result<void> {
    if (note.id in this.byId) {
      return error("A note with that id already exists.")
    }

    this.byId[note.id] = note

    return ok()
  }

  create(props: {
    now: number
    mid: Id
    fields: string[]
    tags?: string
    did: Id
  }) {
    const model = this.models.byId[props.mid]
    if (!model) {
      return error("A note must be associated with a model which exists.")
    }

    const fieldRecord = Template.fieldRecord(model.fields, props.fields)
    if (!fieldRecord.ok) {
      return fieldRecord
    }

    const sortField = props.fields[model.sort_field]
    if (sortField == null) {
      return error("Model has an invalid sort field position.")
    }

    const nid = randomId()
    const tags = props.tags || ""
    const now = props.now
    const did = props.did

    const note: Note = {
      creation: now,
      fields: props.fields,
      mid: props.mid,
      csum: 0, // TODO: make checksums work
      id: nid,
      last_edited: now,
      sort_field: sortField,
      tags,
    }

    const cards: NewCard[] = []

    for (let tid = 0; tid < model.tmpls.length; tid++) {
      const tmpl = model.tmpls[tid]!
      const base = createEmptyCard(now)
      const template = Template.parse(tmpl.qfmt)
      if (!template.ok) {
        return error("Card template was invalid. " + template.reason)
      }
      const isFilled = Template.isFilled(template.value, fieldRecord.value)
      if (!isFilled) {
        continue
      }
      const card: NewCard = {
        ...base,
        did,
        nid,
        tid,
        id: randomId(),
        due: base.due.getTime(),
        last_edit: now,
        last_review: undefined,
        queue: 0,
        state: State.New,
      }
      cards.push(card)
    }

    if (cards.length == 0) {
      return error("Note generated no cards.")
    }

    return ok({ note, cards })
  }
}
