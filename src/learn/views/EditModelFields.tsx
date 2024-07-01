import { Fa } from "@/components/Fa"
import { notNull } from "@/components/pray"
import {
  faGripVertical,
  faKey,
  faPencil,
  faPlus,
  faTrash,
  faUpDown,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { DndItem, dndzone } from "solid-dnd-directive"
import { createMemo, createSignal, For, Show, untrack } from "solid-js"
import { safeParse } from "valibot"
import { Model, ModelField, ModelFields } from "../types"
import { IntegratedField } from "./IntegratedField"
import { AutocompleteFontFamily } from "./AutocompleteFonts"
import { AutocompleteBox } from "./AutocompleteBox"

function Action(props: {
  icon: IconDefinition
  label: string
  onClick?: () => void
}) {
  return (
    <button class="z-field flex w-full items-center gap-2 border-transparent bg-z-body-selected px-2 py-1 shadow-none">
      <Fa class="h-4 w-4" icon={props.icon} title={false} />
      {props.label}
    </button>
  )
}

export function EditModelFields(props: {
  model: Model
  close: (model: Model) => void
}) {
  const [model, setModel] = createSignal(props.model)
  const [fields, setFields] = createSignal<DndItem[]>(model().fields)
  const [selectedId, setSelectedId] = createSignal(fields()[0]?.id)
  const selectedIndex = createMemo(() => {
    const field = model().fields.findIndex((x) => x.id == selectedId())
    return notNull(field, "There must be a field selected in the explorer.")
  })
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const selected = createMemo(() => model().fields[selectedIndex()]!)
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

  return (
    <div class="flex w-full flex-col gap-8">
      <div class="mx-auto flex w-72 max-w-full items-baseline gap-1">
        <div class="whitespace-nowrap">Fields of</div>
        <input
          class="z-field flex-1 border-transparent bg-z-body-selected px-1 py-0 text-left shadow-none"
          type="text"
          value={model().name}
          onInput={(x) =>
            setModel((model) => {
              return { ...model, name: x.currentTarget.value }
            })
          }
        />
      </div>

      <div class="grid w-full gap-6 sm:grid-cols-[auto,16rem]">
        {FieldList()}

        <div class="grid h-fit grid-cols-2 gap-1 sm:grid-cols-1">
          {/* TODO: all of these need click actions */}
          <Action icon={faPlus} label="Add" />
          <Action icon={faTrash} label="Delete" />
          <Action icon={faPencil} label="Rename" />
          <Action icon={faUpDown} label="Reposition" />
        </div>
      </div>

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
          type="plain"
          placeholder="Placeholder to show when no value is typed in"
        />

        <AutocompleteFontFamily label="Editing Font" placeholder="(optional)" />
      </div>
    </div>
  )

  function FieldList() {
    const sortId = createMemo(() => model().fields[model().sort_field]?.id)

    return (
      <div
        class="flex max-h-72 min-h-48 flex-col overflow-x-clip overflow-y-scroll rounded-lg border border-z"
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
