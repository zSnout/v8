export function pray(x: boolean, reason: string): asserts x {
  if (!x) {
    throw new Error(reason)
  }
}

export function notNull<T>(x: T, reason: string): T & {} {
  if (x == null) {
    throw new Error(reason)
  }

  return x
}
