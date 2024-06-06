import { Fa } from "@/components/Fa"
import { isTypable } from "@/components/draggable"
import { createStorage } from "@/stores/local-storage-store"
import {
  faCheck,
  faExclamationTriangle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons"
import { createClient } from "@supabase/supabase-js"
import { For, JSX, Show, createSignal, onCleanup, onMount } from "solid-js"
import type { Database } from "./supabase"

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_TOKIPONASIMILARITY_URL
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_TOKIPONASIMILARITY_ANON_KEY
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

function pickWords() {
  const a = ALL_WORDS[Math.floor(Math.random() * ALL_WORDS.length)]!
  const b = ALL_WORDS.filter((x) => x != a)[
    Math.floor(Math.random() * (ALL_WORDS.length - 1))
  ]!

  return [a, b] as const
}

interface LogEntry {
  status: "sending" | "done" | "error"
  a: string
  b: string
  s: 4 | 1 | 2 | 3
  id: number
}

export function Main() {
  const [words, setWords] = createSignal(pickWords())
  const [log, setLog] = createSignal<LogEntry[]>([])

  const [user, setUser] = createStorage(
    "user",
    "" + Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
  )

  async function answer(value: 1 | 2 | 3 | 4) {
    let uid = +user()
    if (!Number.isSafeInteger(uid)) {
      uid = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      setUser("" + uid)
    }

    const id = Math.random()
    const [a, b] = words()

    setLog((log) => {
      const next = log.slice()
      next.unshift({
        status: "sending",
        a,
        b,
        s: value,
        id,
      })
      return next
    })

    setWords(pickWords())

    try {
      const result = await supabase.from("similarity").insert({
        creator: uid,
        similarity: value,
        word1: a,
        word2: b,
      })

      if (result.error) {
        setLog((log) =>
          log.map((x) => (x.id == id ? { ...x, status: "error" } : x)),
        )
      } else {
        setLog((log) =>
          log.map((x) => (x.id == id ? { ...x, status: "done" } : x)),
        )
      }
    } catch (error) {}
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.altKey || event.metaKey || isTypable(event)) {
      return
    }

    const value =
      event.key == "4"
        ? 4
        : event.key == "1"
        ? 1
        : event.key == "2"
        ? 2
        : event.key == "3"
        ? 3
        : null

    if (value != null) {
      answer(value)
    }
  }

  onMount(() => {
    document.getElementById("wile-js")?.remove()
    document.body.addEventListener("keydown", onKeyDown)
  })

  onCleanup(() => {
    document.body.removeEventListener("keydown", onKeyDown)
  })

  return (
    <div class="flex min-h-full w-full flex-col justify-center font-sp-sans text-2xl/[1]">
      <div class="flex w-full justify-center gap-4 text-8xl/[1]">
        <div class="rounded-lg bg-z-body-selected">{words()[0]}</div>
        <div class="rounded-lg bg-z-body-selected">{words()[1]}</div>
      </div>

      <div class="mt-16 text-center">nimi ni li sama seme</div>

      <div class="mx-auto mt-4 flex flex-col gap-2">
        <div class="flex justify-center gap-2 text-center text-5xl/[1]">
          <button
            class="relative rounded border border-red-500 bg-red-200 p-1 text-red-800 ring ring-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-200 dark:ring-red-950 [&:not(:hover)]:border-transparent [&:not(:hover)]:ring-transparent"
            onClick={() => answer(1)}
          >
            ala
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              1
            </span>
          </button>

          <button
            class="relative rounded border border-orange-500 bg-orange-200 p-1 text-orange-800 ring ring-orange-100 transition dark:border-orange-700 dark:bg-orange-900 dark:text-orange-200 dark:ring-orange-950 [&:not(:hover)]:border-transparent [&:not(:hover)]:ring-transparent"
            onClick={() => answer(2)}
          >
            lili
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              2
            </span>
          </button>

          <button
            class="relative rounded border border-blue-500 bg-blue-200 p-1 text-blue-800 ring ring-blue-100 transition dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200 dark:ring-blue-950 [&:not(:hover)]:border-transparent [&:not(:hover)]:ring-transparent"
            onClick={() => answer(3)}
          >
            mute
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              3
            </span>
          </button>
        </div>

        <button
          class="relative w-full rounded border border-slate-500 bg-z-body-selected p-1 px-2 py-1 text-center text-base/[1] text-z ring ring-slate-100 transition dark:border-slate-700 dark:ring-slate-950 [&:not(:hover)]:border-transparent [&:not(:hover)]:ring-transparent"
          onClick={() => answer(4)}
        >
          mi sona ala e nimi ni
          <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
            4
          </span>
        </button>
      </div>

      <div class="mt-16 flex flex-col gap-3 text-center">
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
          sina sona ala e nimi la o toki e <Label>mi sona ala e nimi ni</Label>
        </p>

        <p>sina toki e sona la nimi sin li kama la o sike toki a</p>

        <p>
          nimi li sama kulupu <Label>suli nanpa tu</Label> lon ilo [linja..ku.]
        </p>
      </div>

      <div class="mt-16 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-1 text-base/[1]">
        <For each={log()}>
          {(entry) => (
            <div class="flex rounded bg-z-body-selected px-2 py-1">
              <Fa
                class={
                  "h-4 w-4" +
                  (entry.status == "sending"
                    ? " animate-[faspinner_1s_linear_infinite]"
                    : "")
                }
                icon={
                  {
                    sending: faSpinner,
                    done: faCheck,
                    error: faExclamationTriangle,
                  }[entry.status]
                }
                title={entry.status}
              />

              <div class="mx-auto flex items-center">
                <Show
                  fallback={
                    <>
                      <span>{entry.a}</span>
                      <span class="text-xs/[1]">
                        sama{" "}
                        {entry.s == 3 ? "mute" : entry.s == 2 ? "lili" : "ala"}
                      </span>
                      <span>{entry.b}</span>
                    </>
                  }
                  when={entry.s == 4}
                >
                  <span class="text-xs/[1]">mi sona ala e</span>
                  <span>{entry.a}</span>
                  <span class="text-xs/[1]">e</span>
                  <span>{entry.b}</span>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
