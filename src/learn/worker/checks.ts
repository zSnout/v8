import type { Id } from "@/learn/lib/id"
import type { SqlValue } from "sql.js"

// manual argument because typescript's `x is ...` semantics are strange
export function int(value: SqlValue): value is number {
  return typeof value == "number" && Number.isSafeInteger(value)
}

export function real(value: SqlValue) {
  return typeof value == "number"
}

export function bool(value: SqlValue) {
  return value == 0 || value == 1
}

export function text(value: SqlValue) {
  return typeof value == "string"
}

export function id(value: SqlValue): value is Id {
  return typeof value == "number" && Number.isSafeInteger(value)
}

// manual argument because typescript's `x is ...` semantics are strange
export function qint(value: SqlValue): value is number {
  return (
    value == null || (typeof value == "number" && Number.isSafeInteger(value))
  )
}

export function qreal(value: SqlValue) {
  return value == null || typeof value == "number"
}

export function qbool(value: SqlValue) {
  return value == null || value == 0 || value == 1
}

export function qtext(value: SqlValue) {
  return value == null || typeof value == "string"
}

export function qid(value: SqlValue): value is Id {
  return (
    value == null || (typeof value == "number" && Number.isSafeInteger(value))
  )
}

export type Check = (x: SqlValue) => boolean

export type CheckResult<T extends Check> = T extends ((
  x: SqlValue,
) => x is infer U extends SqlValue)
  ? U
  : SqlValue