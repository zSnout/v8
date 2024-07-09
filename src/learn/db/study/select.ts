import { Id } from "@/learn/lib/id"
import { AnyCard } from "@/learn/lib/types"
import { DB } from ".."
import { CardBucket } from "../bucket"
import { GatherInfo, regather } from "./gather"

export async function select(
  db: DB,
  main: Id,
  dids: Id[],
  now: number,
  info: GatherInfo,
): Promise<SelectedCard | null> {
  await regather(db, main, dids, now, info)

  const newLeft = Math.min(
    info.cards.b0.length,
    Math.max(0, info.limits.new.today - info.studied.new),
  )

  const newTotal = newLeft + info.studied.new

  const reviewsLeft = Math.min(
    Math.max(0, (info.limits.review.today ?? Infinity) - info.studied.revcards),
    newLeft + info.cards.b1.length + info.cards.b2.length,
  )

  const reviewsTotal = info.studied.revcards + reviewsLeft

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

  return (preferNew && pickNew()) || pickNonNew() || pickNew()
}

export interface SelectedCard {
  card: AnyCard
  index: number
  bucket: CardBucket
}
