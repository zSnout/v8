import type { BindingSpec, SqlValue } from "@sqlite.org/sqlite-wasm"
import { db } from "."
import type { Check, CheckResult, CheckResults } from "./checks"

/**
 * An abstraction over the normal `Stmt` class which doesn't allow fine-grained
 * stepping, but which automatically resets and disposes statements.
 */
export class Stmt {
  private readonly stmt
  private autoDisposes = true

  constructor(sql: string) {
    this.stmt = db.prepare(sql)
    queueMicrotask(() => {
      if (this.autoDisposes) {
        this.dispose()
      }
    })
  }

  bindNew(bindings: BindingSpec) {
    this.stmt.clearBindings()
    this.stmt.bind(bindings)
    return this
  }

  dispose() {
    try {
      this.stmt.finalize()
    } catch {}
  }

  getAll<T extends readonly Check[]>(checks: T): CheckResults<T>[]
  getAll(checks?: undefined): SqlValue[][]
  getAll(checks?: Check[]): SqlValue[][] {
    const data: SqlValue[][] = []
    while (this.stmt.step()) {
      data.push(this.stmt.get([]))
    }
    this.stmt.reset()
    if (checks) {
      const row = data[0]!
      if (row) {
        if (checks.length != row.length) {
          throw new Error(
            `Expected ${checks.length} column(s); received ${row.length}.`,
          )
        }
        for (let index = 0; index < checks.length; index++) {
          if (!checks[index]!(row[index]!)) {
            throw new Error(`Check failed: ${checks[index]}.`)
          }
        }
      }
    }
    return data
  }

  getRow<T extends readonly Check[]>(checks: T): CheckResults<T>
  getRow(checks?: undefined): SqlValue[]
  getRow(checks?: Check[]): SqlValue[] {
    let row
    if (this.stmt.step()) {
      row = this.stmt.get([])
    } else {
      throw new Error("Expected at least one row.")
    }
    this.stmt.reset()
    if (checks) {
      if (checks.length != row.length) {
        throw new Error(
          `Expected ${checks.length} column(s); received ${row.length}.`,
        )
      }
      for (let index = 0; index < checks.length; index++) {
        if (!checks[index]!(row[index]!)) {
          throw new Error(`Check failed: ${checks[index]}.`)
        }
      }
    }
    return row
  }

  getValue<T extends Check>(check: T): CheckResult<T>
  getValue(check?: undefined): SqlValue
  getValue(check?: Check): SqlValue {
    let data
    if (this.stmt.step()) {
      data = this.stmt.get(0)
    } else {
      throw new Error("Expected at least one row.")
    }
    this.stmt.reset()
    if (check) {
      if (!check(data)) {
        throw new Error(`Check failed: ${check}.`)
      }
    }
    return data
  }

  run() {
    try {
      while (this.stmt.step());
    } finally {
      this.stmt.reset()
    }
    return this
  }

  stopAutomaticDisposal() {
    this.autoDisposes = false
    return this
  }
}

export function sql(strings: TemplateStringsArray, ...bindings: SqlValue[]) {
  const stmt = new Stmt(strings.join("?"))
  if (bindings.length) {
    stmt.bindNew(bindings)
  }
  return stmt
}
