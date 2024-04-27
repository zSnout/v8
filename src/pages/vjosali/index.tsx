import { search } from "fast-fuzzy"
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist"
import worker from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import {
  For,
  JSX,
  Show,
  batch,
  createEffect,
  createMemo,
  createSignal,
  onMount,
  untrack,
} from "solid-js"
import { Slide, Word, makeSlideList, makeWordList } from "../viossa/data"

type Mode = "kotoba" | "riso" | undefined

GlobalWorkerOptions.workerSrc = worker

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
const wordMap = makeWordList()
const slideMap = makeSlideList()
const pdf = getDocument("/viossa.pdf").promise

function Pdf(
  props: JSX.CanvasHTMLAttributes<HTMLCanvasElement> & { page: number },
) {
  return (
    <canvas
      {...props}
      ref={async (canvas) => {
        let pageIndex = untrack(() => props.page)
        let page = await (await pdf).getPage(pageIndex)

        async function render() {
          if (props.page != pageIndex) {
            page = await (await pdf).getPage(props.page)
            pageIndex = props.page
          }

          if (canvas.clientWidth == 0) {
            return
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

        let resizeTimeout: any = -1
        window.addEventListener("resize", () => {
          clearTimeout(resizeTimeout)
          resizeTimeout = setTimeout(render, 1000)
        })
      }}
    />
  )
}

function Page(props: {
  class?: string | undefined
  page: number
  onClick?: (() => void) | undefined
  small?: boolean | undefined
}) {
  return (
    <div
      class={"relative" + (props.class ? " " + props.class : "")}
      onClick={props.onClick}
    >
      <Pdf
        class="aspect-video w-full border border-z"
        classList={{ rounded: props.small, "rounded-xl": !props.small }}
        page={props.page}
      />

      <div
        class="absolute bottom-0 right-0 flex h-8 w-12 items-center justify-center border border-z bg-z-body text-z transition"
        classList={{
          "rounded-tl": props.small,
          "rounded-tl-xl": !props.small,
          "rounded-br": props.small,
          "rounded-br-xl": !props.small,
        }}
      >
        {props.page}
      </div>
    </div>
  )
}

function Sukhatro(props: {
  query: () => string
  setQuery: (query: string) => void
  mode: () => Mode
  setMode: (mode: Mode) => void
}) {
  onMount(() => {
    window.addEventListener("keydown", (event): void => {
      if (
        event.key == "/" &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey
      ) {
        document.getElementById("sukhatro")?.focus()
        event.preventDefault()
      }
    })
  })

  return (
    <div class="mb-4 grid grid-cols-2 grid-rows-2 gap-px rounded-xl border border-z bg-z-border ring-z-focus transition focus-within:border-z-focus focus-within:ring">
      <input
        id="sukhatro"
        class="z-field col-span-2 block w-full rounded-b-none rounded-t-[calc(0.75rem_-_1px)] border-0 bg-z-body text-z shadow-none transition placeholder:italic focus-visible:outline-none focus-visible:ring-0"
        type="text"
        value={props.query()}
        onInput={(event) => props.setQuery(event.currentTarget.value)}
        placeholder="da sukha (du deki kaku / per afto)..."
        autocomplete="off"
      />

      <button
        class="rounded-bl-[calc(0.75rem_-_1px)] bg-z-body px-3 py-2 text-z transition focus-within:bg-z-body-selected focus-visible:outline-none"
        onClick={() => props.setMode("kotoba")}
        classList={{
          "bg-z-field-selected": props.mode() == "kotoba",
          "focus:bg-z-field-selected": props.mode() == "kotoba",
        }}
      >
        kotoba mono
      </button>

      <button
        class="rounded-br-[calc(0.75rem_-_1px)] bg-z-body px-3 py-2 text-z transition focus-within:bg-z-body-selected focus-visible:outline-none"
        onClick={() => props.setMode("riso")}
        classList={{
          "bg-z-field-selected": props.mode() == "riso",
          "focus:bg-z-field-selected": props.mode() == "riso",
        }}
      >
        riso mono
      </button>
    </div>
  )
}

function Header() {
  return (
    <div class="grid w-full gap-2 sm:grid-cols-2">
      <div class="flex-1 rounded bg-z-bg-body-selected px-3 py-2 text-center text-z transition">
        jam {wordMap.size} kotobara na kotoli afto.
        <br />
        jam{" "}
        {
          Array.from(wordMap.keys()).filter(
            (x) => localStorage["word+" + x] != ".",
          ).length
        }{" "}
        kotoba k'har risonen.
        <br />
        jam {slideMap.size} risoara na risoli afto.
      </div>
      <div class="flex-1 rounded bg-z-bg-body-selected px-3 py-2 text-center text-z transition">
        riso vona na{" "}
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

function Kotoba(props: {
  word: Word
  setMaximized: (word: Word) => void
  sidebar?: boolean | undefined
}) {
  const opetayena =
    props.word.opetaNa.length > 0 || props.word.hanuNa.length > 0

  return (
    <div
      class="group relative aspect-square border-z px-3 py-2 text-z transition"
      classList={{
        border: !opetayena,
        "bg-z-body-selected": opetayena,
        rounded: !props.sidebar,
        "rounded-xl": props.sidebar,
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
  const words = Array.from(wordMap.values())

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

function KotoliSidebar(props: {
  maximized: () => Word
  setMaximizedWord: (word: Word) => void
  setMaximizedSlide: (slide: Slide) => void
}) {
  return (
    <>
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
        {(page) => (
          <div
            class="mt-2 cursor-zoom-in"
            onClick={() => props.setMaximizedSlide(slideMap.get(page)!)}
          >
            <Page page={page} />
          </div>
        )}
      </For>

      <For each={props.maximized().hanuNa}>
        {(page) => (
          <div
            class="mt-2 cursor-zoom-in"
            onClick={() => props.setMaximizedSlide(slideMap.get(page)!)}
          >
            <Page page={page} />
          </div>
        )}
      </For>
    </>
  )
}

function Risoara(props: {
  query: () => string
  setMaximized: (slide: Slide) => void
}) {
  const slides = Array.from(slideMap.values())

  const filtered = createMemo(() => {
    const q = props.query()

    if (!q) {
      return slides
    }

    return search(q, slides, {
      keySelector(word) {
        return word.opetako.concat(word.hanuko)
      },
      ignoreSymbols: false,
      ignoreCase: true,
      normalizeWhitespace: true,
    })
  })

  return (
    <div class="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-2">
      <For each={slides}>
        {(slide) => (
          <div
            classList={{
              hidden: !filtered().includes(slide),
            }}
            style={{
              order: filtered().indexOf(slide),
            }}
          >
            <Page
              small
              class="cursor-zoom-in"
              page={slide.index}
              onClick={() => props.setMaximized(slide)}
            />
          </div>
        )}
      </For>
    </div>
  )
}

function RisoliSidebar(props: {
  maximized: () => Slide
  setMaximizedWord: (word: Word) => void
  setMaximizedSlide: (slide: Slide) => void
}) {
  const related = createMemo(() => {
    const { opetako } = props.maximized()

    const slideMap = new Map<number, number>()

    for (const word of opetako) {
      for (const index of wordMap.get(word)?.opetaNa || []) {
        slideMap.set(index, (slideMap.get(index) || 0) + 1)
      }
    }

    return Array.from(slideMap.entries())
      .filter(([x]) => x != props.maximized().index) // not this slide
      .sort(([a], [b]) => a - b) // earlier slides get priority
      .sort(([, a], [, b]) => b - a) // slides with more words get priority
      .map(([x]) => x)
  })

  return (
    <>
      <Page page={props.maximized().index} />

      <div class="mt-2 grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
        <For each={props.maximized().opetako.concat(props.maximized().hanuko)}>
          {(word) => (
            <Kotoba
              word={wordMap.get(word)!}
              setMaximized={props.setMaximizedWord}
              sidebar
            />
          )}
        </For>
      </div>

      <For each={related()}>
        {(slideIndex) => (
          <div
            class="mt-2 cursor-zoom-in"
            onClick={() => props.setMaximizedSlide(slideMap.get(slideIndex)!)}
          >
            <Page page={slideIndex} />
          </div>
        )}
      </For>
    </>
  )
}

export function Vjosali() {
  const [query, setQuery] = createSignal("")
  const [word, __setWord] = createSignal<Word>(wordMap.get("sakawi")!)
  const [slide, __setSlide] = createSignal<Slide>(slideMap.get(12)!)
  const [isSlide, setIsSlide] = createSignal(false)
  const [mode, setMode] = createSignal<Mode>()

  function setMaximizedWord(word: Word) {
    batch(() => {
      setIsSlide(false)
      __setWord(word)
      document
        .getElementById("sidebar")
        ?.scrollTo({ behavior: "smooth", top: 0 })
    })
  }

  function setMaximizedSlide(slide: Slide) {
    batch(() => {
      setIsSlide(true)
      __setSlide(slide)
      document
        .getElementById("sidebar")
        ?.scrollTo({ behavior: "smooth", top: 0 })
    })
  }

  return (
    <div class="relative left-[calc(-50vw_+_min(50vw_-_1.5rem,32rem))] grid w-[100vw] grid-cols-[1fr,24rem] gap-6 px-6">
      <div class="flex flex-1 flex-col gap-2">
        <Header />

        <div classList={{ hidden: mode() == "riso" }}>
          <Kotobara query={query} setMaximized={setMaximizedWord} />
        </div>

        <div classList={{ hidden: mode() == "kotoba" }}>
          <Risoara query={query} setMaximized={setMaximizedSlide} />
        </div>
      </div>

      <div
        class="fixed -right-8 top-12 h-[calc(100%_-_3rem)] w-[31rem] overflow-auto px-14 pb-8 pt-8 scrollbar:hidden"
        id="sidebar"
      >
        <Sukhatro
          query={query}
          setQuery={setQuery}
          mode={mode}
          setMode={setMode}
        />

        <Show
          when={isSlide()}
          fallback={
            <KotoliSidebar
              maximized={word}
              setMaximizedSlide={setMaximizedSlide}
              setMaximizedWord={setMaximizedWord}
            />
          }
        >
          <RisoliSidebar
            maximized={slide}
            setMaximizedSlide={setMaximizedSlide}
            setMaximizedWord={setMaximizedWord}
          />
        </Show>
      </div>
    </div>
  )
}
