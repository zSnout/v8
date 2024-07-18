import { Checkbox } from "@/components/fields/CheckboxGroup"
import { Unmain } from "@/components/Prose"
import { For } from "solid-js"
import { createPrefsWithWorker } from "../db/prefs/store"
import type { Worker } from "../db/worker"
import { createLoading } from "../el/Loading"
import { ShortcutManager } from "../lib/shortcuts"
import { BrowserColumn } from "../lib/types"

// TODO: add escape key to all pages

export const Browse = createLoading(
  async (worker: Worker) => {
    const data = await worker.post("browse_load")
    const [prefs, setPrefs, ready] = createPrefsWithWorker(worker)
    await ready
    return { ...data, prefs, setPrefs }
  },
  (_, { columns, prefs, setPrefs }, pop) => {
    new ShortcutManager().scoped({ key: "Escape" }, pop)

    return {
      el: (
        <div class="-my-8">
          <Unmain class="flex h-[calc(100vh_-_3rem)]">
            <div class="flex h-[calc(100vh_-_3rem)] w-full">
              <Sidebar />
              <Grid />
            </div>
          </Unmain>
        </div>
      ),
      onForcePop: () => true,
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
                        (x) => x.concat(name),
                      )
                    } else {
                      const idx = cols.indexOf(name)
                      if (idx == -1) return
                      setPrefs(`Toggle ${name} column visibility in browser`)(
                        "browser",
                        "active_cols",
                        (x) => x.toSpliced(idx, 1),
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

    function Grid() {
      return (
        <div class="flex-1 overflow-auto pb-8 text-sm">
          <table class="min-w-full border-b border-z">
            <thead>
              <tr>
                <For each={prefs.browser.active_cols}>
                  {(x) => (
                    <th class="sticky top-0 border-x border-z bg-z-body px-1 first:border-l-0 last:border-r-0">
                      {x}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={columns}>
                {(data) => (
                  <tr class="odd:bg-[--z-table-row-alt]">
                    <For each={prefs.browser.active_cols}>
                      {(x) => (
                        <td class="whitespace-nowrap border-x border-z px-1 first:border-l-0 last:border-r-0">
                          {data.columns[x]}
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      )
    }
  },
)
