import { search } from "fast-fuzzy"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import {
  For,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
  untrack,
} from "solid-js"
import { Word, makeWordList } from "../viossa/data"

GlobalWorkerOptions.workerSrc = worker

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })

const list = makeWordList()

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

function Kotoba(props: { word: Word; setMaximized: (word: Word) => void }) {
  const opetayena =
    props.word.opetaNa.length > 0 || props.word.hanuNa.length > 0

  return (
    <div
      class="group relative aspect-square rounded border-z px-3 py-2 text-z transition"
      classList={{
        border: !opetayena,
        "bg-z-body-selected": opetayena,
      }}
      onClick={() => props.setMaximized(props.word)}
    >
      {props.word.emoji && (
        <p class="absolute -top-px left-0 flex h-full w-full select-none items-center justify-center p-1 text-7xl text-z opacity-30 blur-[2px] transition">
          {segmenter.segment(props.word.emoji).containing(0).segment}
        </p>
      )}

      <p class="relative text-z transition">{props.word.kotoba}</p>
      <p class="relative text-z transition">{props.word.emoji || ""}</p>

      <div
        class="absolute left-1/2 top-1/2 z-20 hidden h-[150%] w-[150%] -translate-x-1/2 -translate-y-1/2 cursor-zoom-in select-none flex-col rounded-lg border border-z px-3 py-2 transition group-hover:flex"
        classList={{
          "bg-z-body": !opetayena,
          "bg-z-body-selected": opetayena,
        }}
      >
        <div class="flex flex-wrap text-lg font-semibold">
          <p class="mr-auto text-z transition">{props.word.kotoba}</p>
          <p class="text-z transition">{props.word.emoji || ""}</p>
        </div>

        <p class="text-z transition">
          {props.word.imi ? "imi: " + props.word.imi : "(nai har imi)"}
        </p>

        <ul>
          <For each={props.word.tatoeba}>
            {(tatoeba) => <li class="text-z transition">{tatoeba}</li>}
          </For>
        </ul>
      </div>
    </div>
  )
}

function Kotobara(props: {
  setMaximized: (word: Word) => void
  query: () => string
}) {
  const words = Array.from(list.values())

  const filtered = createMemo(() => {
    const q = props.query()

    if (!q) {
      return words
    }

    return search(q, words, {
      keySelector(word) {
        return word.kotoba
      },
      ignoreSymbols: false,
      ignoreCase: true,
      normalizeWhitespace: true,
    })
  })

  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
      <For each={filtered()}>
        {(word) => <Kotoba word={word} setMaximized={props.setMaximized} />}
      </For>
    </div>
  )
}

function KotoliHeader() {
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

function KotoliSidebar(props: {
  query: () => string
  setQuery: (query: string) => void
  maximized: () => Word
}) {
  return (
    <>
      <input
        id="sukhatro"
        class="z-field mb-4 rounded-xl shadow-none placeholder:italic"
        type="text"
        value={props.query()}
        onInput={(event) => props.setQuery(event.currentTarget.value)}
        placeholder="da sukha (du deki kaku / per afto)..."
      />

      <div class="z-20 flex h-72 min-h-72 flex-col gap-4 rounded-xl border border-z bg-z-body-partial px-6 py-4 backdrop-blur-lg transition">
        <div class="flex flex-wrap text-2xl font-semibold">
          <p class="mr-auto text-z transition">{props.maximized().kotoba}</p>
          <p class="text-z transition">{props.maximized().emoji || ""}</p>
        </div>

        <p class="text-lg text-z transition">
          {props.maximized().imi ? (
            <>
              <em>imi:</em> {props.maximized().imi}
            </>
          ) : (
            <em>(nai har imi)</em>
          )}
        </p>

        <Show
          when={props.maximized().tatoeba?.length}
          fallback={
            <em class="-mx-6 -mb-4 mt-auto border-t border-z px-3 py-2 text-z opacity-30 transition">
              afto kotoba nai har tatoeba
            </em>
          }
        >
          <div class="-mx-6 -mb-4 mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-b-xl border-t border-z bg-z-border transition">
            <For
              each={
                props.maximized().tatoeba!?.length % 2
                  ? props.maximized().tatoeba?.concat("")
                  : props.maximized().tatoeba
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

      <For each={props.maximized().opetaNa}>
        {(page) => <Page page={page} />}
      </For>
      <For each={props.maximized().hanuNa}>
        {(page) => <Page page={page} />}
      </For>
    </>
  )
}

export function Kotoli() {
  const [query, setQuery] = createSignal("")
  const [maximized, setMaximized] = createSignal<Word>(list.get("sakawi")!)

  onMount(() => {
    document.addEventListener("keydown", (event): void => {
      if (
        event.key == "/" &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        document.getElementById("sukhatro")?.focus()
        event.preventDefault()
      }
    })
  })

  return (
    <div class="relative left-[calc(-50vw_+_min(50vw_-_1.5rem,32rem))] grid w-[100vw] grid-cols-[1fr,24rem] gap-6 px-6">
      <div class="flex flex-1 flex-col gap-2">
        <KotoliHeader />
        <Kotobara query={query} setMaximized={setMaximized} />
      </div>

      <div class="fixed right-5 top-12 flex h-[calc(100%_-_3rem)] w-[24.5rem] flex-col gap-2 overflow-auto px-1 pb-8 pt-8 scrollbar:hidden">
        <KotoliSidebar
          query={query}
          setQuery={setQuery}
          maximized={maximized}
        />
      </div>
    </div>
  )
}
