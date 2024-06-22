export function pray(x: boolean, reason: string): asserts x {
  if (!x) {
    throw new Error(reason)
  }
}
