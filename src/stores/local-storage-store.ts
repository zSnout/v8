import { createSignal, untrack, type Signal } from "solid-js"

export function createStorage(
  key: string,
  defaultValue: string,
): Signal<string> {
  const realKey = `z8:${key}`

  const [get, set] = createSignal(
    typeof localStorage != "undefined"
      ? localStorage.getItem(realKey) ?? defaultValue
      : defaultValue,
  )

  if (typeof localStorage != "undefined" && typeof window != "undefined") {
    window.addEventListener("storage", (event) => {
      if (event.storageArea == localStorage && event.key == realKey) {
        set(event.newValue ?? defaultValue)
      }
    })
  }

  return [
    get,
    (value) => {
      if (typeof value == "function") {
        const next = value(untrack(get))
        localStorage.setItem(realKey, next)
        return next as any
      } else {
        localStorage.setItem(realKey, value)
        set(value)
        return value as any
      }
    },
  ]
}
