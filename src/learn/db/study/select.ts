import { notNull } from "@/components/pray"
import { Id } from "@/learn/lib/id"
import {
  __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactForget,
  __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered,
} from "@/learn/lib/repeat"
import {
  AnyCard,
  Deck,
  Model,
  ModelTemplate,
  Note,
  RepeatInfo,
  RepeatItem,
} from "@/learn/lib/types"
import { FSRS, Grade, Rating } from "ts-fsrs"
import { DB } from ".."
import { bucketOf, CardBucket } from "../bucket"
import { startOfDaySync } from "../day"
import { Reason } from "../reason"
import { GatherInfo, GatherTx, regatherTx } from "./gather"

export async function select(
  db: DB,
  main: Id | undefined,
  dids: Id[],
  now: number,
  info: GatherInfo,
): Promise<SelectInfo | null> {
  const tx = db.read(["cards", "decks", "confs", "prefs", "notes", "models"])

  await regatherTx(
    // FIXME: type this better
    tx as GatherTx,
    main,
    dids,
    now,
    info,
  )

  const newToday = info.studied.new.length

  const newLeft = Math.min(
    info.cards.b0.length,
    Math.max(0, info.limits.new.today - newToday),
  )

  const newTotal = newLeft + newToday

  const reviewsToday = info.studied.revcards.length

  const reviewsLeft = Math.min(
    Math.max(0, (info.limits.review.today ?? Infinity) - reviewsToday),
    newLeft + info.cards.b1.length + info.cards.b2.length,
  )

  const reviewsTotal = reviewsToday + reviewsLeft

  const preferNew =
    newLeft >= 0 && newLeft / newTotal >= reviewsLeft / reviewsTotal

  function pickNew(): SelectedCard | null {
    const index = info.limits.conf.new.pick_at_random
      ? Math.floor(Math.random() * info.cards.b0.length)
      : 0

    const card = info.cards.b0[index]

    if (!card) {
      return null
    }

    return { card, index, bucket: 0 }
  }

  function pickLearningBefore(now: number): SelectedCard | null {
    const legalB1 = info.cards.b1.filter((x) => x.due <= now)
    const card = legalB1[Math.floor(Math.random() * legalB1.length)]
    if (!card) {
      return null
    }

    const index = info.cards.b1.indexOf(card)
    return { card, index, bucket: 1 }
  }

  function pickReview(): SelectedCard | null {
    const index = Math.floor(Math.random() * info.cards.b2.length)
    const card = info.cards.b2[index]
    if (!card) {
      return null
    }

    return { card, index, bucket: 2 }
  }

  function pickNonNew(): SelectedCard | null {
    return (
      pickLearningBefore(now) ??
      pickReview() ??
      pickLearningBefore(now + info.prefs.collapse_time * 1000)
    )
  }

  const card = (preferNew && pickNew()) || pickNonNew() || pickNew()

  if (!card) {
    return null
  }

  const repeatInfo =
    __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered(
      card.card,
      info.limits.conf,
      info.prefs.day_start,
      new FSRS({
        enable_fuzz: info.limits.conf.review.enable_fuzz,
        maximum_interval: info.limits.conf.review.max_review_interval,
        request_retention: info.limits.conf.review.requested_retention,
        w: info.limits.conf.review.w,
      }),
      now,
      0,
    )

  const deck = notNull(
    await tx.objectStore("decks").get(card.card.did),
    "The card is linked to a nonexistent deck.",
  )

  const note = notNull(
    await tx.objectStore("notes").get(card.card.nid),
    "The card is linked to a nonexistent note.",
  )

  const model = notNull(
    await tx.objectStore("models").get(note.mid),
    "The card's note is linked to a nonexistent model.",
  )

  const tmpl = notNull(
    model.tmpls[card.card.tid],
    "The card is linked to a nonexistent template.",
  )

  await tx.done

  return { ...card, repeatInfo, note, model, tmpl, deck }
}

interface SelectedCard {
  card: AnyCard
  index: number
  bucket: CardBucket
}

export interface SelectInfo extends SelectedCard {
  repeatInfo: RepeatInfo
  note: Note
  model: Model
  tmpl: ModelTemplate
  deck: Deck
}

export function checkBucket(
  card: AnyCard,
  selectInfo: SelectInfo,
  gatherInfo: GatherInfo,
  now: number,
) {
  const prevBucket = selectInfo.bucket

  if (prevBucket != null) {
    gatherInfo.cards[`b${prevBucket}`].splice(selectInfo.index, 1)
  }

  const nextBucket = bucketOf(
    startOfDaySync(gatherInfo.prefs.day_start, now),
    card,
    gatherInfo.prefs.day_start,
  )

  if (nextBucket != null) {
    gatherInfo.cards[`b${nextBucket}`].push(card)
    if (nextBucket == 0) {
      gatherInfo.cards.b0.sort((a, b) => a.due - b.due)
    }
  }

  return prevBucket
}

async function save(
  db: DB,
  { card, log }: RepeatItem,
  selectInfo: SelectInfo,
  gatherInfo: GatherInfo,
  now: number,
  reason: Reason,
) {
  const tx = db.readwrite(["cards", "rev_log"], reason)

  tx.objectStore("cards").put(card)
  tx.objectStore("rev_log").put(log)

  const prevBucket = checkBucket(card, selectInfo, gatherInfo, now)
  await tx.done
  return prevBucket
}

export async function saveReview(
  db: DB,
  selectInfo: SelectInfo,
  gatherInfo: GatherInfo,
  now: number,
  repeatTime: number,
  grade: Grade,
) {
  const info =
    __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactRepeatUnfiltered(
      selectInfo.card,
      gatherInfo.limits.conf,
      gatherInfo.prefs.day_start,
      new FSRS({
        enable_fuzz: gatherInfo.limits.conf.review.enable_fuzz,
        maximum_interval: gatherInfo.limits.conf.review.max_review_interval,
        request_retention: gatherInfo.limits.conf.review.requested_retention,
        w: gatherInfo.limits.conf.review.w,
      }),
      now,
      repeatTime,
    )

  const item = info[grade]
  const { card } = item

  const prevBucket = await save(
    db,
    item,
    selectInfo,
    gatherInfo,
    now,
    `Review card as ${Rating[grade]}`,
  )

  if (prevBucket == 0) {
    if (!gatherInfo.studied.new.includes(card.id)) {
      gatherInfo.studied.new.push(card.id)
    }
  }

  if (!gatherInfo.studied.revcards.includes(card.id)) {
    gatherInfo.studied.revcards.push(card.id)
  }

  gatherInfo.studied.revlogs += 1
}

export async function saveForget(
  db: DB,
  selectInfo: SelectInfo,
  gatherInfo: GatherInfo,
  now: number,
  repeatTime: number,
  resetCount: boolean,
) {
  const item =
    __unsafeDoNotUseDangerouslySetInnerHtmlYetAnotherMockOfReactForget(
      selectInfo.card,
      gatherInfo.prefs.day_start,
      new FSRS({
        enable_fuzz: gatherInfo.limits.conf.review.enable_fuzz,
        maximum_interval: gatherInfo.limits.conf.review.max_review_interval,
        request_retention: gatherInfo.limits.conf.review.requested_retention,
        w: gatherInfo.limits.conf.review.w,
      }),
      now,
      repeatTime,
      resetCount,
    )

  await save(db, item, selectInfo, gatherInfo, now, "Forget card")
}
