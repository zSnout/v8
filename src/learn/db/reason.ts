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
  | `Review card as ${string}`
  | `Toggle ${string} flag`
  | `Toggle ${string} mark`
  | `Update ${"fields" | "templates"} for model ${string}`
  | `Create note in ${string}`
