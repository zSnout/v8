export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

export interface Error<E = string> {
  readonly ok: false
  readonly reason: E
}

export type Result<T, E = string> = Ok<T> | Error<E>

export function ok<T, E = string>(value: T): Result<T, E> {
  return { ok: true, value }
}

export function error(reason: unknown): Error {
  return {
    ok: false,
    reason: String(reason instanceof Error ? reason.message : reason),
  }
}

export function errorOf<E>(reason: E): Error<E> {
  return {
    ok: false,
    reason,
  }
}

export function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.value
  }

  throw new Error(result.reason)
}
