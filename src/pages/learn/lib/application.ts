import type { Tree } from "@/components/fields/CheckboxGroup"
import { fsrs } from "ts-fsrs"
import type { Collection, Decks } from "./types"

// TODO: filter blank cards like anki does
// TODO: add cloze support
// TODO: add image occlusion support
// TODO: report global errors as small popups at bottom of screen

// export function recordAfterHandler(recordLog: BaseRecordLog): RecordLog {
//   const output = {} as RecordLog

//   for (const grade of Grades) {
//     const { log, card: baseCard } = recordLog[grade]
//     const card = baseCard as ReviewedCard

//     output[grade] = {
//       card,
//       log: { ...log, cid: card.cid },
//     }
//   }

//   return output
// }

export class Application {
  private f = fsrs({
    // w: [
    //   0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05,
    //   0.34, 1.26, 0.29, 2.61,
    // ],
    enable_fuzz: true,
  })

  readonly decks: ApplicationDecks

  constructor(private c: Readonly<Collection>) {
    this.decks = new ApplicationDecks(c.decks)
  }

  // repeat(card: AnyCard, now: DateInput): RecordLog {
  //   return this.f.repeat(
  //     { ...card, due: card.due ?? now },
  //     now,
  //     recordAfterHandler,
  //   )
  // }
}

export class ApplicationDecks {
  constructor(private d: Decks) {}

  tree(): Tree<> {}
}
