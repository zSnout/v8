import { Id } from "@/learn/lib/id"
import { DB } from ".."
import { SchedulerV4, regather } from "./gather"

export async function select(
  db: DB,
  main: Id,
  dids: Id[],
  now: number,
  data: SchedulerV4,
) {
  data = await regather(db, dids, now, data)
}
