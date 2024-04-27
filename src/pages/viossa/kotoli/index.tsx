import { For } from "solid-js"
import { makeWordList } from "../data"
import { distance } from "fastest-levenshtein"

export function Main() {
  const list = makeWordList()

  return (
    <div>
      <div class="mb-2 rounded bg-z-bg-body-selected px-3 py-2 text-center">
        jam {list.size} kotobara na vikoli afto.
        <br />
        afto kakutropos fu sakawi.
      </div>

      <div class="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
        <For
          each={Array.from(list.values()).sort((a, b) => {
            const ar = a.word.replace(/[^a-z]/g, "")
            const br = b.word.replace(/[^a-z]/g, "")

            if (ar < br) {
              return -1
            } else if (ar > br) {
              return 1
            } else if (a < b) {
              return -1
            } else if (a > b) {
              return 1
            } else {
              return 0
            }
          })}
        >
          {({ word, referencedIn, taughtIn }) => (
            <div
              class="aspect-square rounded px-3 py-2"
              classList={{
                border: referencedIn.length == 0 && taughtIn.length == 0,
                "bg-z-body-selected": !(
                  referencedIn.length == 0 && taughtIn.length == 0
                ),
              }}
            >
              <strong>{word}</strong>
              <p>
                {Array.from(list.values())
                  .filter(({ word: other }) => {
                    const self = word.replace(/[^\p{L}]/gu, "")
                    other = other.replace(/[^\p{L}]/gu, "")

                    const dist = distance(self, other)
                    return dist != 0 && dist < 2
                  })
                  .map(({ word }) => word)
                  .join(" ")}
              </p>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
