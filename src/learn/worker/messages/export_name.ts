export type ExportableItem = "col" | "cards" | "notes" | "deck"
export type ExportableFile = "json" | "txt" | "csv" | "sqlite"

export function export_name(ending: `.${ExportableItem}.${ExportableFile}`) {
  return "zsnout-learn-" + new Date().toISOString() + ".zl" + ending
}
