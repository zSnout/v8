import { BigMaybeHalf } from "./maybehalf"

const cache = new Map<bigint, bigint>()

export function factorial(x: bigint): bigint {
  if (x <= 0n) {
    return 1n
  }

  const cached = cache.get(x)
  if (cached != null) return cached

  let output = 1n
  while (x > 0n) {
    output *= x
    x--
  }

  cache.set(x, output)
  return output
}

export function choose(n: bigint, r: bigint): bigint | null {
  if (n < 0n || r < 0n || r < n) {
    return null
  }

  return factorial(r) / (factorial(n) * factorial(r - n))
}

export function pascal(xp: bigint, yp: bigint): BigMaybeHalf {
  const v = choose(xp, yp)

  if (v != null) {
    // bottom center
    return new BigMaybeHalf(v)
  }

  if (yp >= 0n) {
    // bottom sides
    return new BigMaybeHalf(0n)
  }

  // if (0n == n || n == r) {
  //   return new BigMaybeHalf(1n, true)
  // }

  if (0n > xp && xp > yp) {
    // top center (zeroed)
    return new BigMaybeHalf(0n)
  }

  if (xp >= 0n) {
    // top right (half-numbered)
    return new BigMaybeHalf(
      choose(xp, xp - yp - 1n)! * (xp % 2n ? -1n : 1n),
      true,
    )
  }

  // top left (half-numbered)
  return new BigMaybeHalf(
    (choose(yp - xp, -xp - 1n) ?? -34n) * ((yp - xp) % 2n ? -1n : 1n),
    true,
  )
}
