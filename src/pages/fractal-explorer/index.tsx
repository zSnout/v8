import { ColorModifiers } from "@/components/ColorModifiers"
import { ErrorBoundary } from "@/components/Error"
import { Fa } from "@/components/Fa"
import { ModalButton } from "@/components/Modal"
import { createEventListener } from "@/components/create-event-listener"
import { CheckboxGroup, Radio } from "@/components/fields/Radio"
import { Range } from "@/components/fields/Range"
import { WebGLInteractiveCoordinateCanvas } from "@/components/glsl/canvas/interactive"
import { textToGLSL } from "@/components/glsl/math/output"
import { trackMouse } from "@/components/glsl/mixins/track-mouse"
import { trackTime } from "@/components/glsl/mixins/track-time"
import type { Vec2 } from "@/components/glsl/types"
import { DynamicOptions } from "@/components/nav/Options"
import { unwrap } from "@/components/result"
import {
  createBooleanSearchParam,
  createNumericalSearchParam,
  createSearchParam,
} from "@/components/search-params"
import {
  faExclamationTriangle,
  faGears,
  faLocationCrosshairs,
  faQuestion,
  faSliders,
} from "@fortawesome/free-solid-svg-icons"
import {
  Accessor,
  Index,
  Setter,
  Show,
  createEffect,
  createSignal,
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

type Theme = "simple" | "gradient" | "plot"

const themeMap: Record<Theme, number> = {
  simple: 1,
  gradient: 2,
  plot: 3,
}

function Equation(props: {
  get: () => string
  set: (value: string) => void
  error: () => string | undefined
  label: string
}) {
  return (
    <div class="relative mt-4 w-full">
      <input
        class="z-field w-full bg-z-body font-mono"
        onInput={(event) => props.set(event.currentTarget.value)}
        type="text"
        value={props.get()}
      />

      <Show when={props.label}>
        <p class="absolute left-2 top-0 -translate-y-1/2 rounded bg-z-body px-2 py-1 text-sm text-z-subtitle transition [line-height:1]">
          {props.label}
        </p>
      </Show>

      <Show when={props.error()}>
        <Fa
          class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
          icon={faExclamationTriangle}
          title="Error"
        />
      </Show>
    </div>
  )
}

function p(strings: TemplateStringsArray, ...values: (number | string)[]) {
  return (
    <p class="text-z transition">
      <Index each={values}>
        {(value, index) => (
          <>
            {strings[index]}
            <code class="rounded bg-z-body-selected px-1 text-z transition dark:bg-z-body">
              {((value) => {
                if (typeof value == "number") {
                  return value
                } else {
                  return String(value)
                }
              })(value())}
            </code>
          </>
        )}
      </Index>
      {strings.at(-1)}
    </p>
  )
}

export function Main() {
  const [equation, setEquation] = createSearchParam("equation", "z^2 + c")
  const [eqParseError, setEqParseError] = createSignal<string>()

  const [c, setC] = createSearchParam("c", "p")
  const [cParseError, setCParseError] = createSignal<string>()

  const [z, setZ] = createSearchParam("z", "p")
  const [zParseError, setZParseError] = createSignal<string>()

  const [theme, setTheme] = createSearchParam<Theme>("theme", "simple")

  const [effectSplit, setEffectSplit] = createBooleanSearchParam("split")

  const [detail, setDetail] = createNumericalSearchParam("detail", 100)
  const [minDetail, setMinDetail] = createNumericalSearchParam("min_detail", 0)
  const [fractalSize, setFractalSize] = createNumericalSearchParam("size", 2)
  const [plotSize, setPlotSize] = createNumericalSearchParam("plot_size", 1)
  const [slider, setSlider] = createNumericalSearchParam("slider", 0)

  createEffect(() => {
    // @ts-ignore: "rotation" is no longer a valid theme
    if (theme() == "rotation") {
      setTheme("plot")
      setPlotSize(0)
    }
  })

  type View = "main" | "equations" | "help"
  const [view, setView] = createSignal<View>("main")

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
              .replace(/t(?!an|er|h)/g, `@(${untrack(time)})`),
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
                  const [equationText, zText, cText] = [equation(), z(), c()]

                  if (!gl) {
                    return
                  }

                  const eq = textToGLSL(equationText)
                  if (!eq.ok) {
                    setEqParseError(eq.reason)
                  } else {
                    setEqParseError()
                  }

                  const zEq = textToGLSL(zText)
                  if (!zEq.ok) {
                    setZParseError(zEq.reason)
                  } else {
                    setZParseError()
                  }

                  const cEq = textToGLSL(cText)
                  if (!cEq.ok) {
                    setCParseError(cEq.reason)
                  } else {
                    setCParseError()
                  }

                  if (!(eq.ok && zEq.ok && cEq.ok)) {
                    return
                  }

                  gl.load(
                    fragmentSource
                      .replace(/EQ_Z/g, zEq.value)
                      .replace(/EQ_C/g, cEq.value)
                      .replace(/EQ/g, eq.value),
                  )

                  gl.draw()
                } catch {}
              })

              gl.setReactiveUniform("u_theme", () => themeMap[theme()])
              gl.setReactiveUniform("u_effect_split", effectSplit)
              gl.setReactiveUniform("u_detail", detail)
              gl.setReactiveUniform("u_detail_min", minDetail)
              gl.setReactiveUniform("u_fractal_size", () => fractalSize() ** 2)
              gl.setReactiveUniform("u_plot_size", plotSize)
              gl.setReactiveUniformArray("u_slider", () => [slider() / 100, 0])

              mouse = trackMouse(gl)
              ;[time, speed, setSpeed] = trackTime(gl)

              gl.draw()
            }}
          />
        )}
      </ErrorBoundary>

      <Show when={equation().match(/(?<!ab|co)s(?!in)/)}>
        <div class="fixed bottom-6 left-6 right-6 flex touch-none justify-center">
          <div class="flex w-full max-w-xs flex-1">
            <Range
              class="border-0"
              name="slider"
              min={0}
              max={100}
              step="any"
              get={slider}
              getLabel={() => Math.round(slider()) + "%"}
              set={setSlider}
            />
          </div>
        </div>
      </Show>

      <DynamicOptions
        buttons={
          <>
            <ModalButton onClick={() => setView("main")}>
              <div class="flex h-6 w-6">
                <Fa class="m-auto h-6 w-6" icon={faSliders} title="Main View" />
              </div>
            </ModalButton>

            <ModalButton onClick={() => setView("equations")}>
              <div class="flex h-6 w-6">
                <Fa
                  class="m-auto h-6 w-6"
                  icon={faGears}
                  title="Equation View"
                />
              </div>
            </ModalButton>

            <ModalButton class="mr-auto" onClick={() => setView("help")}>
              <div class="flex h-6 w-6">
                <Fa
                  class="m-auto h-6 w-6"
                  icon={faQuestion}
                  title="Help View"
                />
              </div>
            </ModalButton>

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
          </>
        }
      >
        <Radio<Theme>
          get={theme}
          label="Theme"
          options={["simple", "gradient", "plot"]}
          set={setTheme}
        />

        <CheckboxGroup
          class="mt-2"
          options={[
            [
              theme() == "plot" ? "ignore size?" : "split?",
              effectSplit,
              setEffectSplit,
            ],
          ]}
        />

        <Show when={view() == "equations"}>
          <Equation
            get={z}
            set={setZ}
            error={zParseError}
            label="Initial value of z"
          />

          <Equation
            get={c}
            set={setC}
            error={cParseError}
            label="Initial value of constant c"
          />
        </Show>

        <Equation
          get={equation}
          set={setEquation}
          error={eqParseError}
          label="Iteration function"
        />

        <Show when={view() == "main"}>
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
            class={theme() == "plot" ? "mb-2" : "mb-6"}
            name="Fractal Size"
            get={fractalSize}
            set={setFractalSize}
            valueToSlider={fractalSizeValueToSlider}
            sliderToValue={fractalSizeSliderToValue}
            decimalDigits={2}
          />

          <Show when={theme() == "plot"}>
            <Slider
              class="mb-6"
              name="Plot Size"
              get={plotSize}
              set={setPlotSize}
              valueToSlider={fractalSizeValueToSlider}
              sliderToValue={fractalSizeSliderToValue}
              decimalDigits={2}
            />
          </Show>

          {gl ? <ColorModifiers gl={gl} save /> : undefined}
        </Show>

        <Show when={view() == "help"}>
          <h3 class="mb-2 mt-4 text-center font-semibold">
            Overview of the {theme()} renderer
          </h3>

          <div class="flex flex-col gap-2">
            {p`To start, the variable ${"p"} is set to the complex number represented by its point on-screen (e.g. the center is ${"0"}, a unit above is ${"i"}, a unit to the right is ${"1"}, and so on). The variable ${"c"} is set to ${c()}, and the variable ${"z"} is set to ${z()}.
            `}

            {
              {
                simple: [
                  p`${"z"} is set to ${equation()} (iteration function). The iteration function is applied until ${"z"} is more than ${fractalSize()} (fractal size) units away from the origin.`,

                  p`If ${"z"} escapes this region within ${detail()} (detail level) applications of the iteration function, the point on-screen is assigned a color based on how quickly ${"z"} escaped. If it stays bounded, it is colored black.`,

                  effectSplit()
                    ? p`${"split?"} is enabled, so points that escape and
                      end up below the ${"y = 0"} line will be colored
                      according to the opposite direction of usual (e.g. towards
                      oranges and yellows instead of purples and blues).`
                    : undefined,
                ],

                gradient: [
                  p`${"z"} is set to ${equation()} (iteration function). The iteration function is applied until ${"z"} is more than ${fractalSize()} (fractal size) units away from the origin.`,

                  p`Once ${"z"} escapes this region or once the iteration function has been applied ${detail()} (detail level) times, the point on-screen is colored according to the path it took and the final value of ${"z"}.`,

                  effectSplit()
                    ? p`${"split?"} is enabled, so the colors of points that escape will be adjusted according to the magnitudes of the last three values of ${"z"}.`
                    : undefined,
                ],

                plot: (effectSplit()
                  ? [
                      p`${"z"} is set to ${equation()} (iteration function). The iteration function is then applied ${detail()} (detail level) times.`,
                    ]
                  : [
                      p`${"z"} is set to ${equation()} (iteration function). The iteration function is applied until ${"z"} is more than ${fractalSize()} (fractal size) units away from the origin, being applied at most ${detail()} (detail level) times.`,
                    ]
                ).concat([
                  p`The hue of the point is then given by ${"z"}'s direction from the origin, and the darkness is given by how close ${"z"} is to the origin. How much space is covered by darkness is adjustable using the ${"plot size"} setting.`,
                ]),
              }[theme()]
            }
          </div>
        </Show>

        <Show when={view() == "equations"}>
          <h3 class="mb-2 mt-4 text-center font-semibold">
            Variables usable in equations
          </h3>

          <table class="[&_td:first-child]:pr-4">
            <tbody>
              <tr>
                <td>c</td>
                <td>constant value used in iterations</td>
              </tr>

              <tr>
                <td>m</td>
                <td>mouse position</td>
              </tr>

              <tr>
                <td>p</td>
                <td>value of point on-screen</td>
              </tr>

              <tr>
                <td>s</td>
                <td>adjustable slider between 0 and 1</td>
              </tr>

              <tr>
                <td>t</td>
                <td>number of seconds passed since page load</td>
              </tr>

              <tr>
                <td>z</td>
                <td>value being iterated</td>
              </tr>

              <tr>
                <td>iter</td>
                <td>number of iterations that have passed</td>
              </tr>

              <tr>
                <td>pi</td>
                <td>pi accurate to 15 decimal places</td>
              </tr>

              <tr>
                <td>e</td>
                <td>e accurate to 15 decimal places</td>
              </tr>
            </tbody>
          </table>

          <h3 class="mb-2 mt-4 text-center font-semibold">
            Functions usable in equations
          </h3>

          {p`${"+-*/^"}, ${"sin"}, ${"cos"}, ${"tan"}, ${"real"}, ${"imag"}, and ${"length"} work as expected. ${"exp"} and ${"log"} use base ${"e"}. ${"abs"} calculates the absolute value of the real and imaginary components separately. ${"sign"} returns a normalized vector. ${"angle"} returns a value between ${"-pi"} and ${"pi"}. All functions work on complex numbers.`}
        </Show>
      </DynamicOptions>
    </>
  )
}
