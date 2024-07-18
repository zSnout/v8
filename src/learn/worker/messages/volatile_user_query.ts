import { db } from "../db"

export function user_query_safe(query: string) {
  const isUnsafe = /begin\s+transaction|commit|rollback/i.test(query)

  if (isUnsafe) {
    const text =
      unsafe.length == 1
        ? `The ${unsafe[0]!} command is not allowed in the safe zone.`
        : unsafe.length == 2
          ? `The ${unsafe[0]!} and ${unsafe[1]!} commands are not allowed in the safe zone.`
          : `The ${unsafe.slice(0, -1).join(", ")}, and ${unsafe.at(-1)!} commands are not allowed in the safe zone.`

    if (isUnsafe && usesNonTransactions) {
      throw new Error(
        `${text} Switch to the safe zone to run queries which might change the database or use transactions.`,
      )
    } else {
    }
  }

  if (/begin\s+transaction|commit|rollback/i.test(query)) {
    throw new Error(
      "Safe queries are automatically run in a transaction. Switch to the unsafe query zone",
    )
  }

  const tx = db.tx()
  try {
    return db.exec(query)
  } finally {
    tx.rollback()
  }
}
