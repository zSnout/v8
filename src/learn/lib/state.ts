/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { notNull, pray } from "@/components/pray"
import { error, ok, Result, unwrapOr } from "@/components/result"
import { Tree } from "@/components/tree"
import { createEmptyCard, FSRS, State } from "ts-fsrs"
import { parse } from "valibot"
import { createBasicModel, createConf, createDeck } from "./defaults"
import { Id, idOf, randomId } from "./id"
import { arrayToRecord } from "./record"
import { __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered } from "./repeat"
import { Scheduler } from "./scheduler"
import * as Template from "./template"
import {
  AnyCard,
  Cards,
  Collection,
  Conf,
  Confs,
  Core,
  Deck,
  Decks,
  Model,
  ModelFields,
  Models,
  ModelTemplates,
  NewCard,
  Note,
  NoteFields,
  Notes,
  Prefs,
  RepeatInfo,
  RevLog,
} from "./types"

// FIXME: add cloze support
// FIXME: add image occlusion support
// FIXME: allow importing anki decks
// FIXME: circular timers
// FIXME: integration with graphing tools
// FIXME: randomly generated cards
// FIXME: online deck shares

// TODO: invalidate all data saving when another tab is open

export class App {
  core!: AppCore
  cards!: AppCards
  confs!: AppConfs
  decks!: AppDecks
  models!: AppModels
  notes!: AppNotes
  prefs!: AppPrefs
  revLog!: AppRevLog

  constructor(private c: Readonly<Collection>) {
    this.construct(c)
  }

  construct(c: Readonly<Collection>) {
    this.c = c
    this.core = new AppCore(c.core, this)
    this.confs = new AppConfs(c.confs, this)
    this.decks = new AppDecks(c.decks, this)
    this.prefs = new AppPrefs(c.prefs, this)
    this.models = new AppModels(c.models, this)
    this.notes = new AppNotes(c.notes, this)
    this.cards = new AppCards(c.cards, this)
    this.revLog = new AppRevLog(c.rev_log, this)
  }

  toJSON(): Collection {
    return this.c
  }

  export() {
    return JSON.stringify(this)
  }

  importJSON(json: unknown) {
    let data
    try {
      data = parse(Collection, json)
    } catch (e) {
      console.error(e)
      return error("Data file is missing proper data.")
    }

    this.construct(data)
    return ok()
  }

  import(text: string) {
    try {
      return this.importJSON(JSON.parse(text))
    } catch (e) {
      console.error(e)
      return error("Data file is malformed. Did you import a JSON file?")
    }
  }
}

export class AppCore {
  constructor(readonly core: Core, private app: App) {}
}

export class AppConfs {
  /** Record from conf names to confs */
  readonly byName: Record<string, Conf> = Object.create(null)

  constructor(
    /** Record from conf ids to confs */ readonly byId: Confs,
    private app: App,
  ) {
    for (const key in byId) {
      const conf = byId[key]!
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

  default(now: number): Conf {
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

    const conf = this.create(now, idOf(1), "Default")
    this.push(conf)
    return conf
  }
}

export class AppDecks {
  static compare(a: string, b: string) {
    const al = a.toLowerCase()
    const bl = b.toLowerCase()

    if (al < bl) return -1
    if (al > bl) return 1
    if (a < b) return -1
    if (a > b) return 1
    return 0
  }

  /** Record from deck names to decks */
  readonly byName: Record<string, Deck> = Object.create(null)

  /** Record from deck ids to decks */
  readonly byId: Record<string, Deck> = Object.create(null)

  constructor(decks: Decks, private app: App) {
    this.byId = decks
    for (const key in decks) {
      const deck = decks[key]!
      this.byName[deck.name] = deck
    }
  }

  default(now: number): Deck {
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

    const deck = this.create(now, "Default")
    this.push(deck)
    return deck
  }

  create(now: number, name: string): Deck {
    const id = randomId()
    return {
      id,
      collapsed: true,
      desc: "",
      is_filtered: false,
      last_edited: now,
      name,
      new_today: 0,
      reviews_today: 0,
      conf: this.app.confs.default(now).id,
      today: now,
    }
  }

  push(deck: Deck): Result<void> {
    if (deck.name in this.byName) {
      return error("A deck with that name already exists.")
    }

    if (deck.id in this.byId) {
      return error("A deck with that id already exists.")
    }

    this.byId[deck.id] = this.byName[deck.name] = deck

    return ok()
  }

  private pushForce(deck: Deck) {
    // pray(!(deck.name in this.n), "A deck with that name already exists.")
    // pray(!(deck.id in this.byId), "A deck with that id already exists.")
    this.byId[deck.id] = this.byName[deck.name] = deck
  }

  byNameOrCreate(name: string, now: number): Deck {
    const existing = this.byName[name]
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

  scheduler(deck: Deck, now: number) {
    if (!(deck.id in this.byId)) {
      return error("The selected deck is not in the collection.")
    }

    const conf = this.app.confs.byId[deck.conf]

    if (!conf) {
      return error("The selected deck isn't attached to a configuration.")
    }

    const nestedName = deck.name + "::"

    const decks = Object.values(this.byName)
      .filter((x) => x.name.startsWith(nestedName))
      .sort(({ name: a }, { name: b }) => AppDecks.compare(a, b))

    decks.unshift(deck)

    return ok(new Scheduler(deck, decks, structuredClone(conf), this.app, now))
  }
}

export class AppPrefs {
  constructor(readonly prefs: Prefs, private app: App) {}

  /** Replaces all preferences. */
  set(prefs: Prefs) {
    Object.assign(this.prefs, prefs)
  }

  /** The deck to put new cards into by default. */
  currentDeck(now: number): Deck {
    const did = this.prefs.current_deck
    if (did != null) {
      const deck = this.app.decks.byId[did]
      if (deck) {
        return deck
      }
    }

    return this.app.decks.default(now)
  }

  /** The model to put new cards into by default. */
  currentModel(now: number): Model {
    const mid = this.prefs.last_model_used
    if (mid != null) {
      const model = this.app.models.byId[mid]
      if (model) {
        return model
      }
    }

    return this.app.models.default(now)
  }

  /** Returns milliseconds between start of local day and Unix epoch */
  startOfDay(now: number | Date): number {
    const date = new Date(now)
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(this.prefs.day_start)
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

  /** Checks if two timestamps occurred on the same day. */
  isSameDay(start: number | Date, end: number | Date) {
    return this.daysBetween(start, end) == 0
  }
}

export class AppCards {
  readonly byNid: Record<string, AnyCard[]>
  readonly byDid: Record<string, AnyCard[]>

  constructor(readonly byId: Cards, private app: App) {
    this.byNid = Object.create(null)
    this.byDid = Object.create(null)
    for (const id in byId) {
      const card = byId[id]!
      ;(this.byNid[card.nid] ??= []).push(card)
      ;(this.byDid[card.did] ??= []).push(card)
    }
  }

  repeat(card: AnyCard, now: number, reviewTime: number): RepeatInfo {
    const { decks, confs, prefs } = this.app

    const deck = notNull(
      decks.byId[card.did],
      "This card is linked to a nonexistent deck.",
    )

    const conf = notNull(
      confs.byId[deck.conf],
      "This card's deck is linked to a nonexistent configuration.",
    )

    return __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered(
      card,
      conf,
      prefs,
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

      const oldDidGroup = this.byDid[old.did]
      if (oldDidGroup) {
        const oldDidGroupIndex = oldDidGroup.indexOf(old)
        if (oldDidGroupIndex != -1) {
          oldDidGroup.splice(oldDidGroupIndex, 1)
        }
      }
    }

    this.byId[card.id] = card
    ;(this.byNid[card.nid] ||= []).push(card)
    ;(this.byDid[card.did] ||= []).push(card)
  }

  set(card: AnyCard): Result<void> {
    const { decks, notes, models } = this.app

    const deck = decks.byId[card.did]
    if (!deck) {
      return error("Card must be associated with a deck which exists.")
    }

    const note = notes.byId[card.nid]
    if (!note) {
      return error("Card must be associated with a note which exists.")
    }

    const model = models.byId[note.mid]
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
  static renameFieldAccessesInTemplates(
    prev: ModelFields,
    next: ModelFields,
    tmpls: ModelTemplates,
  ): ModelTemplates {
    const renames = Object.create(null) as Record<string, string>

    for (const { id, name } of Object.values(prev)) {
      const newField = next[id]
      if (newField) {
        renames[name] = newField.name
      }
    }

    return arrayToRecord(
      Object.values(tmpls).map((tmpl) => {
        const qc = Template.parse(tmpl.qfmt)
        let qfmt
        if (qc.ok) {
          qfmt = Template.toSource(Template.renameFields(qc.value, renames))
        } else {
          qfmt = tmpl.qfmt
        }

        const ac = Template.parse(tmpl.afmt)
        let afmt
        if (ac.ok) {
          afmt = Template.toSource(Template.renameFields(ac.value, renames))
        } else {
          afmt = tmpl.afmt
        }

        return { id: tmpl.id, name: tmpl.name, qfmt, afmt }
      }),
    )
  }

  readonly byName: Record<string, Model>

  constructor(readonly byId: Models, readonly app: App) {
    this.byName = Object.create(null)

    for (const key in byId) {
      const model = byId[key]!
      this.byName[model.name] = model
    }
  }

  default(now: number): Model {
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

    const model = createBasicModel()
    this.set(model, now)
    return model
  }

  private adjustNotesAndCardsForModelChange(
    prev: Model,
    next: Model,
    now: number,
  ) {
    pray(
      prev.id == next.id,
      "Models passed to `.transition` should have the same id.",
    )

    const { notes } = this.app

    for (const note of Object.values(notes.byId)) {
      if (note.mid != next.id) {
        continue
      }

      const sort_field = note.fields[next.sort_field ?? 0] ?? ""
      const fields = Object.create(null) as NoteFields
      for (const key in next.fields) {
        fields[key] = note.fields[key] ?? ""
      }
      const last_edited = now
      // TODO: update csum
      notes.byId[note.id] = {
        ...note,
        sort_field,
        fields,
        last_edited,
      }
      const did = notes.getDeckId(note.id, now)
      // TODO: update which cards exist and their corresponding templates
      const cards = AppNotes.createAssociatedCards(
        now,
        fields,
        note.id,
        did,
        next,
      )
    }
  }

  set(model: Model, now: number) {
    if (model.name.trim() == "") {
      return error("Model name is empty.")
    }

    const id = model.id
    const prev = this.byId[id]
    if (prev == null) {
      this.byId[model.id] = model
      this.byName[model.name] = model
      return ok()
    }

    this.adjustNotesAndCardsForModelChange(prev, model, now)
    delete this.byName[prev.name]
    this.byId[model.id] = model
    this.byName[model.name] = model
    return ok()
  }
}

export class AppNotes {
  static createAssociatedCards(
    now: number,
    fields: NoteFields,
    nid: Id,
    did: Id,
    model: Model,
  ) {
    const fieldRecord = Template.fieldRecord(model.fields, fields)
    const cards: NewCard[] = []

    for (const tmpl of Object.values(model.tmpls)) {
      const base = createEmptyCard(now)
      const template = unwrapOr(Template.parse(tmpl.qfmt), [])
      const isFilled = Template.isFilled(template, fieldRecord)
      if (!isFilled) {
        continue
      }
      const card: NewCard = {
        ...base,
        did,
        nid,
        tid: tmpl.id,
        id: randomId(),
        due: base.due.getTime(),
        last_edit: now,
        last_review: undefined,
        queue: 0,
        state: State.New,
      }
      cards.push(card)
    }

    return cards
  }

  constructor(readonly byId: Notes, private app: App) {}

  getDeckId(nid: Id, now: number) {
    const cards = this.app.cards.byNid[nid]
    if (!cards) {
      return this.app.decks.default(now).id
    }

    const deckIdsWithCardCounts = Object.create(null) as { [x: string]: number }

    for (const card of cards) {
      const count = deckIdsWithCardCounts[card.did] ?? 0
      deckIdsWithCardCounts[card.did] = count + 1
    }

    const entries = Object.entries(deckIdsWithCardCounts)

    if (entries.length == 0) {
      return this.app.decks.default(now).id
    }

    return idOf(entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0])
  }

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
    fields: NoteFields
    tags?: string
    did: Id
  }) {
    const { models } = this.app

    const model = models.byId[props.mid]
    if (!model) {
      return error("A note must be associated with a model which exists.")
    }

    const sortField = props.fields[model.sort_field ?? 0] ?? ""

    const nid = randomId()
    const tags = props.tags ?? ""
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

    const cards = AppNotes.createAssociatedCards(
      now,
      props.fields,
      nid,
      did,
      model,
    )
    if (cards.length == 0) {
      return error("Note generated no cards.")
    }

    return ok({ note, cards })
  }
}

export class AppRevLog {
  constructor(readonly log: RevLog, private app: App) {}
}
