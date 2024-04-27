import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { For, JSX, Show, createEffect, createSignal, untrack } from "solid-js"
import { Word, makeWordList } from "../data"

GlobalWorkerOptions.workerSrc = worker

function Pdf(
  props: JSX.CanvasHTMLAttributes<HTMLCanvasElement> & { page: number },
) {
  return (
    <canvas
      {...props}
      ref={async (canvas) => {
        const pdf = await getDocument("/viossa.pdf").promise

        let pageIndex = untrack(() => props.page)
        let page = await pdf.getPage(pageIndex)

        async function render() {
          if (props.page != pageIndex) {
            page = await pdf.getPage(props.page)
            pageIndex = props.page
          }

          const scale = window.devicePixelRatio || 1
          const viewport = page.getViewport({
            scale: canvas.clientWidth / page.getViewport({ scale: 1 }).width,
          })

          const context = canvas.getContext("2d")!

          canvas.width = Math.floor(viewport.width * scale)
          canvas.height = Math.floor(viewport.height * scale)

          const transform = scale !== 1 ? [scale, 0, 0, scale, 0, 0] : undefined

          page.render({
            canvasContext: context,
            transform: transform,
            viewport: viewport,
          })
        }

        createEffect(render)
        window.addEventListener("resize", render)
      }}
    />
  )
}

export function Main() {
  const list = makeWordList()

  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })

  const [maximized, setMaximized] = createSignal<Word>(list.get("gen")!)

  const [page, setPage] = createSignal(1)

  return (
    <div class="flex flex-col gap-2">
      <div class="grid w-full gap-2 sm:grid-cols-2">
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
            {(word) => (
              <div
                class="group relative aspect-square rounded px-3 py-2"
                classList={{
                  border: word.opetaNa.length == 0 && word.hanuNa.length == 0,
                  "bg-z-body-selected": !(
                    word.opetaNa.length == 0 && word.hanuNa.length == 0
                  ),
                }}
                onClick={() => setMaximized(word)}
              >
                {word.emoji && (
                  <p class="absolute left-0 top-0 flex h-full w-full select-none items-center justify-center p-1 text-8xl opacity-30 blur-[2px]">
                    {segmenter.segment(word.emoji).containing(0).segment}
                  </p>
                )}

                <p class="relative">{word.kotoba}</p>
                <p class="relative">{word.emoji || ""}</p>

                <div class="absolute left-1/2 top-1/2 z-20 hidden h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 cursor-zoom-in select-none flex-col rounded-lg border border-z bg-z-body px-3 py-2 group-hover:flex">
                  <div class="flex flex-wrap text-lg font-semibold">
                    <p class="mr-auto">{word.kotoba}</p>
                    <p>{word.emoji || ""}</p>
                  </div>

                  <p>{word.imi ? "imi: " + word.imi : "(nai har imi)"}</p>

                  <ul>
                    <For each={word.tatoeba}>
                      {(tatoeba) => <li>{tatoeba}</li>}
                    </For>
                  </ul>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="fixed bottom-4 right-4 flex w-96 flex-col gap-2">
        <div class="flex h-72 flex-col gap-4 rounded-xl border border-z bg-z-body-partial px-6 py-4 backdrop-blur-lg">
          <div class="flex flex-wrap text-2xl font-semibold">
            <p class="mr-auto">{maximized().kotoba}</p>
            <p>{maximized().emoji || ""}</p>
          </div>

          <p class="text-lg">
            {maximized().imi ? (
              <>
                <em>imi:</em> {maximized().imi}
              </>
            ) : (
              <em>(nai har imi)</em>
            )}
          </p>

          <Show when={maximized().tatoeba?.length != 0}>
            <ul class="relative flex flex-col gap-2">
              <For each={maximized().tatoeba}>
                {(tatoeba) => (
                  <li class="whitespace-pre-line border-l border-z pl-2">
                    {tatoeba}
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>

        <div class="relative">
          <Pdf
            class="w-full rounded-xl border border-z"
            page={maximized().opetaNa[0] || maximized().hanuNa[0] || 1}
          />

          <div class="absolute bottom-0 right-0 flex h-8 w-12 items-center justify-center rounded-br-xl rounded-tl-xl border border-z bg-z-body">
            {maximized().opetaNa[0] || maximized().hanuNa[0] || 1}
          </div>
        </div>
      </div>
    </div>
  )
}
