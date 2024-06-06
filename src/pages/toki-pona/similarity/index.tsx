import { JSX, createSignal, onMount } from "solid-js"

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
  const a = ALL_WORDS[Math.random() * ALL_WORDS.length]!
  const b = ALL_WORDS.filter((x) => x != a)[
    Math.random() * (ALL_WORDS.length - 1)
  ]!

  return [a, b] as const
}

export function Main() {
  const [words, setWords] = createSignal(pickWords())

  onMount(() => document.getElementById("wile-js")?.remove())

  return (
    // <div class="flex h-full gap-8 font-sp-sans text-2xl/[1]">
    <div class="flex min-h-full w-full flex-col justify-center font-sp-sans text-2xl/[1]">
      <div class="flex w-full justify-center gap-4 text-8xl/[1]">
        <div class="rounded-lg bg-z-body-selected">toki</div>
        <div class="rounded-lg bg-z-body-selected">sona</div>
      </div>

      <div class="mt-16 text-center">nimi ni li sama seme</div>

      <div class="mx-auto mt-4 flex flex-col gap-2">
        <div class="flex justify-center gap-2 text-center text-5xl/[1]">
          <button class="relative rounded border border-red-500 bg-red-200 p-1 text-red-800 ring ring-red-100 transition dark:border-red-700 dark:bg-red-900 dark:text-red-200 dark:ring-red-950 [&:not(:hover)]:border-transparent [&:not(:hover)]:ring-transparent">
            ala
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              1
            </span>
          </button>

          <button class="relative rounded border border-orange-500 bg-orange-200 p-1 text-orange-800 ring ring-orange-100 transition dark:border-orange-700 dark:bg-orange-900 dark:text-orange-200 dark:ring-orange-950 [&:not(:hover)]:border-transparent [&:not(:hover)]:ring-transparent">
            lili
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              2
            </span>
          </button>

          <button class="relative rounded border border-blue-500 bg-blue-200 p-1 text-blue-800 ring ring-blue-100 transition dark:border-blue-700 dark:bg-blue-900 dark:text-blue-200 dark:ring-blue-950 [&:not(:hover)]:border-transparent [&:not(:hover)]:ring-transparent">
            mute
            <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
              3
            </span>
          </button>
        </div>

        <button class="relative w-full rounded border border-slate-500 bg-z-body-selected p-1 px-2 py-1 text-center text-base/[1] text-z ring ring-slate-100 transition dark:border-slate-700 dark:ring-slate-950 [&:not(:hover)]:border-transparent [&:not(:hover)]:ring-transparent">
          mi sona ala e nimi ni
          <span class="absolute bottom-0 right-0 rounded-sm bg-inherit px-0.5 font-sans text-sm/[1]">
            0
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
      </div>
    </div>

    /* <div class="flex h-full w-96 flex-col gap-4">
        <div class="w-full rounded-lg border border-z py-1 text-center text-z transition">
          sina pana e sona{" "}
          <span class="rounded-md bg-z-body-selected px-2 font-sans text-z transition">
            23
          </span>
        </div>

        <div class="flex w-full flex-1 flex-col rounded-lg border border-z">
          ji
        </div>
      </div> */
    // </div>
  )
}
