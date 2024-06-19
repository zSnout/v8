import { CA } from "@zsnout/ithkuil/generate"
import { JSX, Show, createSignal } from "solid-js"

export type Json =
  | string
  | number
  | boolean
  | null
  | readonly Json[]
  | { readonly [x: string]: Json }

export interface Card {
  front: JSX.Element
  back: JSX.Element
  group: string
  id: Json
  answerShown: boolean
}

export function Main() {
  const [card, setCard] = createSignal<Card>({
    front: "7:00",
    back: "しちじ",
    group: "jp::time::oclock",
    id: 7,
    answerShown: true,
  })

  return (
    <div class="flex flex-1 items-start gap-6">
      <div class="flex h-full w-full flex-1 flex-col items-start gap-4">
        <div class="flex w-full flex-1 flex-col gap-4">
          <div class="text-center text-6xl font-semibold text-z-heading sm:text-7xl md:text-8xl lg:text-9xl">
            {card().front}
          </div>

          <Show when={card().answerShown}>
            <hr class="border-z" />

            <div class="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              {card().back}
            </div>
          </Show>
        </div>

        <div class="sticky bottom-0 -mb-8 flex w-full flex-col pb-8">
          <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

          <div class="-mb-8 w-full bg-z-body pb-8">
            <Show
              fallback={
                <button
                  class="rounded bg-z-body-selected py-2"
                  onClick={() => setCard((c) => ({ ...c, answerShown: true }))}
                >
                  Show Answer
                </button>
              }
              when={card().answerShown}
            >
              <div class="grid grid-cols-3 gap-1 text-base/[1.25] md:gap-2">
                <button class="rounded bg-red-300 py-2 text-red-900">
                  Again
                </button>
                <button class="rounded bg-[#ffcc91] py-2 text-yellow-900">
                  Hard
                </button>
                <button class="rounded bg-green-300 py-2 text-green-900">
                  Good
                </button>
              </div>
            </Show>
          </div>
        </div>
      </div>

      <div class="hidden w-48 sm:flex md:w-72">
        <div class="fixed bottom-8 right-0 top-20 flex w-[13.5rem] flex-col overflow-y-auto border-l border-z px-3 py-2 md:w-[19.5rem]"></div>
      </div>
    </div>
  )
}
