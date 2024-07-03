import { Fa } from "@/components/Fa"
import * as autocomplete from "@codemirror/autocomplete"
import * as commands from "@codemirror/commands"
import { html } from "@codemirror/lang-html"
import * as language from "@codemirror/language"
import * as lint from "@codemirror/lint"
import * as search from "@codemirror/search"
import * as state from "@codemirror/state"
import * as view from "@codemirror/view"
import { EditorView } from "@codemirror/view"
import { faBookmark as faRegularSticky } from "@fortawesome/free-regular-svg-icons"
import {
  faCode,
  faBookmark as faSolidSticky,
} from "@fortawesome/free-solid-svg-icons"
import { createEffect, createSignal, For, JSX, Show } from "solid-js"
import { randomId } from "../id"
import { sanitize } from "../sanitize"

function IntegratedTagField(
  props: {
    placeholder?: string
    font?: string
    sizePx?: number
    value?: string
    onInput?: (value: string) => void
    emptyBg?: boolean
  },
  id: string,
): JSX.Element {
  const [tags, setTags] = createSignal(
    props.value
      ?.split(/\s+/g)
      .map((x) => x.trim())
      .filter((x) => x) || [],
  )

  function value(field: string) {
    const a = tags().join(" ")
    if (a && field) {
      return a + " " + field
    } else {
      return a || field
    }
  }

  return (
    <div class="flex flex-wrap gap-1 px-2 pb-2">
      <For each={tags()}>
        {(word) => (
          <div
            class="flex-1 rounded px-1 text-center"
            classList={{
              "bg-z-body": !props.emptyBg,
              "bg-z-body-selected": props.emptyBg,
            }}
          >
            {word}
          </div>
        )}
      </For>

      <input
        type="text"
        class="-mb-2 -mt-1 block min-w-[min(12rem,100%)] flex-[1024] bg-transparent pb-1 placeholder:text-z-subtitle placeholder:opacity-30 focus:outline-none"
        aria-labelledby={id}
        onInput={(el) => {
          const rawValue = el.currentTarget.value
          const values = rawValue.split(/\s+/g)
          if (values.length > 1) {
            const last = values.pop()!
            const next = values.map((x) => x.trim()).filter((x) => x)
            setTags((tags) => tags.concat(next))
            el.currentTarget.value = last
          }
          props.onInput?.(value(el.currentTarget.value))
        }}
        onBlur={(el) => {
          const rawValue = el.currentTarget.value
          const values = rawValue.split(/\s+/g)
          const next = values.map((x) => x.trim()).filter((x) => x)
          setTags((tags) => tags.concat(next))
          el.currentTarget.value = ""
          props.onInput?.(value(el.currentTarget.value))
        }}
        onKeyDown={(el) => {
          if (el.ctrlKey || el.altKey || el.metaKey || el.key != "Enter") {
            return
          }

          const rawValue = el.currentTarget.value
          const values = rawValue.split(/\s+/g)
          const next = values.map((x) => x.trim()).filter((x) => x)
          setTags((tags) => tags.concat(next))
          el.currentTarget.value = ""
          props.onInput?.(value(el.currentTarget.value))
        }}
        placeholder={tags().length == 0 ? props.placeholder : ""}
        style={{
          "font-family": props.font,
          "font-size": props.sizePx ? `${props.sizePx / 16}rem` : "",
        }}
      />
    </div>
  )
}

function IntegratedHTMLField(props: {
  value?: string | undefined
  onInput?: (value: string) => void
  emptyBg?: boolean
}) {
  let editor: EditorView

  return (
    <div
      class="border-t border-z focus-within:*:outline-none"
      ref={(el) => {
        editor = new EditorView({
          doc: props.value,
          extensions: [
            view.highlightSpecialChars(),
            commands.history(),
            view.drawSelection(),
            view.dropCursor(),
            state.EditorState.allowMultipleSelections.of(true),
            language.indentOnInput(),
            language.syntaxHighlighting(language.defaultHighlightStyle, {
              fallback: true,
            }),
            language.bracketMatching(),
            autocomplete.closeBrackets(),
            autocomplete.autocompletion(),
            view.rectangularSelection(),
            view.crosshairCursor(),
            search.highlightSelectionMatches(),
            view.keymap.of([
              ...autocomplete.closeBracketsKeymap,
              ...commands.defaultKeymap,
              ...search.searchKeymap,
              ...commands.historyKeymap,
              ...language.foldKeymap,
              ...autocomplete.completionKeymap,
              ...lint.lintKeymap,
            ]),
            html(),
            EditorView.updateListener.of((v) => {
              if (v.docChanged) {
                props.onInput?.(editor.state.doc.toString())
              }
            }),
          ],
          parent: el,
        })

        createEffect(() => {
          const v = props.value
          if (editor.state.doc.toString() == v) {
            return
          }
          editor.dispatch(
            editor.state.update({
              changes: { from: 0, to: editor.state.doc.length, insert: v },
            }),
          )
        })
      }}
    />
  )
}

interface IntegratedFieldPropsBase<T> {
  label: JSX.Element
  type: T
  placeholder?: string
  font?: string
  sizePx?: number
  value?: string
  onInput: (value: string) => void
  emptyBg?: boolean
  sticky?: boolean
  onSticky?: (sticky: boolean) => void
}

interface IntegratedFieldPropsText<T> extends IntegratedFieldPropsBase<T> {
  rtl: boolean
}

interface IntegratedFieldPropsHTML<T> extends IntegratedFieldPropsText<T> {
  sticky?: boolean
  onSticky?: (sticky: boolean) => void
  showHtml?: boolean
  onShowHtml?: (showHtmlEditor: boolean) => void
}

type IntegratedFieldProps =
  | IntegratedFieldPropsBase<"tags">
  | IntegratedFieldPropsText<"text" | "number">
  | IntegratedFieldPropsHTML<"html">

export function IntegratedField(props: IntegratedFieldProps) {
  const id = randomId().toString()
  let el!: HTMLDivElement

  return (
    <div
      class="z-field flex cursor-text flex-col rounded-lg p-0 shadow-none [&:has(button:focus)]:ring-0"
      classList={{
        "bg-z-body-selected": !props.emptyBg,
        "border-transparent": !props.emptyBg,
        " [&:has(button:focus)]:border-transparent": !props.emptyBg,
        " [&:has(button:focus)]:border-z": props.emptyBg,
      }}
      onMouseDown={(event) => {
        if (event.currentTarget == event.target) {
          event.preventDefault()
          el.focus()
        }
      }}
    >
      <div
        id={id}
        class="mb-1 flex w-full select-none gap-2 px-2 pt-1 text-sm text-z-subtitle"
        onMouseDown={(event) => {
          event.preventDefault()
          el.focus()
        }}
        contentEditable={false}
      >
        <div>{props.label}</div>

        <Show
          when={
            typeof props.sticky == "boolean" ||
            (props.type == "html" && typeof props.showHtml == "boolean")
          }
        >
          <div class="ml-auto flex translate-y-1 gap-2">
            <Show
              when={props.type == "html" && typeof props.showHtml == "boolean"}
            >
              <button
                class="z-field -m-1 rounded border-transparent bg-transparent p-1 shadow-none focus-visible:bg-z-body"
                onClick={() => {
                  if (props.type == "html") {
                    props.onShowHtml?.(!props.showHtml)
                  }
                }}
              >
                <Fa class="h-4 w-4" icon={faCode} title="toggle html view" />
              </button>
            </Show>

            <Show when={typeof props.sticky == "boolean"}>
              <button
                class="z-field -m-1 rounded border-transparent bg-transparent p-1 shadow-none focus-visible:bg-z-body"
                onClick={() => {
                  props.onSticky?.(!props.sticky)
                }}
              >
                <Fa
                  class="h-4 w-4"
                  icon={props.sticky ? faSolidSticky : faRegularSticky}
                  title="toggle sticky"
                />
              </button>
            </Show>
          </div>
        </Show>
      </div>

      {props.type == "html" ? (
        <>
          <div
            ref={(e) => {
              el = e
              el.innerHTML = sanitize(props.value ?? "")
              createEffect(() => {
                const next = sanitize(props.value ?? "")
                if (el.innerHTML != next) {
                  el.innerHTML = next
                }
              })
            }}
            aria-labelledby={id}
            class="-mt-1 w-full bg-transparent px-2 pb-1 focus:outline-none"
            contentEditable
            tabIndex={0}
            style={{
              "font-family": props.font,
              "font-size": props.sizePx ? `${props.sizePx / 16}rem` : "",
            }}
            dir={props.rtl ? "rtl" : "ltr"}
            onInput={(el) => props.onInput?.(el.currentTarget.innerHTML)}
          />

          <Show when={props.showHtml}>{IntegratedHTMLField(props)}</Show>
        </>
      ) : props.type == "tags" ? (
        IntegratedTagField(props, id)
      ) : (
        <input
          ref={(e) => (el = e)}
          type={props.type}
          class="z-field-number -mt-1 block w-full bg-transparent px-2 pb-1 placeholder:text-z-subtitle placeholder:opacity-30 focus:outline-none"
          aria-labelledby={id}
          onInput={(el) => props.onInput?.(el.currentTarget.value)}
          value={props.value ?? ""}
          placeholder={props.placeholder}
          style={{
            "font-family": props.font,
            "font-size": props.sizePx ? `${props.sizePx / 16}rem` : "",
          }}
        />
      )}
    </div>
  )
}
