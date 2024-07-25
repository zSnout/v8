import type { WorkerDB } from "."
import query_upgrade_v2 from "./query/upgrade_v2.sql?raw"

export const latest = 2

// this function cannot access external `db` since that variable isn't set yet
// this handles the main part of upgrading, while `checkVersion` takes the meta
export function upgrade(db: WorkerDB, current: number) {
  // if version < 1, we have no data
  if (current < 1) {
    db.exec(
      `INSERT INTO core (id, version) VALUES (0, :version);
INSERT INTO prefs (id) VALUES (0);
INSERT INTO confs (id, name) VALUES (0, 'Default');
INSERT INTO decks (id, name, is_filtered) VALUES (0, 'Default', 0);`,
      { bind: { ":version": latest } },
    )
  }

  // if version < 2, the `graves` table still has an id column
  // syncing didn't exist when v2 was added, so we can safely drop graves
  if (current < 2) {
    db.exec(query_upgrade_v2)
  }
}
