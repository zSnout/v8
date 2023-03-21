import { ColorModifiers } from "@/components/ColorModifiers"
import { createEventListener } from "@/components/create-event-listener"
import { ErrorBoundary } from "@/components/Error"
import { Fa } from "@/components/Fa"
import { CheckboxGroup, Radio } from "@/components/fields/Radio"
import { Range } from "@/components/fields/Range"
import { WebGLInteractiveCoordinateCanvas } from "@/components/glsl/canvas/interactive"
import { textToGLSL } from "@/components/glsl/math/output"
import { trackMouse } from "@/components/glsl/mixins/track-mouse"
import { trackTime } from "@/components/glsl/mixins/track-time"
import type { Vec2 } from "@/components/glsl/types"
import { ModalButton } from "@/components/Modal"
import { DynamicOptions } from "@/components/nav/Options"
import { unwrap } from "@/components/result"
import {
  createBooleanSearchParam,
  createNumericalSearchParam,
  createSearchParam,
} from "@/components/search-params"
import {
  faExclamationTriangle,
  faLocationCrosshairs,
} from "@fortawesome/free-solid-svg-icons"
import {
  Accessor,
  createEffect,
  createSignal,
  Setter,
  Show,
  untrack,
} from "solid-js"
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

type Theme = "simple" | "gradient" | "rotation"

const themeMap: Record<Theme, number> = {
  simple: 1,
  gradient: 2,
  rotation: 3,
}

export function Index() {
  const [equation, setEquation] = createSearchParam("equation", "z^2 + c")
  const [parseError, setParseError] = createSignal<string>()

  const [theme, setTheme] = createSearchParam<Theme>("theme", "simple")

  const [effectSplit, setEffectSplit] = createBooleanSearchParam("split")

  const [detail, setDetail] = createNumericalSearchParam("detail", 100)
  const [minDetail, setMinDetail] = createNumericalSearchParam("minDetail", 0)
  const [fractalSize, setFractalSize] = createNumericalSearchParam("size", 2)

  let gl: WebGLInteractiveCoordinateCanvas | undefined

  let mouse!: Accessor<Vec2>
  let time!: Accessor<number>
  let speed!: Accessor<number>
  let setSpeed!: Setter<number>

  if (typeof document != "undefined") {
    createEventListener(document, "keydown", (event) => {
      if (
        !event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        (event.key == "f" || event.key == "F")
      ) {
        const eq = untrack(equation)

        const eqWithoutConstants = eq
          .replace(/\$\([^)]*\)/g, "(m)")
          .replace(/@\([^)]*\)/g, `(t)`)

        if (eq == eqWithoutConstants) {
          const [x, y] = untrack(mouse)

          setEquation(
            eq
              .replace(/m/g, `$(${x} ${y < 0.0 ? y : `+ ${y}`}i)`)
              .replace(/t(?!an|h)/g, `@(${untrack(time)})`),
          )

          return
        } else {
          setEquation(eqWithoutConstants)
        }
      }
    })
  }

  return (
    <>
      <ErrorBoundary>
        {() => (
          <canvas
            class="h-full w-full touch-none"
            ref={(canvas) => {
              gl = unwrap(
                WebGLInteractiveCoordinateCanvas.of(canvas, {
                  saveCoordinates: true,
                  top: 1.25,
                  right: 0.5,
                  bottom: -1.25,
                  left: -2,
                }),
              )

              createEffect(() => {
                try {
                  const glsl = textToGLSL(equation())

                  if (glsl.ok) {
                    setParseError()
                    gl?.load(fragmentSource.replace(/EQ/g, glsl.value))
                    gl?.draw()
                  } else {
                    setParseError(glsl.reason)
                  }
                } catch {}
              })

              gl.setReactiveUniform("u_theme", () => themeMap[theme()])
              gl.setReactiveUniform("u_effect_split", effectSplit)
              gl.setReactiveUniform("u_detail", detail)
              gl.setReactiveUniform("u_detail_min", minDetail)
              gl.setReactiveUniform("u_fractal_size", () => fractalSize() ** 2)

              mouse = trackMouse(gl)
              ;[time, speed, setSpeed] = trackTime(gl)

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
        <Radio<Theme>
          get={theme}
          label="Theme"
          options={["simple", "gradient", "rotation"]}
          set={setTheme}
        />

        <CheckboxGroup
          class="mt-2"
          options={[
            [
              theme() == "rotation" ? "halo?" : "split?",
              effectSplit,
              setEffectSplit,
            ],
          ]}
        />

        <div class="relative mt-6 w-full">
          <input
            class="field w-full bg-z-body font-mono"
            onInput={(event) => setEquation(event.currentTarget.value)}
            type="text"
            value={equation()}
          />

          <Show when={parseError() != null}>
            <Fa
              class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
              icon={faExclamationTriangle}
              title="Error"
            />
          </Show>
        </div>

        <Show when={equation().includes("t")}>
          <Slider
            class="mt-3"
            name="Speed"
            get={speed}
            set={setSpeed}
            valueToSlider={fractalSizeValueToSlider}
            sliderToValue={fractalSizeSliderToValue}
            decimalDigits={2}
          />
        </Show>

        <Slider
          class="mb-2 mt-6"
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

        {gl ? <ColorModifiers gl={gl} save /> : undefined}
      </DynamicOptions>
    </>
  )
}
