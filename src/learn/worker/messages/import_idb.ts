import { open } from "@/learn/db"
import { exportData } from "@/learn/db/save"
import { import_json_parsed } from "./import_json_parsed"

export async function import_idb() {
  const data = await exportData(
    await open("learn:Main", Date.now()),
    Date.now(),
  )

  import_json_parsed(data)
}
