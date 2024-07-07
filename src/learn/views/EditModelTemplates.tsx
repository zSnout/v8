import { Fa } from "@/components/Fa"
import { Checkbox } from "@/components/fields/CheckboxGroup"
import { MatchResult } from "@/components/MatchResult"
import { alert, confirm, ModalDescription, prompt } from "@/components/Modal"
import { notNull } from "@/components/pray"
import { error, ok, Result } from "@/components/result"
import {
  faCancel,
  faCheck,
  faGripVertical,
  faPencil,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { DndItem, dndzone } from "solid-dnd-directive"
import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  getOwner,
  Show,
  untrack,
} from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import { array, parse } from "valibot"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { IntegratedField } from "../el/IntegratedField"
import { Layerable } from "../el/Layers"
import { createModelTemplate } from "../lib/defaults"
import { Id } from "../lib/id"
import { arrayToRecord } from "../lib/record"
import * as Template from "../lib/template"
import {
  Model,
  ModelTemplate,
  NoteFields,
  TemplateEditStyle,
} from "../lib/types"

// TODO: stop user from editing model name to potential ambiguity
export const EditModelTemplates = ((props, pop) => {
  const [model, setModel] = createSignal(props.model)
  const [tmpls, setTemplates] = createSignal<DndItem[]>(
    Object.values(model().tmpls),
  )
  createEffect(() => setTemplates(Object.values(model().tmpls)))
  const [selectedId, setSelectedId] = createSignal(
    Object.values(model().tmpls)[0]?.id,
  )
  const selected = createMemo(() => {
    const tmpl = model().tmpls[selectedId() ?? 0]
    return notNull(tmpl, "There must be a template selected in the explorer.")
  })
  const [editStyle, setEditStyle] = createStore(
    structuredClone(props.editStyle),
  )
  const layout = createMemo(() => {
    const triple = editStyle.theme.light && editStyle.theme.dark

    if (editStyle.row == "all-separate") {
      return "all-separate"
    } else if (editStyle.row == "separate") {
      if (triple) {
        return "separate"
      } else {
        return "all-separate"
      }
    } else if (triple) {
      return "triple"
    } else {
      return "dual"
    }
  })
  const owner = getOwner()
  const [fields, setFields] = createStore<NoteFields>(props.fieldsInitial)
  const [html, setHtml] = createStore<Record<string, boolean>>({})

  return {
    el: (
      <div class="flex min-h-full w-full flex-col gap-8">
        <IntegratedField
          label="Editing templates of"
          rtl={false}
          type="text"
          value={model().name}
          onInput={(value) => setModel((model) => ({ ...model, name: value }))}
        />

        <div class="grid w-full gap-x-6 gap-y-8 sm:grid-cols-[auto,16rem]">
          {TemplateList()}
          {SideActions()}
        </div>

        {EditingOptions()}
        {Templates()}
        {EditFields()}
        {SaveChanges()}
      </div>
    ),
    // TODO: make this show a "save changes?" dialog
    onForcePop: () => true,
  }

  function EditFields() {
    return (
      <div class="flex flex-col gap-1">
        <For each={Object.values(model().fields)}>
          {(field) => (
            <IntegratedField
              label={field.name}
              rtl={field.rtl}
              font={field.font}
              sizePx={field.size}
              type="html"
              placeholder={field.desc}
              value={fields[field.name]}
              onInput={(value) => setFields(field.name + "", value)}
              showHtml={html[field.name] ?? false}
              onShowHtml={(show) => setHtml(field.name + "", show)}
            />
          )}
        </For>
      </div>
    )
  }

  function SaveChanges() {
    return (
      <TwoBottomButtons>
        <Action icon={faCancel} label="Cancel" center onClick={pop} />
        <Action
          icon={faCheck}
          label="Save changes"
          center
          onClick={() => {
            const m = model()
            props.save(m, structuredClone(unwrap(editStyle)))
            pop()
          }}
        />
      </TwoBottomButtons>
    )
  }

  function setSelected(
    fn: ModelTemplate | ((x: ModelTemplate) => ModelTemplate),
  ) {
    if (typeof fn == "function") {
      fn = fn(untrack(selected))
    }
    setModel((model) => {
      return {
        ...model,
        tmpls: { ...model.tmpls, [fn.id]: fn },
      }
    })
  }

  async function confirmImportantChange(ingVerb: string) {
    return await confirm({
      owner,
      title: "Are you sure you want to do this?",
      get description() {
        return (
          <ModalDescription>
            {ingVerb} will require a full upload of the database when you next
            synchronize your collection. If you have reviews or other changes
            waiting on another device that haven't been synchronized here yet,{" "}
            <u class="font-semibold text-z">they will be lost</u>. Continue?
          </ModalDescription>
        )
      },
      cancelText: "No, cancel",
      okText: "Yes, continue",
    })
  }

  async function pickTemplateName(
    title: string,
    cancelName?: string | undefined,
  ) {
    let first = true

    while (true) {
      const name = await prompt({
        owner,
        title,
        description: first ? undefined : (
          <ModalDescription>
            That template name is already used. Please pick a different name, or
            cancel the action.
          </ModalDescription>
        ),
      })

      if (name == null || name == cancelName) {
        return
      }

      if (!Object.values(model().tmpls).some((x) => x.name == name)) {
        return name
      }

      first = false
    }
  }

  function Preview(local: {
    theme: "light" | "dark" | "auto"
    html: Result<string>
    css: string
  }) {
    return (
      <MatchResult
        result={local.html}
        fallback={(err) => (
          <div
            class={
              "min-h-48 rounded-lg bg-z-body-selected px-3 py-2 text-z " +
              local.theme
            }
          >
            <For each={err().split("\n")}>{(el) => <p>{el}</p>}</For>
          </div>
        )}
      >
        {(value) => (
          <Template.Render
            class={
              "min-h-48 rounded-lg bg-z-body-selected px-3 py-2 " + local.theme
            }
            html={value()}
            css={local.css}
            theme={local.theme}
          />
        )}
      </MatchResult>
    )
  }

  function Templates() {
    const qhtml = createMemo(() => {
      const result = Template.parse(selected()["qfmt"])
      if (!result.ok) {
        return result
      }
      const { value } = result
      const issues = Template.validate(value, unwrap(fields), {
        FrontSide: undefined,
      })
      if (issues.length) {
        return error(issues.map(Template.issueToString).join("\n"))
      }
      return ok(Template.generate(value, fields, { FrontSide: undefined }))
    })

    const ahtml = createMemo(() => {
      const result = Template.parse(selected()["afmt"])
      if (!result.ok) {
        return result
      }
      const { value } = result
      const q = qhtml()
      const qh = q.ok ? q.value : "error while rendering FrontSide"
      const issues = Template.validate(value, fields, { FrontSide: qh })
      if (issues.length) {
        return error(issues.map(Template.issueToString).join("\n"))
      }
      return ok(Template.generate(value, fields, { FrontSide: qh }))
    })

    return (
      <div
        class="flex flex-col gap-4"
        classList={{ "md:gap-1": editStyle.row == "inline" }}
      >
        <Show when={editStyle.template.front}>
          {SingleTemplate("qfmt", qhtml)}
        </Show>
        <Show when={editStyle.template.back}>
          {SingleTemplate("afmt", ahtml)}
        </Show>
        <Show when={editStyle.template.styling}>{Styling()}</Show>
        <Show
          when={
            !(
              editStyle.template.front ||
              editStyle.template.back ||
              editStyle.template.styling
            )
          }
        >
          <div class="rounded-lg bg-z-body-selected px-2 py-1 text-center italic">
            Select "Front", "Back", or "Styling" to start editing.
          </div>
        </Show>
      </div>
    )
  }

  function Styling() {
    return (
      <IntegratedField
        label="Styling (affects all templates)"
        onInput={(css) => setModel((model) => ({ ...model, css }))}
        type="css-only"
        value={model().css}
        minHeight
      />
    )
  }

  function EditingOptions() {
    return (
      <div class="grid grid-cols-1 gap-1 rounded-lg bg-z-body-selected sm:grid-cols-3">
        <CheckboxContainer label="Templates shown">
          <label class="flex w-full gap-2">
            <Checkbox
              checked={editStyle.template.front}
              onInput={(v) => setEditStyle("template", "front", v)}
            />

            <p>Front</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={editStyle.template.back}
              onInput={(v) => setEditStyle("template", "back", v)}
            />

            <p>Back</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={editStyle.template.styling}
              onInput={(v) => setEditStyle("template", "styling", v)}
            />

            <p>Styling</p>
          </label>
        </CheckboxContainer>

        <CheckboxContainer label="Themes shown">
          <label class="flex w-full gap-2">
            <Checkbox
              checked={editStyle.theme.light}
              onInput={(v) => setEditStyle("theme", "light", v)}
            />

            <p>Light</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={editStyle.theme.dark}
              onInput={(v) => setEditStyle("theme", "dark", v)}
            />

            <p>Dark</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              circular
              checked={!(editStyle.theme.light || editStyle.theme.dark)}
              onInput={() => setEditStyle("theme", ["light", "dark"], false)}
            />

            <p>Auto</p>
          </label>
        </CheckboxContainer>

        <CheckboxContainer label="Grouping">
          <label class="flex w-full gap-2">
            <Checkbox
              circular
              checked={editStyle.row == "inline"}
              onInput={() => setEditStyle("row", "inline")}
            />

            <p>Inline (desktop only)</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              circular
              checked={editStyle.row == "separate"}
              onInput={() => setEditStyle("row", "separate")}
            />

            <p>Separate</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              circular
              checked={editStyle.row == "all-separate"}
              onInput={() => setEditStyle("row", "all-separate")}
              disabled={!(editStyle.theme.light && editStyle.theme.dark)}
            />

            <p
              classList={{
                "opacity-30": !(editStyle.theme.light && editStyle.theme.dark),
              }}
            >
              All separate
            </p>
          </label>
        </CheckboxContainer>
      </div>
    )
  }

  function SingleTemplate(type: "qfmt" | "afmt", html: () => Result<string>) {
    return (
      <div
        class="grid gap-1"
        classList={{
          "grid-cols-2": layout() == "triple",
          "md:grid-cols-3": layout() == "triple",
          "md:grid-cols-2": layout() == "dual" || layout() == "separate",
        }}
      >
        <div
          classList={{
            "col-span-2": layout() == "triple" || layout() == "separate",
            "md:col-span-1": layout() == "triple" || layout() == "dual",
          }}
        >
          <IntegratedField
            label={type == "afmt" ? "Back Template" : "Front Template"}
            onInput={(value) =>
              setSelected((tmpl) => ({ ...tmpl, [type]: value }))
            }
            type="html-only"
            value={selected()[type]}
            minHeight
          />
        </div>

        <Show when={editStyle.theme.light}>
          <Preview theme="light" html={html()} css={model().css} />
        </Show>
        <Show when={editStyle.theme.dark}>
          <Preview theme="dark" html={html()} css={model().css} />
        </Show>
        <Show when={!(editStyle.theme.light || editStyle.theme.dark)}>
          <Preview theme="auto" html={html()} css={model().css} />
        </Show>
      </div>
    )
  }

  function SideActions() {
    return (
      <div class="flex flex-col gap-1">
        <Action
          icon={faPlus}
          label="Add"
          onClick={async () => {
            if (!(await confirmImportantChange("Adding a new template"))) {
              return
            }

            const tmplName = await pickTemplateName("New template name")

            if (!tmplName) {
              return
            }

            setModel((model) => {
              const next = createModelTemplate("", "", tmplName)
              return {
                ...model,
                tmpls: { ...model.tmpls, [next.id]: next },
              }
            })
          }}
        />

        <Action
          icon={faTrash}
          label="Delete"
          onClick={async () => {
            if (Object.keys(model().tmpls).length <= 1) {
              await alert({
                owner,
                title: "Unable to delete",
                description: (
                  <ModalDescription>
                    Card types need at least one template.
                  </ModalDescription>
                ),
              })
              return
            }

            if (!(await confirmImportantChange("Removing this template"))) {
              return
            }

            batch(() => {
              const model = setModel((model) => {
                const { [selectedId() ?? 0]: _, ...tmpls } = model.tmpls
                return { ...model, tmpls }
              })

              setSelectedId(Object.values(model.tmpls)[0]!.id)
            })
          }}
        />

        <Action
          icon={faPencil}
          label="Rename"
          onClick={async () => {
            const tmplName = await pickTemplateName(
              "New template name",
              selected().name,
            )

            if (!tmplName) {
              return
            }

            setSelected((tmpl) => ({ ...tmpl, name: tmplName }))
          }}
        />
      </div>
    )
  }

  function TemplateList() {
    return (
      <div
        class="flex max-h-72 min-h-48 flex-col overflow-x-clip overflow-y-scroll rounded-lg border border-z pb-8"
        ref={(el) => {
          dndzone(el, () => ({
            items: tmpls,
            flipDurationMs: 0,
            dropTargetClasses: ["!outline-none"],
            zoneTabIndex: -1,
          }))
        }}
        onconsider={({ detail: { items } }) => setTemplates(items)}
        onfinalize={({ detail: { items } }) => {
          const result = parse(array(ModelTemplate), items)
          setTemplates(result)
          setModel((model) => ({ ...model, tmpls: arrayToRecord(result) }))
        }}
      >
        <For each={tmpls()}>
          {(tmpl, index) => {
            return (
              <div
                class="-mx-px -mt-px flex items-center border border-z"
                classList={{
                  "bg-z-body": tmpl.id != selectedId(),
                  "bg-z-body-selected": tmpl.id == selectedId(),
                }}
              >
                <div class="z-handle cursor-move py-1 pl-2 pr-1">
                  <Fa
                    class="h-4 w-4"
                    icon={faGripVertical}
                    title="drag to sort"
                  />
                </div>
                <button
                  class="flex-1 py-1 pl-1 pr-2 text-left"
                  onClick={() => setSelectedId(+tmpl.id as Id)}
                >
                  {String(tmpl["name"])}
                </button>
                <div class="px-2 font-mono text-sm text-z-subtitle">
                  {index() + 1}
                </div>
              </div>
            )
          }}
        </For>
      </div>
    )
  }
}) satisfies Layerable<{
  /** The model to edit the templates of. */
  model: Model

  /** The fields record to use as a reference. */
  fieldsInitial: Template.FieldsRecord

  /** The preferences of this app. */
  editStyle: TemplateEditStyle

  /** Called to save information. */
  save: (model: Model, editStyle: TemplateEditStyle) => void
}>
