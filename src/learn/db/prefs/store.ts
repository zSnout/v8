import { createPrefs } from "@/learn/lib/defaults"
import { ID_ZERO } from "@/learn/lib/id"
import { Prefs } from "@/learn/lib/types"
import { createStore, SetStoreFunction, unwrap } from "solid-js/store"
import { DB } from ".."
import { Reason } from "../reason"
import type { SQL } from "../sqlite"

export function createPrefsStore(
  db: DB,
): [
  get: Prefs,
  set: (reason: Reason) => SetStoreFunction<Prefs>,
  ready: Promise<void>,
] {
  const [get, set] = createStore(createPrefs(Date.now()))
  let resolve: () => void
  const ready = new Promise<void>((r) => (resolve = r))

  db.read("prefs")
    .store.get(ID_ZERO)
    .then((prefs) => {
      if (prefs) {
        set(prefs)
      }
      resolve()
    })

  return [
    get,
    (reason) =>
      function (this: any) {
        set.apply(this, arguments as never)

        db.readwrite("prefs", reason)
          .objectStore("prefs")
          .put(structuredClone(unwrap(get)), ID_ZERO)
      } as SetStoreFunction<Prefs>,
    ready,
  ]
}

export function createPrefsSQL(
  sql: SQL,
): [
  get: Prefs,
  set: (reason: Reason) => SetStoreFunction<Prefs>,
  ready: Promise<void>,
] {
  const [get, set] = createStore(createPrefs(Date.now()))
  let resolve: () => void
  const ready = new Promise<void>((r) => (resolve = r))

  sql.post("prefs_get").then((prefs) => {
    set(prefs)
    resolve()
  })

  return [
    get,
    (_reason) =>
      function (this: any) {
        // TODO: implement undo-redo
        set.apply(this, arguments as never)
        sql.post("prefs_set", unwrap(get))
      } as SetStoreFunction<Prefs>,
    ready,
  ]
}
