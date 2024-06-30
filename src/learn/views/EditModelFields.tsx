import { Fa } from "@/components/Fa"
import {
  faGripVertical,
  faPencil,
  faPlus,
  faTrash,
  faUpDown,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { DndItem, dndzone } from "solid-dnd-directive"
import { createSignal, For } from "solid-js"
import { safeParse } from "valibot"
import { Model, ModelFields } from "../types"

// TODO: remove @thisbeyond/solid-dnd
// TODO: remove tiptap

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
  const [selected, setSelected] = createSignal(fields()[0]?.id)

  return (
    <div>
      <div class="grid gap-6 sm:grid-cols-[auto,16rem]">
        {FieldList()}

        <div class="grid h-fit grid-cols-2 gap-2 sm:grid-cols-1">
          <Action icon={faPlus} label="Add" />
          <Action icon={faTrash} label="Delete" />
          <Action icon={faPencil} label="Rename" />
          <Action icon={faUpDown} label="Reposition" />
        </div>
      </div>
    </div>
  )

  function FieldList() {
    return (
      <div
        class="flex max-h-72 min-h-48 flex-col overflow-x-clip overflow-y-scroll rounded-lg border border-z"
        ref={(el) => {
          dndzone(el, () => ({
            items: fields,
            flipDurationMs: 0,
            dropTargetClasses: ["!outline-none"],
          }))
        }}
        onconsider={({ detail: { items } }) => setFields(items)}
        onfinalize={({ detail: { items } }) => {
          const result = safeParse(ModelFields, items)
          if (result.success) {
            setFields(result.output)
            setModel((model) => ({ ...model, fields: result.output }))
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
                class="-mx-px -mt-px flex items-center border border-z [&.z-dragged]:bg-transparent"
                classList={{
                  "bg-z-body": field.id != selected(),
                  "bg-z-body-selected": field.id == selected(),
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
                  onClick={() => setSelected(field.id)}
                >
                  {String(field["name"])}
                </button>
                <div class="ml-auto pr-2 font-mono text-sm text-z-subtitle">
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
