import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import { createSignal } from "solid-js"
import { Fa } from "./Fa"
import { Range } from "./fields/Range"
import type { WebGLCanvas } from "./webgl"

export function ColorModifiers(props: { gl: WebGLCanvas }) {
  const [colorOffset, setColorOffset] = createSignal(0)
  const [spectrum, setSpectrum] = createSignal(100)
  const [smoothness, setSmoothness] = createSignal(100)
  const [repetition, setRepetition] = createSignal(1)
  const [repSign, setRepSign] = createSignal(-1)

  props.gl.setReactiveUniform("u_color_offset", () => colorOffset() / 360)
  props.gl.setReactiveUniform("u_color_spectrum", () => spectrum() / 100)
  props.gl.setReactiveUniform(
    "u_color_smoothness",
    () => 1 - smoothness() / 100
  )
  props.gl.setReactiveUniform(
    "u_color_repetition",
    () => repetition() * repSign()
  )

  return (
    <>
      <Range
        class="field w-full"
        name="Color Offset"
        min={0}
        max={360}
        step="any"
        get={colorOffset}
        getLabel={() => colorOffset().toFixed(0) + "°"}
        set={setColorOffset}
      />

      <Range
        class="field mt-0.5 mb-2 w-full"
        name="Spectrum"
        min={0}
        max={100}
        step="any"
        get={spectrum}
        getLabel={() => spectrum().toFixed(0) + "%"}
        set={setSpectrum}
      />

      <Range
        class="field mt-0.5 mb-2 w-full"
        name="# of colors"
        min={50}
        max={100}
        step="any"
        get={smoothness}
        getLabel={() =>
          smoothness() == 100
            ? "all"
            : (1 / (1 - smoothness() / 100)).toFixed(2)
        }
        set={setSmoothness}
      />

      <div class="flex gap-2">
        <button
          class="field flex h-4.5 w-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-z-body p-0 transition"
          role="checkbox"
          onClick={() => setRepSign((sign) => (sign == 1 ? -1 : 1))}
        >
          <Fa
            class="h-3 w-3"
            icon={repSign() == 1 ? faPlus : faMinus}
            title="Flip Sign"
          />
        </button>

        <div class="w-full">
          <Range
            class="before:translate-x-[calc(-50%_-_0.75rem)]"
            name="Repetition"
            min={1}
            max={10}
            step="any"
            get={repetition}
            getLabel={() => repetition().toFixed(1) + "x"}
            set={setRepetition}
          />
        </div>
      </div>
    </>
  )
}
