import { Checkbox } from "@/components/fields/CheckboxGroup"
import { confirm } from "@/components/Modal"
import { faCheck, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { getOwner } from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { Prefs } from "../lib/types"

export function Settings(rawProps: {
  initial: Prefs
  save: (prefs: Prefs) => void
  close: () => void
}) {
  const [prefs, dangerousUnsafeRawSetPrefs] = createStore(
    structuredClone(rawProps.initial),
  )
  const owner = getOwner()
  let changed = false

  const setPrefs = function (this: any) {
    changed = true
    return dangerousUnsafeRawSetPrefs.apply(this, arguments as never)
  } as typeof dangerousUnsafeRawSetPrefs

  function save() {
    rawProps.save(structuredClone(unwrap(prefs)))
    changed = false
  }

  return (
    <div class="flex min-h-full w-full flex-col">
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
        <Action
          icon={faRightFromBracket}
          label="Exit"
          center
          onClick={async () => {
            if (!changed) {
              rawProps.close()
              return
            }

            const result = await confirm({
              owner,
              title: "Discard changes?",
              description:
                "You have some unsaved changes, and closing this window discards them. Continue?",
            })

            if (result) {
              rawProps.close()
            }
          }}
        />
        <Action
          icon={faCheck}
          label="Save"
          center
          onClick={() => {
            save()
            rawProps.close()
          }}
        />
      </TwoBottomButtons>
    </div>
  )
}
