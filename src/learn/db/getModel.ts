import { DB } from "."
import type { Id } from "../lib/id"

export function getModel(db: DB, mid: Id) {
  return db.read("models").store.get(mid)
}
