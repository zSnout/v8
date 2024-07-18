import { notNull } from "@/components/pray"
import type { Id } from "@/learn/lib/id"
import { TemplateEditStyle } from "@/learn/lib/types"
import { parse } from "valibot"
import { text } from "../checks"
import { db } from "../db"
import { stmts } from "../stmts"

export function model_get_with_edit_style(mid: Id) {
  const tx = db.tx()
  try {
    const data = {
      model: stmts.models.interpret(
        notNull(
          db.single("SELECT * FROM models WHERE id = ?", [mid]).values[0],
          "The selected model does not exist.",
        ),
      ),
      editStyle: parse(
        TemplateEditStyle,
        JSON.parse(
          db.val("SELECT template_edit_style FROM prefs WHERE id = 0", text),
        ),
      ),
    }
    tx.commit()
    return data
  } finally {
    tx.dispose()
  }
}
