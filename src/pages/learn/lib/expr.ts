import { Accessor, createSignal } from "solid-js"

export function createExpr<T>(
  getValue: (last?: T) => T,
): [get: Accessor<T>, reload: () => T] {
  const [get, set] = createSignal<T>(getValue())
  return [get as Accessor<T>, () => set(getValue)]
}
