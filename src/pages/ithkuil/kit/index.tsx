import { Unmain } from "@/components/Prose"
import {
  createStorage,
  createStorageBoolean,
} from "@/stores/local-storage-store"
import { affixes, roots, type AffixEntry } from "@zsnout/ithkuil/data"
import { wordToIthkuil } from "@zsnout/ithkuil/generate"
import { glossWord } from "@zsnout/ithkuil/gloss"
import { parseWord } from "@zsnout/ithkuil/parse"
import {
  createRecognizer,
  RecognizerOutput,
  unglossWord,
  type DataAffixByDegree,
  type DataRoot,
  type Replacement,
} from "@zsnout/ithkuil/ungloss"
import {
  createMemo,
  createSignal,
  For,
  mapArray,
  Match,
  onMount,
  Show,
  Switch,
  type JSX,
} from "solid-js"

const recognize = createRecognizer(affixes, roots)

export function Main() {
  onMount(() => document.querySelector(".q8s7")?.remove())

  const [source, setSource] = createStorage(
    "ithkuil/kit/source",
    "hello world ithkuil 'person'",
  )

  const words = mapArray(
    createMemo(() =>
      source()
        .split(/\s+/g)
        .filter((x) => x),
    ),
    (word) => {
      try {
        const parsed = parseWord(word)
        if (!parsed) {
          throw new Error("to the other branch")
        }
        const gloss = parsed == null ? undefined : glossWord(parsed)

        return {
          el: (
            <div class="rounded-lg bg-z-body-selected px-2 py-1">
              <div class="font-bold text-z-heading">{word}</div>
              <div>{gloss?.short}</div>
            </div>
          ),
        }
      } catch (err) {
        const recognized = Object.assign(recognize(word), {
          source: word,
        })
        const unglossed = unglossWord(recognized.gloss)
        const success = unglossed.filter((x) => x.type == "success")
        const error = unglossed.filter((x) => x.type == "error")

        return {
          el: (
            <div class="rounded-lg bg-z-body-selected px-2 py-1">
              <div class="font-bold text-z-heading">{word}</div>
              <Show when={recognized.gloss != word}>
                <div class="font-bold text-z-heading">{recognized.gloss}</div>
              </Show>
              <Switch>
                <Match when={success.length == 0 && error.length}>
                  <div class="grid grid-cols-[auto,auto] gap-x-4 text-red-700">
                    <For each={error}>
                      {({ label, reason }) => (
                        <>
                          <div>{label}</div>
                          <div>{reason}</div>
                        </>
                      )}
                    </For>
                  </div>
                </Match>
                <Match when={success.length == 0 && !error.length}>
                  <div class="text-red-700">Invalid gloss</div>
                </Match>
                <Match when={success.length == 1}>
                  <div>{wordToIthkuil(success[0]!.value)}</div>
                  <div>{glossWord(success[0]!.value).short}</div>
                </Match>
                <Match when={success.length > 1}>
                  <div class="grid grid-cols-[auto,auto] gap-x-4">
                    <For each={success}>
                      {(x) => (
                        <>
                          <div>{wordToIthkuil(x.value)}</div>
                          <div>{glossWord(x.value).short}</div>
                        </>
                      )}
                    </For>
                  </div>
                </Match>
              </Switch>
            </div>
          ),
          recognized,
        }
      }
    },
  )

  return (
    <Unmain class="flex gap-6 pl-6">
      <div class="flex flex-1 flex-col gap-8">
        <textarea
          class="z-field min-h-20 w-full whitespace-pre-wrap border-transparent bg-z-body-selected shadow-none"
          onInput={(e) => setSource(e.currentTarget.value)}
          value={source()}
          placeholder="Enter words or unglossables here..."
        />

        <div class="flex flex-wrap gap-4">
          <For each={words()}>{(x) => x.el}</For>
        </div>
      </div>

      <div class="h-full w-96 min-w-96 max-w-96">
        <div class="fixed bottom-0 right-0 top-12 flex w-96 flex-col overflow-auto border-l bg-z-body pb-12 pt-4">
          <Sidebar
            unglosses={words()
              .filter((x) => x.recognized != null)
              .map((x) => x.recognized)}
          />
        </div>
      </div>
    </Unmain>
  )
}

function Section(props: { title: string; children: JSX.Element }) {
  const [open, setOpen] = createStorageBoolean(
    `ithkuil/kit/${props.title}`,
    true,
  )

  return (
    <details
      class="mt-2 first:mt-0"
      open={open()}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary class="px-4 text-center font-bold text-z-heading">
        {props.title}
      </summary>

      {props.children}
    </details>
  )
}

function Sidebar(props: {
  unglosses: readonly (RecognizerOutput & { source: string })[]
}) {
  return (
    <>
      <Section title="Ithkuil Utility Kit">
        <p class="mt-2 px-4">
          The Ithkuil Utility Kit helps with glossing and unglossing words and
          searching Ithkuil's root and affix lists.
        </p>

        <p class="mt-2 px-4">
          To gloss a word, type it into the Query Box at the top. To gloss
          multiple words, separate them with spaces.
        </p>

        <p class="mt-2 px-4">
          To ungloss a phrase, type it into the Query Box. Unglossing syntax
          only allows dashes <Code>-</Code>, not periods <Code>.</Code> to be
          used to separate gloss segments. The outputted word will adhere as
          closely as possible to the morpheme scoping order you specify. As
          such, <Code>l-ERG-G</Code> and <Code>l-G-ERG</Code> will output
          different words.
        </p>
      </Section>

      <Section title="Searching Roots & Affixes">
        <p class="mt-2 px-4">
          To search for a root, type its definition in <Strong>double</Strong>{" "}
          quotes. This may be used as part of a gloss. Note that in a gloss, a
          root in double quotes will specify the stem and root. As such,{" "}
          <Code>S1-"human"-ERG</Code> is invalid, but <Code>"human"-ERG</Code>{" "}
          is okay. Avoid using the character <Code>-</Code> in root definitions.
        </p>

        <p class="mt-2 px-4">
          To search for an affix, type its definition in <Strong>single</Strong>{" "}
          quotes. This may be used as part of a gloss, as in{" "}
          <Code>"human"-'small'-ERG</Code>. Avoid using the character{" "}
          <Code>-</Code> in affix definitions.
        </p>

        <p class="mt-2 px-4">
          Avoid using hyphens <Code>-</Code> and spaces <Code> </Code> in root
          and affix definitions. They will not work properly.
        </p>
      </Section>

      <Section title="Root & Affix Alternatives">
        <For
          each={props.unglosses.flatMap((x) => x.replacements)}
          fallback={
            <p class="mx-4 mt-2">
              If you use a quoted root or affix definition like{" "}
              <Code>"human"</Code>, one root or affix will be used in the main
              window. Alternatives will then be shown here.
            </p>
          }
        >
          {Alt}
        </For>
      </Section>
    </>
  )
}

function Alt(replacement: Replacement & { source: string }) {
  const [shown, setShown] = createSignal(5)

  return (
    <div class="mx-4 mt-2">
      <p>{toString(replacement, replacement.actual, true)} alts:</p>
      <div class="ml-4">
        <For
          each={replacement.alts.slice(0, shown())}
          fallback={<p>No alternatives available.</p>}
        >
          {(alt) => <p>{toString(replacement, alt)}</p>}
        </For>
        <Show when={replacement.alts.length > shown()}>
          <button class="font-bold" onClick={() => setShown((x) => x << 1)}>
            {replacement.alts.length - shown()} more available. Click to see{" "}
            {Math.min(replacement.alts.length - shown(), shown())}.
          </button>
        </Show>
        <Show when={shown() > 5}>
          <button class="font-bold" onClick={() => setShown((x) => x >> 1)}>
            Click to hide{" "}
            {Math.min(replacement.alts.length, shown()) - (shown() >> 1)}.
          </button>
        </Show>
      </div>
    </div>
  )
}

function toString(
  replacement: Replacement,
  entry: AffixEntry | DataRoot | DataAffixByDegree,
  header?: boolean,
) {
  const head = header ? "font-bold text-z-heading" : "font-bold"
  const sub = header ? "font-bold text-z-heading" : "text-z-subtitle"
  if ("cr" in entry) {
    return (
      <span>
        <span class={head}>
          S{entry.stem}-{entry.cr}
        </span>{" "}
        <span class={sub}>“{entry.label}”</span>
      </span>
    )
  }

  if ("abbr" in entry) {
    return (
      <span>
        <span class={head}>
          {entry.cs}/{entry.degree}
        </span>{" "}
        <span class={sub}>‘{entry.value}’</span>
      </span>
    )
  }

  const degree = "degree" in replacement ? replacement.degree : 0

  return (
    <span>
      <span class={head}>
        {entry.cs}/{degree}
      </span>{" "}
      <span class={sub}>
        ‘{entry.degrees[degree] || entry.description || entry.abbreviation}’
      </span>
    </span>
  )
}

function Code(props: { children: JSX.Element }) {
  return (
    <code class="whitespace-pre rounded bg-z-body-selected px-1">
      {props.children}
    </code>
  )
}

function Strong(props: { children: JSX.Element }) {
  return <strong class="font-bold text-z-heading">{props.children}</strong>
}
