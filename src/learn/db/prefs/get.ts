import { notNull } from "@/components/pray"
import { DB } from ".."
import { ID_ZERO } from "../../lib/id"

export async function getPrefs(db: DB) {
  return notNull(
    await db.get("prefs", ID_ZERO),
    "This collection doesn't have a preferences table.",
  )
}
