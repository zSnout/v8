import { notNull } from "@/components/pray"
import { Id } from "@/learn/lib/id"
import { AnyCard } from "@/learn/lib/types"
import { IDBPTransaction } from "idb"
import { DB, DBCollection } from ".."
import { bucketOf } from "../bucket"
import { dayStartOffset, startOfDaySync } from "../day"

async function cardsTx(
  tx: IDBPTransaction<
    DBCollection,
    ("cards" | "decks" | "prefs" | "confs")[],
    "readonly"
  >,
  dids: Id[],
  dayStart: number,
  today: number,
): Promise<Cards> {
  const index = tx.objectStore("cards").index("did")

  const b0: AnyCard[] = []
  const b1: AnyCard[] = []
  const b2: AnyCard[] = []

  await Promise.all(
    dids.map(async (did) => {
      const cards = await index.getAll(did)

      for (const card of cards) {
        const bucket = bucketOf(today, card, dayStart)

        if (bucket == 0) {
          b0.push(card)
        } else if (bucket == 1) {
          b1.push(card)
        } else if (bucket == 2) {
          b2.push(card)
        }
      }
    }),
  )

  b0.sort((a, b) => a.due - b.due)

  return { b0, b1, b2, today }
}

async function studiedTx(
  tx: IDBPTransaction<
    DBCollection,
    ("cards" | "decks" | "prefs" | "confs")[],
    "readonly"
  >,
  dids: Id[],
  dayStart: number,
  today: number,
): Promise<Studied> {
  const decks = tx.objectStore("decks")

  let newToday = 0
  let revcards = 0
  let revlogs = 0

  await Promise.all(
    dids.map(async (did) => {
      const deck = await decks.get(did)
      if (!deck) return
      if (startOfDaySync(dayStart, deck.today) != today) return

      newToday += deck.new_today.length
      revcards += deck.revcards_today.length
      revlogs += deck.revlogs_today.length
    }),
  )

  return { new: newToday, revcards, revlogs }
}

async function limitsTx(
  tx: IDBPTransaction<
    DBCollection,
    ("cards" | "decks" | "prefs" | "confs")[],
    "readonly"
  >,
  main: Id,
  dayStart: number,
  today: number,
): Promise<Limits> {
  const deck = notNull(
    await tx.objectStore("decks").get(main),
    "The main deck must exist.",
  )

  const conf = notNull(
    await tx.objectStore("confs").get(deck.cfid),
    "The deck must be linked to a valid configuration.",
  )

  const wasDeckUpdatedToday = startOfDaySync(dayStart, deck.today) == today

  return {
    new: {
      byConf: conf.new.per_day,
      customGlobal: deck.default_newcard_limit,
      customToday: wasDeckUpdatedToday ? deck.custom_newcard_limit : undefined,
      today:
        (wasDeckUpdatedToday ? deck.custom_newcard_limit : undefined) ??
        deck.default_newcard_limit ??
        conf.new.per_day,
    },
    review: {
      byConf: conf.review.per_day,
      customGlobal: deck.default_revcard_limit,
      customToday: wasDeckUpdatedToday ? deck.custom_revcard_limit : undefined,
      today:
        (wasDeckUpdatedToday ? deck.custom_revcard_limit : undefined) ??
        deck.default_revcard_limit ??
        conf.review.per_day,
    },
  }
}

export interface Cards {
  b0: AnyCard[]
  b1: AnyCard[]
  b2: AnyCard[]
  today: number
}

export interface Studied {
  new: number
  revcards: number
  revlogs: number
}

export interface Limit<T extends number | undefined> {
  byConf: T
  customToday: number | undefined
  customGlobal: number | undefined
  today: T
}

export interface Limits {
  new: Limit<number>
  review: Limit<number | undefined>
}

export interface GatherInfo {
  cards: Cards
  studied: Studied
  limits: Limits
}

export async function gather(db: DB, main: Id, dids: Id[], now: number) {
  const tx = db.transaction(["cards", "decks", "prefs", "confs"])
  const dayStart = await dayStartOffset(tx)
  const today = startOfDaySync(dayStart, now)

  const [cards, studied, limits] = await Promise.all([
    cardsTx(tx, dids, dayStart, today),
    studiedTx(tx, dids, dayStart, today),
    limitsTx(tx, main, dayStart, today),
  ])

  return { cards, studied, limits }
}

export async function regather(
  db: DB,
  main: Id,
  dids: Id[],
  now: number,
  info: GatherInfo,
) {
  const tx = db.transaction(["cards", "decks", "prefs", "confs"])
  const dayStart = await dayStartOffset(tx)
  const today = startOfDaySync(dayStart, now)

  const [cards, studied, limits] = await Promise.all([
    today != info.cards.today && (await cardsTx(tx, dids, dayStart, today)),
    studiedTx(tx, dids, dayStart, today),
    limitsTx(tx, main, dayStart, today),
  ])
  if (cards) info.cards = cards
  info.studied = studied
  info.limits = limits
}
