import { Checkbox } from "@/components/fields/CheckboxGroup"
import { Unmain } from "@/components/Prose"
import { For } from "solid-js"
import { load } from "../db/browse/load"
import { createLoading } from "../el/Loading"
import { BrowserColumn } from "../lib/types"
import { ShortcutManager } from "../lib/shortcuts"

// TODO: add escape key to all pages

export const Browse = createLoading(
  load,
  (_, { columns, prefs, setPrefs }, pop) => {
    new ShortcutManager().scoped({ key: "Escape" }, pop)

    return {
      el: (
        <Unmain class="flex min-h-full">
          <div class="-my-8 flex min-h-full w-full">
            <Sidebar />
            <Grid />
          </div>
        </Unmain>
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
                    <th class="border-x border-z px-1 first:border-l-0 last:border-r-0">
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