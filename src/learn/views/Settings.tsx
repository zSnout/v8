import { Checkbox } from "@/components/fields/CheckboxGroup"
import { alert, confirm, ModalDescription } from "@/components/Modal"
import {
  faDatabase,
  faDownload,
  faRightFromBracket,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { getOwner, Show } from "solid-js"
import { DB } from "../db"
import { createPrefsStore } from "../db/prefs/store"
import { exportDb, importJson } from "../db/save"
import { SingleBottomAction } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { Icon, Icons } from "../el/IconButton"
import { useLayers } from "../el/Layers"
import { createLoading } from "../el/Loading"
import { ShortcutManager } from "../lib/shortcuts"
import { JsonData } from "./JsonData"

export const Settings = createLoading(
  async (db: DB) => {
    const [prefs, setPrefs, ready] = createPrefsStore(db)
    await ready
    return [prefs, setPrefs] as const
  },
  (db, [prefs, setPrefs], pop) => {
    new ShortcutManager().scoped({ key: "Escape" }, pop)
    const layers = useLayers()

    const owner = getOwner()

    let filePicker!: HTMLInputElement

    return {
      el: (
        <div class="flex min-h-full w-full flex-col gap-8">
          <Icons>
            <Icon icon={faRightFromBracket} label="Back" onClick={pop} />
            <input
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
            />
            <Icon
              icon={faDownload}
              label="Export"
              onClick={async () => {
                const file = await exportDb(db, Date.now())
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
                icon={faDatabase}
                label="Internals"
                onClick={() => layers.push(JsonData, db)}
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
