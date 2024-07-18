import type { Id } from "@/learn/lib/id"
import type { SqlValue } from "sql.js"

export const int = (x: SqlValue) => typeof x == "number"
export const bool = (x: SqlValue) => x == 0 || x == 1
export const text = (x: SqlValue) => typeof x == "string"
export const id = (x: SqlValue): x is Id =>
  typeof x == "number" && Number.isSafeInteger(x)

export const qint = (x: SqlValue) => x == null || typeof x == "number"
export const qbool = (x: SqlValue) => x == null || x == 0 || x == 1
export const qtext = (x: SqlValue) => x == null || typeof x == "string"
export const qid = (x: SqlValue): x is Id | null =>
  x == null || (typeof x == "number" && Number.isSafeInteger(x))

export type Check = (x: SqlValue) => boolean
export type CheckResult<T extends Check> = T extends ((
  x: SqlValue,
) => x is infer U extends SqlValue)
  ? U
  : SqlValue
