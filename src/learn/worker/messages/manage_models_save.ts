import type { Id } from "@/learn/lib/id"
import { cloneModel } from "@/learn/lib/models"
import type { AddedModel, RemovedModel } from "@/learn/lib/types"
import { readwrite, sql } from ".."
import { stmts } from "../stmts"

export function manage_models_save(
  added: AddedModel[],
  removed: RemovedModel[],
  idToNameMap: Record<Id, string>,
) {
  const tx = readwrite("Manage models")
  try {
    if (added.length) {
      const stmt = stmts.models.insert()
      for (const a of added) {
        const model = cloneModel(a.id, a.name, a.cloned)
        stmt.bindNew(stmts.models.insertArgs(model)).run()
      }
    }

    if (removed.length) {
      sql`
        UPDATE core
        SET
          last_edited = ${Date.now()},
          last_schema_edit = ?0
        WHERE id = 0;
      `.run()

      for (const [mid] of removed) {
        sql`DELETE FROM models WHERE id = ${mid};`.run()
      }
    }

    if (Object.keys(idToNameMap).length) {
      for (const [id, name] of Object.entries(idToNameMap)) {
        sql`UPDATE models SET name = ${name} WHERE id = ${id};`.run()
      }
    }

    tx.commit()
  } finally {
    tx.dispose()
  }
}
