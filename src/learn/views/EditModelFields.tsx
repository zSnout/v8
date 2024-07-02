import { Fa } from "@/components/Fa"
import { Checkbox } from "@/components/fields/CheckboxGroup"
import { alert, confirm, ModalDescription, prompt } from "@/components/Modal"
import { notNull } from "@/components/pray"
import {
  faCheck,
  faGripVertical,
  faKey,
  faPencil,
  faPlus,
  faTrash,
  IconDefinition,
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
import { safeParse } from "valibot"
import { createField } from "../defaults"
import { Model, ModelField, ModelFields } from "../types"
import { AutocompleteFontFamily } from "./AutocompleteFonts"
import { IntegratedField } from "./IntegratedField"

function Action(props: {
  icon: IconDefinition
  label: string
  onClick?: () => void
  shrinks?: boolean
  center?: boolean
}) {
  return (
    <button
      class="z-field flex w-full items-center gap-2 border-transparent bg-z-body-selected px-2 py-1 shadow-none"
      classList={{ "justify-center": props.center }}
      onClick={props.onClick}
    >
      <div class="flex h-6 items-center justify-center">
        <Fa class="h-4 w-4" icon={props.icon} title={false} />
      </div>
      <div classList={{ "max-sm:sr-only": props.shrinks }}>{props.label}</div>
    </button>
  )
}

export function EditModelFields(props: {
  model: Model
  close: (model: Model) => void
}) {
  const [model, setModel] = createSignal(props.model)
  const [fields, setFields] = createSignal<DndItem[]>(model().fields)
  createEffect(() => setFields(model().fields))
  const [selectedId, setSelectedId] = createSignal(fields()[0]?.id)
  const selectedIndex = createMemo(() => {
    const field = model().fields.findIndex((x) => x.id == selectedId())
    return notNull(field, "There must be a field selected in the explorer.")
  })
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const selected = createMemo(() => model().fields[selectedIndex()]!)

  const owner = getOwner()

  return (
    <div class="flex min-h-full w-full flex-col gap-8">
      <IntegratedField
        label="Editing fields of"
        rtl={false}
        type="text"
        value={model().name}
        onInput={(value) => setModel((model) => ({ ...model, name: value }))}
      />

      <div class="grid w-full gap-6 sm:grid-cols-[auto,16rem]">
        {FieldList()}
        {SideActions()}
      </div>

      {FieldOptions()}

      <div class="mx-auto mt-auto w-full max-w-96">
        <Action icon={faCheck} label="Save changes" center />
      </div>
    </div>
  )

  function setSelected(fn: ModelField | ((x: ModelField) => ModelField)) {
    const idx = untrack(selectedIndex)
    if (typeof fn == "function") {
      fn = fn(untrack(selected))
    }
    setModel((model) => {
      return {
        ...model,
        fields: model.fields.with(idx, fn),
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
      cancelText: "Cancel",
      okText: "Continue",
    })
  }

  async function pickFieldName(title: string, cancelName?: string | undefined) {
    let first = true

    while (true) {
      const name = await prompt({
        owner,
        title,
        description: first ? undefined : (
          <ModalDescription>
            That field name is already used. Please pick a different name, or
            cancel the action.
          </ModalDescription>
        ),
      })

      if (name == null || name == cancelName) {
        return
      }

      if (!model().fields.some((x) => x.name == name)) {
        return name
      }

      first = false
    }
  }

  function FieldOptions() {
    return (
      <div class="flex flex-col gap-1">
        <IntegratedField
          label="Description"
          rtl={selected().rtl}
          font={selected().font}
          sizePx={selected().size}
          value={selected().desc}
          onInput={(y) => {
            setSelected((x) => ({ ...x, desc: y }))
          }}
          type="text"
          placeholder="Placeholder to show when no value is typed in"
        />

        <div class="grid grid-cols-[1fr,8rem] gap-1">
          <AutocompleteFontFamily
            label="Editing Font"
            placeholder="(optional)"
            value={selected().font}
            onChange={(font) => {
              setSelected((field) => ({ ...field, font }))
            }}
          />

          <IntegratedField
            label="Size"
            rtl={false}
            type="number"
            placeholder="(optional)"
          />
        </div>

        <div class="flex flex-col gap-1 rounded-lg bg-z-body-selected px-2 pb-1 pt-1">
          <p class="text-sm text-z-subtitle">Other options</p>

          <label class="flex w-full gap-2">
            <Checkbox
              circular
              checked={model().sort_field == selectedIndex()}
              onInput={() =>
                setModel((model) => ({ ...model, sort_field: selectedIndex() }))
              }
            />

            <p>Sort by this field in the browser</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={selected().rtl}
              onInput={(rtl) => setSelected((x) => ({ ...x, rtl }))}
            />

            <p>Edit as right-to-left text</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={selected().html}
              onInput={(html) => setSelected((x) => ({ ...x, html }))}
            />

            <p>Default to editing raw HTML</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={selected().collapsed}
              onInput={(collapsed) => setSelected((x) => ({ ...x, collapsed }))}
            />

            <p>Collapse field in card creator</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={selected().excludeFromSearch}
              onInput={(excludeFromSearch) =>
                setSelected((x) => ({ ...x, excludeFromSearch }))
              }
            />

            <p>Exclude from unqualified searches</p>
          </label>
        </div>
      </div>
    )
  }

  function SideActions() {
    return (
      <div class="grid h-fit grid-cols-2 gap-1 sm:grid-cols-1">
        <Action
          icon={faPlus}
          label="Add"
          onClick={async () => {
            if (!(await confirmImportantChange("Adding a new field"))) {
              return
            }

            const fieldName = await pickFieldName("New field name")

            if (!fieldName) {
              return
            }

            setModel((model) => ({
              ...model,
              fields: model.fields.concat(createField(fieldName)),
            }))
          }}
        />

        <Action
          icon={faTrash}
          label="Delete"
          onClick={async () => {
            if (model().fields.length <= 1) {
              await alert({
                owner,
                title: "Unable to delete",
                description: (
                  <ModalDescription>
                    Card types need at least one field.
                  </ModalDescription>
                ),
              })
              return
            }

            if (!(await confirmImportantChange("Removing this field"))) {
              return
            }

            batch(() => {
              const index = selectedIndex()

              const model = setModel((model) => ({
                ...model,
                fields: model.fields.toSpliced(index, 1),
              }))

              setSelectedId(
                model.fields[Math.min(index, model.fields.length - 1)]!.id,
              )
            })
          }}
        />

        <Action
          icon={faPencil}
          label="Rename"
          onClick={async () => {
            const fieldName = await pickFieldName(
              "New field name",
              selected().name,
            )

            if (!fieldName) {
              return
            }

            setSelected((field) => ({ ...field, name: fieldName }))
          }}
        />
      </div>
    )
  }

  function FieldList() {
    const sortId = createMemo(() => model().fields[model().sort_field]?.id)

    return (
      <div
        class="flex max-h-72 min-h-48 flex-col overflow-x-clip overflow-y-scroll rounded-lg border border-z pb-8"
        ref={(el) => {
          dndzone(el, () => ({
            items: fields,
            flipDurationMs: 0,
            dropTargetClasses: ["!outline-none"],
            zoneTabIndex: -1,
          }))
        }}
        onconsider={({ detail: { items } }) => setFields(items)}
        onfinalize={({ detail: { items } }) => {
          const result = safeParse(ModelFields, items)
          if (result.success) {
            setFields(result.output)
            setModel((model) => {
              const prevSortField = notNull(
                model.fields[model.sort_field],
                "A sort field was not previously specified.",
              )
              const sortField = result.output.findIndex(
                (field) => field.id == prevSortField.id,
              )
              if (sortField == -1) {
                throw new Error("The sort field could not be moved.")
              }
              return {
                ...model,
                fields: result.output,
                sort_field: sortField,
              }
            })
          } else {
            throw new Error(
              "Model fields were in an invalid state after sorting.",
            )
          }
        }}
      >
        <For each={fields()}>
          {(field, index) => {
            return (
              <div
                class="-mx-px -mt-px flex items-center border border-z"
                classList={{
                  "bg-z-body": field.id != selectedId(),
                  "bg-z-body-selected": field.id == selectedId(),
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
                  onClick={() => setSelectedId(field.id)}
                >
                  {String(field["name"])}
                </button>
                <Show when={field.id == sortId()}>
                  <Fa class="h-3 w-3" icon={faKey} title="sort field" />
                </Show>
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
