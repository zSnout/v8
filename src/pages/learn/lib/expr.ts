import { Accessor, createEffect, createSignal } from "solid-js"

export function createExpr<T>(
  getValue: (last?: T) => T,
): [get: Accessor<T>, reload: () => T] {
  const [get, set] = createSignal<T>()
  createEffect(() => set(getValue))
  return [get as Accessor<T>, () => set(getValue)]
}
