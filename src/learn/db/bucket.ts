import { AnyCard } from "../lib/types"
import { startOfDaySync } from "./day"

export type CardBucket = 0 | 1 | 2 | null

export function bucketOf(
  today: number,
  card: AnyCard,
  dayStart: number,
): CardBucket {
  if (
    (card.queue == 1 && startOfDaySync(dayStart, card.last_edited) == today) ||
    card.queue == 2
  ) {
    return null
  }

  if (card.state == 0) {
    return 0
  } else if ((card.state == 1 || card.state == 2) && card.scheduled_days == 0) {
    return 1
  } else if (startOfDaySync(dayStart, card.due) <= today) {
    return 2
  } else {
    return null
  }
}
