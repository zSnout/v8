export type Reason =
  | "Check database validity"
  | "Toggle whether deck is collapsed"
  | "Toggle deck name visibility"
  | "Forget card"
  | "Suspend card"
  | "Bury card"
  | "Toggle debug features"
  | "Toggle whether due counts are shown during reviews"
  | "Toggle whether due dates are shown above review buttons"
  | "Import collection"
  | "Toggle sidebar"
  | "Toggle flag visibility in sidebar"
  | "Toggle whether note is marked"
  | `Review card as ${string}`
  | `Toggle ${string} flag`
  | `Toggle ${string} mark`
  | `Update ${"fields" | "templates"} for model ${string}`
  | `Create note in ${string}`
  | `Create deck ${string}`
  | `Create model(s) ${string}`
  | `Delete model(s) ${string}`
  | `Create model(s) ${string} and delete ${string}`