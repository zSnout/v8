import { textToGLSL } from "@/components/glsl/math/output"
import { parse } from "@/components/glsl/math/parse"
import { Heading } from "@/components/Heading"
import { createMemo, createSignal } from "solid-js"

export default function Index() {
  const [math, setMath] = createSignal("z^2 + c")

  const parsed = createMemo(() => {
    const result = parse(math())

    if (result.ok) {
      return JSON.stringify(result.value, undefined, 2)
    } else {
      return "Error: " + result.reason
    }
  })

  const glsl = createMemo(() => {
    const result = textToGLSL(math())

    if (result.ok) {
      return result.value
    } else {
      return "Error: " + result.reason
    }
  })

  return (
    <div class="group/center m-auto flex w-[512px] max-w-full flex-col">
      <Heading>Debug: Math to GLSL</Heading>

      <input
        class="field mb-4"
        onInput={(event) => setMath(event.currentTarget.value)}
        placeholder="Type an expression..."
        type="text"
        value={math()}
      />

      <div class="flex w-full flex-row gap-4">
        <pre class="flex-1 gap-4">{parsed()}</pre>

        <div class="flex flex-1 flex-col gap-4">
          <p>
            <strong>GLSL:</strong> {glsl()}
          </p>
        </div>
      </div>
    </div>
  )
}
