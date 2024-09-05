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

export function pascal(n: bigint, r: bigint): bigint {
  const v = choose(n, r)

  if (v != null) {
    return v
  }

  if (r >= 0n) {
    return 0n
  }

  return -1n
}
