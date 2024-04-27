import { For } from "solid-js"
import { makeWordList } from "../data"

export function Main() {
  const list = makeWordList()

  return (
    <div>
      <div class="mb-2 rounded bg-z-bg-body-selected px-3 py-2 text-center">
        jam {list.size} kotobara na vikoli afto.
        <br />
        jam{" "}
        {
          Array.from(list.keys()).filter(
            (x) => localStorage["word+" + x] != ".",
          ).length
        }{" "}
        kotoba k'har risonen.
        <br />
        afto kakutropos fu sakawi.
      </div>

      <div class="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
        <For each={Array.from(list.values())}>
          {({ word, referencedIn, taughtIn, emoji }) => (
            <div
              class="relative aspect-square rounded px-3 py-2"
              classList={{
                border: referencedIn.length == 0 && taughtIn.length == 0,
                "bg-z-body-selected": !(
                  referencedIn.length == 0 && taughtIn.length == 0
                ),
              }}
            >
              <p>{word}</p>
              <p>{emoji || ""}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
