import { UserMedia, writeKey } from "@/learn/lib/media"
import { sql } from ".."
import { text } from "../checks"

const media = new UserMedia()

/** Does not create a transaction. */
export async function media_analyze_unused() {
  const notes = sql`SELECT fields FROM notes;`.getAll([text]).map((x) => x[0])
  const keys = await media.keys()

  const unusedKeys: ArrayBuffer[] = []
  for (const key of keys) {
    const str = `/learn/media/${writeKey(key)}`
    if (!notes.some((x) => x.includes(str))) {
      unusedKeys.push(key)
    }
  }

  return unusedKeys
}
