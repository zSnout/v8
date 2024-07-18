import { Checkbox } from "@/components/fields/CheckboxGroup"
import { alert, confirm, ModalDescription } from "@/components/Modal"
import {
  faArrowRightArrowLeft,
  faDownload,
  faMagnifyingGlassChart,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons"
import { getOwner, Show } from "solid-js"
import { createPrefsWithWorker } from "../db/prefs/store"
import type { Worker } from "../db/worker"
import { SingleBottomAction } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { Icon, Icons } from "../el/IconButton"
import { useLayers } from "../el/Layers"
import { createLoading } from "../el/Loading"
import { SqlData } from "./SqlData"

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
        <div class="flex min-h-full w-full flex-col gap-8">
          <Icons>
            <Icon icon={faRightFromBracket} label="Back" onClick={pop} />
            {/* <input
              type="file"
              class="sr-only"
              accept="application/json"
              ref={filePicker}
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0]
                if (!file) {
                  return
                }
                event.currentTarget.value = ""

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

                await importJson(db, await file.text())

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
            />
            <Icon
              icon={faUpload}
              label="Import"
              onClick={() => filePicker.click()}
            /> */}
            <Icon
              icon={faDownload}
              label="Export"
              onClick={async () => {
                const file = await worker.post("sqlite_export")
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
            <Show when={prefs.debug}>
              <Icon
                icon={faMagnifyingGlassChart}
                label="Query"
                onClick={() => layers.push(SqlData, worker)}
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
                            indexedDB (which is likely no longer in use). Are
                            you sure?
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
                    await worker.post("idb_import")
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
            </Show>
          </Icons>

          {/* TODO: show all available options, not just booleans */}

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

          <SingleBottomAction
            icon={faRightFromBracket}
            label="Back"
            center
            onClick={pop}
          />
        </div>
      ),
      onForcePop: () => true,
    }
  },
)
