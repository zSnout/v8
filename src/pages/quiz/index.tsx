import { Fa } from "@/components/Fa"
import { CheckboxTree, Json } from "@/components/fields/CheckboxGroup"
import { createStorage } from "@/stores/local-storage-store"
import {
  faClose,
  faDownload,
  faExclamationTriangle,
  faNavicon,
  faTrash,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import {
  For,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js"
import { Card, PartialCard } from "./shared"
import { leaves, tree } from "./tree"

// TODO: move to homepage
// TODO: add seo items
// TODO: sitelensitelen sitelentelo sitelenpona tokipona

type State = "noscript" | "nodecks" | "noneleft" | "ok" | "guide"

interface QueuedCard {
  readonly short: string
  readonly path: readonly string[]
  readonly id: string
  readonly interval: number
  readonly availableAt: number
}

function NoScript() {
  return (
    <div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <Fa class="size-12" icon={faExclamationTriangle} title="error" />

      <p class="text-center">
        JavaScript is disabled.
        <br />
        Please enable it to continue.
      </p>
    </div>
  )
}

function NoCards() {
  return (
    <div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <Fa class="size-12" icon={faExclamationTriangle} title="error" />

      <p class="text-center">
        You have no decks selected.
        <br />
        Select some from the sidebar to continue.
      </p>
    </div>
  )
}

function NoneLeft() {
  return (
    <div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <Fa class="size-12" icon={faExclamationTriangle} title="error" />

      <p class="text-center">
        You have no cards left to pick.
        <br />
        Select more decks from the sidebar to continue.
        <br />
        Alternatively, wait until your reviews are ready.
        <br />
        Alternatively, clear your reviews.
      </p>
    </div>
  )
}

function areCardsSame(
  a: { readonly path: readonly string[]; readonly id: string },
  b: { readonly path: readonly string[]; readonly id: string },
) {
  return (
    a.path.length == b.path.length &&
    a.id == b.id &&
    a.path.every((x, i) => x == b.path[i])
  )
}

function random<T>(x: readonly T[]): T {
  if (x.length == 0) {
    throw new RangeError("Array must not be empty.")
  }

  return x[Math.floor(x.length * Math.random())]!
}

function restoreQueuedCard(q: QueuedCard): PartialCard | undefined {
  let obj = tree.tree
  let result
  for (let index = 0; index < q.path.length; index++) {
    const segment = q.path[index]!
    const next = obj[segment]
    if (next == null) {
      return
    }
    if (tree.isLeaf(next)) {
      if (index == q.path.length - 1) {
        result = next
        break
      }
      return
    }
    obj = next
  }

  if (!result) {
    return
  }

  return PartialCard.of(result, q.id)
}

function QueueEntry(props: { short: JSX.Element; availableAt: string }) {
  return (
    <>
      <p class="text-xs text-z-subtitle">{props.availableAt}</p>
      <p class="text-sm">{props.short}</p>
    </>
  )
}

function Shortcut(props: { key: string }) {
  return (
    <kbd
      class="absolute bottom-0 right-1 hidden text-sm md:block"
      title={`Shortcut: key ${props.key}`}
    >
      {props.key}
    </kbd>
  )
}

function Guide() {
  return (
    <div class="flex w-full flex-1 flex-col items-center justify-center gap-4">
      <h1 class="text-2xl font-semibold text-z-heading">How does this work?</h1>

      <p class="max-w-96">
        Select some decks from the sidebar. A random card will be drawn, and you
        should try to think of the answer in your head. Once you have a
        response, click "Reveal Answer" to show the correct answer.
      </p>

      <p class="max-w-96">
        If you didn't know it, click "Again". If you knew the answer but it took
        a lot of mental effort, click "Hard". Otherwise, click "Good".
      </p>

      <p class="max-w-96">
        When you mark a card "Again" or "Hard", it will be queued to be reviewed
        after a certain delay. This helps form longer-lasting connections in
        your mind.
      </p>

      <p class="max-w-96">
        This application saves your data even across reloads, so you can safely
        learn some cards, close this tab, and finish reviews later.
      </p>

      <p class="max-w-96">
        It is highly recommended that you periodically download your data by
        using the{" "}
        <span class="z-field -my-4 inline-flex overflow-clip p-1 align-middle">
          <span class="flex h-5 w-5 items-center justify-center">
            <Fa class="h-4 w-4" title="download" icon={faDownload} />
          </span>
        </span>{" "}
        button in the sidebar. This ensures your review queue and selected deck
        data aren't lost by accident.
      </p>

      <p class="max-w-96">
        Press "Next Card" or the spacebar on your keyboard to start.
      </p>
    </div>
  )
}

// receives a value in seconds
function timestampDist(dist: number) {
  dist = Math.floor(dist / 5) * 5

  if (dist < 5) {
    return "now"
  }

  if (dist < 60) {
    return dist + "s"
  }

  dist = Math.floor(dist / 60)

  if (dist < 60) {
    return dist + "m"
  }

  dist = Math.floor(dist / 24)

  if (dist < 24) {
    return dist + "hr"
  }

  dist = Math.floor(dist / 30)

  if (dist < 30) {
    return dist + "d"
  }

  dist = Math.floor(dist * 10) / 10

  if (dist < 12) {
    return dist + "mo"
  }

  dist = Math.floor(Math.floor(dist / 12) * 10) / 10

  return dist + "yr"
}

function queueFromJson(value: Json) {
  if (!(value instanceof Array)) {
    throw new Error("Review queue data is invalid.")
  }
  if (
    !value.every(
      (x): x is typeof x & QueuedCard =>
        typeof x == "object" &&
        x != null &&
        "short" in x &&
        typeof x.short == "string" &&
        "path" in x &&
        x.path instanceof Array &&
        x.path.every((x): x is string => typeof x == "string") &&
        "id" in x &&
        typeof x.id == "string" &&
        "interval" in x &&
        typeof x.interval == "number" &&
        "availableAt" in x &&
        typeof x.availableAt == "number",
    )
  ) {
    throw new Error("Review queue data is invalid.")
  }
  return value
}

function queueFromString(str: string) {
  try {
    const value = JSON.parse(str) as Json
    if (!(value instanceof Array)) {
      return []
    }
    if (
      !value.every(
        (x): x is typeof x & QueuedCard =>
          typeof x == "object" &&
          x != null &&
          "short" in x &&
          typeof x.short == "string" &&
          "path" in x &&
          x.path instanceof Array &&
          x.path.every((x): x is string => typeof x == "string") &&
          "id" in x &&
          typeof x.id == "string" &&
          "interval" in x &&
          typeof x.interval == "number" &&
          "availableAt" in x &&
          typeof x.availableAt == "number",
      )
    ) {
      return []
    }
    return value
  } catch {
    return []
  }
}

function intervals(_lastInterval: number | undefined) {
  // if (lastInterval == undefined) {
  return {
    again: 1,
    hard: 10,
    good: undefined,
  }
  // }

  // if (lastInterval <= 10) {
  //   return {
  //     again: 1,
  //     hard: 10,
  //     good: undefined,
  //   }
  // }

  // if (lastInterval <= 15) {
  //   return {
  //     again: 1,
  //     hard: 6,
  //     good: 10,
  //   }
  // }

  // if (lastInterval <= 60) {
  //   return {
  //     again: 10,
  //     hard: 15,
  //     good: undefined,
  //   }
  // }
}

function intervalLabel(
  lastInterval: number | undefined,
  type: "again" | "hard" | "good",
) {
  const i = intervals(lastInterval)[type]
  if (i == null) {
    return "(end)"
  }
  return timestampDist(i * 60)
}

export function Main() {
  const [storageTree, setStorageTree] = createStorage("quiz::tree", "{}")

  const [sidebarOpen, setSidebarOpen] = createSignal(true)

  const [reviewsWithoutNew, setReviewsWithoutNew] = createStorage(
    "quiz::reviews_without_new",
    "0",
  )

  const [queue, setQueue] = (() => {
    const [raw, setRaw] = createStorage("quiz::queue", "[]", "directmount")

    return [
      createMemo((): readonly QueuedCard[] => queueFromString(raw())),
      (queue: readonly QueuedCard[]) => setRaw(JSON.stringify(queue)),
    ]
  })()

  createEffect(() => {
    try {
      const val = JSON.parse(storageTree())
      tree.importJSON(val)
    } catch {}
  })

  createEffect(() => setStorageTree(JSON.stringify(tree.toJSON())))

  const [card, setCard] = createSignal<Card>({
    front: "",
    back: "",
    path: [],
    id: "",
    answerShown: false,
    source: [],
    short: "",
    lastInterval: 0,
  })

  const [state, setState] = createSignal<State>("noscript")

  function exportState(): string {
    return JSON.stringify({
      version: 1,
      tree: tree.toJSON(),
      reviewsWithoutNew: reviewsWithoutNew(),
      queue: queue(),
    })
  }

  function importState(x: string) {
    try {
      const y: Json = JSON.parse(x)

      if (
        typeof y != "object" ||
        y == null ||
        !("version" in y) ||
        y.version != 1 ||
        !("tree" in y) ||
        !("reviewsWithoutNew" in y) ||
        typeof y.reviewsWithoutNew != "string" ||
        !("queue" in y)
      ) {
        throw new TypeError("Malformed data file.")
      }

      setReviewsWithoutNew(y.reviewsWithoutNew)
      let queueFailed = false
      let treeFailed = false
      try {
        setQueue(queueFromJson(y.queue))
      } catch {
        queueFailed = true
      }
      try {
        tree.importJSON(y.tree)
      } catch {
        treeFailed = false
      }

      if (queueFailed && treeFailed) {
        alert(
          "Review queue and checkbox tree data were both malformed. Their data in the application has not changed.",
        )
      } else if (queueFailed) {
        alert(
          "Review queue data was malformed. Its application data was not changed.",
        )
      } else if (treeFailed) {
        alert(
          "Checkbox tree data was malformed. Its application data was not changed.",
        )
      }
    } catch {
      alert("Data file cannot be read. No application data was changed.")
    }
  }

  function unsafeDoNotUseNextRandomCard() {
    const next = tree.choose((leaf) => leaf.weight)

    if (next == null) {
      setState("nodecks")
      return
    }

    const { node, path } = next
    setCard(PartialCard.of(node, undefined).toCard(path, undefined))
    setState("ok")
  }

  function randomFromQueue(q: readonly QueuedCard[]): QueuedCard | undefined {
    const n = now()

    for (const t of [
      0,
      1000 * 60,
      1000 * 60 * 5,
      1000 * 60 * 10,
      1000 * 60 * 20,
    ]) {
      const c = q.filter((x) => x.availableAt < n - t)
      if (c.length) {
        return random(c)
      }
    }

    return
  }

  function unsafeDoNotUseNextCard() {
    const queued = queue()
    const current = card()

    unsafeDoNotUseNextRandomCard()

    if (state() == "nodecks") {
      return
    }

    for (let i = 0; i < 50; i++) {
      const next = card()

      if (
        !queued.some((q) => areCardsSame(q, next)) &&
        !areCardsSame(current, next)
      ) {
        setState("ok")
        return
      }

      unsafeDoNotUseNextRandomCard()
    }

    const q = randomFromQueue(queued)
    if (q) {
      const c = restoreQueuedCard(q)
      if (c) {
        setCard(c.toCard(q.path, q.interval))
        setState("ok")
        return
      }
    }

    setState("noneleft")
    return
  }

  function nextCard() {
    if (+reviewsWithoutNew() >= 8) {
      setReviewsWithoutNew("0")
      unsafeDoNotUseNextCard()
      return
    } else {
      const n = now()
      const needReview = queue().filter((x) => x.availableAt < n)
      if (needReview.length) {
        const qc = random(needReview)
        const qd = restoreQueuedCard(qc)
        if (qd) {
          const card = qd.toCard(qc.path, qc.interval)
          setCard(card)
          setState("ok")
          return
        }
      }
    }

    unsafeDoNotUseNextCard()
    return
  }

  function answer(response: "again" | "hard" | "good") {
    const c = card()
    const interval = intervals(c.lastInterval)[response]
    if (interval == null) {
      const c = card()
      setQueue(
        queue()
          .filter((x) => !areCardsSame(x, c))
          .sort(({ availableAt: a }, { availableAt: b }) => a - b),
      )
      nextCard()
      return
    }
    const q = queue()
    const matchingCardIndex = q.findIndex((a) => areCardsSame(a, c))
    const availableAt = Date.now() + 1000 * 60 * interval
    if (matchingCardIndex != -1) {
      // this was a review, count it as such
      setReviewsWithoutNew((x) => {
        const y = +x
        if (Number.isSafeInteger(y)) {
          return y + 1 + ""
        } else {
          return "1"
        }
      })

      setQueue(
        q
          .map((x, i) =>
            i == matchingCardIndex
              ? {
                  ...x,

                  // we probably just took this one from the queue, so put it
                  // back, but later
                  availableAt: Math.max(x.availableAt, availableAt),
                }
              : x,
          )
          .sort(({ availableAt: a }, { availableAt: b }) => a - b),
      )
    } else {
      setQueue(
        q
          .concat({
            availableAt,
            id: c.id,
            interval,
            path: c.path,
            short: c.short,
          })
          .sort(({ availableAt: a }, { availableAt: b }) => a - b),
      )
    }

    nextCard()
  }

  onMount(() => {
    try {
      const val = JSON.parse(storageTree())
      tree.importJSON(val)
    } catch {}

    setState("guide")

    document.body.addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      if (event.key == "0" || event.key == " ") {
        if (state() == "ok") {
          if (!card().answerShown) {
            setCard((c) => ({ ...c, answerShown: true }))
          }
        } else {
          nextCard()
        }
      } else if (event.key == "1" || event.key == "2" || event.key == "3") {
        if (state() == "ok" && card().answerShown) {
          answer(([, "again", "hard", "good"] as const)[event.key])
        }
      }
    })
  })

  const [now, setNow] = createSignal(Date.now())

  setInterval(() => {
    setNow(Date.now())
  }, 5000)

  function timestamp(ms: number) {
    const dist = Math.floor((ms - now()) / 1000)
    return timestampDist(dist)
  }

  function Sidebar() {
    return (
      <div
        class="fixed left-0 top-0 h-full w-full translate-x-0 overflow-clip transition-[transform,width,backdrop-filter,background-color] sm:pointer-events-auto sm:sticky sm:top-20 sm:-mb-16 sm:flex sm:h-[calc(100%_+_4rem)] sm:max-h-[calc(100dvh_-_3rem)] sm:w-[19.5rem] sm:-translate-y-8 sm:translate-x-6 sm:bg-transparent sm:backdrop-filter-none"
        classList={{
          "backdrop-blur-sm": sidebarOpen(),
          "backdrop-blur-0": !sidebarOpen(),
          "bg-z-body-partial": sidebarOpen(),
          "pointer-events-none": !sidebarOpen(),
          "sm:!w-0": !sidebarOpen(),
          // "sm:!max-w-[19.5rem]": sidebarOpen(),
          "sm:!translate-x-[21rem]": !sidebarOpen(),
        }}
        onClick={(event) => {
          if (event.currentTarget == event.target && event.offsetY > 48) {
            setSidebarOpen(false)
          }
        }}
        aria-hidden={!sidebarOpen()}
        inert={!sidebarOpen()}
      >
        <div
          class="fixed bottom-8 right-0 top-8 flex w-[19.5rem] flex-col overflow-y-auto border-l border-z px-4 py-10 sm:translate-x-0"
          classList={{
            "translate-x-0": sidebarOpen(),
            "translate-x-full": !sidebarOpen(),
          }}
        />

        <div
          class="fixed bottom-0 right-0 top-12 flex w-full flex-col items-start overflow-y-auto border-l border-transparent bg-z-body px-4 pt-8 transition xs:w-[19.5rem] xs:border-z sm:top-0 sm:w-[19.5rem] sm:translate-x-0 sm:border-transparent sm:bg-transparent sm:transition-none"
          classList={{
            "translate-x-0": sidebarOpen(),
            "translate-x-full": !sidebarOpen(),
          }}
        >
          <p class="mb-1">~{leaves} cards available.</p>

          <ul class="flex w-full flex-1 flex-col gap-1">
            <CheckboxTree tree={tree} />
          </ul>

          <div class="sticky bottom-0 max-h-[min(24rem,50%)] w-full">
            <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

            <div class="h-2 w-full bg-z-body" />

            <div class="relative border-t border-z bg-z-body pt-[0.546875rem] sm:pb-0">
              <div class="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 flex-row items-center whitespace-nowrap bg-z-body px-2 text-sm/[1]">
                Review Queue
                <button
                  class="ml-2 inline-flex h-4 w-4 items-center justify-center rounded bg-red-500"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to delete all saved reviews?",
                      )
                    ) {
                      setQueue([])
                    }
                  }}
                >
                  <Fa
                    class="h-3 w-3 icon-white"
                    icon={faTrash}
                    title="delete reviews"
                  />
                </button>
              </div>

              <div class="grid grid-cols-[auto,1fr] items-baseline gap-x-4 pb-8">
                <For
                  fallback={
                    <div class="col-span-2 text-sm">No reviews queued.</div>
                  }
                  each={queue()}
                >
                  {(card) => (
                    <QueueEntry
                      short={card.short}
                      availableAt={timestamp(card.availableAt)}
                    />
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div class="relative z-10 flex flex-1 items-start">
        <div class="flex h-full w-full flex-1 flex-col items-start gap-4">
          <Show
            fallback={
              <Show
                fallback={
                  <Show
                    fallback={
                      <Show fallback={<NoCards />} when={state() == "guide"}>
                        <Guide />
                      </Show>
                    }
                    when={state() == "noneleft"}
                  >
                    <NoneLeft />
                  </Show>
                }
                when={state() == "noscript"}
              >
                <NoScript />
              </Show>
            }
            when={state() == "ok"}
          >
            <div class="flex w-full max-w-full flex-1 flex-col gap-4">
              <div class="font-mono text-sm/[1] lowercase text-z-subtitle">
                <For each={card().source}>
                  {(item, index) => (
                    <Show fallback={item} when={index() != 0}>
                      {" "}
                      / {item}
                    </Show>
                  )}
                </For>
              </div>

              <div class="max-w-full hyphens-auto text-center text-6xl font-semibold text-z-heading sm:text-7xl md:text-8xl lg:text-9xl">
                {card().front}
              </div>

              <Show when={card().answerShown}>
                <hr class="border-z" />

                <div class="max-w-full hyphens-auto text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                  {card().back}
                </div>
              </Show>
            </div>
          </Show>

          <div class="sticky bottom-0 -mb-8 flex w-full flex-col pb-8">
            <div class="h-4 w-full bg-gradient-to-b from-transparent to-z-bg-body" />

            <div class="-mb-8 w-full bg-z-body pb-8 text-center">
              <Show
                fallback={
                  <Show
                    fallback={
                      <a
                        class="flex h-12 w-full items-center justify-center rounded bg-z-body-selected py-2"
                        href=""
                      >
                        Reload Page
                      </a>
                    }
                    when={
                      state() == "nodecks" ||
                      state() == "noneleft" ||
                      state() == "guide"
                    }
                  >
                    <button
                      class="relative h-12 w-full rounded bg-z-body-selected py-2"
                      onClick={() => nextCard()}
                    >
                      Next Card
                      <Shortcut key="Space" />
                    </button>
                  </Show>
                }
                when={state() == "ok"}
              >
                <Show
                  fallback={
                    <button
                      class="relative h-12 w-full rounded bg-z-body-selected py-2"
                      onClick={() =>
                        setCard((c) => ({ ...c, answerShown: true }))
                      }
                    >
                      Reveal Answer
                      <Shortcut key="Space" />
                    </button>
                  }
                  when={card().answerShown}
                >
                  <div class="grid grid-cols-3 gap-1 text-base/[1.25] md:gap-2">
                    <button
                      class="relative rounded bg-red-300 py-1 text-red-900"
                      onClick={() => answer("again")}
                    >
                      Again
                      <br />
                      {intervalLabel(card().lastInterval, "again")}
                      <Shortcut key="1" />
                    </button>

                    <button
                      class="relative rounded bg-[#ffcc91] py-1 text-yellow-900"
                      onClick={() => answer("hard")}
                    >
                      Hard
                      <br />
                      {intervalLabel(card().lastInterval, "hard")}
                      <Shortcut key="2" />
                    </button>

                    <button
                      class="relative rounded bg-green-300 py-1 text-green-900"
                      onClick={() => answer("good")}
                    >
                      Good
                      <br />
                      {intervalLabel(card().lastInterval, "good")}
                      <Shortcut key="3" />
                    </button>
                  </div>
                </Show>
              </Show>
            </div>
          </div>
        </div>

        <div class="fixed right-4 top-16 z-10 flex flex-col gap-2">
          <button
            class="z-field overflow-clip p-1 active:translate-y-0 md:translate-x-[min(0px,-50vw_+_512px+1rem)]"
            onClick={() => setSidebarOpen((x) => !x)}
          >
            <div class="relative h-6 w-6">
              <div
                class="absolute left-0 top-0 transition"
                classList={{
                  "translate-x-[125%]": !sidebarOpen(),
                  "translate-x-0": sidebarOpen(),
                }}
              >
                <Fa class="h-6 w-6" icon={faClose} title="close sidebar" />
              </div>

              <div
                class="absolute left-0 top-0 transition"
                classList={{
                  "translate-x-0": !sidebarOpen(),
                  "-translate-x-[125%]": sidebarOpen(),
                }}
              >
                <Fa class="h-6 w-6" icon={faNavicon} title="open sidebar" />
              </div>
            </div>
          </button>

          <div
            class="flex flex-col gap-2 transition"
            classList={{ "translate-x-14": !sidebarOpen() }}
            aria-hidden={!sidebarOpen()}
            inert={!sidebarOpen()}
          >
            <button
              class="z-field overflow-clip p-1 active:translate-y-0 md:translate-x-[min(0px,-50vw_+_512px+1rem)]"
              onClick={() => {
                const file = new File(
                  [exportState()],
                  "zsnout-quiz-" + new Date().toISOString() + ".json",
                  { type: "application/json" },
                )

                const url = URL.createObjectURL(file)

                const a = document.createElement("a")
                a.href = url
                a.download = file.name
                a.click()
              }}
            >
              <div class="flex h-6 w-6 items-center justify-center">
                <Fa
                  class="h-5 w-5"
                  icon={faDownload}
                  title="download application data"
                />
              </div>
            </button>

            <input
              class="sr-only"
              type="file"
              accept="application/json"
              onInput={async (event) => {
                const f = event.currentTarget.files?.[0]
                if (!f) {
                  return
                }
                event.currentTarget.value = ""
                const text = await f.text()
                importState(text)
              }}
            />

            <button
              class="z-field overflow-clip p-1 active:translate-y-0 md:translate-x-[min(0px,-50vw_+_512px+1rem)]"
              onClick={(event) => {
                const i = event.currentTarget.previousElementSibling
                if (!(i instanceof HTMLInputElement)) {
                  return
                }
                i.value = ""
                i.click()
              }}
            >
              <div class="flex h-6 w-6 items-center justify-center">
                <Fa
                  class="h-5 w-5"
                  icon={faUpload}
                  title="upload application data"
                />
              </div>
            </button>
          </div>
        </div>

        <Sidebar />
      </div>
    </>
  )
}
