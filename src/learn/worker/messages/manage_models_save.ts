import { cloneModel } from "@/learn/lib/models"
import type { AddedModel, RemovedModel } from "@/learn/lib/types"
import { db } from "../db"
import { stmts } from "../stmts"

export function manage_models_save(
  added: AddedModel[],
  removed: RemovedModel[],
) {
  const tx = db.tx()
  try {
    if (added.length) {
      const stmt = db.prepare(stmts.models.insert)
      try {
        for (const a of added) {
          const model = cloneModel(a.id, a.name, a.cloned)
          stmt.bind(stmts.models.insertArgs(model)).stepReset()
        }
      } finally {
        stmt.finalize()
      }
    }

    if (removed.length) {
      db.run(
        "UPDATE core SET last_edited = ?, last_schema_edit = ? WHERE id = 0",
        [Date.now(), Date.now()],
      )

      for (const [mid] of removed) {
        db.run(
          "INSERT INTO graves (oid, type) SELECT id, 1 FROM notes WHERE mid = ?",
          [mid],
        )
        db.run("DELETE FROM notes WHERE mid = ?", [mid])
        db.run("DELETE FROM models WHERE id = ?", [mid])
      }
    }

    tx.commit()
  } finally {
    tx.dispose()
  }
}
