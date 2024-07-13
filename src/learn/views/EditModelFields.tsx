import { Checkbox } from "@/components/fields/CheckboxGroup"
import { AutocompleteFontFamily } from "../el/AutocompleteFonts"
import { CheckboxContainer } from "../el/CheckboxContainer"
import { createListEditor } from "../el/EditList"
import { IntegratedField } from "../el/IntegratedField"
import { createField } from "../lib/defaults"
import { idOf } from "../lib/id"
import { arrayToRecord } from "../lib/record"
import { Model, ModelField } from "../lib/types"

export const EditModelFields = createListEditor<
  { model: Model; save(model: Model): void },
  0,
  Model,
  Omit<Model, "fields">,
  ModelField
>(
  async (props) => {
    return {
      async: 0 as const,
      item: props.model,
      title: props.model.name,
      subtitle: "editing fields",
      save(item) {
        props.save(item)
      },
    }
  },
  ({ item }) => [item, Object.values(item.fields)] as const,
  ({ data, items }) => ({ ...data, fields: arrayToRecord(items) }),
  (data) => data.sort_field,
  (name) => createField(name),
  {
    add: "Add",
    delete: "Delete",
    rename: "Rename",
    needAtLeastOne: "Models need at least one field.",
    newFieldName: "New field name",
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
