import { onCleanup } from "solid-js"

export function createEventListener<K extends keyof DocumentEventMap>(
  target: Document,
  name: K,
  callback: (event: DocumentEventMap[K] & { currentTarget: Document }) => void,
  options?: AddEventListenerOptions,
): void

export function createEventListener<
  T extends HTMLElement,
  K extends keyof HTMLElementEventMap,
>(
  target: T,
  name: K,
  callback: (event: HTMLElementEventMap[K] & { currentTarget: T }) => void,
  options?: AddEventListenerOptions,
): void

export function createEventListener(
  target: EventTarget,
  name: string,
  callback: (event: Event) => void,
  options?: AddEventListenerOptions,
) {
  if (typeof window == "undefined") {
    return
  }

  target.addEventListener(name, callback, options)

  onCleanup(() => target.removeEventListener(name, callback, options))
}
