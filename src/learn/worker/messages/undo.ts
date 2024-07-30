import type { UndoType } from "@/learn/shared"
import { state } from ".."
import type { UndoMeta } from "../lib/undo"

export function undo(type: UndoType, meta: UndoMeta) {
  return state.dispatch(type, meta)
}
