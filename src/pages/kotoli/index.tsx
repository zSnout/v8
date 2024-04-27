import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { For, JSX, Show, createEffect, createSignal, untrack } from "solid-js"
import { Word, makeWordList } from "../viossa/data"

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
  const [dualLayout, setDualLayout] = createSignal(true)

  function Header() {
    return (
      <div class="grid w-full gap-2 sm:grid-cols-2">
        <div class="flex-1 rounded bg-z-bg-body-selected px-3 py-2 text-center text-z transition">
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
          kotoli afto mahena na sakawi.
        </div>
        <div class="flex-1 rounded bg-z-bg-body-selected px-3 py-2 text-center text-z transition">
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
    )
  }

  function WordList(props: { padded?: boolean | undefined }) {
    return (
      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2"
        classList={{ "pb-[calc(31.78125rem_+_4px)]": props.padded }}
      >
        <For each={Array.from(list.values())}>
          {(word) => {
            const opetayena = word.opetaNa.length > 0 || word.hanuNa.length > 0

            return (
              <div
                class="group relative aspect-square rounded border-z px-3 py-2 text-z transition"
                classList={{
                  border: !opetayena,
                  "bg-z-body-selected": opetayena,
                }}
                onClick={() => setMaximized(word)}
              >
                {word.emoji && (
                  <p class="absolute -top-px left-0 flex h-full w-full select-none items-center justify-center p-1 text-7xl text-z opacity-30 blur-[2px] transition">
                    {segmenter.segment(word.emoji).containing(0).segment}
                  </p>
                )}

                <p class="relative text-z transition">{word.kotoba}</p>
                <p class="relative text-z transition">{word.emoji || ""}</p>

                <div
                  class="absolute left-1/2 top-1/2 z-20 hidden h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 cursor-zoom-in select-none flex-col rounded-lg border border-z px-3 py-2 transition group-hover:flex"
                  classList={{
                    "bg-z-body": !opetayena,
                    "bg-z-body-selected": opetayena,
                  }}
                >
                  <div class="flex flex-wrap text-lg font-semibold">
                    <p class="mr-auto text-z transition">{word.kotoba}</p>
                    <p class="text-z transition">{word.emoji || ""}</p>
                  </div>

                  <p class="text-z transition">
                    {word.imi ? "imi: " + word.imi : "(nai har imi)"}
                  </p>

                  <ul>
                    <For each={word.tatoeba}>
                      {(tatoeba) => (
                        <li class="text-z transition">{tatoeba}</li>
                      )}
                    </For>
                  </ul>
                </div>
              </div>
            )
          }}
        </For>
      </div>
    )
  }

  function Page(props: { page: number }) {
    return (
      <div class="relative">
        <Pdf
          class="aspect-video w-full rounded-xl border border-z"
          page={props.page}
        />

        <div class="absolute bottom-0 right-0 flex h-8 w-12 items-center justify-center rounded-br-xl rounded-tl-xl border border-z bg-z-body text-z transition">
          {props.page}
        </div>
      </div>
    )
  }

  function Maximized(props: { sidebar?: boolean | undefined }) {
    return (
      <>
        <div class="z-20 flex h-72 min-h-72 flex-col gap-4 rounded-xl border border-z bg-z-body-partial px-6 py-4 backdrop-blur-lg transition">
          <div class="flex flex-wrap text-2xl font-semibold">
            <p class="mr-auto text-z transition">{maximized().kotoba}</p>
            <p class="text-z transition">{maximized().emoji || ""}</p>
          </div>

          <p class="text-lg text-z transition">
            {maximized().imi ? (
              <>
                <em>imi:</em> {maximized().imi}
              </>
            ) : (
              <em>(nai har imi)</em>
            )}
          </p>

          <Show
            when={maximized().tatoeba?.length}
            fallback={
              <em class="-mx-6 -mb-4 mt-auto border-t border-z px-3 py-2 text-z opacity-30 transition">
                afto kotoba nai har tatoeba
              </em>
            }
          >
            {/* <ul class="relative flex flex-col gap-2">
              <For each={maximized().tatoeba}>
                {(tatoeba) => (
                  <li class="whitespace-pre-line border-l border-z pl-2 text-z transition">
                    {tatoeba}
                  </li>
                )}
              </For>
            </ul> */}

            <div class="-mx-6 -mb-4 mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-b-xl border-t border-z bg-z-border transition">
              <For
                each={
                  maximized().tatoeba!?.length % 2
                    ? maximized().tatoeba?.concat("")
                    : maximized().tatoeba
                }
              >
                {(tatoeba) => (
                  <p class="whitespace-pre-line bg-z-body px-3 py-2 text-z transition">
                    {tatoeba}
                  </p>
                )}
              </For>
            </div>
          </Show>
        </div>

        <Show
          when={props.sidebar}
          fallback={
            <Page page={maximized().opetaNa[0] || maximized().hanuNa[0] || 1} />
          }
        >
          <For each={maximized().opetaNa}>{(page) => <Page page={page} />}</For>
          <For each={maximized().hanuNa}>{(page) => <Page page={page} />}</For>
        </Show>
      </>
    )
  }

  function LargeLayout() {
    return (
      <div class="flex flex-col gap-2">
        <Header />

        <div class="relative left-[calc(-50vw_+_min(50vw_-_1.5rem,32rem))] w-[100vw] px-6">
          <WordList padded />
        </div>

        <div class="fixed bottom-4 right-4 flex w-96 flex-col gap-2">
          <Maximized />
        </div>
      </div>
    )
  }

  function TwoColumnLayout() {
    return (
      <div class="relative left-[calc(-50vw_+_min(50vw_-_1.5rem,32rem))] grid w-[100vw] grid-cols-[1fr,24rem] gap-6 px-6">
        <div class="flex flex-1 flex-col gap-2">
          <Header />
          <WordList />
        </div>

        <div class="fixed right-6 top-12 flex h-[calc(100%_-_3rem)] w-96 flex-col gap-2 overflow-auto pb-8 pt-8 scrollbar:hidden">
          <Maximized sidebar />
        </div>
      </div>
    )
  }

  return <TwoColumnLayout />
}
