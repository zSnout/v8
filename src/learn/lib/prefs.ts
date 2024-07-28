import { createPrefs } from "@/learn/lib/defaults"
import { Prefs } from "@/learn/lib/types"
import { createStore, SetStoreFunction, unwrap } from "solid-js/store"
import type { Worker } from "../db"
import { Reason } from "./reason"

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
    (reason: Reason) =>
      function (this: any) {
        // TODO: implement undo-redo
        set.apply(this, arguments as never)
        worker.post("prefs_set", unwrap(get), reason)
      } as SetStoreFunction<Prefs>,
    ready,
  ]
}
