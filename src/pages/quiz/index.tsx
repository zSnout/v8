import type { Json } from "@/components/basic-tree"
import { CheckboxTree } from "@/components/fields/CheckboxGroup"
import { ShortcutManager } from "@/learn/lib/shortcuts"
import { createStorage } from "@/stores/local-storage-store"
import { faDownload, faTrash } from "@fortawesome/free-solid-svg-icons"
import {
  For,
  JSX,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from "solid-js"
import {
  ActionExport,
  ActionImport,
  ShortcutLabel,
  ContentAction,
  ContentCard,
  ContentGuide,
  ContentNoCards,
  ContentNoScript,
  ContentNoneLeft,
  Full,
  Response,
  ResponseGray,
  ResponsesGrid,
  ResponsesSingleLink,
  SidebarSticky,
  SidebarStickyLabel,
  SidebarStickyLabelAction,
} from "./layout"
import { Card, PartialCard, timestampDist } from "./shared"
import { leaves, tree } from "./tree"

// TODO: move to homepage
// TODO: add seo items
// TODO: sitelentelo sitelenpona tokipona

type State = "noscript" | "nodecks" | "noneleft" | "ok" | "guide"

interface QueuedCard {
  readonly short: string
  readonly path: readonly string[]
  readonly id: string
  readonly interval: number
  readonly availableAt: number
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

function Guide() {
  return (
    <ContentGuide title="How does this work?">
      <p>
        Select some decks from the sidebar. A random card will be drawn, and you
        should try to think of the answer in your head. Once you have a
        response, click "Reveal Answer" to show the correct answer.
      </p>

      <p>
        If you didn't know it, click "Again". If you knew the answer but it took
        a lot of mental effort, click "Hard". Otherwise, click "Good".
      </p>

      <p>
        When you mark a card "Again" or "Hard", it will be queued to be reviewed
        after a certain delay. This helps form longer-lasting connections in
        your mind.
      </p>

      <p>
        This application saves your data even across reloads, so you can safely
        learn some cards, close this tab, and finish reviews later.
      </p>

      <p>
        It is highly recommended that you periodically download your data by
        using the <ContentAction icon={faDownload} title="download" /> button in
        the sidebar. This ensures your review queue and selected deck data
        aren't lost by accident.
      </p>

      <p>Press "Next Card" or the spacebar on your keyboard to start.</p>
    </ContentGuide>
  )
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
  const shortcuts = new ShortcutManager()

  const [storageTree, setStorageTree] = createStorage("quiz::tree", "{}")

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
      1000 * 60 * 30,
    ]) {
      const c = q.filter((x) => x.availableAt < n + t)
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
            i == matchingCardIndex ?
              {
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
      <>
        <p class="mb-1">~{leaves} cards available.</p>

        <ul class="flex w-full flex-1 flex-col gap-1">
          <CheckboxTree tree={tree} />
        </ul>

        <SidebarSticky>
          <SidebarStickyLabel>
            Review Queue
            <SidebarStickyLabelAction
              icon={faTrash}
              title="delete reviews"
              onClick={() => {
                if (
                  confirm("Are you sure you want to delete all saved reviews?")
                ) {
                  setQueue([])
                }
              }}
            />
          </SidebarStickyLabel>

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
        </SidebarSticky>
      </>
    )
  }

  return (
    <Full
      content={
        <Show
          fallback={
            <Show
              fallback={
                <Show
                  fallback={
                    <Show
                      fallback={<ContentNoCards />}
                      when={state() == "guide"}
                    >
                      <Guide />
                    </Show>
                  }
                  when={state() == "noneleft"}
                >
                  <ContentNoneLeft />
                </Show>
              }
              when={state() == "noscript"}
            >
              <ContentNoScript />
            </Show>
          }
          when={state() == "ok"}
        >
          <ContentCard
            source={card().source}
            front={card().front}
            back={card().answerShown && card().back}
          />
        </Show>
      }
      responses={
        <Show
          fallback={
            <Show
              fallback={
                <ResponsesSingleLink href="">Reload Page</ResponsesSingleLink>
              }
              when={
                state() == "nodecks" ||
                state() == "noneleft" ||
                state() == "guide"
              }
            >
              <ResponseGray onClick={nextCard}>
                Next Card
                <ShortcutLabel shortcuts={shortcuts} key={{ key: " " }} />
              </ResponseGray>
            </Show>
          }
          when={state() == "ok"}
        >
          <Show
            fallback={
              <ResponseGray
                onClick={() => setCard((c) => ({ ...c, answerShown: true }))}
              >
                Reveal Answer
                <ShortcutLabel shortcuts={shortcuts} key={{ key: " " }} />
              </ResponseGray>
            }
            when={card().answerShown}
          >
            <ResponsesGrid class="grid-cols-3">
              <Response
                class="bg-red-300 text-red-900"
                onClick={() => answer("again")}
              >
                Again
                <br />
                {intervalLabel(card().lastInterval, "again")}
                <ShortcutLabel shortcuts={shortcuts} key={{ key: "1" }} />
              </Response>

              <Response
                class="bg-[#ffcc91] text-yellow-900"
                onClick={() => answer("hard")}
              >
                Hard
                <br />
                {intervalLabel(card().lastInterval, "hard")}
                <ShortcutLabel shortcuts={shortcuts} key={{ key: "2" }} />
              </Response>

              <Response
                class="bg-green-300 text-green-900"
                onClick={() => answer("good")}
              >
                Good
                <br />
                {intervalLabel(card().lastInterval, "good")}
                <ShortcutLabel shortcuts={shortcuts} key={{ key: "3" }} />
              </Response>
            </ResponsesGrid>
          </Show>
        </Show>
      }
      actions={
        <>
          <ActionExport
            file={() =>
              new File(
                [exportState()],
                "zsnout-quiz-" + new Date().toISOString() + ".json",
                { type: "application/json" },
              )
            }
          />

          <ActionImport
            receive={async (file) => {
              const text = await file.text()
              importState(text)
            }}
          />
        </>
      }
      sidebar={<Sidebar />}
    />
  )
}
