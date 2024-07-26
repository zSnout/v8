import { randomId } from "@/learn/lib/id"
import { readwrite, sql } from ".."

export function create_deck(name: string) {
  const tx = readwrite(`Create deck ${name}`)
  try {
    sql`
      INSERT OR IGNORE INTO decks (id, name, is_filtered)
      VALUES (${randomId()}, ${name}, 0);
    `.run()
    tx.commit()
  } finally {
    tx.dispose()
  }
}
