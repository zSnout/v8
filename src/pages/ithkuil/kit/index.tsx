import { glossWord } from "@zsnout/ithkuil/gloss"
import { parseWord } from "@zsnout/ithkuil/parse"
import {
  createSignal,
  For,
  Match,
  onMount,
  Show,
  Switch,
  type JSX,
} from "solid-js"
import {
  createRecognizer,
  RecognizerOutput,
  unglossWord,
} from "@zsnout/ithkuil/ungloss"
import { affixes, roots } from "@zsnout/ithkuil/data"
import { wordToIthkuil } from "@zsnout/ithkuil/generate"
import { Unmain } from "@/components/Prose"

const recognize = createRecognizer(affixes, roots)

export function Main() {
  onMount(() => document.querySelector(".q8s7")?.remove())

  const [source, setSource] = createSignal("hello world ithkuil 'person'")

  const [unglossed, setUnglossed] = createSignal<readonly RecognizerOutput[]>(
    [],
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
          <For
            each={source()
              .split(/\s+/g)
              .filter((x) => x)}
          >
            {(word) => {
              try {
                const parsed = parseWord(word)
                if (!parsed) {
                  throw new Error("to the other branch")
                }
                const gloss = parsed == null ? undefined : glossWord(parsed)

                return (
                  <div class="rounded-lg bg-z-body-selected px-2 py-1">
                    <div class="font-bold text-z-heading">{word}</div>
                    <div>{gloss?.short}</div>
                  </div>
                )
              } catch (err) {
                const recognized = recognize(word)
                const unglossed = unglossWord(recognized.gloss)
                const success = unglossed.filter((x) => x.type == "success")
                const error = unglossed.filter((x) => x.type == "error")

                return (
                  <div class="rounded-lg bg-z-body-selected px-2 py-1">
                    <div class="font-bold text-z-heading">{word}</div>
                    <Show when={recognized.gloss != word}>
                      <div class="font-bold text-z-heading">
                        {recognized.gloss}
                      </div>
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
                )
              }
            }}
          </For>
        </div>
      </div>

      <div class="h-full w-96 min-w-96 max-w-96">
        <div class="fixed bottom-0 right-0 top-12 flex w-96 flex-col border-l py-4">
          <Sidebar />
        </div>
      </div>
    </Unmain>
  )
}

function Sidebar() {
  return (
    <>
      <h1 class="px-4 text-center font-bold text-z-heading">
        Ithkuil Utility Kit
      </h1>

      <p class="mt-2 px-4">
        The Ithkuil Utility Kit helps with glossing and unglossing words and
        searching Ithkuil's root and affix lists.
      </p>

      <p class="mt-2 px-4">
        To gloss a word, type it into the Query Box at the top. To gloss
        multiple words, separate them with spaces.
      </p>

      <p class="mt-2 px-4">
        To ungloss a phrase, type it into the Query Box. Unglossing syntax only
        allows dashes <Code>-</Code>, not periods <Code>.</Code> to be used to
        separate gloss segments. The outputted word will adhere as closely as
        possible to the morpheme scoping order you specify. As such,{" "}
        <Code>l-ERG-G</Code> and <Code>l-G-ERG</Code> will output different
        words.
      </p>

      <h1 class="mt-2 px-4 text-center font-bold text-z-heading">
        Root & Affix Searches
      </h1>

      <p class="mt-2 px-4">
        To search for a root, type its definition in <Strong>double</Strong>{" "}
        quotes. This may be used as part of a gloss. Note that in a gloss, a
        root in double quotes will specify the stem and root. As such,{" "}
        <Code>S1-"human"-ERG</Code> is invalid, but <Code>"human"-ERG</Code> is
        okay. Avoid using the character <Code>-</Code> in root definitions.
      </p>

      <p class="mt-2 px-4">
        To search for an affix, type its definition in <Strong>single</Strong>{" "}
        quotes. This may be used as part of a gloss, as in{" "}
        <Code>"human"-'small'-ERG</Code>. Avoid using the character{" "}
        <Code>-</Code> in affix definitions.
      </p>

      <p class="mt-2 px-4">
        Avoid using hyphens <Code>-</Code> and spaces <Code> </Code> in root and
        affix definitions. They will not work properly.
      </p>
    </>
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
