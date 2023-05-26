import {
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  untrack,
} from "solid-js"
import type { JSX } from "solid-js/jsx-runtime"
import { createEventListener } from "./create-event-listener"

export type QuizQuestion =
  | {
      question: JSX.Element
      next?(): QuizQuestion

      type: "true-or-false"
      check(value: boolean): QuizCheckResult

      placeholder?: undefined
    }
  | {
      question: JSX.Element
      next?(): QuizQuestion

      type: "field"
      placeholder?: string
      check(value: string): QuizCheckResult
    }

export type QuizCheckResult = {
  correct: boolean
  note?: JSX.Element
}

function QuizButton(props: {
  children: JSX.Element
  class: `h-${number} active:h-[calc(${number}rem_-_1px)]${string}`
  disabled?(): boolean
  onClick?(): boolean | undefined
  onClickFinished?(): void
}) {
  return (
    <button
      class={
        "relative rounded border-b-2 text-lg font-semibold text-white z-quiz-[blue,2] z-quiz-[green,3] z-quiz-[red,1] z-quiz-[yellow,4] active:top-px active:animate-[quiz-correct_1s] active:border-b " +
        props.class
      }
      disabled={props.disabled?.()}
      onClick={(event) => {
        const prevent = props.onClick?.()

        if (prevent) {
          return
        }

        const animation = event.currentTarget.animate(
          [
            { offset: 0, opacity: 1 },
            { offset: 0.75, opacity: 0, transform: "scale(2)" },
            { offset: 1, opacity: 0, transform: "scale(2)" },
            { offset: 1, opacity: 0, transform: "scale(1)" },
          ],
          { duration: 750 },
        )

        for (const item of event.currentTarget.parentElement!.children) {
          if (item != event.currentTarget) {
            item.animate(
              [
                { offset: 0, opacity: 1 },
                { offset: 0.1, opacity: 0 },
                { offset: 1, opacity: 0 },
              ],
              { duration: 750 },
            )
          }
        }

        animation.onfinish = () => props.onClickFinished?.()
      }}
    >
      {props.children}
    </button>
  )
}

export function QuizLayout(props: { createQuestion(): QuizQuestion }) {
  const [screen, setScreen] = createSignal(props.createQuestion())
  const [checkResult, setCheckResult] = createSignal<QuizCheckResult>()

  async function nextScreen() {
    const currentScreen = untrack(screen)

    setScreen(currentScreen.next?.() || props.createQuestion())
    setCheckResult()

    const el = field()

    if (el) {
      el.value = ""
    }

    if (el && el.isConnected) {
      el.focus()
    }

    const el2 = layout()

    if (el2) {
      const promises: Promise<Event>[] = []

      for (const node of el2.querySelectorAll("button, input")) {
        const animation = node.animate(
          [
            { offset: 0, opacity: 0, transform: "scale(1)" },
            { offset: 1, opacity: 1, transform: "scale(1)" },
          ],
          { duration: 100 },
        )

        promises.push(
          new Promise((resolve) => {
            animation.onfinish = resolve
          }),
        )
      }

      await Promise.all(promises)
    }
  }

  function check<T>(
    answer: QuizQuestion & { check(value: T): QuizCheckResult },
    value: T,
  ) {
    const result = answer.check(value)
    setCheckResult(result)
    return result
  }

  const [layout, setLayout] = createSignal<HTMLDivElement>()
  const [field, setField] = createSignal<HTMLInputElement>()

  function QuizField() {
    return (
      <form
        class="flex h-40 items-center justify-center"
        onSubmit={(event) => {
          event.preventDefault()

          const question = screen()
          const el = field()

          if (question.type == "field" && el) {
            const result = check(question, el.value)

            if (result.correct) {
              const animation = el.animate(
                [
                  { offset: 0, opacity: 1 },
                  { offset: 0.75, opacity: 0, transform: "scale(2)" },
                  { offset: 1, opacity: 0, transform: "scale(2)" },
                  { offset: 1, opacity: 0, transform: "scale(1)" },
                ],
                { duration: 750 },
              )

              el.disabled = true

              animation.onfinish = () => {
                el.disabled = false
                el.value = ""

                nextScreen()
              }
            }
          }
        }}
      >
        <input
          class="field w-80 max-w-full"
          placeholder={screen().placeholder || "Type..."}
          ref={setField}
          required
        />
      </form>
    )
  }

  function QuizTrueOrFalse() {
    const disabled = createMemo(() => checkResult()?.correct === true)

    return (
      <div class="grid h-40 grid-cols-[20rem,20rem] gap-8">
        <QuizButton
          class="h-40 active:h-[calc(10rem_-_1px)]"
          disabled={disabled}
          onClick={() => {
            const question = screen()

            if (question.type == "true-or-false") {
              const result = check(question, true)

              return !result.correct
            }

            return false
          }}
          onClickFinished={nextScreen}
        >
          True
        </QuizButton>

        <QuizButton
          class="h-40 active:h-[calc(10rem_-_1px)]"
          disabled={disabled}
          onClick={() => {
            const question = screen()

            if (question.type == "true-or-false") {
              const result = check(question, false)

              return !result.correct
            }

            return false
          }}
          onClickFinished={nextScreen}
        >
          False
        </QuizButton>
      </div>
    )
  }

  createEventListener(document, "keydown", (event) => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (document.activeElement && document.activeElement != document.body)
    ) {
      return
    }

    const index =
      event.key == "a" || event.key == "A"
        ? 1
        : event.key == "b" || event.key == "B"
        ? 2
        : event.key == "c" || event.key == "C"
        ? 3
        : event.key == "d" || event.key == "D"
        ? 4
        : null

    if (!index) {
      return
    }

    event.preventDefault()

    const question = untrack(screen)

    if (question.type == "true-or-false") {
      if (index == 1) {
        check(question, true)
      }

      if (index == 2) {
        check(question, false)
      }
    }
  })

  return (
    <div
      class="m-auto flex w-full max-w-2xl animate-[fade-in_1s] select-none flex-col"
      ref={setLayout}
    >
      <div class="mb-4 text-center text-2xl">{screen().question}</div>

      <div class="mb-16 text-center text-z-subtitle">
        <Switch fallback={checkResult()?.note}>
          <Match when={checkResult()?.correct === false}>
            {checkResult()?.note || "Incorrect."}
          </Match>

          <Match when={checkResult()?.note == null}>
            <span class="invisible">i</span>
          </Match>
        </Switch>
      </div>

      <Show when={screen().type == "field"}>
        <QuizField />
      </Show>

      <Show when={screen().type == "true-or-false"}>
        <QuizTrueOrFalse />
      </Show>
    </div>
  )
}
