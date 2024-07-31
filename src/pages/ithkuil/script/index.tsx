import { Fa } from "@/components/Fa"
import { AutoResizeTextarea } from "@/components/fields/AutoResizeTextarea"
import {
  faArrowsTurnToDots,
  faBars,
  faDownload,
  faMagicWandSparkles,
  faPaperPlane,
  faPenNib,
  faTextSlash,
} from "@fortawesome/free-solid-svg-icons"
import {
  AnchorX,
  AnchorY,
  CharacterRow,
  Diacritic,
  Lines,
  Primary,
  type PrimaryCharacter,
  Row,
  Translate,
  fitViewBox,
  getBBox,
  isElidable,
  textToScript,
} from "@zsnout/ithkuil/script"
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js"

export function Main() {
  const [inputText, setInputText] = createSignal("Wattunkí ruyün!")
  const [text, setText] = createSignal("Wattunkí ruyün!")
  const [lineSpace, setLineSpace] = createSignal(70)
  const [showGuides, setShowGuides] = createSignal(true)
  const [elidePrimaries, setElidePrimaries] = createSignal(true)
  const [elideQuaternaries, setElideQuaternaries] = createSignal(true)
  const [strokeWidth, setStrokeWidth] = createSignal(0)

  let isFast = true
  const [trigger, setTrigger] = createSignal(0)

  let box: {
    readonly x: number
    readonly y: number
    readonly height: number
    readonly width: number
  } = {
    x: -512,
    y: -100,
    height: 200,
    width: 1024,
  }

  let isSVGInitialized = false

  const sentence = createMemo(() => {
    try {
      trigger()
      const content = text()
      const spaceBetweenLines = lineSpace()
      const willShowGuides = showGuides()
      const willElidePrimaries = elidePrimaries()
      const willElideQuaternaries = elideQuaternaries()
      const renderedStrokeWidth = strokeWidth()

      let maxWidth = 0

      const rows = content.split("\n").map((line, index) => {
        const parsed = textToScript(line, {
          handwritten: renderedStrokeWidth != 0,
          useCaseIllValDiacritics: willElideQuaternaries,
        })

        const characters = AnchorX({
          at: "l",
          children: (
            <g>
              {parsed.ok ?
                willElidePrimaries ?
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
                                (
                                  (character as PrimaryCharacter).bottom ==
                                  "FRM"
                                ) ?
                                  "HORIZ_BAR"
                                : "DOT",
                              handwritten: renderedStrokeWidth != 0,
                            }),
                          })
                        }

                        const node = character.construct(character as any)

                        if (character.dimmed) {
                          node.classList.add("dimmed")
                        }

                        return node
                      }),
                    compact: !isFast,
                    space: 10 + renderedStrokeWidth,
                  })
                : CharacterRow({
                    children: parsed.value,
                    compact: !isFast,
                    space: 10 + renderedStrokeWidth,
                  })

              : ((
                  <text class="fill-z-text-heading" stroke-width={0}>
                    {parsed.reason}
                  </text>
                ) as SVGTextElement)
              }
            </g>
          ) as SVGGElement,
          y: index * (70 + spaceBetweenLines),
        }) as SVGGElement

        const width = getBBox(characters).width

        if (width > maxWidth) {
          maxWidth = width
        }

        if (willShowGuides) {
          const lines = Lines({ width: 1024, height: 0 })

          lines.setAttribute("class", "stroke-z-border transition")

          characters.insertBefore(
            Translate({
              children: lines,
              y: index * (70 + spaceBetweenLines),
            }),
            characters.children[0] || null,
          )
        }

        return characters
      })

      const stack = (<g>{rows}</g>) as SVGGElement

      const myBox = getBBox(stack)

      box = {
        x: 0,
        width: maxWidth,
        y: myBox.y - 1,
        height: myBox.height + 1,
      }

      if (isSVGInitialized) {
        updateViewBox()
      }

      return stack
    } finally {
      isFast = true
    }
  })

  const svg = (
    <svg
      class={
        "transition " +
        (strokeWidth() ?
          "fill-none stroke-z-text-heading [&_.dimmed]:stroke-z-text-dimmed"
        : "fill-z-text-heading [&_.dimmed]:fill-z-text-dimmed")
      }
      viewBox="-512 -100 1024 200"
      stroke-width={strokeWidth()}
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      {sentence()}
    </svg>
  ) as SVGSVGElement

  isSVGInitialized = true

  function updateViewBox() {
    const renderedStrokeWidth = untrack(strokeWidth)

    const width = Math.max(200, svg.clientWidth)

    const xCenter = box.x + box.width / 2

    svg.setAttribute(
      "viewBox",
      `${xCenter - width / 2} ${box.y - renderedStrokeWidth} ${width} ${
        box.height + 2 * renderedStrokeWidth
      }`,
    )
  }

  setTimeout(() => untrack(updateViewBox))

  createEffect(() => {
    text()
    strokeWidth()
    updateViewBox()
  })

  const observer = new ResizeObserver(updateViewBox)
  observer.observe(svg)
  onCleanup(() => observer.disconnect())

  const result = (
    <div class="group/center my-auto flex flex-col">
      <h1 class="mb-8 text-center text-lg font-light text-z-heading transition">
        Ithkuil Script Generator
      </h1>

      {svg}

      <form
        class="mt-8 flex w-96 max-w-full flex-col gap-4 self-center"
        onSubmit={(event) => {
          event.preventDefault()

          batch(() => {
            setText(untrack(inputText))
            setTrigger((x) => x + 1)
          })
        }}
      >
        <AutoResizeTextarea
          class="z-field w-full"
          placeholder="Type a sentence here..."
          value={inputText()}
          onInput={(event) => setInputText(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (
              event.metaKey !== event.ctrlKey &&
              !event.shiftKey &&
              !event.altKey &&
              event.key == "Enter"
            ) {
              event.preventDefault()
              setText(inputText())
            }
          }}
        />

        <div class="flex w-full gap-2">
          <input
            class="z-field w-full px-0 text-center placeholder:text-xs"
            min={0}
            onInput={(event) => {
              const value = +event.currentTarget.value

              if (Number.isNaN(value) || value < 0) {
                return
              }

              setLineSpace(value)
            }}
            value={lineSpace()}
            type="number"
            placeholder="Spacing..."
            disabled={!inputText().includes("\n")}
          />

          <button
            class="z-field flex items-center justify-center"
            classList={{ "bg-z-field-selected": strokeWidth() == 0 }}
            type="submit"
            onClick={() => setStrokeWidth((x) => (x == 0 ? 5 : 0))}
          >
            <Fa
              class="h-4 w-4"
              icon={faPenNib}
              title="Toggle whether to write in calligraphic mode"
            />
          </button>

          <button
            class="z-field flex items-center justify-center"
            classList={{ "bg-z-field-selected": elidePrimaries() }}
            type="submit"
            onClick={() => setElidePrimaries((x) => !x)}
          >
            <Fa
              class="h-4 w-4"
              icon={faTextSlash}
              title="Toggle whether sentence-initial primaries may be elided"
            />
          </button>

          <button
            class="z-field flex items-center justify-center"
            classList={{ "bg-z-field-selected": elideQuaternaries() }}
            type="submit"
            onClick={() => setElideQuaternaries((x) => !x)}
          >
            <Fa
              class="h-4 w-4"
              icon={faArrowsTurnToDots}
              title="Toggle whether case/ill+val quaternaries may be elided"
            />
          </button>

          <button
            class="z-field flex items-center justify-center"
            classList={{ "bg-z-field-selected": showGuides() }}
            type="submit"
            onClick={() => setShowGuides((x) => !x)}
          >
            <Fa class="h-4 w-4" icon={faBars} title="Toggle guides" />
          </button>

          <button
            class="z-field flex items-center justify-center"
            type="button"
            onClick={() => {
              const downloaded = svg.cloneNode(true) as SVGSVGElement

              downloaded.removeAttribute("class")

              downloaded.querySelectorAll(".dimmed").forEach((el) => {
                if (renderedStrokeWidth) {
                  el.setAttribute("stroke", "#808080")
                } else {
                  el.setAttribute("fill", "#808080")
                }
              })

              downloaded
                .querySelectorAll("[class]")
                .forEach((el) => el.removeAttribute("class"))

              const renderedStrokeWidth = untrack(strokeWidth)

              if (!showGuides()) {
                fitViewBox(downloaded, renderedStrokeWidth / 2)
              }

              if (renderedStrokeWidth) {
                downloaded.setAttribute(
                  "stroke-width",
                  "" + renderedStrokeWidth,
                )

                downloaded.setAttribute("stroke", "black")

                downloaded.setAttribute("fill", "none")
              } else {
                downloaded.removeAttribute("stroke-width")
                downloaded.removeAttribute("stroke")
                downloaded.setAttribute("fill", "black")
              }

              downloaded.setAttribute("xmlns", "http://www.w3.org/2000/svg")

              const blob = new Blob(
                ['<?xml version="1.0" ?>\n' + downloaded.outerHTML],
                { type: "image/svg+xml" },
              )

              const url = URL.createObjectURL(blob)

              const anchor = document.createElement("a")

              anchor.href = url

              anchor.download =
                text()
                  .slice(0, 15)
                  .replace(/[^\p{ID_Start}\p{ID_Continue}]+/giu, "-")
                  .replace(/^-+|-+$/g, "")
                  .toLowerCase() + ".svg"

              anchor.click()
            }}
          >
            <Fa class="h-4 w-4" icon={faDownload} title="Download" />
          </button>

          <button
            class="z-field flex items-center justify-center"
            type="submit"
            onClick={() => {
              if (
                confirm(
                  "This may freeze your browser for a few seconds or minutes, depending on the length of your text. Are you sure you want to continue?",
                )
              ) {
                isFast = false

                setTimeout(() => {
                  alert("Done.")
                })
              }
            }}
          >
            <Fa class="h-4 w-4" icon={faMagicWandSparkles} title="Prettify" />
          </button>

          <button
            class="z-field flex items-center justify-center"
            type="submit"
            onClick={() => (isFast = true)}
          >
            <Fa class="h-4 w-4" icon={faPaperPlane} title="Write" />
          </button>
        </div>
      </form>

      <div class="mt-4 flex w-96 max-w-full flex-col gap-1 self-center">
        <p>To adjust the content, type in the input field.</p>

        <p>
          <Fa
            class="relative -top-px mx-1 inline h-4 w-4"
            icon={faPenNib}
            title="Toggle whether to write in calligraphic mode"
          />{" "}
          flips between calligraphic and handwritten mode.
        </p>

        <p>
          <Fa
            class="relative -top-px mx-1 inline h-4 w-4"
            icon={faTextSlash}
            title="Toggle whether sentence-initial primaries may be elided"
          />{" "}
          toggles whether primaries may be elided.
        </p>

        <p>
          <Fa
            class="relative -top-px mx-1 inline h-4 w-4"
            icon={faArrowsTurnToDots}
            title="Toggle whether case/ill+val quaternaries may be elided"
          />{" "}
          toggles whether quaternaries may be elided.
        </p>

        <p>
          <Fa
            class="relative -top-px mx-1 inline h-4 w-4"
            icon={faBars}
            title="Toggle guides"
          />{" "}
          toggles the line guides.
        </p>

        <p>
          <Fa
            class="relative -top-px mx-1 inline h-4 w-4"
            icon={faDownload}
            title="Download"
          />{" "}
          downloads the generated SVG.
        </p>

        <p>
          <Fa
            class="relative -top-px mx-1 inline h-4 w-4"
            icon={faMagicWandSparkles}
            title="Prettify"
          />{" "}
          is explained below.
        </p>

        <p>
          <Fa
            class="relative -top-px mx-1 inline h-4 w-4"
            icon={faPaperPlane}
            title="Write"
          />{" "}
          re-renders your text (ctrl/cmd-enter works too!)
        </p>

        <p>
          The "Spacing" field controls the spacing between multiple lines of
          text. It defaults to 70 and is disabled unless you have multiple lines
          of text.
        </p>

        <p class="mt-4">
          The{" "}
          <Fa
            class="relative -top-px mx-1 inline h-4 w-4"
            icon={faMagicWandSparkles}
            title="Prettify"
          />{" "}
          button aligns the spaces between letters more accurately. It is{" "}
          <em>very</em> slow, and will freeze the browser for 30 seconds to
          several minutes.
        </p>
      </div>
    </div>
  )

  for (const el of document.getElementsByClassName("q8s7")) {
    el.remove()
  }

  return result
}
