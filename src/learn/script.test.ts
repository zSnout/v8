// Examples of using the scripting API

import type { Tx } from "./script"

declare const tx: Tx

tx.decks
  .by("name")
  .withKey(IDBKeyRange.bound("Default::", "Default:;", true, true))
  .cursor()
  .filter((deck) => deck.collapsed)
  .update((x) => {
    x.name = x.name + "::wow"
    return x
  })

tx.decks.cursor().each(console.log)