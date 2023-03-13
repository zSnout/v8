import { onCleanup } from "solid-js"

export function createEventListener<K extends keyof DocumentEventMap>(
  target: Document,
  name: K,
  callback: (event: DocumentEventMap[K] & { currentTarget: Window }) => void
): void

export function createEventListener<
  T extends HTMLElement,
  K extends keyof HTMLElementEventMap
>(
  target: T,
  name: K,
  callback: (event: HTMLElementEventMap[K] & { currentTarget: T }) => void
): void

export function createEventListener(
  target: EventTarget,
  name: string,
  callback: (event: Event) => void
) {
  if (typeof window == "undefined") {
    return
  }

  target.addEventListener(name, callback)

  onCleanup(() => target.removeEventListener(name, callback))
}
