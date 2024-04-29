import { Fa } from "@/components/Fa"
import {
  faArrowLeft,
  faArrowRight,
  faClose,
  faMap,
} from "@fortawesome/free-solid-svg-icons"
import { search } from "fast-fuzzy"
import {
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask,
  RenderingCancelledException,
  getDocument,
} from "pdfjs-dist"
import "pdfjs-dist/build/pdf.worker.mjs"
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
import {
  RISOLI,
  Slide,
  Word,
  makeSlideList,
  makeWordList,
  sortWords,
} from "./data"

type Mode = "kotoba" | "riso" | undefined

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
const wordMap = makeWordList()
const slideMap = makeSlideList()

let pdf: Promise<PDFDocumentProxy> | undefined

function Pdf(
  props: JSX.CanvasHTMLAttributes<HTMLCanvasElement> & { page: number },
) {
  return (
    <canvas
      {...props}
      ref={async (canvas) => {
        let pageIndex = untrack(() => props.page)
        let page: PDFPageProxy | undefined
        let currentTask: RenderTask | undefined
        let needsRedraw = true
        const [intersecting, setIntersecting] = createSignal(false)

        async function render() {
          try {
            if (currentTask) {
              currentTask.cancel()
            }

            const nowIndex = props.page

            if (!page || nowIndex != pageIndex) {
              if (!pdf) {
                pdf = getDocument(RISOLI).promise
              }

              page = await (await pdf).getPage(nowIndex)
              pageIndex = nowIndex
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

            const transform =
              scale !== 1 ? [scale, 0, 0, scale, 0, 0] : undefined

            currentTask = page.render({
              canvasContext: context,
              transform: transform,
              viewport: viewport,
            })

            await currentTask.promise

            needsRedraw = false
          } catch (error) {
            if (!(error instanceof RenderingCancelledException)) {
              throw error
            }
          }
        }

        function invalidate() {
          props.page

          if (untrack(intersecting)) {
            needsRedraw = false
            render()
          } else {
            needsRedraw = true
          }
        }

        createEffect(() => invalidate())

        let resizeTimeout: any = -1
        window.addEventListener("resize", () => {
          clearTimeout(resizeTimeout)

          resizeTimeout = setTimeout(() => {
            untrack(() => invalidate())
          }, 250)
        })

        new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) {
            setIntersecting(true)

            if (needsRedraw) {
              render()
            }
          } else {
            setIntersecting(false)
          }
        }).observe(canvas)
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
        class="aspect-video w-full border border-z transition"
        classList={{ rounded: props.small, "rounded-xl": !props.small }}
        page={props.page}
      />

      <div
        class="absolute bottom-0 right-0 flex h-8 w-12 select-none items-center justify-center border border-z bg-z-body text-z transition"
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
  setMode: (mode: Mode | ((mode: Mode) => Mode)) => void
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
        class="rounded-bl-[calc(0.75rem_-_1px)] bg-z-body px-3 py-2 text-z transition focus-visible:outline-none"
        onClick={() =>
          props.setMode((mode) => (mode == "kotoba" ? undefined : "kotoba"))
        }
        classList={{
          "bg-z-field-selected": props.mode() == "kotoba",
        }}
      >
        kotoba mono
      </button>

      <button
        class="rounded-br-[calc(0.75rem_-_1px)] bg-z-body px-3 py-2 text-z transition focus-visible:outline-none"
        onClick={() =>
          props.setMode((mode) => (mode == "riso" ? undefined : "riso"))
        }
        classList={{
          "bg-z-field-selected": props.mode() == "riso",
        }}
      >
        riso mono
      </button>
    </div>
  )
}

function Header() {
  const known = Array.from(wordMap.values()).filter((x) => x.eins)

  return (
    <div class="w-full">
      <div class="mb-2 flex w-full flex-col rounded bg-z-body-selected px-3 py-2">
        <p class="text-center text-xl font-extralight">
          kotoba libre maxena na sakawi
        </p>

        <p class="text-center text-sm">
          risoli vona na{" "}
          <a
            class="text-z-link underline decoration-transparent underline-offset-2 transition hover:decoration-current"
            href="https://bit.ly/davilera"
          >
            bit.ly/davilera
          </a>
        </p>
      </div>

      <div class="grid w-full gap-2 sm:grid-cols-2">
        <div class="flex flex-1 flex-col rounded bg-z-bg-body-selected px-3 py-2 text-center text-z transition">
          <p>jam {known.length} kotobara na kotoli afto.</p>

          <p>jam {known.filter((x) => x.emoji).length} kotoba k'har risonen.</p>

          <p>
            kotoli nai sirubraa{" "}
            {known.length - known.filter((x) => x.fal).length} kotoba.
          </p>
        </div>

        <div class="flex flex-1 flex-col rounded bg-z-bg-body-selected px-3 py-2 text-center text-z transition">
          <p>jam {slideMap.size} riso na risoli afto.</p>

          <p>
            risoli opeta {known.filter((x) => x.opetaNa.length).length} kotoba.
          </p>

          <p>
            risoli hanu tsui{" "}
            {known.filter((x) => x.opetaNa.length || x.hanuNa.length).length}{" "}
            kotoba.
          </p>
        </div>
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

        <div class="line-clamp-4">
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
      <div class="relative z-20 flex min-h-72 flex-col gap-4 rounded-xl border border-z bg-z-body-partial px-6 py-4 backdrop-blur-lg transition">
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-30 blur-[2px]">
          {segmenter.segment(props.maximized().emoji).containing(0)?.segment}
        </div>

        <div class="relative flex flex-wrap text-2xl font-semibold">
          <p class="mr-auto text-z transition">{props.maximized().kotoba}</p>
          <p class="text-z transition">{props.maximized().emoji || ""}</p>
        </div>

        <p class="relative text-lg text-z transition">
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
            <em class="relative -mx-6 -mb-4 mt-auto border-t border-z px-3 py-2 text-z opacity-30 transition">
              afto kotoba nai har tatoeba
            </em>
          }
        >
          <div class="relative -mx-6 -mb-4 mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-b-xl border-t border-z bg-z-border transition">
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

      <Show when={props.maximized().lyk?.length}>
        <div class="mt-2 rounded-tl-2xl border-l border-z pb-1 pl-2 pt-1 text-sm italic text-z transition">
          lyk kotoba:
        </div>

        <div
          class="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2 border-l border-z pb-2 pl-2 text-z transition"
          classList={{
            "rounded-br-2xl": !props.maximized().kundr?.length,
          }}
        >
          <For each={props.maximized().lyk}>
            {(word) => (
              <Kotoba
                word={wordMap.get(word)!}
                setMaximized={props.setMaximizedWord}
                sidebar
              />
            )}
          </For>
        </div>
      </Show>

      <Show when={props.maximized().kundr?.length}>
        <div
          class="border-l border-z pb-1 pl-2 pt-1 text-sm italic text-z transition"
          classList={{
            "mt-2": !props.maximized().lyk?.length,
            "rounded-tl-2xl": !props.maximized().lyk?.length,
          }}
        >
          kundr kotoba:
        </div>

        <div class="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2 rounded-bl-2xl border-l border-z pb-2 pl-2 text-z transition">
          <For each={props.maximized().kundr}>
            {(word) => (
              <Kotoba
                word={wordMap.get(word)!}
                setMaximized={props.setMaximizedWord}
                sidebar
              />
            )}
          </For>
        </div>
      </Show>

      <For
        each={props.maximized().opetaNa.concat(props.maximized().hanuNa)}
        fallback={
          <div class="mt-2 rounded-xl border border-z px-3 py-2 italic text-z opacity-30 transition">
            kotoba afto nai har riso.
          </div>
        }
      >
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
  setDialogSlide: (slide: Slide) => void
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
      <div
        class="cursor-zoom-in"
        onClick={() => props.setDialogSlide(props.maximized())}
      >
        <Page page={props.maximized().index} />
      </div>

      <div class="mt-2 grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
        <For
          each={props
            .maximized()
            .opetako.toSorted()
            .concat(props.maximized().hanuko.toSorted())}
        >
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

function RisoliDialog(props: {
  dialogSlide: () => Slide | undefined
  setDialogSlide: (slide: Slide | undefined) => void
  setMaximizedWord: (word: Word) => void
}) {
  const [dictionary, setDictionary] = createSignal(false)

  return (
    <dialog
      class="flex h-full w-full cursor-zoom-out items-center justify-center overflow-visible bg-transparent p-6 backdrop-blur-lg backdrop:bg-z-body backdrop:opacity-70 focus:outline-none [&:modal]:max-h-full [&:modal]:max-w-full"
      classList={{ hidden: !props.dialogSlide() }}
      ref={(el) => {
        createEffect(() => {
          if (props.dialogSlide()) {
            el.showModal()
          } else {
            el.close()
          }
        })
      }}
      onClose={() => {
        props.setDialogSlide(undefined)
      }}
      onClick={() => {
        props.setDialogSlide(undefined)
      }}
    >
      <div class="flex h-full w-full flex-col justify-center gap-6">
        <div
          class="flex aspect-video w-full justify-center"
          classList={{
            "max-h-full": !dictionary(),
            "max-h-[calc(100%_-_8.5rem)]": dictionary(),
          }}
        >
          <div class="relative aspect-video h-full">
            <Page class="aspect-video" page={props.dialogSlide()?.index || 1} />

            <button
              class="absolute -right-2 -top-2 flex h-12 w-12 items-center justify-center rounded-xl border border-z bg-z-body ring-z-focus transition focus-visible:border-z-focus focus-visible:bg-z-body-selected focus-visible:outline-none focus-visible:ring"
              autofocus
            >
              <Fa class="h-8 w-8" icon={faClose} title="da kini riso" />
            </button>

            <button
              class="absolute -left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl border border-z bg-z-body ring-z-focus transition focus-visible:border-z-focus focus-visible:bg-z-body-selected focus-visible:outline-none focus-visible:ring"
              onClick={(event) => {
                const index = props.dialogSlide()?.index
                if (index == null) {
                  return
                }

                event.preventDefault()
                event.stopImmediatePropagation()
                props.setDialogSlide(
                  slideMap.get(index - 1) || props.dialogSlide(),
                )
              }}
            >
              <Fa class="h-8 w-8" icon={faArrowLeft} title="da se risodan" />
            </button>

            <button
              class="absolute -right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl border border-z bg-z-body ring-z-focus transition focus-visible:border-z-focus focus-visible:bg-z-body-selected focus-visible:outline-none focus-visible:ring"
              onClick={(event) => {
                const index = props.dialogSlide()?.index
                if (index == null) {
                  return
                }

                event.preventDefault()
                event.stopImmediatePropagation()
                props.setDialogSlide(
                  slideMap.get(index + 1) || props.dialogSlide(),
                )
              }}
            >
              <Fa class="h-8 w-8" icon={faArrowRight} title="da se risomirai" />
            </button>

            <button
              class="absolute -bottom-2 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-xl border border-z bg-z-body ring-z-focus transition focus-visible:border-z-focus focus-visible:bg-z-body-selected focus-visible:outline-none focus-visible:ring"
              onClick={(event) => {
                event.preventDefault()
                event.stopImmediatePropagation()
                setDictionary((x) => !x)
              }}
            >
              <Fa
                class="h-8 w-8"
                icon={faMap}
                title="da kinauki kotoli na unna"
              />
            </button>
          </div>
        </div>

        <Show when={dictionary()}>
          <div class="-mx-6 -my-7 flex h-48 min-h-48 w-[calc(100%_+_3rem)] gap-2 overflow-x-auto overflow-y-hidden px-6 py-7 scrollbar:hidden">
            <For
              each={(props.dialogSlide()?.opetako || []).concat(
                props.dialogSlide()?.hanuko || [],
              )}
            >
              {(word) => (
                <div class="flex h-28 w-28">
                  <Kotoba
                    sidebar
                    word={wordMap.get(word)!}
                    setMaximized={(word) => {
                      props.setDialogSlide(undefined)
                      props.setMaximizedWord(word)
                    }}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </dialog>
  )
}

export function Vjosali() {
  const [query, setQuery] = createSignal("")
  const [word, __setWord] = createSignal<Word>(wordMap.get("al")!)
  const [slide, __setSlide] = createSignal<Slide>(slideMap.get(12)!)
  const [isSlide, setIsSlide] = createSignal(false)
  const [mode, setMode] = createSignal<Mode>()
  const [dialogSlide, setDialogSlide] = createSignal<Slide>()

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
            setDialogSlide={setDialogSlide}
          />
        </Show>
      </div>

      <RisoliDialog
        dialogSlide={dialogSlide}
        setDialogSlide={(slide) => {
          if (slide) {
            setMaximizedSlide(slide)
          }
          setDialogSlide(slide)
        }}
        setMaximizedWord={setMaximizedWord}
      />
    </div>
  )
}

function Siruting(props: { children: JSX.Element }) {
  return (
    <div class="aspect-square rounded bg-z-body-selected px-3 py-2 transition">
      {props.children}
    </div>
  )
}

function Sirutingara(props: { namae: string; children: JSX.Element[] }) {
  return (
    <div class="rounded-xl border border-z px-6 pb-6 pt-4 text-z transition">
      <h2 class="mb-4 text-lg font-light">
        {props.children.length} {props.namae}
      </h2>

      {props.children.length ? (
        <div class="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2">
          {props.children}
        </div>
      ) : (
        <p class="rounded bg-z-body-selected px-3 py-2 italic">nai jam. bra!</p>
      )}
    </div>
  )
}

export function Siru() {
  return (
    <div class="flex flex-col gap-4">
      <Sirutingara namae="kundrko k'nai inje siruli">
        {Array.from(wordMap.values())
          .filter((x) => x.eins)
          .flatMap((x) => x.kundr || [])
          .filter((x) => !wordMap.has(x))
          .sort(sortWords)
          .map((x) => (
            <Siruting>{x}</Siruting>
          ))}
      </Sirutingara>

      <Sirutingara namae="lykko k'nai inje siruli">
        {Array.from(wordMap.values())
          .filter((x) => x.eins)
          .flatMap((x) => x.lyk || [])
          .filter((x) => !wordMap.has(x))
          .sort(sortWords)
          .map((x) => (
            <Siruting>{x}</Siruting>
          ))}
      </Sirutingara>

      <Sirutingara namae="kotoba oba vil har lykko unna">
        {Array.from(wordMap.values())
          .filter((x) => x.eins)
          .flatMap(
            (x) =>
              x.lyk
                ?.filter((lyk) => !wordMap.get(lyk)?.lyk?.includes(x.kotoba))
                .map((lyk) => [x.kotoba, lyk] as const) || [],
          )
          .map(([a, b]) => (
            <Siruting>
              <p>{b}</p>
              <p>{a}</p>
            </Siruting>
          ))}
      </Sirutingara>

      <Sirutingara namae="kotoba oba vil har kundrko unna">
        {Array.from(wordMap.values())
          .filter((x) => x.eins)
          .flatMap(
            (x) =>
              x.kundr
                ?.filter(
                  (kundr) => !wordMap.get(kundr)?.kundr?.includes(x.kotoba),
                )
                .map((kundr) => [x.kotoba, kundr] as const) || [],
          )
          .map(([a, b]) => (
            <Siruting>
              <p>{b}</p>
              <p>{a}</p>
            </Siruting>
          ))}
      </Sirutingara>

      <Sirutingara namae="kotoba k'nai har fal">
        {Array.from(wordMap.values())
          .filter((x) => x.eins && !x.fal)
          .map((x) => (
            <Siruting>{x.kotoba}</Siruting>
          ))}
      </Sirutingara>

      <Sirutingara namae="kotoba k'nai har falnen">
        {Array.from(wordMap.values())
          .filter((x) => x.eins && !x.falnen)
          .map((x) => (
            <Siruting>{x.kotoba}</Siruting>
          ))}
      </Sirutingara>

      <Sirutingara namae="kotoba k'nai opetayena mit riso">
        {Array.from(wordMap.values())
          .filter((x) => x.eins && !x.opetaNa.length)
          .map((x) => (
            <Siruting>{x.kotoba}</Siruting>
          ))}
      </Sirutingara>
    </div>
  )
}
