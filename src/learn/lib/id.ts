import * as v from "valibot"

export function randomId(): Id {
  return (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER / 2)) + 1) as Id
}

export const IdKey = v.string()

export const Id = v.pipe(
  v.number(),
  v.check((x) => Number.isSafeInteger(x)),
  v.brand("id"),
)

export type Id = v.InferOutput<typeof Id>
