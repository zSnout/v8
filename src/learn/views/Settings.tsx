import { Checkbox } from "@/components/fields/CheckboxGroup"
import { alert, confirm, ModalDescription } from "@/components/Modal"
import {
  faCheck,
  faDownload,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { getOwner } from "solid-js"
import { parse } from "valibot"
import { DB } from "../db"
import { createNote } from "../db/createNote/createNote"
import { createPrefsStore } from "../db/prefs/store"
import { exportDb, importDb } from "../db/save"
import { SingleBottomAction } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { Icon, Icons } from "../el/IconButton"
import { createLoading } from "../el/Loading"
import { ID_ZERO, idOf } from "../lib/id"
import { Collection } from "../lib/types"

export const Settings = createLoading(
  async (db: DB) => {
    const [prefs, setPrefs, ready] = createPrefsStore(db)
    await ready
    return [prefs, setPrefs] as const
  },
  (db, [prefs, setPrefs], pop) => {
    const owner = getOwner()

    let filePicker!: HTMLInputElement

    return {
      el: (
        <div class="flex min-h-full w-full flex-col gap-8">
          <button
            onClick={async () => {
              const data = `魚	たまご
肉	にく
卵	たまご
水	みず
食べます	たばます
飲みます	のみます
大きい	おおきい
小さい	ちいさい
新しい	あたらしい
古い	ふるい
月よう日	げつようび
火よう日	かようび
水よう日	すいようび
木よう日	もくようび
金よう日	きんようび
土よう日	どようび
日よう日	にちようび
見ます	みます
聞きます	ききます
読みます	よみます
十時半	じゅうじはん
八時五分	はちじごふん
三時に十分	さんじにじゅうぷん
四年せい	しねんせい
六にん	ろくにん
七月	しちがつ
九さい	きゅうさい
書きます	かきます
言います	いいます
話します	はなします`
                .split("\n")
                .map((x) => x.split("\t") as [kanji: string, reading: string])

              for (const [kanji, reading] of data) {
                const m = (await db
                  .read("models")
                  .store.get(idOf(3323968114672263)))!
                const deck = (await db.read("decks").store.get(idOf(ID_ZERO)))!
                const result = createNote(
                  db,
                  [],
                  {
                    8721063081413018: kanji,
                    6867200239311358: reading,
                  },
                  m,
                  deck,
                  Date.now(),
                  {},
                )
                await result.done
              }
            }}
          >
            sakawi magic stuff
          </button>

          <Icons>
            <Icon icon={faCheck} label="Save" onClick={pop} />
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

                try {
                  var json = JSON.parse(await file.text())
                } catch {
                  throw new Error(
                    "Couldn't read file. Did you upload a .zl.json?",
                  )
                }

                try {
                  var data = parse(Collection, json)
                } catch {
                  throw new Error(
                    "Invalid file. Did you upload a proper .zl.json?",
                  )
                }

                await importDb(db, data)

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
            icon={faCheck}
            label="Save"
            center
            onClick={pop}
          />
        </div>
      ),
      onForcePop: () => true,
    }
  },
)
