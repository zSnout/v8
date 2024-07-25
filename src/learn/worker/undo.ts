// adapted from https://www.sqlite.org/undoredo.html

import { error, ok } from "@/components/result"
import type { WorkerDB } from "."
import type { Reason } from "../db/reason"
import type { Id } from "../lib/id"
import {
  ZDB_UNDO_FAILED,
  ZDB_UNDO_HAPPENED,
  ZDB_UNDO_STACK_CHANGED,
  type UndoType,
  type WorkerNotification,
} from "../shared"
import { text } from "./checks"

export interface UndoMeta {
  currentCard?: Id
}

export type Item = [
  start: number,
  end: number,
  reason: Reason | null,
  meta: UndoMeta,
]

export class StateManager {
  private undoStack: Item[] = []
  private redoStack: Item[] = []
  private active = false
  private freeze = -1
  private firstlog = 1

  constructor(private readonly db: WorkerDB) {}

  activate(args: string[]) {
    if (this.active) {
      return
    }
    this.createTriggers(args)
    this.undoStack = []
    this.redoStack = []
    this.active = true
    this.freeze = -1
    this.startInterval()
  }

  deactivate() {
    if (!this.active) {
      return
    }
    this.dropTriggers()
    this.undoStack = []
    this.redoStack = []
    this.active = false
    this.freeze = -1
  }

  makeFrozen() {
    if (this.freeze >= 0) {
      throw new Error("Recursive call to `freeze`.")
    }

    this.freeze = this.db.selectValue(
      "SELECT coalesce(max(seq),0) FROM undolog",
      undefined,
      1,
    )!
  }

  makeUnfrozen() {
    if (this.freeze < 0) {
      throw new Error("Called `unfreeze` while not frozen.")
    }

    this.db.exec("DELETE FROM undolog WHERE seq > ?", { bind: [this.freeze] })
    this.freeze = -1
  }

  mark(reason: Reason | null, meta: UndoMeta) {
    if (!this.active) {
      this.msgStackChanged()
      return
    }

    let end = this.db.selectValue(
      "SELECT coalesce(max(seq),0) FROM undolog",
      undefined,
      1,
    )!
    if (this.freeze >= 0 && end > this.freeze) {
      end = this.freeze
    }
    const begin = this.firstlog
    this.startInterval()
    if (begin == this.firstlog) {
      this.msgStackChanged()
      return
    }

    this.undoStack.push([begin, end, reason, meta])
    this.redoStack = []
    this.msgStackChanged()
  }

  dispatch(type: UndoType) {
    return this.step(
      type == "undo" ? this.undoStack : this.redoStack,
      type == "undo" ? this.redoStack : this.undoStack,
      type,
    )
  }

  private msgStackChanged() {
    postMessage({
      zid: ZDB_UNDO_STACK_CHANGED,
      canUndo: this.active && this.undoStack.length > 0,
      canRedo: this.active && this.redoStack.length > 0,
    } satisfies WorkerNotification)
  }

  private msgUndoHappened(
    type: UndoType,
    reason: Reason | null,
    meta: UndoMeta,
  ) {
    postMessage({
      zid: ZDB_UNDO_HAPPENED,
      type,
      reason,
      meta,
    } satisfies WorkerNotification)
  }

  private msgUndoFailed(type: UndoType) {
    postMessage({
      zid: ZDB_UNDO_FAILED,
      type,
    } satisfies WorkerNotification)
  }

  private createTriggers(args: string[]) {
    try {
      this.db.exec("DROP TABLE undolog")
    } catch {}
    let sql = "CREATE TEMP TABLE undolog (seq integer primary key, sql text);\n"
    for (const tbl of args) {
      const colList = this.db
        .run(`pragma table_info(${tbl})`)
        .map((x) => x[1] as string)

      sql += `CREATE TEMP TRIGGER _${tbl}_it AFTER INSERT ON ${tbl} BEGIN
INSERT INTO undolog VALUES (NULL, 'DELETE FROM ${tbl} WHERE rowid='||new.rowid);
END;`

      sql += `CREATE TEMP TRIGGER _${tbl}_ut AFTER UPDATE ON ${tbl} BEGIN
INSERT INTO undolog VALUES (NULL, 'UPDATE ${tbl} `
      let sep = "SET "
      for (const name of colList) {
        sql += `${sep}${name}='||quote(old.${name})||'`
        sep = ","
      }
      sql += ` WHERE rowid='||old.rowid);
END;`

      sql += `CREATE TEMP TRIGGER _${tbl}_dt AFTER DELETE ON ${tbl} BEGIN
INSERT INTO undolog VALUES (NULL, 'INSERT INTO ${tbl}(rowid`
      for (const name of colList) {
        sql += `,${name}`
      }
      sql += `) VALUES ('||old.rowid||'`
      for (const name of colList) {
        sql += `,'||quote(old.${name})||'`
      }
      sql += `)');
END;`
    }
    this.db.exec(sql)
  }

  private dropTriggers() {
    const tlist = this.db.checked(
      "SELECT name FROM sqlite_temp_schema WHERE type='trigger'",
      [text],
    )

    for (const [trigger] of tlist) {
      if (!/^_.*_[iud]t$/.test(trigger)) {
        continue
      }

      this.db.exec(`DROP TRIGGER ${trigger}`)
    }

    try {
      this.db.exec("DROP TABLE undolog")
    } catch {}
  }

  private startInterval() {
    this.firstlog = this.db.selectValue(
      "SELECT coalesce(max(seq),0)+1 FROM undolog",
      undefined,
      1,
    )!
  }

  private step(v1: Item[], v2: Item[], type: UndoType) {
    const first = v1.pop()
    if (!first) {
      this.msgUndoFailed(type)
      return error("Nothing left in " + type + " stack.")
    }
    let [begin, end, reason, meta] = first
    this.db.exec("BEGIN")
    try {
      const q1 = `SELECT sql FROM undolog WHERE seq>=${begin} AND seq<=${end} ORDER BY seq DESC`
      const sqllist = this.db.run(q1).map((x) => x[0] as string)
      this.db.exec(`DELETE FROM undolog WHERE seq>=${begin} AND seq<=${end}`)
      this.firstlog = this.db.selectValue(
        "SELECT coalesce(max(seq),0)+1 FROM undolog",
        undefined,
        1,
      )!
      for (const sql of sqllist) {
        this.db.exec(sql)
      }
      this.db.exec("COMMIT")
    } catch (err) {
      this.db.exec("ROLLBACK")
      throw err
    }

    this.msgUndoHappened(type, reason, meta)

    end = this.db.selectValue(
      "SELECT coalesce(max(seq),0)+1 FROM undolog",
      undefined,
      1,
    )!
    begin = this.firstlog
    v2.push([begin, end, reason, meta])
    this.startInterval()
    this.msgStackChanged()

    return ok(reason)
  }
}
