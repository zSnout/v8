import { Fa } from "@/components/Fa"
import { isTypable } from "@/components/draggable"
import {
  createStorage,
  createStorageBoolean,
} from "@/stores/local-storage-store"
import {
  IconDefinition,
  faCheck,
  faCloud,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { RealtimeChannel, createClient } from "@supabase/supabase-js"
import { For, JSX, Show, createSignal, onCleanup, onMount } from "solid-js"
import type { Database } from "./supabase"

const supabaseUrl = import.meta.env["PUBLIC_SUPABASE_TOKIPONASIMILARITY_URL"]
const supabaseKey = import.meta.env[
  "PUBLIC_SUPABASE_TOKIPONASIMILARITY_ANON_KEY"
]
const supabase = createClient<Database>(supabaseUrl, supabaseKey)

const ALL_WORDS =
  "a akesi ala alasa ale anpa ante anu awen esun ijo ike ilo insa jaki jan jelo jo kala kalama kama kasi ken kepeken kijetesantakalu kili kin kipisi kiwen ko kon kule kulupu kute lape laso lawa leko len lete lili linja lipu loje lon luka lukin lupa ma mama mani meli mi mije misikeke moku moli monsi monsuta mu mun musi mute namako nanpa nasa nasin nena ni nimi noka olin ona open pakala pali palisa pan pana pilin pimeja pini pipi poka poki pona sama seli selo seme sewi sijelo sike sin sina sinpin sitelen soko sona soweli suli suno supa suwi tan taso tawa telo tenpo toki tomo tonsi tu unpa uta utala walo wan waso wawa weka wile".split(
    " ",
  )

function Label(props: { children: JSX.Element }) {
  return (
    <span class="border border-z bg-z-body-selected">{props.children}</span>
  )
}

function IconLabel(props: { icon: IconDefinition; title: string }) {
  return (
    <span class="relative top-px -my-5 inline-flex h-[2.125rem] max-h-[2.125rem] min-h-[2.125rem] w-8 min-w-8 max-w-8 items-center justify-center border border-z bg-z-body-selected">
      <Fa class="inline h-5 w-5" icon={props.icon} title={props.title} />
    </span>
  )
}

function SmallLabel(props: { children: JSX.Element }) {
  return (
    <span class="-my-0.5 mx-1 rounded bg-z-body-selected p-0.5 first:ml-0 last:mr-0">
      {props.children}
    </span>
  )
}

function pickWords() {
  const a = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)]!
  const b = ALL_WORDS.filter((x) => x != a)[
    Math.floor(Math.random() * (ALL_WORDS.length - 1))
  ]!

  return [a, b] as const
}

interface LogEntry {
  status: "sending" | "done" | "error" | "cloud"
  word1: string
  word2: string
  similarity: 4 | 1 | 2 | 3
  local_id: number
  creator: number
}

export function Main() {
  const [words, setWords] = createSignal(pickWords())
  const [log, setLog] = createSignal<LogEntry[]>([])
  const [user, setUser] = createStorage("toki-pona:similarity:user", "xx")
  const [hideGuide, setHideGuide] = createStorageBoolean(
    "toki-pona:similarity:show-guide",
    false,
  )

  function getCreator() {
    let creator = +user()
    if (!Number.isSafeInteger(creator)) {
      creator = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      setUser("" + creator)
    }

    return creator
  }

  async function answer(similarity: 1 | 2 | 3 | 4) {
    const creator = getCreator()

    const local_id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    const [word1, word2] = words()

    setLog((log) => {
      const next = log.slice()
      next.unshift({
        status: "sending",
        word1,
        word2,
        similarity,
        local_id,
        creator,
      })
      return next
    })

    setWords(pickWords())

    try {
      const result = await supabase.from("similarity").insert({
        creator,
        similarity,
        word1,
        word2,
        local_id,
      })

      if (result.error) {
        setLog((log) =>
          log.map((x) =>
            x.local_id == local_id ? { ...x, status: "error" } : x,
          ),
        )
      } else {
        setLog((log) =>
          log.map((x) =>
            x.local_id == local_id ? { ...x, status: "done" } : x,
          ),
        )
      }
    } catch (error) {}
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.metaKey || isTypable(event)) {
      return
    }

    const value =
      event.key == "4" ? 4
      : event.key == "1" ? 1
      : event.key == "2" ? 2
      : event.key == "3" ? 3
      : null

    if (value != null) {
      answer(value)
    }
  }

  let channel: RealtimeChannel
  onMount(async () => {
    document.getElementById("wile-js")?.remove()
    document.body.addEventListener("keydown", onKeyDown)
    channel = supabase
      .channel("hi", { config: { broadcast: { self: false } } })
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public" },
        (event) => {
          const data = event.new as unknown
          if (
            typeof data != "object" ||
            !data ||
            !("word1" in data) ||
            typeof data.word1 != "string" ||
            !("word2" in data) ||
            typeof data.word2 != "string" ||
            !("similarity" in data) ||
            typeof data.similarity != "number" ||
            !(
              data.similarity == 1 ||
              data.similarity == 2 ||
              data.similarity == 3 ||
              data.similarity == 4
            ) ||
            !("local_id" in data) ||
            typeof data.local_id != "number" ||
            !("creator" in data) ||
            typeof data.creator != "number"
          ) {
            return
          }
          const { word1, word2, similarity, local_id, creator } = data
          const me = getCreator()

          setLog((log) => {
            if (log.some((x) => x.local_id == local_id)) {
              return log
            }

            const next = log.slice()

            next.unshift({
              word1,
              word2,
              similarity,
              local_id,
              status: creator == me ? "done" : "cloud",
              creator,
            })

            return next
          })
        },
      )
      .subscribe()
    const data = await supabase.from("similarity").select()
    if (data.error) {
      return
    }
    setLog((log) => {
      const me = getCreator()
      const results: LogEntry[] = []

      for (const { word1, word2, similarity, local_id, creator } of data.data) {
        if (
          !(
            similarity == 1 ||
            similarity == 2 ||
            similarity == 3 ||
            similarity == 4
          )
        ) {
          continue
        }

        results.push({
          word1,
          word2,
          similarity,
          local_id,
          status: creator == me ? "done" : "cloud",
          creator,
        })
      }

      results.reverse()
      return log.concat(results)
    })
  })

  onCleanup(() => {
    document.body.removeEventListener("keydown", onKeyDown)
    channel.unsubscribe()
  })

  return (
    <div class="flex min-h-full w-full flex-col justify-center font-sp-sans text-2xl/[1]">
      <div class="flex w-full justify-center gap-4 text-8xl/[1]">
        <div class="flex flex-col rounded-lg bg-z-body-selected">
          <span>{words()[0]}</span>
          <span class="pb-1 text-center font-sans text-base/[1]">
            {words()[0]}
          </span>
        </div>

        <div class="flex flex-col rounded-lg bg-z-body-selected">
          <span>{words()[1]}</span>
          <span class="pb-1 text-center font-sans text-base/[1]">
            {words()[1]}
          </span>
        </div>
      </div>

      <div class="mt-16 text-center">nimi ni li sama seme</div>

      <div class="mx-auto mt-4 flex flex-col gap-2">
        <div class="flex justify-center gap-2 text-center text-5xl/[1]">
          <button
            class="relative rounded border border-red-500 bg-red-200 p-1 text-red-800 ring ring-red-100 transition focus-visible:outline-none dark:border-red-700 dark:bg-red-900 dark:text-red-200 dark:ring-red-950 [&:not(:hover):not(:focus-visible)]:border-transparent [&:not(:hover):not(:focus-visible)]:ring-transparent"
            onClick={() => answer(1)}
          >
            ala
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              1
            </span>
          </button>

          <button
            class="relative rounded border border-orange-500 bg-orange-200 p-1 text-orange-800 ring ring-orange-100 transition focus-visible:outline-none dark:border-orange-700 dark:bg-orange-900 dark:text-orange-200 dark:ring-orange-950 [&:not(:hover):not(:focus-visible)]:border-transparent [&:not(:hover):not(:focus-visible)]:ring-transparent"
            onClick={() => answer(2)}
          >
            lili
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              2
            </span>
          </button>

          <button
            class="relative rounded border border-blue-500 bg-blue-200 p-1 text-blue-800 ring ring-blue-100 transition focus-visible:outline-none dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200 dark:ring-blue-950 [&:not(:hover):not(:focus-visible)]:border-transparent [&:not(:hover):not(:focus-visible)]:ring-transparent"
            onClick={() => answer(3)}
          >
            mute
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              3
            </span>
          </button>
        </div>

        <button
          class="relative w-full rounded border border-slate-500 bg-z-body-selected p-1 px-2 py-1 text-center text-base/[1] text-z ring ring-slate-100 transition focus-visible:outline-none dark:border-slate-700 dark:ring-slate-950 [&:not(:hover):not(:focus-visible)]:border-transparent [&:not(:hover):not(:focus-visible)]:ring-transparent"
          onClick={() => answer(4)}
        >
          mi sona ala e nimi ni
          <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
            4
          </span>
        </button>

        <button
          class="relative mt-6 w-full rounded border border-slate-500 bg-z-body-selected p-1 px-2 py-1 text-center text-base/[1] text-z ring ring-slate-100 transition focus-visible:outline-none dark:border-slate-700 dark:ring-slate-950 [&:not(:hover):not(:focus-visible)]:border-transparent [&:not(:hover):not(:focus-visible)]:ring-transparent"
          onClick={() => setHideGuide((x) => !x)}
        >
          {hideGuide() ? "o open e lipu sona" : "o pini e lipu anpa"}
        </button>
      </div>

      <Show when={!hideGuide()}>
        <div class="mt-1 flex flex-col text-center [line-height:1.5]">
          <p>
            nimi ni li sama ala sama <Label>lukin en jelo</Label> anu{" "}
            <Label>waso en ike</Label> la o toki e <Label>ala</Label>
          </p>

          <p>
            nimi ni li sama lili sama <Label>ala en weka</Label> anu{" "}
            <Label>waso en ilo</Label> la o toki e <Label>lili</Label>
          </p>

          <p>
            nimi ni li sama mute sama <Label>mute en suli</Label> anu{" "}
            <Label>kepeken en ilo</Label> la o toki e <Label>mute</Label>
          </p>

          <p>
            sina sona ala e nimi la o toki e{" "}
            <Label>mi sona ala e nimi ni</Label>
          </p>

          <p>sina toki e sona la nimi sin li kama la o sike toki a</p>

          <p>
            nimi li tan kulupu <Label>suli nanpa tu</Label> lon ilo [linja..ku.]
          </p>

          <p>
            sina pana e sona la sona li tawa anpa li kule{" "}
            <IconLabel icon={faSpinner} title="spinner" />
          </p>

          <p>
            mi pana pona e sona tawa kulupu la kule li kama{" "}
            <IconLabel icon={faCheck} title="check" />
          </p>

          <p>
            ijo ante li pana la sona ona li tawa anpa li kule{" "}
            <IconLabel icon={faCloud} title="cloud" />
          </p>
        </div>
      </Show>

      <div class="mt-8 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-1 text-base/[1]">
        <div class="flex rounded border border-z px-2 py-1">
          <div class="mx-auto flex items-center">
            <span class="text-xs/[1]">sona</span>
            <span class="-my-0.5 mx-1 rounded bg-z-body-selected px-2 py-0.5 font-sans font-semibold">
              {log().length}
            </span>
            <span class="text-xs/[1]">li tan ale</span>
          </div>
        </div>

        <div class="flex rounded border border-z px-2 py-1">
          <div class="mx-auto flex items-center">
            <span class="text-xs/[1]">sona</span>
            <span class="-my-0.5 mx-1 rounded bg-z-body-selected px-2 py-0.5 font-sans font-semibold">
              {((log, creator) =>
                log.filter((x) => x.creator == creator).length)(
                log(),
                getCreator(),
              )}
            </span>
            <span class="text-xs/[1]">li tan sina</span>
          </div>
        </div>

        <For each={log()}>
          {(entry) => (
            <div
              class="flex rounded border border-transparent px-2 py-1 transition"
              classList={{
                "bg-z-body-selected": entry.status != "cloud",
                "border-z": entry.status == "cloud",
                "opacity-30": entry.status == "sending",
              }}
            >
              <Fa
                class={
                  "h-4 w-4" +
                  (entry.status == "sending" ?
                    " animate-[faspinner_1s_linear_infinite]"
                  : "")
                }
                icon={
                  {
                    sending: faSpinner,
                    done: faCheck,
                    error: faExclamationTriangle,
                    cloud: faCloud,
                  }[entry.status]
                }
                title={entry.status}
              />

              <div class="mx-auto flex items-center">
                <Show
                  fallback={
                    <>
                      <SmallLabel>{entry.word1}</SmallLabel>
                      <span class="text-xs/[1]">
                        sama{" "}
                        {entry.similarity == 3 ?
                          "mute"
                        : entry.similarity == 2 ?
                          "lili"
                        : "ala"}
                      </span>
                      <SmallLabel>{entry.word2}</SmallLabel>
                    </>
                  }
                  when={entry.similarity == 4}
                >
                  <span class="text-xs/[1]">mi sona ala e</span>
                  <SmallLabel>{entry.word1}</SmallLabel>
                  <span class="text-xs/[1]">e</span>
                  <SmallLabel>{entry.word2}</SmallLabel>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
