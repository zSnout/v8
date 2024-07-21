import { createPrefs } from "@/learn/lib/defaults"
import { Prefs } from "@/learn/lib/types"
import { createStore, SetStoreFunction, unwrap } from "solid-js/store"
import { Reason } from "./reason"
import type { Worker } from "."

export function createPrefsStore(
  worker: Worker,
): [
  get: Prefs,
  set: (reason: Reason) => SetStoreFunction<Prefs>,
  ready: Promise<void>,
] {
  const [get, set] = createStore(createPrefs(Date.now()))
  let resolve: () => void
  const ready = new Promise<void>((r) => (resolve = r))

  worker.post("prefs_get").then((prefs) => {
    set(prefs)
    resolve()
  })

  return [
    get,
    (_reason) =>
      function (this: any) {
        // TODO: implement undo-redo
        set.apply(this, arguments as never)
        worker.post("prefs_set", unwrap(get))
      } as SetStoreFunction<Prefs>,
    ready,
  ]
}
