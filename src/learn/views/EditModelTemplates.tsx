import { Fa } from "@/components/Fa"
import { MatchResult } from "@/components/MatchResult"
import { alert, confirm, ModalDescription, prompt } from "@/components/Modal"
import { notNull } from "@/components/pray"
import { error, ok } from "@/components/result"
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
  untrack,
} from "solid-js"
import { array, parse } from "valibot"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { IntegratedField } from "../el/IntegratedField"
import { createModelTemplate } from "../lib/defaults"
import { Id } from "../lib/id"
import { arrayToRecord } from "../lib/record"
import * as Template from "../lib/template"
import { Model, ModelTemplate } from "../lib/types"

// TODO: stop user from editing model name to potential ambiguity
export function EditModelTemplates(props: {
  /** The model to edit the templates of. */
  model: Model

  /** The fields record to use as a reference. */
  fields: Template.FieldsRecord

  /**
   * Called to close the modal. If a `model` is passed, it is the updated model.
   * If `null` is passed, it means that the edit action was canceled.
   */
  close: (model: Model | null) => void
}) {
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

  const owner = getOwner()

  return (
    <div class="flex min-h-full w-full flex-col gap-8">
      <IntegratedField
        label="Editing templates of"
        rtl={false}
        type="text"
        value={model().name}
        onInput={(value) => setModel((model) => ({ ...model, name: value }))}
      />

      <div class="grid w-full gap-6 sm:grid-cols-[auto,16rem]">
        {FieldList()}
        {SideActions()}
      </div>

      {TemplateOptions()}
      {SaveChanges()}
    </div>
  )

  function SaveChanges() {
    return (
      <TwoBottomButtons>
        <Action
          icon={faCancel}
          label="Cancel"
          center
          onClick={() => props.close(null)}
        />
        <Action
          icon={faCheck}
          label="Save changes"
          center
          onClick={() => {
            const m = model()
            props.close(m)
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

  function Preview(local: { tmpl: string; css: string }) {
    const compiled = createMemo(() => {
      const result = Template.parse(local.tmpl)
      if (!result.ok) {
        return result
      }
      const { value } = result
      const issues = Template.validate(value, props.fields)
      if (issues.length) {
        return error(issues.map(Template.issueToString).join("\n"))
      }
      return ok(value)
    })

    return (
      <MatchResult
        result={compiled()}
        fallback={(err) => (
          <div class="rounded-lg bg-z-body-selected px-3 py-2">
            <For each={err().split("\n")}>{(el) => <p>{el}</p>}</For>
          </div>
        )}
      >
        {(value) => (
          <Template.Render
            class="rounded-lg bg-z-body-selected px-3 py-2"
            html={Template.generate(value(), props.fields)}
            css={local.css}
          />
        )}
      </MatchResult>
    )
  }

  function TemplateOptions() {
    return (
      <div class="grid grid-cols-[auto,calc(375px_-_1.5rem)] gap-1">
        <IntegratedField
          label="Front Template"
          onInput={(value) => setSelected((tmpl) => ({ ...tmpl, qfmt: value }))}
          type="html-only"
          value={selected().qfmt}
          minHeight
        />

        <Preview tmpl={selected().qfmt} css={model().css} />

        <IntegratedField
          label="Back Template"
          onInput={(value) => setSelected((tmpl) => ({ ...tmpl, afmt: value }))}
          type="html-only"
          value={selected().afmt}
          minHeight
        />

        <Preview tmpl={selected().afmt} css={model().css} />

        <div class="col-span-2">
          <IntegratedField
            label="Styling (affects all templates)"
            onInput={(css) => setModel((model) => ({ ...model, css }))}
            type="css-only"
            value={model().css}
            minHeight
          />
        </div>
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

  function FieldList() {
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
}
