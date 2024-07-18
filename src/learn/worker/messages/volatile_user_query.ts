import { db } from "../db"

export function volatile_user_query(query: string) {
  return db.exec(query)
}
