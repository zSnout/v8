import { alert, confirm, ModalDescription, prompt } from "@/components/Modal"
import { notNull } from "@/components/pray"
import {
  faCancel,
  faCheck,
  faPencil,
  faPlus,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import {
  batch,
  createMemo,
  createSignal,
  getOwner,
  JSX,
  Setter,
  Show,
  untrack,
} from "solid-js"
import { createStore, SetStoreFunction, Store, unwrap } from "solid-js/store"
import { compareWithName } from "../lib/compare"
import type { Id } from "../lib/id"
import { Cloneable } from "../message"
import { Action, TwoBottomButtons } from "./BottomButtons"
import { defineLayer, type Layer, type LayerRenderInfo } from "./DefineLayer"
import { Layerable } from "./Layers"
import { createLoading } from "./Loading"
import { PlainFieldList, SortableFieldList } from "./Sortable"

interface DefineListEditorProps<
  Props,
  State extends { selected?: string | number },
  AsyncData,
  Entry extends { id: Id; name: string; deleted?: boolean },
> {
  tags(info: LayerRenderInfo<Props, State, AsyncData>): {
    title: string
    subtitle: string
  }
  getEntries(info: LayerRenderInfo<Props, State, AsyncData>): Entry[]
  save(
    info: LayerRenderInfo<Props, State, AsyncData>,
    state: State,
    entries: Entry[],
  ): void
  sortId(info: LayerRenderInfo<Props, State, AsyncData>): Id | null
  create(
    info: LayerRenderInfo<Props, State, AsyncData>,
    name: string,
    selected: Entry,
  ): Entry
  options: (info: {
    info: LayerRenderInfo<Props, State, AsyncData>
    get: Store<State>
    set: SetStoreFunction<State>
    selected: Entry
    setSelected: Setter<Entry>
  }) => JSX.Element
  internalProps: {
    add: string
    addIcon?: IconDefinition
    delete: string
    rename: string
    needAtLeastOne: string
    newFieldName: string
    initialMessage?: string
    full?: boolean
    noSort?: boolean | "by-name"
    thisActionWillDeleteACard?: string
    undeletable?: (entry: Entry) => boolean
  }
}

export function defineListEditor<
  Props,
  State extends { selected?: string | number },
  AsyncData,
  Entry extends { id: Id; name: string; deleted?: boolean },
>(
  list: DefineListEditorProps<Props, State, AsyncData, Entry>,
): Layer<Props, State, AsyncData>["render"] {
  const { internalProps, sortId, create, options: Options } = list
  return (info) => {
    const { pop, props } = info
    const { title, subtitle } = list.tags(info)
    const owner = getOwner()
    const [entries, setEntries] = createSignal(list.getEntries(info))
    const [state, setState] = createStore(info.state)
    const [selectedId, setSelectedId] = createSignal(
      notNull(
        state.selected ?? entries()[0]?.id,
        internalProps.needAtLeastOne as never,
      ),
    )
    const selectedIndex = createMemo(() => {
      const e = entries()
      const sid = selectedId()
      return notNull(
        e.findIndex((x) => x.id == sid),
        "Selected id must exist.",
      )
    })
    const selected = createMemo(() =>
      notNull(
        entries()[selectedIndex()],
        "`selectedIndex` should return a valid index.",
      ),
    )
    const setSelected = ((data: Entry | ((x: Entry) => Entry)) => {
      const d = typeof data == "function" ? data(untrack(selected)) : data
      setEntries((entries) => entries.with(selectedIndex(), d))
      return d
    }) as Setter<Entry>

    return (
      <div class="flex min-h-full w-full flex-col gap-8">
        <div class="w-full rounded-lg bg-z-body-selected px-2 py-1 text-center">
          {title} <span class="text-z-subtitle">— {subtitle}</span>
        </div>

        <div
          class="grid w-full gap-6 sm:grid-cols-[auto,16rem]"
          classList={{ "flex-1": internalProps.full }}
        >
          <Show
            when={internalProps.noSort}
            fallback={
              <SortableFieldList
                get={entries()}
                set={setEntries}
                selectedId={selectedId()}
                setSelectedId={(x) => {
                  setSelectedId(x)
                  info.state.selected = x
                }}
                sortId={sortId?.(info) ?? undefined}
                fullHeight={!!internalProps.full}
              />
            }
          >
            <PlainFieldList
              get={
                internalProps.noSort == "by-name" ?
                  entries().toSorted(compareWithName)
                : entries()
              }
              selectedId={selectedId()}
              setSelectedId={setSelectedId}
              sortId={sortId?.(info) ?? undefined}
              fullHeight={!!internalProps.full}
            />
          </Show>

          <SideActions />
        </div>

        <Options
          info={info}
          get={state}
          set={setState}
          selected={selected()}
          setSelected={setSelected}
        />

        <SaveChanges />
      </div>
    )

    async function confirmOneWaySync(description?: string) {
      return await confirm({
        owner,
        title: "Are you sure you want to do this?",
        get description() {
          return (
            <>
              <Show when={description}>
                {(el) => <ModalDescription>{el()}</ModalDescription>}
              </Show>

              <ModalDescription>
                This action will require a full upload of the database when you
                next synchronize your collection. If you have reviews or other
                changes waiting on another device that haven't been synchronized
                here yet, <u class="font-semibold text-z">they will be lost</u>.
                Continue?
              </ModalDescription>
            </>
          )
        },
        cancelText: "No, cancel",
        okText: "Yes, continue",
      })
    }

    async function pickName(title: string, cancelName?: string | undefined) {
      let first = true

      while (true) {
        const name = (
          await prompt({
            owner,
            title,
            description:
              first ? undefined : (
                <ModalDescription>
                  That name is already used. Please pick a different name, or
                  cancel the action.
                </ModalDescription>
              ),
          })
        )?.trim()

        if (name == null || name == cancelName) {
          return
        }

        if (!entries().some((x) => x.name.trim() == name)) {
          return name
        }

        first = false
      }
    }

    function SaveChanges() {
      return (
        <TwoBottomButtons>
          <Action icon={faCancel} label="Cancel" center onClick={() => pop()} />
          <Action
            icon={faCheck}
            label="Save changes"
            center
            onClick={() => {
              // TODO: saving is a possibly async operation
              list.save(info, structuredClone(unwrap(state)), entries())

              pop()
            }}
          />
        </TwoBottomButtons>
      )
    }

    function SideActions() {
      return (
        <div class="flex flex-col gap-1">
          <Action
            icon={internalProps.addIcon ?? faPlus}
            label={internalProps.add}
            onClick={async () => {
              if (!(await confirmOneWaySync())) {
                return
              }

              const name = await pickName(internalProps.newFieldName)

              if (!name) {
                return
              }

              const next = create(info, name, untrack(selected))

              batch(() => {
                setEntries((fields) => fields.concat(next))
                setSelectedId(next.id)
              })
            }}
          />

          <Action
            icon={faTrash}
            label={internalProps.delete}
            onClick={async () => {
              if (entries().length <= 1) {
                await alert({
                  owner,
                  title: "Unable to delete",
                  description: (
                    <ModalDescription>
                      {internalProps.needAtLeastOne}
                    </ModalDescription>
                  ),
                })
                return
              }

              if (
                !(await confirmOneWaySync(
                  internalProps.thisActionWillDeleteACard,
                ))
              ) {
                return
              }

              batch(() => {
                const sid = selectedId()

                const fields = setEntries((x) => {
                  const idx = x.findIndex((x) => x.id == sid)
                  if (idx == -1) return x
                  if (x.length <= 1)
                    throw new Error(internalProps.needAtLeastOne)
                  x.splice(idx, 1)
                  return [...x]
                })

                setSelectedId(
                  notNull(fields[0]?.id, internalProps.needAtLeastOne as never),
                )
              })
            }}
            disabled={internalProps.undeletable?.(selected())}
          />

          <Action
            icon={faPencil}
            label={internalProps.rename}
            onClick={async () => {
              const name = await pickName(
                internalProps.newFieldName,
                selected().name,
              )

              if (!name) {
                return
              }

              setSelected((field) => ({ ...field, name: name }))
            }}
          />
        </div>
      )
    }
  }
}

export function defineListEditorLayer<
  Props,
  State extends { selected?: string | number },
  AsyncData,
  Entry extends { id: Id; name: string; deleted?: boolean },
>(
  layer: Omit<Layer<Props, State, AsyncData>, "render">,
  list: DefineListEditorProps<Props, State, AsyncData, Entry>,
) {
  return defineLayer({ ...layer, render: defineListEditor(list) })
}

export function createListEditor<
  Props,
  AsyncProps,
  Item,
  Data extends Cloneable & object,
  Entry extends { id: Id; name: string; deleted?: boolean },
>(
  load: (
    props: Props,
    setMessage: Setter<string>,
  ) => Promise<{
    async: AsyncProps
    item: Item
    title: string
    subtitle: string
    save(item: Item): void
  }>,
  split: (props: {
    props: Props
    item: Item
    async: AsyncProps
  }) => readonly [Data, Entry[]],
  join: (props: {
    props: Props
    async: AsyncProps
    data: Data
    items: Entry[]
  }) => Item,
  sortId: ((data: Data) => Id | null) | null,
  create: (name: string, selected: Entry) => Entry,
  internalProps: {
    add: string
    addIcon?: IconDefinition
    delete: string
    rename: string
    needAtLeastOne: string
    newFieldName: string
    initialMessage?: string
    full?: boolean
    noSort?: boolean | "by-name"
    thisActionWillDeleteACard?: string
    undeletable?: (entry: Entry) => boolean
  },
  Options: (props: {
    get: Store<Data>
    set: SetStoreFunction<Data>
    selected: Entry
    setSelected: Setter<Entry>
    props: Props
    async: AsyncProps
  }) => JSX.Element,
): Layerable<Props> {
  return createLoading(
    load,
    (props, { async, item, title, subtitle, save }, pop) => {
      const [initialData, initialEntries] = split({
        props,
        async,
        item: item,
      })
      const owner = getOwner()
      const [data, rawSetData] = createStore(initialData)
      const [entries, setEntries] = createSignal(initialEntries)
      const [selectedId, setSelectedId] = createSignal(
        notNull(entries()[0]?.id, internalProps.needAtLeastOne as never),
      )
      const selectedIndex = createMemo(() => {
        const e = entries()
        const sid = selectedId()
        return notNull(
          e.findIndex((x) => x.id == sid),
          "Selected id must exist.",
        )
      })
      const selected = createMemo(() =>
        notNull(
          entries()[selectedIndex()],
          "`selectedIndex` should return a valid index.",
        ),
      )
      let changed = false // TODO: use this
      const setData = function (this: any) {
        ;(rawSetData as any).apply(this, arguments)
        changed = true
      } as SetStoreFunction<Data>
      const setSelected = ((data: Entry | ((x: Entry) => Entry)) => {
        const d = typeof data == "function" ? data(untrack(selected)) : data
        setEntries((entries) => entries.with(selectedIndex(), d))
        return d
      }) as Setter<Entry>

      return {
        el: (
          <div class="flex min-h-full w-full flex-col gap-8">
            <div class="w-full rounded-lg bg-z-body-selected px-2 py-1 text-center">
              {title} <span class="text-z-subtitle">— {subtitle}</span>
            </div>

            <div
              class="grid w-full gap-6 sm:grid-cols-[auto,16rem]"
              classList={{ "flex-1": internalProps.full }}
            >
              <Show
                when={internalProps.noSort}
                fallback={
                  <SortableFieldList
                    get={entries()}
                    set={setEntries}
                    selectedId={selectedId()}
                    setSelectedId={setSelectedId}
                    sortId={sortId?.(data) ?? undefined}
                    fullHeight={!!internalProps.full}
                  />
                }
              >
                <PlainFieldList
                  get={
                    internalProps.noSort == "by-name" ?
                      entries().toSorted(compareWithName)
                    : entries()
                  }
                  selectedId={selectedId()}
                  setSelectedId={setSelectedId}
                  sortId={sortId?.(data) ?? undefined}
                  fullHeight={!!internalProps.full}
                />
              </Show>

              <SideActions />
            </div>

            <Options
              async={async}
              props={props}
              get={data}
              set={setData}
              selected={selected()}
              setSelected={setSelected}
            />

            <SaveChanges />
          </div>
        ),
        onForcePop,
      }

      async function onForcePop(): Promise<boolean> {
        // TODO: this should do something
        return true
      }

      async function confirmOneWaySync(description?: string) {
        return await confirm({
          owner,
          title: "Are you sure you want to do this?",
          get description() {
            return (
              <>
                <Show when={description}>
                  {(el) => <ModalDescription>{el()}</ModalDescription>}
                </Show>

                <ModalDescription>
                  This action will require a full upload of the database when
                  you next synchronize your collection. If you have reviews or
                  other changes waiting on another device that haven't been
                  synchronized here yet,{" "}
                  <u class="font-semibold text-z">they will be lost</u>.
                  Continue?
                </ModalDescription>
              </>
            )
          },
          cancelText: "No, cancel",
          okText: "Yes, continue",
        })
      }

      async function pickName(title: string, cancelName?: string | undefined) {
        let first = true

        while (true) {
          const name = (
            await prompt({
              owner,
              title,
              description:
                first ? undefined : (
                  <ModalDescription>
                    That name is already used. Please pick a different name, or
                    cancel the action.
                  </ModalDescription>
                ),
            })
          )?.trim()

          if (name == null || name == cancelName) {
            return
          }

          if (!entries().some((x) => x.name.trim() == name)) {
            return name
          }

          first = false
        }
      }

      function SaveChanges() {
        return (
          <TwoBottomButtons>
            <Action
              icon={faCancel}
              label="Cancel"
              center
              onClick={() => pop()}
            />
            <Action
              icon={faCheck}
              label="Save changes"
              center
              onClick={() => {
                // TODO: saving is a possibly async operation
                save(
                  join({
                    props,
                    async,
                    data: structuredClone(unwrap(data)),
                    items: entries(),
                  }),
                )

                pop()
              }}
            />
          </TwoBottomButtons>
        )
      }

      function SideActions() {
        return (
          <div class="flex flex-col gap-1">
            <Action
              icon={internalProps.addIcon ?? faPlus}
              label={internalProps.add}
              onClick={async () => {
                if (!(await confirmOneWaySync())) {
                  return
                }

                const name = await pickName(internalProps.newFieldName)

                if (!name) {
                  return
                }

                const next = create(name, untrack(selected))

                batch(() => {
                  setEntries((fields) => fields.concat(next))
                  setSelectedId(next.id)
                })
              }}
            />

            <Action
              icon={faTrash}
              label={internalProps.delete}
              onClick={async () => {
                if (entries().length <= 1) {
                  await alert({
                    owner,
                    title: "Unable to delete",
                    description: (
                      <ModalDescription>
                        {internalProps.needAtLeastOne}
                      </ModalDescription>
                    ),
                  })
                  return
                }

                if (
                  !(await confirmOneWaySync(
                    internalProps.thisActionWillDeleteACard,
                  ))
                ) {
                  return
                }

                batch(() => {
                  const sid = selectedId()

                  const fields = setEntries((x) => {
                    const idx = x.findIndex((x) => x.id == sid)
                    if (idx == -1) return x
                    if (x.length <= 1)
                      throw new Error(internalProps.needAtLeastOne)
                    x.splice(idx, 1)
                    return [...x]
                  })

                  setSelectedId(
                    notNull(
                      fields[0]?.id,
                      internalProps.needAtLeastOne as never,
                    ),
                  )
                })
              }}
              disabled={internalProps.undeletable?.(selected())}
            />

            <Action
              icon={faPencil}
              label={internalProps.rename}
              onClick={async () => {
                const name = await pickName(
                  internalProps.newFieldName,
                  selected().name,
                )

                if (!name) {
                  return
                }

                setSelected((field) => ({ ...field, name: name }))
              }}
            />
          </div>
        )
      }
    },
    internalProps.initialMessage,
  )
}
