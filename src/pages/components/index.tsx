import { Heading } from "@/components/Heading"
import { Separator } from "@/components/Separator"
import { Radio } from "@/components/fields/Radio"
import { SearchBarCore } from "@/components/fields/SearchBar"
import { toDateString } from "@/components/to-date-string"
import { createSignal } from "solid-js"

export function Main() {
  const [radio, setRadio] = createSignal<"hi" | "hello" | "earth" | "world">(
    "hi",
  )

  return (
    <>
      <Heading>A heading with text</Heading>

      <Separator />

      <p>
        default date: {toDateString(new Date(Date.now()))}
        <br />
        short date: {toDateString(new Date(Date.now()), { short: true })}
      </p>

      <Radio
        class="mx-auto max-w-md font-mono"
        label="Hello"
        options={["hi", "hello", "earth", "world"]}
        get={radio}
        set={setRadio}
      />

      <SearchBarCore
        class="mx-auto mt-6"
        open={false}
        main={
          <input
            class="w-96 max-w-full rounded-lg bg-z-field px-3 py-2 text-z transition focus-visible:outline-none"
            value="hello world"
          />
        }
        drawer={(active) => (
          <div>
            {Array(600)
              .fill(0)
              .map((_, index) => (
                <button
                  class="w-full px-3 py-1 transition"
                  classList={{ "bg-z-field-selected": active() == index }}
                >
                  hello
                </button>
              ))}
          </div>
        )}
        options={600}
      />
    </>
  )
}
