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

function choose(n: bigint, r: bigint): bigint {
  return factorial(r) / (factorial(n) * factorial(r - n))
}

const pcache = new Map<bigint, Map<bigint, BigMaybeHalf>>()

function pascalInner(xp: bigint, yp: bigint): BigMaybeHalf {
  if (!(xp < 0n || yp < 0n || yp < xp)) {
    // bottom center
    return new BigMaybeHalf(choose(xp, yp))
  }

  if (yp >= 0n) {
    // bottom sides
    return new BigMaybeHalf(0n)
  }

  if (0n > xp && xp > yp) {
    // top center (zeroed)
    return new BigMaybeHalf(0n)
  }

  if (xp >= 0n) {
    // top right (half-numbered)
    return new BigMaybeHalf(
      choose(xp, xp - yp - 1n) * (xp % 2n ? -1n : 1n),
      true,
    )
  }

  // top left (half-numbered)
  return new BigMaybeHalf(
    choose(yp - xp, -xp - 1n) * ((yp - xp) % 2n ? -1n : 1n),
    true,
  )
}

export function pascal(xp: bigint, yp: bigint): BigMaybeHalf {
  let row = pcache.get(xp)
  if (!row) {
    row = new Map()
    pcache.set(xp, row)
  }

  const cell = row.get(yp)
  if (cell != null) {
    return cell
  }

  const value = pascalInner(xp, yp)
  row.set(yp, value)
  return value
}
