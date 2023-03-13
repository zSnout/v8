import { createMemo, createSignal } from "solid-js"
import { AutoResizeTextarea } from "../../../components/fields/AutoResizeTextarea"
import { LabeledCheckbox } from "../../../components/fields/Checkbox"
import { Separator } from "../../../layouts/Separator"

const isNonSeparator = /[\p{L}\p{N}]/u

function deDuplicate(text: string, keepSeparators: boolean) {
  let output = ""

  for (const char of text) {
    if (keepSeparators && !isNonSeparator.test(char)) {
      output += char
      continue
    }

    const index = output.indexOf(char)

    if (index != -1) {
      output = output.slice(0, index) + output.slice(index + 1)
    } else {
      output += char
    }
  }

  return output
}

export default function () {
  const [value, setValue] = createSignal("")
  const [keepSeparators, setKeepSeparators] = createSignal(false)

  const output = createMemo(() =>
    deDuplicate(value() || "Type something here...", keepSeparators())
  )

  return (
    <>
      <AutoResizeTextarea
        class="field"
        onInput={(event) => setValue(event.currentTarget.value)}
        placeholder="Type something here..."
        value={value()}
      />

      <div class="mt-4 break-words" classList={{ placeholder: output().trim() == "" }}>
        <span>{output()}</span>
      </div>

      <Separator />

      <LabeledCheckbox
        checked={keepSeparators()}
        label="Keep separators?"
        onInput={(event) => setKeepSeparators(event.currentTarget.checked)}
      />
    </>
  )
}
