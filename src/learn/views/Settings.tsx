import { Checkbox } from "@/components/fields/CheckboxGroup"
import { alert, confirm, ModalDescription } from "@/components/Modal"
import { unwrap as unwrapResult } from "@/components/result"
import {
  faCheck,
  faDownload,
  faRightFromBracket,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { getOwner } from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { Icon, Icons } from "../el/IconButton"
import { App } from "../lib/state"

export function Settings({ app, close }: { app: App; close: () => void }) {
  const [prefs, dangerousUnsafeRawSetPrefs] = createStore(
    structuredClone(app.prefs.prefs),
  )
  const owner = getOwner()
  let changed = false

  const setPrefs = function (this: any) {
    changed = true
    return dangerousUnsafeRawSetPrefs.apply(this, arguments as never)
  } as typeof dangerousUnsafeRawSetPrefs

  function save() {
    app.prefs.set(structuredClone(unwrap(prefs)))
    changed = false
    close()
  }

  async function exit() {
    if (!changed) {
      close()
      return
    }

    const result = await confirm({
      owner,
      title: "Discard changes?",
      description:
        "You have some unsaved changes, and closing this window discards them. Continue?",
      cancelText: "No, stay here",
      okText: "Yes, exit",
    })

    if (result) {
      close()
    }
  }

  let filePicker!: HTMLInputElement

  return (
    <div class="flex min-h-full w-full flex-col gap-8">
      <Icons>
        <Icon icon={faRightFromBracket} label="Exit" onClick={exit} />
        <Icon icon={faCheck} label="Save" onClick={save} />
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
                  <strong class="text-z underline">irreversibly</strong> replace
                  your entire collection with data from the imported file. We
                  highly recommend exporting your current data before you
                  import, just in case.
                </ModalDescription>
              ),
              cancelText: "No, cancel",
              okText: "Yes, import",
            })

            if (!result) {
              return
            }

            unwrapResult(app.import(await file.text()))

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
          onClick={() => {
            const file = new File(
              [app.export()],
              "zsnout-learn-" + new Date().toISOString() + ".json",
            )

            const url = URL.createObjectURL(file)
            const a = document.createElement("a")
            a.style.display = "none"
            document.body.append(a)
            a.href = url
            a.download = file.name
            a.click()
          }}
        />
      </Icons>

      {/* TODO: show all available options, not just booleans */}

      <CheckboxContainer label="Other options">
        <label class="flex w-full gap-2">
          <Checkbox
            checked={prefs.show_review_time_above_buttons}
            onInput={(checked) =>
              setPrefs("show_review_time_above_buttons", checked)
            }
          />

          <p>Show next due date above buttons</p>
        </label>

        <label class="flex w-full gap-2">
          <Checkbox
            checked={prefs.show_remaining_due_counts}
            onInput={(checked) =>
              setPrefs("show_remaining_due_counts", checked)
            }
          />

          <p>Show remaining due counts during reviews</p>
        </label>

        <label class="flex w-full gap-2">
          <Checkbox
            checked={prefs.debug}
            onInput={(checked) => setPrefs("debug", checked)}
          />

          <p>Enable debug features</p>
        </label>
      </CheckboxContainer>

      <TwoBottomButtons>
        <Action icon={faRightFromBracket} label="Exit" center onClick={exit} />
        <Action icon={faCheck} label="Save" center onClick={save} />
      </TwoBottomButtons>
    </div>
  )
}
