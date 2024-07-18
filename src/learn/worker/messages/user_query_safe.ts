import { db } from "../db"

export function user_query_safe(query: string) {
  const isUnsafe = /begin\s+transaction|commit|rollback/i.test(query)

  if (isUnsafe) {
    throw new Error("Safe queries cannot use transactions.")
  }

  const tx = db.tx()
  try {
    return db.exec(query)
  } finally {
    tx.rollback()
  }
}
