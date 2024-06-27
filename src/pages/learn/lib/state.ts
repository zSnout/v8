import { pray } from "@/components/pray"
import { error, ok, Result } from "@/components/result"
import { Tree } from "@/components/tree"
import { fsrs } from "ts-fsrs"
import { createConf, createDeck } from "./defaults"
import { Id, randomId } from "./id"
import { Collection, Conf, Confs, Deck, Decks } from "./types"

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

export class Application {
  private f = fsrs({
    // w: [
    //   0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
    //   0.34, 1.26, 0.29, 2.61,
    // ],
    enable_fuzz: true,
  })

  readonly decks: ApplicationDecks
  readonly confs: ApplicationConfs

  constructor(private c: Readonly<Collection>) {
    this.confs = new ApplicationConfs(c.confs)
    this.decks = new ApplicationDecks(c.decks, this.confs)
  }

  // repeat(card: AnyCard, now: DateInput): RecordLog {
  //   return this.f.repeat(
  //     { ...card, due: card.due ?? now },
  //     now,
  //     recordAfterHandler,
  //   )
  // }

  toJSON(): Collection {
    return this.c
  }
}

export class ApplicationConfs {
  /** Record from conf names to confs */
  private n: Record<string, Conf> = Object.create(null)

  /** Record from conf ids to confs */
  private d: Record<string, Conf> = Object.create(null)

  constructor(confs: Confs) {
    this.d = confs
    for (const key in confs) {
      const conf = confs[key]!
      this.n[conf.name] = conf
    }
  }

  create(now: number, id: Id, name: string): Conf {
    const conf = createConf(now)
    conf.id = id
    conf.name = name
    return conf
  }

  push(conf: Conf): Result<void> {
    if (conf.name in this.n) {
      return error("A deck with that name already exists.")
    }

    if (conf.id in this.d) {
      return error("A deck with that id already exists.")
    }

    this.d[conf.id] = this.n[conf.name] = conf

    return ok()
  }

  getDefault(now: number): Conf {
    const byName = this.n["Default"]
    if (byName) {
      return byName
    }

    const byId = this.d[1]
    if (byId) {
      return byId
    }

    const firstKey = Object.keys(this.d)[0]
    if (firstKey) {
      const first = this.d[firstKey]
      if (first) {
        return first
      }
    }

    const conf = this.create(now, 1 as Id, "Default")
    this.push(conf)
    return conf
  }
}

export class ApplicationDecks {
  /** Record from deck names to decks */
  private n: Record<string, Deck> = Object.create(null)

  /** Record from deck ids to decks */
  private d: Record<string, Deck> = Object.create(null)

  constructor(decks: Decks, private c: ApplicationConfs) {
    this.d = decks
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

    if (deck.id in this.d) {
      return error("A deck with that id already exists.")
    }

    this.d[deck.id] = this.n[deck.name] = deck

    return ok()
  }

  private pushForce(deck: Deck) {
    pray(!(deck.name in this.n), "A deck with that name already exists.")
    pray(!(deck.id in this.d), "A deck with that id already exists.")
    this.d[deck.id] = this.n[deck.name] = deck
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

    for (const id in this.d) {
      const deck = this.d[id as any]!

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
