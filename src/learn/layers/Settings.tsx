import { Checkbox } from "@/components/fields/CheckboxGroup"
import { alert, confirm, ModalDescription } from "@/components/Modal"
import {
  faDownload,
  faRightFromBracket,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import type { Worker } from "../db"
import { createPrefsStore } from "../db/prefs"
import { Action } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { defineLayer } from "../el/DefineLayer"
import { UploadButton } from "../el/upload"

export const LAYER_SETTINGS = defineLayer({
  init(_: Worker) {},
  async load({ props }) {
    const [prefs, setPrefs, ready] = createPrefsStore(props)
    await ready
    return [prefs, setPrefs] as const
  },
  render({ pop, owner, props: worker, data: [prefs, setPrefs] }) {
    return (
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
                file.name.endsWith(".json") || file.type == "application/json" ?
                  "json"
                : "sqlite3"

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
              <Action center icon={faUpload} label="Import" onClick={trigger} />
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
                setPrefs("Toggle whether due counts are shown during reviews")(
                  "show_remaining_due_counts",
                  checked,
                )
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
      </div>
    )
  },
})