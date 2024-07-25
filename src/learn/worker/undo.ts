// adapted from https://www.sqlite.org/undoredo.html

import { type WorkerNotification } from "../shared"
import { text } from "./checks"
import { db } from "."

export type Item = [start: number, end: number]

export class StateManager {
  private undoStack: Item[] = []
  private redoStack: Item[] = []
  private active = false
  private freeze = -1
  private firstlog = 1

  constructor() {}

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

    this.freeze = db.selectValue(
      "SELECT coalesce(max(seq),0) FROM undolog",
      undefined,
      1,
    )!
  }

  makeUnfrozen() {
    if (this.freeze < 0) {
      throw new Error("Called `unfreeze` while not frozen.")
    }

    db.exec("DELETE FROM undolog WHERE seq > ?", { bind: [this.freeze] })
    this.freeze = -1
  }

  mark() {
    if (!this.active) {
      this.refreshButtons()
      return
    }

    let end = db.selectValue(
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
      this.refreshButtons()
      return
    }

    this.undoStack.push([begin, end])
    this.redoStack = []
    this.refreshButtons()
  }

  undo() {
    this.step(this.undoStack, this.redoStack)
  }

  redo() {
    this.step(this.redoStack, this.undoStack)
  }

  private refreshButtons() {
    postMessage({
      zid: "zdb:refresh-undoredo",
      canUndo: this.active && this.undoStack.length > 0,
      canRedo: this.active && this.redoStack.length > 0,
    } satisfies WorkerNotification)
  }

  private refreshInterfaces() {
    postMessage({ zid: "zdb:refresh-interfaces" } satisfies WorkerNotification)
  }

  private createTriggers(args: string[]) {
    try {
      db.exec("DROP TABLE undolog")
    } catch {}
    let sql = "CREATE TEMP TABLE undolog (seq integer primary key, sql text);\n"
    for (const tbl of args) {
      const colList = db
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
    db.exec(sql)
  }

  private dropTriggers() {
    const tlist = db.checked(
      "SELECT name FROM sqlite_temp_schema WHERE type='trigger'",
      [text],
    )

    for (const [trigger] of tlist) {
      if (!/^_.*_[iud]t$/.test(trigger)) {
        continue
      }

      db.exec(`DROP TRIGGER ${trigger}`)
    }

    try {
      db.exec("DROP TABLE undolog")
    } catch {}
  }

  private startInterval() {
    this.firstlog = db.selectValue(
      "SELECT coalesce(max(seq),0)+1 FROM undolog",
      undefined,
      1,
    )!
  }

  private step(v1: Item[], v2: Item[]) {
    let [begin, end] = v1.pop()!
    db.exec("BEGIN")
    try {
      const q1 = `SELECT sql FROM undolog WHERE seq>=${begin} AND seq<=${end} ORDER BY seq DESC`
      const sqllist = db.run(q1).map((x) => x[0] as string)
      db.exec(`DELETE FROM undolog WHERE seq>=${begin} AND seq<=${end}`)
      this.firstlog = db.selectValue(
        "SELECT coalesce(max(seq),0)+1 FROM undolog",
        undefined,
        1,
      )!
      for (const sql of sqllist) {
        db.exec(sql)
      }
      db.exec("COMMIT")
    } catch (err) {
      db.exec("ROLLBACK")
      throw err
    }

    this.refreshInterfaces()

    end = db.selectValue(
      "SELECT coalesce(max(seq),0)+1 FROM undolog",
      undefined,
      1,
    )!
    begin = this.firstlog
    v2.push([begin, end])
    this.startInterval()
    this.refreshButtons()
  }
}

export const state = new StateManager()
