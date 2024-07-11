import { Fa } from "@/components/Fa"
import { faGripVertical, faKey } from "@fortawesome/free-solid-svg-icons"
import {
  DragDropProvider,
  DragDropSensors,
  DragEvent,
  DragOverlay,
  Id,
  SortableProvider,
  closestCenter,
  createSortable,
} from "@thisbeyond/solid-dnd"
import { For, Ref, Setter, Show, createSignal, mapArray } from "solid-js"

export function SortableFieldList<T extends { id: Id; name: string }>(props: {
  get: T[]
  set: Setter<T[]>
  selectedId: Id | undefined
  setSelectedId: (id: Id) => void
  sortId: Id | undefined
}) {
  const main = props

  const [activeItem, setActiveItem] = createSignal<number | string>()
  const ids = mapArray<T, number | string>(
    () => props.get,
    (x) => x.id,
  )

  return (
    <DragDropProvider
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetector={closestCenter}
    >
      <DragDropSensors />
      <div class="flex max-h-72 min-h-48 flex-col overflow-x-clip overflow-y-scroll rounded-lg border border-z pb-8">
        <SortableProvider ids={ids()}>
          <For each={props.get}>
            {(item, index) => <Item item={item} index={index()} />}
          </For>
        </SortableProvider>
      </div>
      <DragOverlay>
        <Show when={props.get.find((x) => x.id == activeItem())}>
          {(x) => <RawItem item={x()} index={null} hidden={false} />}
        </Show>
      </DragOverlay>
    </DragDropProvider>
  )

  function onDragStart({ draggable }: DragEvent) {
    setActiveItem(draggable.id)
  }

  function onDragEnd({ draggable, droppable }: DragEvent) {
    if (draggable && droppable) {
      const currentItems = ids()
      const fromIndex = currentItems.indexOf(draggable.id)
      const toIndex = currentItems.indexOf(droppable.id)
      if (fromIndex !== toIndex) {
        props.set((fields) => {
          const next = fields.slice()
          next.splice(toIndex, 0, ...next.splice(fromIndex, 1))
          return next
        })
      }
    }
  }

  function RawItem(props: {
    item: T
    index: number | null
    hidden: boolean
    ref?: Ref<HTMLDivElement>
  }) {
    return (
      <div
        class="-mx-px -mt-px flex items-center border border-z"
        classList={{
          "bg-z-body": props.item.id != main.selectedId,
          "bg-z-body-selected": props.item.id == main.selectedId,
          "opacity-20": props.hidden,
        }}
        ref={props.ref}
      >
        <div class="z-handle cursor-move py-1 pl-2 pr-1">
          <Fa class="h-4 w-4" icon={faGripVertical} title="drag to sort" />
        </div>
        <button
          class="flex-1 py-1 pl-1 pr-2 text-left"
          onClick={() => main.setSelectedId(+props.item.id as Id)}
        >
          {String(props.item.name)}
        </button>
        <Show when={props.item.id == main.sortId}>
          <Fa class="h-3 w-3" icon={faKey} title="sort field" />
        </Show>
        <div class="px-2 font-mono text-sm text-z-subtitle">
          {props.index == null ? "" : props.index + 1}
        </div>
      </div>
    )
  }

  function Item(props: { item: T; index: number }) {
    const sortable = createSortable(props.item.id)

    return (
      <RawItem
        hidden={sortable.isActiveDraggable}
        index={props.index}
        item={props.item}
        ref={sortable}
      />
    )
  }
}
