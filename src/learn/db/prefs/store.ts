import { createPrefs } from "@/learn/lib/defaults"
import { ID_ZERO } from "@/learn/lib/id"
import { Prefs } from "@/learn/lib/types"
import { createStore, SetStoreFunction, unwrap } from "solid-js/store"
import { DB } from ".."

export function createPrefsStore(
  db: DB,
): [get: Prefs, set: SetStoreFunction<Prefs>] {
  const [get, set] = createStore(createPrefs(Date.now()))

  db.get("prefs", ID_ZERO).then((prefs) => {
    if (prefs) {
      set(prefs)
    }
  })

  return [
    get,
    function (this: any) {
      set.apply(this, arguments as never)

      db.transaction("prefs", "readwrite")
        .objectStore("prefs")
        .put(structuredClone(unwrap(get)), ID_ZERO)
    } as SetStoreFunction<Prefs>,
  ]
}
