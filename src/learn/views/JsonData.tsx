import { ModalDescription, prompt } from "@/components/Modal"
import { json, jsonParseLinter } from "@codemirror/lang-json"
import * as language from "@codemirror/language"
import * as lint from "@codemirror/lint"
import * as view from "@codemirror/view"
import { faCheck, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"
import { getOwner } from "solid-js"
import { parse } from "valibot"
import type { DB } from "../db"
import { exportData, importDb } from "../db/save"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { IntegratedCodeField } from "../el/IntegratedField"
import { createLoading } from "../el/Loading"
import { randomId } from "../lib/id"
import { Collection } from "../lib/types"

export const JsonData = createLoading(
  (db: DB) => exportData(db, Date.now()),
  (db, collection, pop) => {
    const owner = getOwner()
    let v = JSON.stringify(collection, undefined, 2)

    return {
      el: (
        <div class="flex h-[calc(100vh_-_7rem)] w-full flex-1 flex-col gap-4">
          <div class="flex flex-1 flex-col overflow-y-auto rounded-lg bg-z-body-selected">
            <div class="sticky top-0 z-10 -mb-px flex w-full select-none gap-2 border-b border-z bg-z-body-selected px-2 pb-1 pt-1 text-sm text-z-subtitle">
              Database Dump (JSON)
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
                lang: json(),
                exts: [
                  view.lineNumbers(),
                  language.foldGutter(),
                  lint.linter(jsonParseLinter()),
                ],
              },
            )}
          </div>

          <TwoBottomButtons>
            <Action
              icon={faRightFromBracket}
              label="Exit"
              center
              onClick={pop}
            />
            <Action
              icon={faCheck}
              label="Save"
              center
              onClick={async () => {
                const value = v

                try {
                  var data = JSON.parse(value)
                } catch (err) {
                  console.error(err)
                  throw new Error("The data is not a valid JSON file.")
                }

                try {
                  var collection = parse(Collection, data)
                } catch (err) {
                  console.error(err)
                  throw new Error("The data is not a valid collection.")
                }

                const code = randomId().toString().slice(-6)

                const typedValue = await prompt({
                  owner,
                  title: "WARNING: IRREVERSIBLE DAMAGE AHEAD",
                  get description() {
                    return (
                      <>
                        <ModalDescription>
                          This will{" "}
                          <strong class="text-z underline">irreversibly</strong>{" "}
                          replace your entire collection with data from what you
                          just typed. There are no checking routines performed.
                          If you match a card to a deck which doesn't exist, the
                          app will likely break. If you match a card to a note
                          which doesn't exist, the app will likely break.
                        </ModalDescription>

                        <ModalDescription>
                          By saving this data, you acknowledge the risk of
                          destroying your local copy of this app forever. You
                          understand that{" "}
                          <strong class="text-z underline">
                            recovery means deleting all your data from this
                            website in your browser settings
                          </strong>
                          . You understand that an inability to delete your
                          browser's data will result in it being{" "}
                          <strong class="text-z underline">
                            ENTIRELY IMPOSSIBLE
                          </strong>{" "}
                          for you to use this website ever again.
                        </ModalDescription>

                        <ModalDescription>
                          To confirm you understand the risks associated with
                          saving unchecked data, enter the code{" "}
                          <code class="select-none">{code}</code> into the text
                          field below. Alternatively, cancel the action.
                        </ModalDescription>
                      </>
                    )
                  },
                  cancelText: "No, cancel",
                  okText: "Yes, save",
                })

                if (typedValue !== code) {
                  return
                }

                await importDb(db, collection)
              }}
            />
          </TwoBottomButtons>
        </div>
      ),
      onForcePop: () => true,
    }
  },
)
