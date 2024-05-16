import nearley from "nearley"
import grammar from "./latex"

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
const start = parser.save()

export function parse(text: string) {
  parser.restore(start)
  parser.feed(text)
  return parser.finish()
}
