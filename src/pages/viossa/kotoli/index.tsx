import { For } from "solid-js"
import { makeWordList } from "../data"

export function Main() {
  const list = makeWordList()

  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })

  return (
    <div>
      <div class="mb-2 grid w-full gap-2 sm:grid-cols-2">
        <div class="flex-1 rounded bg-z-bg-body-selected px-3 py-2 text-center">
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

        <div class="flex-1 rounded bg-z-bg-body-selected px-3 py-2 text-center">
          da lera na{" "}
          <a
            class="text-z-link underline decoration-transparent underline-offset-2 transition hover:decoration-current"
            href="https://bit.ly/davilera"
          >
            https://bit.ly/davilera
          </a>
          !
          <br />
          sakawi maxa afto na 2024t 4m.
          <br />
          jam riso mange au opeta kotoba mange.
        </div>
      </div>

      <div class="relative left-[calc(-50vw_+_min(50vw_-_1.5rem,32rem))] w-[100vw] px-6">
        <div class="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
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
                {emoji && (
                  <p class="absolute left-0 top-0 flex h-full w-full select-none items-center justify-center p-1 text-8xl opacity-30 blur-[2px]">
                    {segmenter.segment(emoji).containing(0).segment}
                  </p>
                )}

                <p class="relative">{word}</p>
                <p class="relative">{emoji || ""}</p>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
