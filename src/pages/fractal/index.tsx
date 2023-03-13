import { ColorModifiers } from "@/components/ColorModifiers"
import { ErrorBoundary } from "@/components/Error"
import { Fa } from "@/components/Fa"
import { Radio } from "@/components/fields/Radio"
import { Range } from "@/components/fields/Range"
import { ModalButton } from "@/components/Modal"
import { DynamicOptions } from "@/components/nav/Options"
import { unwrap } from "@/components/result"
import { WebGLInteractiveCoordinateCanvas } from "@/components/webgl"
import { Separator } from "@/layouts/Separator"
import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons"
import { createSignal } from "solid-js"
import fragmentSource from "./fragment.glsl"

// Because users likely want more control over lower detail values, we map the
// sliders so the bottom half [0, 500) actually maps to [0, 100), and the top
// half [500, 1000] maps to [100, 1000].

function detailValueToSlider(value: number) {
  value = Math.min(1000, Math.max(0, value))

  if (value < 100) {
    return value * 5
  }

  return (value - 100) / 1.8 + 500
}

function detailSliderToValue(value: number) {
  value = Math.min(1000, Math.max(0, value))

  if (value < 500) {
    return value / 5
  }

  return 1.8 * (value - 500) + 100
}

// Similar logic for fractal size; this time [0, 500) maps to [0, 2) and
// [500, 1000] maps to [2, 10].

function fractalSizeValueToSlider(value: number) {
  value = Math.min(10, Math.max(0, value))

  if (value < 2) {
    return 250 * value
  }

  return (125 * (value + 6)) / 2
}

function fractalSizeSliderToValue(value: number) {
  value = Math.min(1000, Math.max(0, value))

  if (value < 500) {
    return value / 250
  }

  return (2 * value) / 125 - 6
}

function Slider(props: {
  class?: string
  name: string
  decimalDigits?: number

  get: () => number
  set: (value: number) => void

  valueToSlider: (value: number) => number
  sliderToValue: (value: number) => number
}) {
  return (
    <Range
      class={props.class}
      decimalDigits={props.decimalDigits}
      name={props.name}
      min={0}
      max={1000}
      step="any"
      get={() => props.valueToSlider(props.get())}
      getLabel={() => props.get().toFixed(props.decimalDigits)}
      set={(value) => props.set(props.sliderToValue(value))}
    />
  )
}

type Theme = "simple" | "gradient"

const themeMap: Record<Theme, number> = {
  simple: 1,
  gradient: 2,
}

export function Index() {
  const [detail, setDetail] = createSignal(100)
  const [minDetail, setMinDetail] = createSignal(0)
  const [fractalSize, setFractalSize] = createSignal(2)
  const [theme, setTheme] = createSignal<Theme>("gradient")

  let gl: WebGLInteractiveCoordinateCanvas | undefined

  return (
    <>
      <ErrorBoundary>
        {() => (
          <canvas
            class="h-full w-full touch-none"
            ref={(canvas) => {
              gl = unwrap(WebGLInteractiveCoordinateCanvas.of(canvas))
              unwrap(gl.load(fragmentSource))

              gl.setCoords({
                bottom: -1.25,
                top: 1.25,
                left: -2,
                right: 0.5,
              })

              gl.setReactiveUniform("u_detail", detail)
              gl.setReactiveUniform("u_detail_min", minDetail)
              gl.setReactiveUniform("u_fractal_size", () => fractalSize() ** 2)
              gl.setReactiveUniform("u_theme", () => themeMap[theme()])
              gl.draw()
            }}
          />
        )}
      </ErrorBoundary>

      <DynamicOptions
        buttons={
          <ModalButton
            onClick={() => {
              if (!gl) {
                return
              }

              gl.setCoords({
                bottom: -1.25,
                top: 1.25,
                left: -2,
                right: 0.5,
              })
            }}
          >
            <Fa
              class="h-6 w-6"
              icon={faLocationCrosshairs}
              title="Reset Position"
            />
          </ModalButton>
        }
      >
        <Radio
          get={theme}
          label="Theme"
          options={["simple", "gradient"]}
          set={setTheme}
        />

        <Separator />

        <Slider
          class="mb-2"
          name="Detail"
          get={detail}
          set={(value) => {
            value = Math.floor(Math.max(5, value))
            setDetail(value)

            if (minDetail() > value) {
              setMinDetail(value)
            }
          }}
          valueToSlider={detailValueToSlider}
          sliderToValue={detailSliderToValue}
        />

        <Slider
          class="mb-2"
          name="Min. Detail"
          get={minDetail}
          set={(value) => {
            value = Math.floor(value)

            if (minDetail() > detail()) {
              setMinDetail(value)
              setDetail(value)
            } else {
              setMinDetail(value)
            }
          }}
          valueToSlider={detailValueToSlider}
          sliderToValue={detailSliderToValue}
        />

        <Slider
          class="mb-6"
          name="Fractal Size"
          get={fractalSize}
          set={setFractalSize}
          valueToSlider={fractalSizeValueToSlider}
          sliderToValue={fractalSizeSliderToValue}
          decimalDigits={2}
        />

        {gl ? <ColorModifiers gl={gl} /> : undefined}
      </DynamicOptions>
    </>
  )
}
