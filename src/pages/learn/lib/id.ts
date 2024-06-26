import * as v from "valibot"

export function randomId(): Id {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) as Id
}

export function timestampId(now: number | Date): Id {
  return now.valueOf() satisfies number as Id
}

export const IdKey = v.pipe(
  v.string(),
  v.check((x) => Number.isSafeInteger(+x)),
  v.transform((x) => +x),
  v.brand("id"),
)

export const Id = v.pipe(
  v.number(),
  v.check((x) => Number.isSafeInteger(x)),
  v.brand("id"),
)

export type Id = v.InferOutput<typeof Id>
