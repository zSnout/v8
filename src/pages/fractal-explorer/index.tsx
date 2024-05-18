import { ColorModifiers } from "@/components/ColorModifiers"
import { ErrorBoundary } from "@/components/Error"
import { Fa } from "@/components/Fa"
import { ModalButton } from "@/components/Modal"
import { createEventListener } from "@/components/create-event-listener"
import { isInteractive } from "@/components/draggable"
import { CheckboxGroup, Radio } from "@/components/fields/Radio"
import { Range } from "@/components/fields/Range"
import { WebGLInteractiveCoordinateCanvas } from "@/components/glsl/canvas/interactive"
import {
  freeze,
  latexToGLSL,
  nodeToTree,
  treeToLatex,
  unfreeze,
} from "@/components/glsl/math/output"
import { parse } from "@/components/glsl/math/parse"
import { trackMouse } from "@/components/glsl/mixins/track-mouse"
import { trackTime } from "@/components/glsl/mixins/track-time"
import type { Vec2 } from "@/components/glsl/types"
import { DynamicOptions } from "@/components/nav/Options"
import { unwrap } from "@/components/result"
import {
  SignalLike,
  createBooleanSearchParam,
  createNumericalSearchParam,
  createSearchParam,
} from "@/components/search-params"
import { MQEditable } from "@/mathquill"
import { parseLatex } from "@/mathquill/parse"
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

export type Theme = "simple" | "gradient" | "plot" | "trig"

export const themeMap: Record<Theme, number> = {
  simple: 1,
  gradient: 2,
  plot: 3,
  trig: 4,
}

function Equation(props: {
  get: () => string
  set: (value: string) => void
  error: () => string | undefined
  label: string
}) {
  return (
    <div class="relative mt-4 w-full">
      <MQEditable
        class="z-field w-full rounded-lg border border-z p-0 shadow-none [&_.mq-root-block]:px-3 [&_.mq-root-block]:py-2"
        latex={props.get()}
        edit={(mq) => {
          props.set(mq.latex())
        }}
      />

      <p class="absolute left-2 top-0 -translate-y-1/2 rounded bg-z-body px-2 py-0 text-sm text-z-subtitle transition [line-height:1]">
        {props.label}
      </p>

      <Show when={props.error()}>
        <Fa
          class="absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2"
          icon={faExclamationTriangle}
          title={props.error() || ""}
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
            <code class="inline-block max-w-[12rem] truncate rounded bg-z-body-selected px-1 align-bottom text-z transition dark:bg-z-body">
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

function createEquationSearchParam(
  name: string,
  initial: string,
): SignalLike<string> {
  const [value, setValue] = createSearchParam(name, `~~${initial}`)

  return [
    () => {
      const v = value()
      if (v.startsWith("~~")) {
        return v.slice(2)
      } else {
        const val = parse(v)
        if (!val.ok) {
          return initial
        } else {
          try {
            return treeToLatex(val.value).value
          } catch {
            return initial
          }
        }
      }
    },
    (value) => {
      setValue("~~" + value)
    },
  ]
}

export function Main() {
  const [equation, setEquation] = createEquationSearchParam(
    "equation",
    "z^{2}+c",
  )
  const [eqParseError, setEqParseError] = createSignal<string>()

  const [c, setC] = createEquationSearchParam("c", "p")
  const [cParseError, setCParseError] = createSignal<string>()

  const [z, setZ] = createEquationSearchParam("z", "p")
  const [zParseError, setZParseError] = createSignal<string>()

  const [theme, setTheme] = createSearchParam<Theme>("theme", "simple")

  const [effectSplit, setEffectSplit] = createBooleanSearchParam("split")
  const [effectAltColors, setEffectAltColors] =
    createBooleanSearchParam("alt_colors")

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
        (event.key == "f" || event.key == "F") &&
        !isInteractive(event)
      ) {
        const unfrozen =
          equation().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)[mt]/) ||
          z().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)[mt]/) ||
          c().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)[mt]/)

        if (unfrozen) {
          const m = untrack(mouse)
          const t = untrack(time)

          for (const [get, set] of [
            [equation, setEquation],
            [z, setZ],
            [c, setC],
          ] as const) {
            try {
              const result = parseLatex(get())
              if (!result.ok) {
                continue
              }
              const node = freeze(result.value, m, t)
              const tree = nodeToTree(node)
              const latex = treeToLatex(tree).value
              set(latex)
            } catch {}
          }
        } else {
          for (const [get, set] of [
            [equation, setEquation],
            [z, setZ],
            [c, setC],
          ] as const) {
            try {
              const result = parseLatex(get())
              if (!result.ok) {
                continue
              }
              const node = unfreeze(result.value)
              const tree = nodeToTree(node)
              const latex = treeToLatex(tree).value
              set(latex)
            } catch {}
          }
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

                  const eq = latexToGLSL(equationText)
                  if (!eq.ok) {
                    setEqParseError(eq.reason)
                  } else {
                    setEqParseError()
                  }

                  const zEq = latexToGLSL(zText)
                  if (!zEq.ok) {
                    setZParseError(zEq.reason)
                  } else {
                    setZParseError()
                  }

                  const cEq = latexToGLSL(cText)
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
              gl.setReactiveUniform("u_effect_alt_colors", effectAltColors)
              gl.setReactiveUniform("u_detail", detail)
              gl.setReactiveUniform("u_detail_min", minDetail)
              gl.setReactiveUniform("u_fractal_size", () => fractalSize() ** 2)
              gl.setReactiveUniform("u_plot_size", plotSize)
              gl.setReactiveUniformArray("u_slider", () => [slider() / 100, 0])
              gl.setReactiveUniform(
                "u_dual_enabled",
                () =>
                  equation().includes("\\dual{") ||
                  z().includes("\\dual{") ||
                  c().includes("\\dual{"),
              )

              mouse = trackMouse(gl)
              ;[time, speed, setSpeed] = trackTime(gl)

              gl.draw()
            }}
          />
        )}
      </ErrorBoundary>

      <Show
        when={
          equation().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)s/) ||
          z().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)s/) ||
          c().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)s/)
        }
      >
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
          options={["simple", "gradient", "plot", "trig"]}
          set={setTheme}
        />

        <CheckboxGroup
          class="mt-2"
          options={[
            [
              theme() == "trig"
                ? "alt colors?"
                : theme() == "plot"
                ? "ignore size?"
                : "split?",
              effectSplit,
              setEffectSplit,
            ],
          ]}
        />

        <Show when={theme() == "trig"}>
          <CheckboxGroup
            class="mt-2"
            options={[
              ["more alt colors?", effectAltColors, setEffectAltColors],
            ]}
          />
        </Show>

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
          <Show
            when={
              equation().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)t/) ||
              z().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)t/) ||
              c().match(/(?<!(?:\\|\\operatorname{)[A-Za-z]*)t/)
            }
          >
            <Range
              class="mt-3"
              name="Speed"
              min={Math.log(0.01)}
              max={Math.log(10)}
              step="any"
              get={() => Math.log(speed())}
              getLabel={() => speed().toFixed(2)}
              set={(v) => setSpeed(Math.exp(v))}
            />
          </Show>

          <Range
            class="mb-2 mt-6"
            name="Detail"
            min={Math.log(10)}
            max={Math.log(1000)}
            step="any"
            get={() => Math.log(detail())}
            getLabel={() => "" + Math.round(detail())}
            set={(v) => {
              const value = Math.exp(v)
              setDetail(value)

              if (minDetail() > value) {
                setMinDetail(value)
              }
            }}
          />

          <Range
            class="mb-2"
            name="Min. Detail"
            min={Math.log(1)}
            max={Math.log(1001)}
            step="any"
            get={() => Math.log(minDetail() + 1)}
            getLabel={() => "" + Math.round(minDetail())}
            set={(v) => {
              const value = Math.exp(v) - 1
              setMinDetail(value)

              if (value > detail()) {
                setDetail(value)
              }
            }}
          />

          <Range
            class={theme() == "plot" ? "mb-2" : "mb-6"}
            name="Fractal Size"
            min={Math.log(0.1)}
            max={Math.log(100)}
            step="any"
            get={() => Math.log(fractalSize())}
            getLabel={() => fractalSize().toFixed(2)}
            set={(v) => setFractalSize(Math.exp(v))}
          />

          <Show when={theme() == "plot"}>
            <Range
              class="mb-6"
              name="Plot Size"
              min={Math.log(0.1)}
              max={Math.log(10.1)}
              step="any"
              get={() => Math.log(plotSize() + 0.09999999)}
              getLabel={() => plotSize().toFixed(2)}
              set={(v) => setPlotSize(Math.exp(v) - 0.09999999)}
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

                trig: [
                  p`${"z"} is set to ${equation()} (iteration function). The iteration function is applied until ${"z"} is more than ${fractalSize()} (fractal size) units away from the origin.`,

                  p`If ${"z"} escapes this region within ${detail()} (detail level) applications of the iteration function, the point on-screen is assigned a color based on how quickly ${"z"} escaped. If it stays bounded, it is colored black.`,

                  effectSplit()
                    ? p`${"split?"} is enabled, so points that escape and
                      end up below the ${"y = 0"} line will be colored
                      according to the opposite direction of usual (e.g. towards
                      oranges and yellows instead of purples and blues).`
                    : undefined,
                ],
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

          {p`${"+-*/^"}, ${"sin"}, ${"cos"}, ${"tan"}, ${"log"}, ${"ln"}, ${"real"}, and ${"imag"} work as expected. ${"exp"} is short for ${"e^x"}. ${"|x|"} calculates the magnitude of a complex number; use ${"unsign"} to take the absolute value of the real and imaginary components separately. ${"sign"} returns a normalized vector. ${"angle"} returns a value between ${"-π"} and ${"π"}. All functions work on complex numbers.`}

          <h3 class="mb-2 mt-4 text-center font-semibold">Dual graphing</h3>

          {p`Dual graphing is helpful for exploring Julia sets. Type ${"dual"} to create a dual value, represented as two overlapping rectangles in the equation editor. The larger value will be used in the main window, and the smaller one in a smaller subwindow. Try changing all instances of ${"c"} to ${"dual(c,m)"}!`}
        </Show>
      </DynamicOptions>
    </>
  )
}
