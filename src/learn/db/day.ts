import { TxWith } from "."
import { ID_ZERO } from "../lib/id"

const day_starts = new WeakMap<object, number>()

export function startOfDaySync(dayStart: number, now: number) {
  const date = new Date(now)
  date.setHours(0)
  date.setMinutes(0)
  date.setSeconds(0)
  date.setMilliseconds(dayStart)
  let value = date.valueOf()
  if (value > now.valueOf()) {
    value -= 1000 * 60 * 60 * 24
  }
  return value
}

/** If `start` or `end` is undefined, returns `0`. */
export function daysBetweenSync(
  dayStart: number,
  start: number | undefined,
  end: number | undefined,
) {
  if (start == null || end == null) {
    return 0
  }

  const diffMs = startOfDaySync(dayStart, end) - startOfDaySync(dayStart, start)
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/** Checks if two timestamps occurred on the same day. */
export function isSameDaySync(dayStart: number, start: number, end: number) {
  return daysBetweenSync(dayStart, start, end) == 0
}

export async function dayStartOffset(tx: TxWith<"prefs">) {
  let start = day_starts.get(tx)
  if (start == null) {
    const prefs = await tx.objectStore("prefs").get(ID_ZERO)
    if (!prefs) {
      throw new Error("This collection doesn't have a preferences table.")
    }
    start = prefs.day_start
    day_starts.set(tx, start)
  }
  return start
}

export async function startOfDay(tx: TxWith<"prefs">, now: number) {
  return startOfDaySync(await dayStartOffset(tx), now)
}

export async function daysBetween(
  tx: TxWith<"prefs">,
  start: number | undefined,
  end: number | undefined,
) {
  if (start == null || end == null) {
    return 0
  }

  start = await startOfDay(tx, start)
  end = await startOfDay(tx, end)

  return Math.round((end - start) / (1000 * 60 * 60 * 24))
}

/** Checks if two timestamps occurred on the same day. */
export async function isSameDay(
  tx: TxWith<"prefs">,
  start: number,
  end: number,
) {
  return (await daysBetween(tx, start, end)) == 0
}
