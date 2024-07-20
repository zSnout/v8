import { Checkbox } from "@/components/fields/CheckboxGroup"
import { alert, confirm, ModalDescription } from "@/components/Modal"
import {
  faArrowRightArrowLeft,
  faDownload,
  faMagnifyingGlassChart,
  faRightFromBracket,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { getOwner, Show } from "solid-js"
import { createPrefsWithWorker } from "../db/prefs/store"
import type { Worker } from "../db/worker"
import { Action } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { Icon, IconGrid } from "../el/IconButton"
import { useLayers } from "../el/Layers"
import { createLoading } from "../el/Loading"
import { UploadButton } from "../el/upload"
import { Query } from "./Query"

export const Settings = createLoading(
  async (worker: Worker) => {
    const [prefs, setPrefs, ready] = createPrefsWithWorker(worker)
    await ready
    return [prefs, setPrefs] as const
  },
  (worker, [prefs, setPrefs], pop) => {
    const layers = useLayers()
    const owner = getOwner()

    return {
      el: (
        <div class="mx-auto flex min-h-full w-full max-w-xl flex-col gap-4">
          {/* TODO: show all available options, not just booleans */}

          <div class="grid w-full grid-cols-2 gap-1 xs:grid-cols-3">
            <Action
              class="col-span-2 xs:col-span-1"
              center
              icon={faRightFromBracket}
              label="Back"
              onClick={pop}
            />
            <UploadButton
              accept=".json,.sqlite3,.sqlite,application/json,application/x-sqlite3,application/vnd.sqlite3"
              onUpload={async ([file]) => {
                const mode =
                  file.name.endsWith(".json") || file.type == "application/json"
                    ? "json"
                    : "sqlite3"

                const result = await confirm({
                  owner,
                  title: "Confirm import?",
                  description: (
                    <ModalDescription>
                      This will{" "}
                      <strong class="text-z underline">irreversibly</strong>{" "}
                      replace your entire collection with data from the imported
                      file. We highly recommend exporting your current data
                      before you import, just in case.
                    </ModalDescription>
                  ),
                  cancelText: "No, cancel",
                  okText: "Yes, import",
                })

                if (!result) {
                  return
                }

                if (mode == "json") {
                  await worker.post("import_json_unparsed", await file.text())
                } else {
                  await worker.post("import_sqlite", await file.arrayBuffer())
                }

                await alert({
                  owner,
                  title: "Imported successfully",
                  description: (
                    <ModalDescription>
                      The collection was imported successfully.
                    </ModalDescription>
                  ),
                })
              }}
            >
              {(trigger) => (
                <Action
                  center
                  icon={faUpload}
                  label="Import"
                  onClick={trigger}
                />
              )}
            </UploadButton>

            <Action
              center
              icon={faDownload}
              label="Export"
              onClick={async () => {
                const file = await worker.post("export_sqlite")
                const url = URL.createObjectURL(file)
                const a = document.createElement("a")
                a.style.display = "none"
                document.body.append(a)
                a.href = url
                a.download = file.name
                a.click()
                a.remove()
              }}
            />
          </div>

          <CheckboxContainer label="Other options">
            <label class="flex w-full gap-2">
              <Checkbox
                checked={prefs.show_review_time_above_buttons}
                onInput={(checked) =>
                  setPrefs(
                    "Toggle whether due dates are shown above review buttons",
                  )("show_review_time_above_buttons", checked)
                }
              />

              <p>Show next due date above buttons</p>
            </label>

            <label class="flex w-full gap-2">
              <Checkbox
                checked={prefs.show_remaining_due_counts}
                onInput={(checked) =>
                  setPrefs(
                    "Toggle whether due counts are shown during reviews",
                  )("show_remaining_due_counts", checked)
                }
              />

              <p>Show remaining due counts during reviews</p>
            </label>

            <label class="flex w-full gap-2">
              <Checkbox
                checked={prefs.debug}
                onInput={(checked) =>
                  setPrefs("Toggle debug features")("debug", checked)
                }
              />

              <p>Enable debug features</p>
            </label>
          </CheckboxContainer>

          <Show when={prefs.debug}>
            <DebugSection />
          </Show>
        </div>
      ),
      onForcePop: () => true,
    }

    function DebugSection() {
      return (
        <IconGrid label="Debug actions">
          <UploadButton
            accept=".json"
            onUpload={async ([file]) => {
              const result = await confirm({
                owner,
                title: "Confirm import?",
                description: (
                  <ModalDescription>
                    This will{" "}
                    <strong class="text-z underline">irreversibly</strong>{" "}
                    replace your entire collection with data from the imported
                    file. We highly recommend exporting your current data before
                    you import, just in case.
                  </ModalDescription>
                ),
                cancelText: "No, cancel",
                okText: "Yes, import",
              })

              if (!result) {
                return
              }

              await worker.post("import_json_unparsed", await file.text())

              await alert({
                owner,
                title: "Imported successfully",
                description: (
                  <ModalDescription>
                    The collection was imported successfully.
                  </ModalDescription>
                ),
              })
            }}
          >
            {(trigger) => (
              <Icon icon={faUpload} label="Legacy" onClick={trigger} />
            )}
          </UploadButton>

          <UploadButton
            accept=".sqlite3,.sqlite"
            onUpload={async ([file]) => {
              const result = await confirm({
                owner,
                title: "Confirm import?",
                description: (
                  <ModalDescription>
                    This will{" "}
                    <strong class="text-z underline">irreversibly</strong>{" "}
                    replace your entire collection with data from the imported
                    file. We highly recommend exporting your current data before
                    you import, just in case.
                  </ModalDescription>
                ),
                cancelText: "No, cancel",
                okText: "Yes, import",
              })

              if (!result) {
                return
              }

              await worker.post("import_sqlite", await file.arrayBuffer())

              await alert({
                owner,
                title: "Imported successfully",
                description: (
                  <ModalDescription>
                    The collection was imported successfully.
                  </ModalDescription>
                ),
              })
            }}
          >
            {(trigger) => (
              <Icon icon={faUpload} label="Legacy" onClick={trigger} />
            )}
          </UploadButton>

          <Icon
            icon={faMagnifyingGlassChart}
            label="Query"
            onClick={() => layers.push(Query, worker)}
          />

          <Icon
            icon={faArrowRightArrowLeft}
            label="Transfer"
            onClick={async () => {
              if (
                !(await confirm({
                  owner,
                  title: "Do you want to transfer?",
                  get description() {
                    return (
                      <ModalDescription>
                        This will reset all your data stored in SQLite (the
                        newer database system) with data purely taken from
                        indexedDB (which is likely no longer in use). Are you
                        sure?
                      </ModalDescription>
                    )
                  },
                  okText: "Yes, transfer",
                  cancelText: "No, cancel",
                }))
              ) {
                return
              }

              try {
                await worker.post("import_idb")
                await alert({
                  owner,
                  title: "Imported indexedDB data into SQLite database.",
                })
              } catch {
                await alert({
                  owner,
                  title: "Failed to import indexedDB data.",
                })
              }
            }}
          />
        </IconGrid>
      )
    }
  },
)
