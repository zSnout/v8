import { ModalDescription, prompt } from "@/components/Modal"
import { Unmain } from "@/components/Prose"
import { sql, SQLite } from "@codemirror/lang-sql"
import {
  faCheck,
  faRightFromBracket,
  faShieldHalved,
  faSkullCrossbones,
} from "@fortawesome/free-solid-svg-icons"
import type { SqlValue } from "@sqlite.org/sqlite-wasm"
import { createSignal, For, Show } from "solid-js"
import type { Worker } from "../db"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { defineLayer } from "../el/DefineLayer"
import { IntegratedCodeField } from "../el/IntegratedField"

const MODIFYING_QUERY =
  /insert|update|delete|alter|drop|truncate|create|merge/gi
const TRANSACTIONAL_QUERY = /begin|transaction|commit|rollback/gi

const format = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction",
})

export default defineLayer({
  state: "signal",
  init(props: { worker: Worker; initial?: string }) {
    return props.initial ?? ""
  },
  load() {},
  render(info) {
    const {
      owner,
      shortcuts,
      pop,
      props: { worker },
    } = info
    shortcuts.scoped({ key: "Enter", mod: "macctrl" }, run, true)

    const [result, setResult] = createSignal<
      | {
          columns: string[]
          values: SqlValue[][]
        }[]
      | string
    >("")
    if (info.state) {
      runSafely(info.state)
    }
    const [safe, setSafe] = createSignal(true)

    return (
      <div class="flex min-h-[calc(100vh_-_7rem)] w-full flex-1 flex-col gap-4">
        <Field />
        <Notes />
        <Data />
        <Actions />
      </div>
    )

    function Field() {
      return (
        <div class="flex h-56 flex-col overflow-y-auto rounded-lg bg-z-body-selected">
          <div class="sticky top-0 z-10 -mb-px flex w-full select-none gap-2 border-b border-z bg-z-body-selected px-2 pb-1 pt-1 text-sm text-z-subtitle">
            SQLite Query
          </div>

          <FieldInner />
        </div>
      )
    }

    function FieldInner() {
      return IntegratedCodeField(
        {
          value: info.state,
          onInput(v) {
            info.state = v
          },
        },
        {
          alone: true,
          lang: sql({ dialect: SQLite, upperCaseKeywords: true }),
        },
      )
    }

    function NotesSafeMode() {
      return (
        <>
          <Show when={info.state.match(MODIFYING_QUERY)}>
            {(matches) => (
              <div class="rounded-lg bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                The {format.format(matches().map((x) => x.toUpperCase()))}{" "}
                command
                {matches().length == 1 ? "" : "s"} normally modif
                {matches().length == 1 ? "ies" : "y"} the database, but will
                have no effect in safe mode.
              </div>
            )}
          </Show>

          <Show when={info.state.match(TRANSACTIONAL_QUERY)}>
            {(matches) => (
              <div class="rounded-lg bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                The {format.format(matches().map((x) => x.toUpperCase()))}{" "}
                command
                {matches().length == 1 ? "" : "s"} normally work
                {matches().length == 1 ? "s" : ""} with transactions, but will
                have no effect in safe mode.
              </div>
            )}
          </Show>
        </>
      )
    }

    function NotesUnsafeMode() {
      return (
        <Show when={info.state.match(MODIFYING_QUERY)}>
          {(matches) => (
            <div class="rounded-lg bg-yellow-100 px-2 py-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              The {format.format(matches().map((x) => x.toUpperCase()))} command
              {matches().length == 1 ? "" : "s"} will modify the database
              permanently unless you create a ROLLBACKed transaction.
            </div>
          )}
        </Show>
      )
    }

    function Notes() {
      return (
        <Show fallback={<NotesUnsafeMode />} when={safe()}>
          <NotesSafeMode />
        </Show>
      )
    }

    function Data() {
      return (
        <Show
          fallback={
            <Show
              fallback={
                <div class="rounded-lg bg-purple-100 px-2 py-1 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  No results were returned from the latest query. Try typing
                  something, then click "Run".
                  <br />
                  You can also press Ctrl+Enter (or Cmd+Enter on Mac) to execute
                  your query.
                </div>
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
                      <div class="mx-auto min-w-[min(67rem,100vw)] max-w-[100vw] overflow-x-auto px-6">
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
                                        {(
                                          el instanceof Uint8Array ||
                                          el instanceof ArrayBuffer ||
                                          el instanceof Int8Array
                                        ) ?
                                          Array.from(new Uint8Array(el))
                                            .map((x) =>
                                              x.toString(16).padStart(2, "0"),
                                            )
                                            .join(" ")
                                        : typeof el == "bigint" ?
                                          el.toString()
                                        : el == null ?
                                          "NULL"
                                        : (el as Exclude<typeof el, BigInt>)}
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
      )
    }

    function Actions() {
      return (
        <div class="mt-auto flex w-full flex-col gap-4 xs:gap-1">
          <TwoBottomButtons>
            <Action
              icon={faRightFromBracket}
              label="Exit"
              center
              onClick={pop}
            />
            <Action icon={faCheck} label="Run" center onClick={run} />
          </TwoBottomButtons>

          <Action
            class="mx-auto w-full max-w-96"
            icon={safe() ? faSkullCrossbones : faShieldHalved}
            label={safe() ? "Enable Unsafe Mode" : "Back to Safety"}
            center
            onClick={async () => {
              if (!safe()) {
                setSafe(true)
                return
              }

              const code = Math.random().toString(10).slice(-6)

              const result = await prompt({
                owner,
                title: "Enable unsafe mode? (DANGEROUS)",
                get description() {
                  return (
                    <>
                      <ModalDescription>
                        Unsafe mode lets you use arbitrary SQLite commands.
                        <strong class="text-z underline">
                          If you don't know SQLite, you should not use unsafe
                          mode.
                        </strong>
                      </ModalDescription>

                      <ModalDescription>
                        Anything you do in unsafe mode can affect the database{" "}
                        <strong class="text-z underline">
                          permanently and irreversibly
                        </strong>
                        . This could destroy years of reviews, make the
                        application inaccessible, or any other number of
                        terrible things. We highly recommend exporting your
                        current data before you use unsafe mode, just in case.
                      </ModalDescription>

                      <ModalDescription>
                        Enter{" "}
                        <code class="rounded bg-z-body-selected px-1 text-z">
                          {code}
                        </code>{" "}
                        below to confirm you want to enter unsafe mode.
                      </ModalDescription>
                    </>
                  )
                },
                cancelText: "Nope, stay safe",
                okText: "Yes, let me query",
              })

              if (result !== code) {
                return
              }

              setSafe(false)
            }}
          />
        </div>
      )
    }

    async function run() {
      try {
        setResult(await worker.post("user_query", info.state, !safe()))
      } catch (err) {
        console.error(err)
        setResult(String(err))
      }
    }

    async function runSafely(q = info.state) {
      try {
        setResult(await worker.post("user_query", q, false))
      } catch (err) {
        console.error(err)
        setResult(String(err))
      }
    }
  },
})
