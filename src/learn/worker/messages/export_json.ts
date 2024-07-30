import { export_json_raw } from "./export_json_raw"
import { export_name } from "./export_name"

export function export_json() {
  return new File([JSON.stringify(export_json_raw())], export_name(".col.json"))
}
