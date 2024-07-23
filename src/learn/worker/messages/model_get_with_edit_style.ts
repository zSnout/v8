import type { Id } from "@/learn/lib/id"
import { TemplateEditStyle } from "@/learn/lib/types"
import { parse } from "valibot"
import { text } from "../checks"
import { db } from "../db"
import { stmts } from "../stmts"

export function model_get_with_edit_style(mid: Id) {
  const tx = db.read()
  try {
    return {
      model: stmts.models.interpret(
        db.row("SELECT * FROM models WHERE id = ?", [mid]),
      ),
      editStyle: parse(
        TemplateEditStyle,
        JSON.parse(
          db.val("SELECT template_edit_style FROM prefs WHERE id = 0", text),
        ),
      ),
    }
  } finally {
    tx.dispose()
  }
}
