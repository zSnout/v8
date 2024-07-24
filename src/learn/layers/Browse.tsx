import { Checkbox } from "@/components/fields/CheckboxGroup"
import { Unmain } from "@/components/Prose"
import {
  batch,
  createMemo,
  createSignal,
  For,
  untrack,
  type JSX,
} from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import { Worker } from "../db"
import { createPrefsStore } from "../db/prefs"
import { ContextMenuItem } from "../el/ContextMenu"
import { defineLayer } from "../el/DefineLayer"
import { createExpr } from "../lib/expr"
import { idOf, type Id } from "../lib/id"
import { BrowserColumn } from "../lib/types"

export const LAYER_BROWSE = defineLayer({
  init(_: Worker) {
    const [selected, setSelected] = createStore<Record<string, boolean>>({})
    const [selectFrom, setSelectFrom] = createSignal<Id>()
    const [selectTo, setSelectTo] = createSignal<Id>()
    const [selectInvert, setSelectInvert] = createSignal(false)
    return {
      selected,
      setSelected,
      selectFrom,
      setSelectFrom,
      selectTo,
      setSelectTo,
      selectInvert,
      setSelectInvert,
    }
  },
  async load({ props: worker }) {
    const data = await worker.post("browse_load")
    const [prefs, setPrefs, ready] = createPrefsStore(worker)
    await ready
    const [sorted, reloadSorted] = createExpr(() => data.cards)
    return [data, { prefs, setPrefs, sorted, reloadSorted }] as const
  },
  render({
    props: worker,
    data: [, { prefs, setPrefs, sorted, reloadSorted }],
    state: {
      selected,
      setSelected,
      selectFrom,
      setSelectFrom,
      selectTo,
      setSelectTo,
      selectInvert,
      setSelectInvert,
    },
  }) {
    const [mousedown, setMousedown] = createSignal(false)
    const ids = createMemo(() => sorted().map((x) => x.card.id))
    const selectFromIndex = createMemo(() => {
      const sf = selectFrom()
      if (sf == null) {
        return NaN
      } else {
        return ids().indexOf(sf)
      }
    })
    const selectToIndex = createMemo(() => {
      const st = selectTo()
      if (st == null) {
        return NaN
      } else {
        return ids().indexOf(st)
      }
    })

    addEventListener("mouseup", () => setMousedown(false))

    return (
      <div class="-my-8">
        <Unmain class="flex h-[calc(100vh_-_3rem)]">
          <div class="flex h-[calc(100vh_-_3rem)] w-full">
            <Sidebar />
            <Grid />
          </div>
        </Unmain>
      </div>
    )

    function getSelected() {
      const output = structuredClone(unwrap(selected))

      let siLow = selectFromIndex()
      let siHigh = selectToIndex()
      if (siLow > siHigh) {
        ;[siLow, siHigh] = [siHigh, siLow]
      }
      const value = !selectInvert()
      if (isFinite(siLow) && isFinite(siHigh)) {
        const allIds = ids()
        for (let index = siLow; index <= siHigh; index++) {
          output[allIds[index]!] = value
        }
      }

      return Object.entries(output)
        .filter((x) => x[1])
        .map((x) => idOf(x[0]))
    }

    function savePreviousSelection() {
      batch(() => {
        let siLow = selectFromIndex()
        let siHigh = selectToIndex()
        if (siLow > siHigh) {
          ;[siLow, siHigh] = [siHigh, siLow]
        }
        setSelectFrom()
        setSelectTo()
        const value = !selectInvert()
        setSelectInvert(false)
        if (isFinite(siLow) && isFinite(siHigh)) {
          const allIds = ids()
          const diff: Record<Id, boolean> = {}
          for (let index = siLow; index <= siHigh; index++) {
            diff[allIds[index]!] = value
          }
          setSelected(diff)
        }
      })
    }

    function Sidebar() {
      return (
        <div class="flex h-full w-56 flex-col gap-1 overflow-auto border-r border-z p-2">
          <For each={BrowserColumn.options}>
            {(name) => (
              <label class="flex w-full gap-2">
                <Checkbox
                  checked={prefs.browser.active_cols.includes(name)}
                  onInput={(v) => {
                    const cols = prefs.browser.active_cols

                    if (v) {
                      if (cols.includes(name)) return
                      setPrefs(`Toggle ${name} column visibility in browser`)(
                        "browser",
                        "active_cols",
                        (x: BrowserColumn[]) => x.concat(name),
                      )
                    } else {
                      const idx = cols.indexOf(name)
                      if (idx == -1) return
                      setPrefs(`Toggle ${name} column visibility in browser`)(
                        "browser",
                        "active_cols",
                        (x: BrowserColumn[]) => x.toSpliced(idx, 1),
                      )
                    }
                  }}
                />

                <p>{name}</p>
              </label>
            )}
          </For>
        </div>
      )
    }

    function GridContextMenu(): JSX.Element {
      return (
        <>
          <ContextMenuItem
            onClick={() => {
              const cids = getSelected()
              worker.post("browse_due_date_set", cids, Date.now())
            }}
          >
            Make due now
          </ContextMenuItem>
        </>
      )
    }

    function Grid() {
      return (
        <div class="flex-1 overflow-auto pb-8 text-sm">
          <table
            class="min-w-full border-b border-z"
            onCtx={({ detail }) => detail(GridContextMenu)}
          >
            <thead>
              <tr>
                <For each={prefs.browser.active_cols}>
                  {(x) => (
                    <th
                      class="sticky top-0 cursor-pointer select-none border-x border-z bg-z-body px-1 first:border-l-0 last:border-r-0"
                      onClick={() => {
                        savePreviousSelection()
                        untrack(sorted).sort((ad, bd) => {
                          const a = ad.columns[x]
                          const b = bd.columns[x]

                          // nulls first
                          if (a == null && b == null) return 0
                          if (a == null) return -1
                          if (b == null) return 1

                          // then numbers
                          if (typeof a == "number" && typeof b == "number") {
                            return a - b
                          }
                          if (typeof a == "number") return -1
                          if (typeof b == "number") return 1

                          // then text
                          const al = a.toLowerCase()
                          const bl = b.toLowerCase()
                          if (al < bl) return -1
                          if (al > bl) return 1
                          if (a < b) return -1
                          if (a > b) return 1

                          // then give up
                          return 0
                        })
                        reloadSorted()
                      }}
                    >
                      {x}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={sorted()}>
                {(data, index) => {
                  const id = data.card.id
                  const isSelected = createMemo(() =>
                    (
                      (selectFromIndex() <= index() &&
                        index() <= selectToIndex()) ||
                      (selectFromIndex() >= index() &&
                        index() >= selectToIndex())
                    ) ?
                      !selectInvert()
                    : selected[id],
                  )
                  return (
                    <tr
                      class="select-none"
                      classList={{
                        "odd:bg-[--z-table-row-alt]": !isSelected(),
                        "bg-[--z-table-row-selected]": isSelected(),
                        "odd:bg-[--z-table-row-selected-alt]": isSelected(),
                      }}
                      onMouseDown={(event) => {
                        const isCtx =
                          event.button == 2 ||
                          (event.button == 0 && event.ctrlKey)
                        if (isCtx) {
                          if (!isSelected()) {
                            setSelected((x) => {
                              return {
                                ...Object.fromEntries(
                                  Object.keys(x).map((x) => [x, false]),
                                ),
                                [id]: true,
                              }
                            })
                            setSelectInvert(false)
                            setSelectFrom(id)
                            setSelectTo(id)
                          }
                          return
                        }
                        if (event.shiftKey) {
                          if (selectFrom() == null) {
                            setSelectFrom(id)
                          }
                          setSelectInvert(false)
                        } else {
                          if (event.ctrlKey || event.metaKey) {
                            savePreviousSelection()
                            setSelected(id.toString(), (x) => {
                              setSelectInvert(x)
                              return !x
                            })
                          } else {
                            setSelected((x) => {
                              return {
                                ...Object.fromEntries(
                                  Object.keys(x).map((x) => [x, false]),
                                ),
                                [id]: true,
                              }
                            })
                            setSelectInvert(false)
                          }
                          setSelectFrom(id)
                        }
                        setMousedown(true)
                        setSelectTo(id)
                      }}
                      onMouseOver={() => {
                        if (mousedown()) {
                          setSelectTo(id)
                        }
                      }}
                    >
                      <For each={prefs.browser.active_cols}>
                        {(x) => (
                          <td
                            class="whitespace-nowrap border-x px-1 first:border-l-0 last:border-r-0"
                            classList={{
                              "border-z": !isSelected(),
                              "border-[--z-table-row-selected-border]":
                                isSelected(),
                              "text-[--z-table-row-selected-text]":
                                isSelected(),
                            }}
                          >
                            {data.columns[x]}
                          </td>
                        )}
                      </For>
                    </tr>
                  )
                }}
              </For>
            </tbody>
          </table>
        </div>
      )
    }
  },
})
