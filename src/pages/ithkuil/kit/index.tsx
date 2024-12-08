import { clsx } from "@/components/clsx"
import { Fa } from "@/components/Fa"
import { Checkbox } from "@/components/fields/CheckboxGroup"
import { Unmain } from "@/components/Prose"
import { CheckboxContainer } from "@/learn/el/CheckboxContainer"
import {
  createStorage,
  createStorageBoolean,
} from "@/stores/local-storage-store"
import { faClose, faNavicon } from "@fortawesome/free-solid-svg-icons"
import { affixes, roots, type AffixEntry } from "@zsnout/ithkuil/data"
import { wordToIthkuil } from "@zsnout/ithkuil/generate"
import { glossWord } from "@zsnout/ithkuil/gloss"
import { parseWord } from "@zsnout/ithkuil/parse"
import {
  AnchorX,
  AnchorY,
  CharacterRow,
  Diacritic,
  getBBox,
  isElidable,
  Primary,
  Row,
  textToScript,
  type PrimaryCharacter,
} from "@zsnout/ithkuil/script"
import {
  createRecognizer,
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
  onCleanup,
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
    `"tool"-OBS "this"-AFF šio malëuţřaitie "word_search"-'similar'-ATT`,
  )

  const [splitByNewline, setSplitByNewline] = createStorageBoolean(
    "ithkuil/kit/split_by_newline",
    false,
  )

  const [showScript, setShowScript] = createStorageBoolean(
    "ithkuil/kit/script",
    true,
  )

  const [glossLong, setGlossLong] = createStorageBoolean(
    "ithkuil/kit/gloss_long",
    false,
  )

  const [elidePrimaries, setElidePrimaries] = createStorageBoolean(
    "ithkuil/kit/elide_primaries",
    true,
  )

  const [elideQuaternaries, setElideQuaternaries] = createStorageBoolean(
    "ithkuil/kit/elide_quaternaries",
    true,
  )

  const [handwritten, setHandwritten] = createStorageBoolean(
    "ithkuil/kit/handwritten",
    true,
  )

  const [stretch, setStretch] = createStorageBoolean(
    "ithkuil/kit/stretch",
    true,
  )

  const words = mapArray(
    createMemo(() =>
      source()
        .split(splitByNewline() ? /(?:\r?\n)+/g : /\s+/g)
        .filter((x) => x),
    ),
    (word) => {
      if (/^(?:q|h[aeiou]?[0123])/i.test(word)) {
        return {
          el: (
            <div class="max-w-full rounded-lg bg-z-body-selected px-2 py-1">
              <div class="font-bold text-z-heading">{word}</div>
              <div>Custom character sequence</div>
              <MaybeDraw word={word} />
            </div>
          ),
        }
      }

      try {
        const parsed = parseWord(word)
        if (!parsed) {
          throw new Error("Not a valid word.")
        }
        const gloss = glossWord(parsed)

        return {
          el: (
            <div
              class={
                "max-w-full rounded-lg bg-z-body-selected px-2 py-1" +
                (stretch() ? " flex-[1_0_fit-content]" : "")
              }
            >
              <div class="font-bold text-z-heading">{word}</div>
              <div>{gloss[glossLong() ? "full" : "short"]}</div>
              <MaybeDraw word={word} />
            </div>
          ),
        }
      } catch (err) {
        const recognized = recognize(word)
        const unglossed = unglossWord(recognized.gloss)
        const success = unglossed.filter((x) => x.type == "success")
        const error = unglossed.filter((x) => x.type == "error")

        return {
          el: (
            <div
              class={
                "rounded-lg bg-z-body-selected px-2 py-1" +
                (stretch() ? " flex-[1_0_fit-content]" : "")
              }
            >
              <div class="font-bold text-z-heading">{word}</div>
              <Show when={recognized.gloss != word}>
                <div class="font-bold text-z-heading">{recognized.gloss}</div>
              </Show>
              <Switch>
                <Match when={success.length == 0}>
                  <p class="text-red-700 dark:text-red-400">
                    {err instanceof Error ? err.message : String(err)}
                  </p>
                  <div class="grid grid-cols-[auto,auto] gap-x-4 text-red-700 dark:text-red-400">
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
                <Match when={success.length == 1}>
                  <div>{wordToIthkuil(success[0]!.value)}</div>
                  <div>
                    {
                      glossWord(success[0]!.value)[
                        glossLong() ? "full" : "short"
                      ]
                    }
                  </div>
                </Match>
                <Match when={success.length > 1}>
                  <div class="grid grid-cols-[auto,auto] gap-x-4">
                    <For each={success}>
                      {(x) => (
                        <>
                          <div>{wordToIthkuil(x.value)}</div>
                          <div>
                            {glossWord(x.value)[glossLong() ? "full" : "short"]}
                          </div>
                        </>
                      )}
                    </For>
                  </div>
                </Match>
              </Switch>
              <For each={success}>
                {(word) => <MaybeDraw word={wordToIthkuil(word.value)} />}
              </For>
            </div>
          ),
          recognized,
        }
      }
    },
  )

  // "show" means "show on mobile and desktop"
  // "hide" means "hide on mobile and desktop"
  // anything else means "hide on mobile; show on desktop"
  const [sidebar, setShowSidebar] = createStorage<"show" | "hide">(
    "ithkuil/kit/sidebar",
    "",
  )

  return (
    <Unmain class="flex gap-6 px-6 md:pr-0">
      <div class="flex flex-1 flex-col gap-8 md:w-[calc(100vw_-_27rem)] md:max-w-[calc(100vw_-_27rem)]">
        <textarea
          class="z-field min-h-20 w-full whitespace-pre-wrap border-transparent bg-z-body-selected shadow-none"
          onInput={(e) => setSource(e.currentTarget.value)}
          value={source()}
          placeholder="Enter words or unglossables here..."
        />

        <div class="flex flex-wrap gap-4 break-words">
          <For each={words()}>{(x) => x.el}</For>
        </div>
      </div>

      <div class="contents h-full w-96 min-w-96 max-w-96 md:block">
        <div class="fixed bottom-0 right-0 top-12 contents w-96 flex-col overflow-auto border-l border-z bg-z-body pb-12 pt-4 md:flex">
          <div
            class={clsx(
              "fixed bottom-0 top-12 w-[calc(100%_+_1px)] overflow-y-auto overflow-x-hidden border-l border-z bg-z-body py-4 text-left transition-all md:contents",
              sidebar() == "hide" ? "left-full" : "-left-px",
            )}
          >
            <Sidebar />
          </div>
        </div>
      </div>

      <button
        class="fixed right-2 top-14 flex size-8 rounded-lg border border-z bg-z-body shadow md:hidden"
        onClick={() => setShowSidebar((x) => (x == "hide" ? "" : "hide"))}
      >
        <Fa
          class={"m-auto " + (sidebar() == "hide" ? "size-5" : "size-6")}
          icon={sidebar() == "hide" ? faNavicon : faClose}
          title={sidebar()}
        />
      </button>
    </Unmain>
  )

  function Sidebar() {
    return (
      <>
        <Section title="Ithkuil Utility Kit">
          <p class="mt-2 px-4">
            The Ithkuil Utility Kit helps with glossing and constructing words
            and searching Ithkuil's root and affix lists. All data is
            automatically saved on page reload.
          </p>

          <p class="mt-2 px-4">
            To gloss a word, type it into the query box at the top.
          </p>

          <p class="mt-2 px-4">
            To construct a word, type a regular gloss into the query box, but
            use <Code>-</Code> instead of <Code>.</Code> to separate grammatical
            categories. (Ca forms still use a single dot-separated complex.)
          </p>

          <p class="mt-2 px-4">
            To gloss or construct multiple words, separate them with{" "}
            {splitByNewline() ? "newlines" : "spaces"}.
          </p>
        </Section>

        <Section title="Searching Roots & Affixes">
          <p class="mt-2 px-4">
            To search for a root, type its definition in <Strong>double</Strong>{" "}
            quotes. This may be used as part of a constructed word, as in{" "}
            <Code>A-"painting"-DEC</Code>.
          </p>

          <p class="mt-2 px-4">
            To search for an affix, type its definition in{" "}
            <Strong>single</Strong> quotes. This may be used as part of a
            constructed word, as in <Code>"human"-'small'-ERG</Code>.
          </p>

          <p class="mt-2 px-4">
            Avoid using hyphens <Code>-</Code>
            <Show when={!splitByNewline()}>
              {" "}
              and spaces <Code> </Code>
            </Show>{" "}
            in root and affix definitions. They will not work properly.
          </p>
        </Section>

        <Section title="Script Generation">
          <p class="mx-4 mt-2">
            The Ithkuil Utility Kit includes some built-in script capabilities.{" "}
            <a
              class="text-z-link underline underline-offset-2"
              href="/Custom Character Syntax.pdf"
            >
              Custom character sequences
            </a>{" "}
            starting with Q-, q-, and h- are supported. To create long custom
            character sequences, split your queries by newlines instead of
            spaces. To download generated scripts, use the{" "}
            <a
              class="text-z-link underline underline-offset-2"
              href="/ithkuil/script"
            >
              Ithkuil Script Generator
            </a>
            .
          </p>
        </Section>

        <Section title="Kit Options">
          <div class="mx-4 mt-2">
            <CheckboxContainer label="Utility kit options">
              <label class="flex w-full gap-2">
                <Checkbox checked={glossLong()} onInput={setGlossLong} />
                Show full glosses?
              </label>
              <label class="flex w-full gap-2">
                <Checkbox checked={stretch()} onInput={setStretch} />
                Stretch query boxes?
              </label>
              <label class="flex w-full gap-2">
                <Checkbox
                  checked={splitByNewline()}
                  onInput={setSplitByNewline}
                />
                Split queries by newlines?
              </label>
              <label class="flex w-full gap-2">
                <Checkbox checked={showScript()} onInput={setShowScript} />
                Generate script?
              </label>
              <label class="flex w-full gap-2">
                <Checkbox checked={handwritten()} onInput={setHandwritten} />
                Use handwritten characters?
              </label>
              <label class="flex w-full gap-2">
                <Checkbox
                  checked={elidePrimaries()}
                  onInput={setElidePrimaries}
                />
                Elide primaries?
              </label>
              <label class="flex w-full gap-2">
                <Checkbox
                  checked={elideQuaternaries()}
                  onInput={setElideQuaternaries}
                />
                Elide quaternaries?
              </label>
            </CheckboxContainer>
          </div>
        </Section>

        <Section title="Credit">
          <p class="mx-4 mt-2">
            The parsing, glossing, unglossing, script generation systems, and
            handwritten script characters were built by{" "}
            <a
              class="text-z-link underline underline-offset-2"
              href="https://github.com/zsakowitz/ithkuil"
            >
              this site's author
            </a>
            .
          </p>

          <p class="mx-4 mt-2">
            The calligraphic Ithkuil characters were created by{" "}
            <a
              class="text-z-link underline underline-offset-2"
              href="https://github.com/shankarsivarajan"
            >
              Shankar Sivarajan
            </a>
            .
          </p>

          <p class="mx-4 mt-2">
            The custom character syntax for advanced alphabetic characters was
            designed by{" "}
            <a
              class="text-z-link underline underline-offset-2"
              href="https://github.com/ryanlo713"
            >
              Lucifer Caelius Delicatus
            </a>
            .
          </p>

          <p class="mx-4 mt-2">
            The dictionaries for the root and affix searches are from the{" "}
            <a
              class="text-z-link underline underline-offset-2"
              href="https://docs.google.com/spreadsheets/d/1JdaG1PaSQJRE2LpILvdzthbzz1k_a0VT86XSXouwGy8/edit"
            >
              Collaborative Ithkuil IV Roots and Affixes Spreadsheet
            </a>
            .
          </p>
        </Section>

        <hr class="mb-2 mt-4 border-z" />

        <Section title="Root & Affix Alternatives">
          <For
            each={words()
              .flatMap((x) => x.recognized?.replacements)
              .filter((x) => x != null)}
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

  function MaybeDraw(props: { word: string }) {
    return (
      <Show when={showScript()}>
        <Draw word={props.word} />
      </Show>
    )
  }

  function Draw(props: { word: string }) {
    return createMemo(() => {
      const stroke = handwritten() ? 5 : 0
      const willElidePrimaries = elidePrimaries()
      const willElideQuaternaries = elideQuaternaries()
      const [svg, setSvg] = createSignal(<p>Rendering...</p>)
      const id = (globalThis.requestIdleCallback || setTimeout)(() =>
        setSvg(actualDraw()),
      )
      onCleanup(() => (globalThis.cancelIdleCallback || clearTimeout)(id))

      return svg

      function actualDraw() {
        const parsed = textToScript(props.word, {
          handwritten: !!stroke,
          useCaseIllValDiacritics: willElideQuaternaries,
        })

        if (!parsed.ok) {
          return <p class="text-red-700 dark:text-red-400">{parsed.reason}</p>
        }

        const characters = AnchorX({
          at: "l",
          children: (
            <g>
              {willElidePrimaries ?
                Row({
                  children: parsed.value
                    .filter((character) => {
                      if (
                        character.construct == Primary &&
                        isElidable(character as PrimaryCharacter) &&
                        (!(character as PrimaryCharacter).bottom ||
                          (character as PrimaryCharacter).bottom == "UNF/C")
                      ) {
                        return false
                      }

                      return true
                    })
                    .map((character) => {
                      if (
                        character.construct == Primary &&
                        isElidable(character as PrimaryCharacter)
                      ) {
                        return AnchorY({
                          at: "c",
                          children: Diacritic({
                            name:
                              (character as PrimaryCharacter).bottom == "FRM" ?
                                "HORIZ_BAR"
                              : "DOT",
                            handwritten: !!stroke,
                          }),
                        })
                      }

                      const node = character.construct(character as any)

                      if (character.dimmed) {
                        node.classList.add("dimmed")
                      }

                      return node
                    }),
                  space: 10 + (stroke ?? 0),
                })
              : CharacterRow({
                  children: parsed.value,
                  space: 10 + (stroke ?? 0),
                })
              }
            </g>
          ) as SVGGElement,
        }) as SVGGElement

        const box = getBBox(characters)

        return (
          <svg
            viewBox={`${box.x - stroke} ${box.y - stroke} ${box.width + 2 * stroke} ${box.height + 2 * stroke}`}
            style={{
              height: box.height / 2 + stroke + "px",
            }}
            class={
              "mt-2 overflow-visible transition " +
              (stroke ?
                "fill-none stroke-z-text-heading [&_.dimmed]:stroke-z-text-dimmed"
              : "fill-z-text-heading [&_.dimmed]:fill-z-text-dimmed")
            }
            stroke-width={stroke}
            stroke-linejoin="round"
            stroke-linecap="round"
          >
            {characters}
          </svg>
        )
      }
    }) as unknown as JSX.Element
    // `Show` does this so it's fine
  }
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

function Alt(replacement: Replacement) {
  const [shown, setShown] = createSignal(5)

  return (
    <div class="mx-4 mt-2">
      <p>{toString(replacement, replacement.actual, true)} alts:</p>
      <div class="ml-4 hyphens-auto">
        <For
          each={replacement.alts.slice(0, shown())}
          fallback={
            <p class="text-pretty pl-4 -indent-4">No alternatives available.</p>
          }
        >
          {(alt) => (
            <p class="text-pretty pl-4 -indent-4">
              {toString(replacement, alt)}
            </p>
          )}
        </For>
        <Show when={replacement.alts.length > shown()}>
          <button
            class="text-pretty pl-4 text-left -indent-4 font-bold"
            onClick={() => setShown((x) => x << 1)}
          >
            {replacement.alts.length - shown()} more available. Click to see{" "}
            {Math.min(replacement.alts.length - shown(), shown())}.
          </button>
        </Show>
        <Show when={shown() > 5}>
          <button
            class="text-pretty pl-4 text-left -indent-4 font-bold"
            onClick={() => setShown((x) => x >> 1)}
          >
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
