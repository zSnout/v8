/** A -> B -> (A,B].prod() */
const cache = new Map<bigint, Map<bigint, bigint>>()

function factorialRange(minExcluded: bigint, maxIncluded: bigint): bigint {
  if (maxIncluded < minExcluded) {
    return 0n
  }

  let cacheRow

  const cached = (
    (cacheRow = cache.get(minExcluded)) ??
    (cache.set(minExcluded, (cacheRow = new Map<bigint, bigint>())), cacheRow)
  )?.get(maxIncluded)

  if (cached != null) {
    return cached
  }

  let output = 1n

  while (minExcluded < maxIncluded) {
    minExcluded++
    output *= minExcluded
  }

  cacheRow.set(maxIncluded, output)

  return output
}

export function factorial(x: bigint): bigint {
  return factorialRange(0n, x)
}

export function nCr(n: bigint, r: bigint): bigint {
  if (n < 0n || r < 0n || r < n) {
    return 0n
  }

  return factorialRange(r, n) * factorial(n - r)
}
