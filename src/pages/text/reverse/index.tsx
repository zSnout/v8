import { createSignal } from "solid-js"
import { AutoResizeTextarea } from "../../../components/fields/AutoResizeTextarea"

export default function () {
  const [value, setValue] = createSignal("")

  return (
    <>
      <AutoResizeTextarea
        class="field"
        onInput={(event) => setValue(event.currentTarget.value)}
        placeholder="Type something here..."
        value={value()}
      />

      <div
        class="mt-4 break-words"
        classList={{ placeholder: value().trim() == "" }}
      >
        {value().split("").reverse().join("")}
      </div>
    </>
  )
}
