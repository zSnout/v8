import type { UndoType } from "@/learn/shared"
import { state } from ".."

export function undo(type: UndoType) {
  return state.dispatch(type)
}
