import { Unmain } from "@/components/Prose"
import { sql, SQLite } from "@codemirror/lang-sql"
import { faCheck, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { createSignal, For, Show } from "solid-js"
import type { QueryExecResult } from "sql.js"
import type { Worker } from "../db/worker"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { IntegratedCodeField } from "../el/IntegratedField"
import type { LayerOutput } from "../el/Layers"
import { ShortcutManager } from "../lib/shortcuts"

export function SqlData(worker: Worker, pop: () => void): LayerOutput {
  const shortcuts = new ShortcutManager()
  shortcuts.scoped({ key: "Enter", mod: "macctrl" }, run, true)

  let v = ""

  const [result, setResult] = createSignal<QueryExecResult[] | string>("")

  return {
    el: (
      <div class="flex min-h-[calc(100vh_-_7rem)] w-full flex-1 flex-col gap-4">
        <div class="flex h-56 flex-col overflow-y-auto rounded-lg bg-z-body-selected">
          <div class="sticky top-0 z-10 -mb-px flex w-full select-none gap-2 border-b border-z bg-z-body-selected px-2 pb-1 pt-1 text-sm text-z-subtitle">
            SQLite Query
          </div>

          {IntegratedCodeField(
            {
              value: v,
              onInput(value) {
                v = value
              },
            },
            {
              alone: true,
              lang: sql({
                dialect: SQLite,
                upperCaseKeywords: true,
                schema: {
                  core: [
                    "id",
                    "version",
                    "creation",
                    "last_edited",
                    "last_schema_edit",
                    "last_sync",
                    "tags",
                  ],
                },
              }),
            },
          )}
        </div>

        <Show
          fallback={
            <Show
              fallback={
                <p>
                  No results were returned from the latest query. Try typing
                  something, then click "Run".
                </p>
              }
              when={result().toString()}
            >
              {(x) => (
                <pre class="rounded-lg bg-red-100 px-2 py-1 text-sm text-red-800 dark:bg-red-900 dark:text-red-200">
                  {x()}
                </pre>
              )}
            </Show>
          }
          when={(() => {
            const val = result()
            return typeof val != "string" && (val.length == 0 ? undefined : val)
          })()}
        >
          {(result) => (
            <div class="flex-1">
              <Unmain>
                <div class="flex w-screen flex-col gap-4">
                  <For each={result()}>
                    {(result) => (
                      <div class="mx-auto min-w-[67rem] max-w-[100vw] overflow-x-auto px-6">
                        <table class="w-full border border-z text-sm">
                          <thead>
                            <tr>
                              <For each={result.columns}>
                                {(column) => (
                                  <th class="border-x border-z bg-z-body px-1 first:border-l-0 last:border-r-0">
                                    {column}
                                  </th>
                                )}
                              </For>
                            </tr>
                          </thead>
                          <tbody>
                            <For each={result.values}>
                              {(row) => (
                                <tr class="odd:bg-[--z-table-row-alt]">
                                  <For each={row}>
                                    {(el) => (
                                      <td class="whitespace-nowrap border-x border-z px-1 first:border-l-0 last:border-r-0">
                                        {el instanceof Uint8Array
                                          ? Array.from(el)
                                              .map((x) =>
                                                x.toString(16).padStart(2, "0"),
                                              )
                                              .join(" ")
                                          : el}
                                      </td>
                                    )}
                                  </For>
                                </tr>
                              )}
                            </For>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </For>
                </div>
              </Unmain>
            </div>
          )}
        </Show>

        <TwoBottomButtons>
          <Action icon={faRightFromBracket} label="Exit" center onClick={pop} />
          <Action icon={faCheck} label="Run" center onClick={run} />
        </TwoBottomButtons>
      </div>
    ),
    onForcePop: () => true,
    onReturn() {},
  }

  async function run() {
    try {
      setResult(await worker.post("volatile_user_query", v))
    } catch (err) {
      console.error(err)
      setResult(String(err))
    }
  }
}
