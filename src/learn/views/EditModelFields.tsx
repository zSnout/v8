import { Fa } from "@/components/Fa"
import { notNull } from "@/components/pray"
import {
  faGripVertical,
  faPencil,
  faPlus,
  faTrash,
  faUpDown,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import {
  closestCenter,
  createSortable,
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  useDragDropContext,
} from "@thisbeyond/solid-dnd"
import { createSignal, For, JSX } from "solid-js"
import { Model } from "../types"

function Sortable(props: { id: string | number; item: JSX.Element }) {
  const sortable = createSortable(props.id)
  const [state] = notNull(
    useDragDropContext(),
    "Can only be used in a `DragDropProvider`.",
  )
  return (
    <div
      use:sortable
      class="sortable"
      classList={{
        "opacity-25": sortable.isActiveDraggable,
        "transition-transform": !!state.active.draggable,
      }}
    >
      {props.item}
    </div>
  )
}

export const SortableVerticalListExample = () => {
  const [items, setItems] = createSignal<(string | number)[]>([1, 2, 3])
  const [activeItem, setActiveItem] = createSignal<string | number>()
  const ids = () => items()

  return (
    <DragDropProvider
      onDragStart={({ draggable }) => setActiveItem(draggable.id)}
      onDragEnd={({ draggable, droppable }) => {
        if (droppable) {
          const currentItems = ids()
          const fromIndex = currentItems.indexOf(draggable.id)
          const toIndex = currentItems.indexOf(droppable.id)
          if (fromIndex !== toIndex) {
            const updatedItems = currentItems.slice()
            updatedItems.splice(
              toIndex,
              0,
              ...updatedItems.splice(fromIndex, 1),
            )
            setItems(updatedItems)
          }
        }
      }}
      collisionDetector={closestCenter}
    >
      <DragDropSensors />
      <div class="flex flex-col self-stretch">
        <SortableProvider ids={ids()}>
          <For each={items()}>
            {(item) => <Sortable id={item} item={item} />}
          </For>
        </SortableProvider>
      </div>
      <DragOverlay>
        <div class="sortable">{activeItem()}</div>
      </DragOverlay>
    </DragDropProvider>
  )
}

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
  const [selected, setSelected] = createSignal(0)

  function Inner() {
    return (
      <div
        class="flex max-h-72 min-h-48 flex-col overflow-y-scroll rounded-lg border border-z"
        // ref={() => {
        //   // new Sortable(el, {
        //   //   animation: 150,
        //   //   scroll: true,
        //   //   ghostClass: "z-dragged",
        //   //   onChange(event) {
        //   //     const names = event.items.map((x) =>
        //   //       notNull(
        //   //         x.dataset["id"],
        //   //         "An id must be set on each element.",
        //   //       ),
        //   //     )
        //   //     const current = model().fields[selected()]
        //   //     batch(() => {
        //   //       const next = setModel((model) => ({
        //   //         ...model,
        //   //         fields: model.fields.toSorted(
        //   //           (a, b) => names.indexOf(a.name) - names.indexOf(b.name),
        //   //         ),
        //   //       }))
        //   //       const index = next.fields.findIndex(
        //   //         (value) => value == current,
        //   //       )
        //   //       setSelected(index)
        //   //     })
        //   //   },
        //   // })
        // }}
      >
        <For each={model().fields}>
          {(field, index) => {
            const sortable = createSortable(field.name)
            return (
              <div
                class="-mt-px flex items-center border-y border-z first:border-t-transparent [&.z-dragged]:bg-transparent"
                classList={{
                  "bg-z-body": index() != selected(),
                  "bg-z-body-selected": index() == selected(),
                }}
                data-id={field.name}
                ref={(el) => {
                  sortable.ref(el)
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
                  onClick={() => setSelected(index())}
                >
                  {field.name}
                </button>
              </div>
            )
          }}
        </For>
      </div>
    )
  }

  return (
    <div>
      <div class="grid gap-6 sm:grid-cols-[auto,16rem]">
        <DragDropProvider
          collisionDetector={closestCenter}
          onDragStart={(event) => {}}
        >
          <DragDropSensors />
          <SortableProvider ids={model().fields.map((x) => x.name)}>
            <Inner />
          </SortableProvider>
          <DragOverlay>hello</DragOverlay>
        </DragDropProvider>

        <div class="grid h-fit grid-cols-2 gap-2 sm:grid-cols-1">
          <Action icon={faPlus} label="Add" />
          <Action icon={faTrash} label="Delete" />
          <Action icon={faPencil} label="Rename" />
          <Action icon={faUpDown} label="Reposition" />
        </div>
      </div>
    </div>
  )
}
