import { db } from "../db"

export function user_query_unsafe(query: string) {
  return db.exec(query)
}
