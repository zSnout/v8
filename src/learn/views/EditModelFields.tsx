import { Checkbox } from "@/components/fields/CheckboxGroup"
import { confirm, ModalDescription, prompt } from "@/components/Modal"
import { notNull } from "@/components/pray"
import {
  faCancel,
  faCheck,
  faPencil,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import { batch, createMemo, createSignal, getOwner, untrack } from "solid-js"
import { createStore, unwrap } from "solid-js/store"
import { AutocompleteFontFamily } from "../el/AutocompleteFonts"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { createListEditor } from "../el/EditList"
import { IntegratedField } from "../el/IntegratedField"
import { Layerable } from "../el/Layers"
import { SortableFieldList } from "../el/Sortable"
import { createField } from "../lib/defaults"
import { idOf } from "../lib/id"
import { arrayToRecord } from "../lib/record"
import { Model, ModelField } from "../lib/types"
import { renameFieldAccessesInTemplates } from "../lib/updateModelTemplates"

export const EditModelFields = createListEditor<
  { model: Model; save(model: Model): void },
  0,
  Model,
  Omit<Model, "fields">,
  ModelField
>(
  async (props) => {
    return {
      async: 0,
      item: props.model,
      title: props.model.name,
      subtitle: "editing fields",
      save(item) {
        props.save(item)
      },
    }
  },
  ({ item }) => [item, Object.values(item.fields)],
  ({ data, items }) => ({ ...data, fields: arrayToRecord(items) }),
  (data) => data.sort_field,
  (name) => createField(name),
  {
    addField: "Add field",
    needAtLeastOne: "Models need at least one field.",
    newFieldName: "New field name",
    removeField: "Remove field",
    renameField: "Rename field",
  },
  (props) => {
    const { setSelected } = props

    return (
      <div class="flex flex-col gap-1">
        <IntegratedField
          label="Description"
          rtl={props.selected.rtl}
          font={props.selected.font}
          sizePx={props.selected.size}
          value={props.selected.desc}
          onInput={(y) => {
            setSelected((x) => ({ ...x, desc: y }))
          }}
          type="text"
          placeholder="Placeholder to show when no value is typed in"
        />

        <div class="grid grid-cols-[1fr,8rem] gap-1">
          <AutocompleteFontFamily
            label="Editing Font"
            placeholder="(optional)"
            value={props.selected.font}
            onChange={(font) => {
              setSelected((field) => ({ ...field, font }))
            }}
          />

          <IntegratedField
            label="Size"
            rtl={false}
            type="number"
            placeholder="(optional)"
            value={props.selected.size?.toString() ?? ""}
            onInput={(value) =>
              setSelected((field) => {
                if (value == "") {
                  return { ...field, size: undefined }
                }

                const size = Math.floor(+value)
                if (Number.isFinite(size)) {
                  return { ...field, size: Math.max(4, Math.min(256, size)) }
                } else {
                  return field
                }
              })
            }
          />
        </div>

        <CheckboxContainer label="Other options">
          <label class="flex w-full gap-2">
            <Checkbox
              circular
              checked={props.get.sort_field == props.selected.id}
              onInput={() => props.set("sort_field", idOf(props.selected.id))}
            />

            <p>Sort by this field in the browser</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={props.selected.rtl}
              onInput={(rtl) => setSelected((x) => ({ ...x, rtl }))}
            />

            <p>Edit as right-to-left text</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={props.selected.html}
              onInput={(html) => setSelected((x) => ({ ...x, html }))}
            />

            <p>Default to editing raw HTML</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={props.selected.collapsed}
              onInput={(collapsed) => setSelected((x) => ({ ...x, collapsed }))}
            />

            <p>Collapse field in card creator</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={props.selected.excludeFromSearch}
              onInput={(excludeFromSearch) =>
                setSelected((x) => ({ ...x, excludeFromSearch }))
              }
            />

            <p>Exclude from unqualified searches</p>
          </label>
        </CheckboxContainer>
      </div>
    )
  },
)

export const EditModelFieldsOld = ((props, pop) => {
  const [model, setModel] = createStore<Omit<Model, "fields">>(
    structuredClone(props.model),
  )

  const [fields, setFields] = createSignal(
    Object.values(structuredClone(props.model.fields)),
  )

  const [selectedId, setSelectedId] = createSignal(
    notNull(fields()[0]?.id, "A model must have at least one field."),
  )

  const selected = createMemo(() => {
    const f = fields()
    const id = selectedId()
    return notNull(
      f.find((x) => x.id == id),
      "There must be a field selected in the explorer.",
    )
  })

  const owner = getOwner()

  return {
    el: (
      <div class="flex min-h-full w-full flex-col gap-8">
        <div class="w-full rounded-lg bg-z-body-selected px-2 py-1 text-center">
          {model.name} <span class="text-z-subtitle">— editing fields</span>
        </div>

        <div class="grid w-full gap-6 sm:grid-cols-[auto,16rem]">
          <SortableFieldList
            get={fields()}
            set={setFields}
            selectedId={selectedId()}
            setSelectedId={setSelectedId}
            sortId={model.sort_field}
          />

          {SideActions()}
        </div>

        {FieldOptions()}
        {SaveChanges()}
      </div>
    ),
    // TODO: add a "save changes?" screen here
    onForcePop: () => true,
  }

  function SaveChanges() {
    return (
      <TwoBottomButtons>
        <Action icon={faCancel} label="Cancel" center onClick={() => pop()} />
        <Action
          icon={faCheck}
          label="Save changes"
          center
          onClick={() => {
            const m = unwrap(model)
            const f = arrayToRecord(fields())

            props.save({
              ...m,
              tmpls: renameFieldAccessesInTemplates(
                props.model.fields,
                f,
                m.tmpls,
              ),
              fields: f,
            })

            pop()
          }}
        />
      </TwoBottomButtons>
    )
  }

  function setSelected(fn: ModelField | ((x: ModelField) => ModelField)) {
    if (typeof fn == "function") {
      fn = fn(untrack(selected))
    }
    const sid = selectedId()
    setFields((fields) => {
      const field = fields.findIndex((x) => x.id == sid)
      if (field == -1) return fields
      fields[field] = fn
      return [...fields]
    })
  }

  async function confirmImportantChange(ingVerb: string) {
    return await confirm({
      owner,
      title: "Are you sure you want to do this?",
      get description() {
        return (
          <ModalDescription>
            {ingVerb} will require a full upload of the database when you next
            synchronize your collection. If you have reviews or other changes
            waiting on another device that haven't been synchronized here yet,{" "}
            <u class="font-semibold text-z">they will be lost</u>. Continue?
          </ModalDescription>
        )
      },
      cancelText: "No, cancel",
      okText: "Yes, continue",
    })
  }

  async function pickFieldName(title: string, cancelName?: string | undefined) {
    let first = true

    while (true) {
      const name = (
        await prompt({
          owner,
          title,
          description: first ? undefined : (
            <ModalDescription>
              That field name is already used. Please pick a different name, or
              cancel the action.
            </ModalDescription>
          ),
        })
      )?.trim()

      if (name == null || name == cancelName) {
        return
      }

      if (!fields().some((x) => x.name == name)) {
        return name
      }

      first = false
    }
  }

  function FieldOptions() {
    return (
      <div class="flex flex-col gap-1">
        <IntegratedField
          label="Description"
          rtl={selected().rtl}
          font={selected().font}
          sizePx={selected().size}
          value={selected().desc}
          onInput={(y) => {
            setSelected((x) => ({ ...x, desc: y }))
          }}
          type="text"
          placeholder="Placeholder to show when no value is typed in"
        />

        <div class="grid grid-cols-[1fr,8rem] gap-1">
          <AutocompleteFontFamily
            label="Editing Font"
            placeholder="(optional)"
            value={selected().font}
            onChange={(font) => {
              setSelected((field) => ({ ...field, font }))
            }}
          />

          <IntegratedField
            label="Size"
            rtl={false}
            type="number"
            placeholder="(optional)"
            value={selected().size?.toString() ?? ""}
            onInput={(value) =>
              setSelected((field) => {
                if (value == "") {
                  return { ...field, size: undefined }
                }

                const size = Math.floor(+value)
                if (Number.isFinite(size)) {
                  return { ...field, size: Math.max(4, Math.min(256, size)) }
                } else {
                  return field
                }
              })
            }
          />
        </div>

        <CheckboxContainer label="Other options">
          <label class="flex w-full gap-2">
            <Checkbox
              circular
              checked={model.sort_field == selectedId()}
              onInput={() =>
                setModel((model) => ({
                  ...model,
                  sort_field: idOf(selectedId()!),
                }))
              }
            />

            <p>Sort by this field in the browser</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={selected().rtl}
              onInput={(rtl) => setSelected((x) => ({ ...x, rtl }))}
            />

            <p>Edit as right-to-left text</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={selected().html}
              onInput={(html) => setSelected((x) => ({ ...x, html }))}
            />

            <p>Default to editing raw HTML</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={selected().collapsed}
              onInput={(collapsed) => setSelected((x) => ({ ...x, collapsed }))}
            />

            <p>Collapse field in card creator</p>
          </label>

          <label class="flex w-full gap-2">
            <Checkbox
              checked={selected().excludeFromSearch}
              onInput={(excludeFromSearch) =>
                setSelected((x) => ({ ...x, excludeFromSearch }))
              }
            />

            <p>Exclude from unqualified searches</p>
          </label>
        </CheckboxContainer>
      </div>
    )
  }

  function SideActions() {
    return (
      <div class="flex flex-col gap-1">
        <Action
          icon={faPlus}
          label="Add"
          onClick={async () => {
            if (!(await confirmImportantChange("Adding a new field"))) {
              return
            }

            const fieldName = await pickFieldName("New field name")

            if (!fieldName) {
              return
            }

            const next = createField(fieldName)

            batch(() => {
              setFields((fields) => fields.concat(next))
              setSelectedId(next.id)
            })
          }}
        />

        <Action
          icon={faTrash}
          label="Delete"
          onClick={async () => {
            if (fields().length <= 1) {
              await alert({
                owner,
                title: "Unable to delete",
                description: (
                  <ModalDescription>
                    Models need at least one field.
                  </ModalDescription>
                ),
              })
              return
            }

            if (!(await confirmImportantChange("Removing this field"))) {
              return
            }

            batch(() => {
              const sid = selectedId()

              const fields = setFields((x) => {
                const idx = x.findIndex((x) => x.id == sid)
                if (idx == -1) return x
                if (x.length <= 1)
                  throw new Error("Models need at least one field.")
                x.splice(idx, 1)
                return [...x]
              })

              setSelectedId(
                notNull(fields[0]?.id, "Models need at least one field."),
              )
            })
          }}
        />

        <Action
          icon={faPencil}
          label="Rename"
          onClick={async () => {
            const fieldName = await pickFieldName(
              "New field name",
              selected().name,
            )

            if (!fieldName) {
              return
            }

            setSelected((field) => ({ ...field, name: fieldName }))
          }}
        />
      </div>
    )
  }
}) satisfies Layerable<{
  /** The model to edit the fields of. */
  model: Model

  /**
   * Called to save the modal. If a `model` is passed, it is the updated model.
   * If `null` is passed, it means that the edit action was canceled.
   */
  save: (model: Model) => void
}>
