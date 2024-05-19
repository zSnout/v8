import { createEffect, createSignal, untrack } from "solid-js"

export type ReadonlySearchParams = Pick<
  URLSearchParams,
  | "entries"
  | "forEach"
  | "get"
  | "getAll"
  | "has"
  | "keys"
  | "toString"
  | "values"
>

export type SignalLike<T> = readonly [get: () => T, set: (value: T) => void]

const [rawSearch, setRawSearch] = createSignal(
  typeof location == "undefined"
    ? new URLSearchParams()
    : new URLSearchParams(location.search),
)

const queue = new Map<string, string | null>()
let didQueue = false

function updateURL() {
  if (!didQueue) {
    return
  }

  didQueue = false

  const search = untrack(rawSearch)

  for (const [name, value] of queue) {
    if (value == null) {
      search.delete(name)
    } else {
      search.set(name, value)
    }
  }

  queue.clear()

  history.replaceState(undefined, "", "?" + search.toString())

  setRawSearch(search)
}

export function createSearchParam(
  name: string,
  defaultValue: string,
): SignalLike<string>

export function createSearchParam<T extends string>(
  name: string,
  defaultValue: T,
): SignalLike<T>

export function createSearchParam(name: string): SignalLike<string | null>

export function createSearchParam<T extends string | null = null>(
  name: string,
  defaultValue: T = null! as T,
): SignalLike<string | T> {
  const [get, set] = createSignal<string | null>(null)

  createEffect(() => set(rawSearch().get(name)))

  return [
    () => get() ?? defaultValue,
    (value) => {
      setSearchParam(name, value)
      set(value as string | null)
    },
  ]
}

export function createNumericalSearchParam(
  name: string,
  defaultValue: number,
): SignalLike<number> {
  const [get, set] = createSearchParam(name)

  return [
    () => +(get() ?? defaultValue),
    (value) => set(value == defaultValue ? null : "" + value),
  ]
}

export function createBooleanSearchParam(name: string): SignalLike<boolean> {
  const [get, set] = createSearchParam(name)

  return [
    () => (get() == "false" ? false : get() == "true" ? true : get() != null),
    (value) => set(value ? "true" : "false"),
  ]
}

export function createBooleanSearchParamWithFallback(
  name: string,
  fallback: string,
): SignalLike<boolean> {
  const [base] = createBooleanSearchParam(fallback)
  const [get, set] = createSearchParam(name)

  return [
    () => (get() == "true" ? true : get() == "false" ? false : base()),
    (value) => set(value ? "true" : "false"),
  ]
}

export function getSearchParam(name: string): string | null {
  return untrack(rawSearch).get(name)
}

export function setSearchParam(name: string, value: string | null) {
  queue.set(name, value)

  if (!didQueue) {
    didQueue = true
    setTimeout(updateURL, 2000)
  }

  return value
}
