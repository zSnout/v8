import { notNull } from "@/components/pray"
import { Id, ID_ZERO } from "@/learn/lib/id"
import { AnyCard, Conf, Prefs } from "@/learn/lib/types"
import { IDBPTransaction } from "idb"
import { DB, Ty } from ".."
import { bucketOf } from "../bucket"
import { dayStartOffset, startOfDaySync } from "../day"

type GatherCols = ("cards" | "decks" | "prefs" | "confs")[]
type Tx = IDBPTransaction<Ty, GatherCols, "readonly">

async function cardsTx(
  tx: Tx,
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
  tx: Tx,
  dids: Id[],
  dayStart: number,
  today: number,
): Promise<Studied> {
  const decks = tx.objectStore("decks")

  let newToday: Id[] = []
  let revcards: Id[] = []
  let revlogs = 0

  await Promise.all(
    dids.map(async (did) => {
      const deck = await decks.get(did)
      if (!deck) return
      if (startOfDaySync(dayStart, deck.today) != today) return

      newToday.push(...deck.new_today)
      revcards.push(...deck.revcards_today)
      revlogs += deck.revlogs_today
    }),
  )

  return { new: newToday, revcards, revlogs }
}

async function defaultLimitsTx(tx: Tx): Promise<Limits> {
  const conf = notNull(
    await tx.objectStore("confs").get(ID_ZERO),
    "The default configuration must not be deleted.",
  )

  return {
    new: {
      byConf: conf.new.per_day,
      customGlobal: undefined,
      customToday: undefined,
      today: conf.new.per_day,
    },
    review: {
      byConf: conf.review.per_day,
      customGlobal: undefined,
      customToday: undefined,
      today: conf.review.per_day,
    },
    conf,
  }
}

async function limitsTx(
  tx: Tx,
  main: Id | undefined,
  dayStart: number,
  today: number,
): Promise<Limits> {
  if (main == null) {
    return await defaultLimitsTx(tx)
  }

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
    conf,
  }
}

async function prefsTx(tx: Tx) {
  return notNull(
    await tx.objectStore("prefs").get(ID_ZERO),
    "This collection does not have a preferences table.",
  )
}

export interface Cards {
  b0: AnyCard[]
  b1: AnyCard[]
  b2: AnyCard[]
  today: number
}

export interface Studied {
  new: Id[]
  revcards: Id[]
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
  conf: Conf
}

export interface GatherInfo {
  cards: Cards
  studied: Studied
  limits: Limits
  prefs: Prefs
}

export async function gather(
  db: DB,
  main: Id | undefined,
  dids: Id[],
  now: number,
): Promise<GatherInfo> {
  const tx = db.read(["cards", "decks", "prefs", "confs"])
  const dayStart = await dayStartOffset(tx)
  const today = startOfDaySync(dayStart, now)

  const [cards, studied, limits, prefs] = await Promise.all([
    cardsTx(tx, dids, dayStart, today),
    studiedTx(tx, dids, dayStart, today),
    limitsTx(tx, main, dayStart, today),
    prefsTx(tx),
  ])

  return { cards, studied, limits, prefs }
}

export async function regatherTx(
  tx: Tx,
  main: Id | undefined,
  dids: Id[],
  now: number,
  info: GatherInfo,
): Promise<void> {
  const dayStart = await dayStartOffset(tx)
  const today = startOfDaySync(dayStart, now)

  const [cards, studied, limits, prefs] = await Promise.all([
    today != info.cards.today && (await cardsTx(tx, dids, dayStart, today)),
    studiedTx(tx, dids, dayStart, today),
    limitsTx(tx, main, dayStart, today),
    prefsTx(tx),
  ])

  if (cards) info.cards = cards
  info.studied = studied
  info.limits = limits
  info.prefs = prefs
}

export type { Tx as GatherTx }
