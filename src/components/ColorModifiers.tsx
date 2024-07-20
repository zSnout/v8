import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons"
import { createSignal, untrack } from "solid-js"
import { Fa } from "./Fa"
import { Range } from "./fields/Range"
import type { WebGLCanvas } from "./glsl/canvas/base"
import { createNumericalSearchParam } from "./search-params"

function createSearchSignal(defaultValue: number, name: string) {
  return createNumericalSearchParam(name, defaultValue)
}

function createPlainSignal(value: number) {
  return createSignal(value)
}

export function ColorModifiers(props: { gl: WebGLCanvas; save?: boolean }) {
  const factory = props.save ? createSearchSignal : createPlainSignal

  const [colorOffset, setColorOffset] = factory(0, "colorOffset")
  const [spectrum, setSpectrum] = factory(100, "spectrum")
  const [smoothness, setSmoothness] = factory(100, "smoothness")
  const [repetition, setRepetition] = factory(1, "repetition")
  const [repetitionSign, setRepetitionSign] = factory(-1, "repetitionSign")

  props.gl.setReactiveUniform("u_color_offset", () => colorOffset() / 360)
  props.gl.setReactiveUniform("u_color_spectrum", () => spectrum() / 100)
  props.gl.setReactiveUniform(
    "u_color_smoothness",
    () => 1 - smoothness() / 100,
  )
  props.gl.setReactiveUniform(
    "u_color_repetition",
    () => repetition() * repetitionSign(),
  )

  return (
    <>
      <Range
        class="z-field w-full"
        name="Color Offset"
        min={0}
        max={360}
        step="any"
        get={colorOffset}
        getLabel={() => colorOffset().toFixed(0) + "°"}
        set={setColorOffset}
      />

      <Range
        class="z-field mb-1.5 mt-0.5 w-full"
        name="Spectrum"
        min={0}
        max={100}
        step="any"
        get={spectrum}
        getLabel={() => spectrum().toFixed(0) + "%"}
        set={setSpectrum}
      />

      <Range
        class="z-field mb-2 mt-0.5 w-full"
        name="# of colors"
        min={50}
        max={100}
        step="any"
        get={smoothness}
        getLabel={() =>
          smoothness() == 100 ? "all" : (
            (1 / (1 - smoothness() / 100)).toFixed(2)
          )
        }
        set={setSmoothness}
      />

      <div class="-mb-1 flex gap-2">
        <button
          class="z-field flex h-4.5 w-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-z-body p-0 transition"
          role="checkbox"
          onClick={() =>
            setRepetitionSign(untrack(repetitionSign) == 1 ? -1 : 1)
          }
        >
          <Fa
            class="h-3 w-3"
            icon={repetitionSign() == 1 ? faPlus : faMinus}
            title="Flip Sign"
          />
        </button>

        <div class="w-full">
          <Range
            class="before:translate-x-[calc(-50%_-_0.75rem)]"
            name="Repetition"
            min={Math.log(0.1)}
            max={Math.log(9.99)}
            step="any"
            get={() => Math.log(repetition())}
            getLabel={() => Math.round(repetition() * 100) + "%"}
            set={(x) => setRepetition(Math.exp(x))}
          />
        </div>
      </div>
    </>
  )
}
