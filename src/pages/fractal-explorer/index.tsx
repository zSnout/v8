import { ColorModifiers } from "@/components/ColorModifiers"
import { DialogButton } from "@/components/Dialog"
import { ErrorBoundary } from "@/components/Error"
import { Fa } from "@/components/Fa"
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
  createBooleanSearchParamWithFallback,
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
  JSX,
  Setter,
  Show,
  createEffect,
  createSignal,
  untrack,
} from "solid-js"
import fragmentSource from "./fragment.glsl"

export type Theme = "simple" | "gradient" | "plot" | "trig" | "black" | "none"

export type InnerTheme = "black" | "gradient" | "plot" | "blobs"

export interface OuterHelp {
  readonly main: JSX.Element
}

export interface InnerHelp {
  readonly main: JSX.Element
  readonly none: JSX.Element
}

export interface OuterThemeInfo {
  readonly id: number
  readonly a?: string | undefined
  readonly b?: string | undefined
  readonly c?: string | undefined
  help(props: { a: boolean; b: boolean; c: boolean }): OuterHelp
}

export interface InnerThemeInfo {
  readonly id: number
  readonly a?: string | undefined
  readonly b?: string | undefined
  help(props: { a: boolean; b: boolean }): InnerHelp
}

export const themeMap: Record<Theme, OuterThemeInfo> = {
  simple: {
    id: 1,
    a: "split out",
    c: "darkness",
    help() {
      return {
        main: p`If ${"z"} escapes that region, the point on-screen is assigned a color based on how quickly ${"z"} escaped.`,
      }
    },
  },
  gradient: {
    id: 2,
    a: "split out",
    c: "darkness",
    help() {
      return {
        main: p`If ${"z"} escapes that region, the point on-screen is colored according to the path it took and the final value of ${"z"}.`,
      }
    },
  },
  plot: {
    id: 3,
    c: "darkness",
    help() {
      return {
        main: p`If ${"z"} escapes that region, the hue of the point is then given by ${"z"}'s direction from the origin, and the darkness is given by how close ${"z"} is to the origin. How much space is covered by darkness is adjustable using the ${"plot size"} setting.`,
      }
    },
  },
  trig: {
    id: 4,
    a: "alts a",
    b: "alts b",
    c: "darkness",
    help() {
      return {
        main: p`If ${"z"} escapes that region, the point on-screen is assigned a color based on how quickly ${"z"} escaped.`,
      }
    },
  },
  black: {
    id: 5,
    a: "white",
    b: "glow",
    help(props) {
      return {
        main: (
          <Show
            when={props.b}
            fallback={
              <Show
                when={props.a}
                fallback={p`If ${"z"} escapes that region, it is colored black.`}
              >
                {p`If ${"z"} escapes that region, it is colored white.`}
              </Show>
            }
          >
            {p`If ${"z"} escapes that region, it is colored gray, with the shade depending on how quickly it escaped.`}
          </Show>
        ),
      }
    },
  },
  none: {
    id: 6,
    help() {
      return {
        main: p`The fractal size is set to infinity, so the point will never escape.`,
      }
    },
  },
}

export const innerThemeMap: Record<InnerTheme, InnerThemeInfo> = {
  black: {
    id: 1,
    a: "white",
    help(props) {
      return {
        main: (
          <Show
            when={props.a}
            fallback={p`If ${"z"} stays bounded, it is colored black.`}
          >
            {p`If ${"z"} stays bounded, it is colored white.`}
          </Show>
        ),
        none: (
          <Show when={props.a} fallback={p`The point is then colored black.`}>
            {p`The point is then colored white.`}
          </Show>
        ),
      }
    },
  },
  gradient: {
    id: 2,
    a: "split in",
    help() {
      return {
        main: p`If ${"z"} stays bounded, the point on-screen is colored according to the path it took and the final value of ${"z"}.`,
        none: p`The point is then colored according to the path it took and the final value of ${"z"}.`,
      }
    },
  },
  plot: {
    id: 3,
    help() {
      return {
        main: p`If ${"z"} stays bounded, the hue of the point is then given by ${"z"}'s direction from the origin, and the darkness is given by how close ${"z"} is to the origin. How much space is covered by darkness is adjustable using the ${"plot size"} setting.`,
        none: p`The point's hue is then given by ${"z"}'s direction from the origin, and the darkness is given by how close ${"z"} is to the origin. How much space is covered by darkness is adjustable using the ${"plot size"} setting.`,
      }
    },
  },
  blobs: {
    id: 4,
    a: "alts a",
    b: "alts b",
    help() {
      return {
        main: p`If ${"z"} stays bounded, the hue of the point is given by calculations involving the path it traveled along.`,
        none: p`The hue of the point is then given by calculations involving the path it traveled along.`,
      }
    },
  },
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
    <div class="text-z transition">
      <Index each={values}>
        {(value, index) => (
          <>
            {strings[index]}
            <span class="inline-block max-w-[12rem] truncate rounded bg-z-body-selected px-1 align-bottom font-mono text-z transition dark:bg-z-body">
              {((value) => {
                if (typeof value == "number") {
                  return value
                } else {
                  return String(value)
                }
              })(value())}
            </span>
          </>
        )}
      </Index>
      {strings.at(-1)}
    </div>
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
  const [innerTheme, setInnerTheme] = createSearchParam<InnerTheme>(
    "inner_theme",
    (() => {
      const t = untrack(theme)
      return (
        t == "simple" || t == "trig" ? "black"
        : t == "none" ? "plot"
        : t
      )
    })(),
  )

  const [split, setSplit] = createSearchParam("split")
  const [effectOuterA, setEffectOuterA] = createBooleanSearchParamWithFallback(
    "outer_a",
    "split",
  )
  const [effectOuterB, setEffectOuterB] = createBooleanSearchParamWithFallback(
    "outer_b",
    "alt_colors",
  )
  const [effectOuterC, setEffectOuterC] = createBooleanSearchParam("outer_c")
  const [effectInnerA, setEffectInnerA] = createBooleanSearchParamWithFallback(
    "inner_a",
    "split",
  )
  const [effectInnerB, setEffectInnerB] = createBooleanSearchParamWithFallback(
    "inner_b",
    "alt_colors",
  )

  createEffect(() => {
    if (split()) {
      if (theme() == "plot") {
        setTheme("none")
        setInnerTheme("plot")
      }
      setSplit(null)
    }
  })

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

              gl.setReactiveUniform("u_theme", () => themeMap[theme()].id)
              gl.setReactiveUniform(
                "u_inner_theme",
                () => innerThemeMap[innerTheme()].id,
              )
              gl.setReactiveUniform("u_effect_outer_a", effectOuterA)
              gl.setReactiveUniform("u_effect_outer_b", effectOuterB)
              gl.setReactiveUniform("u_effect_outer_c", effectOuterC)
              gl.setReactiveUniform("u_effect_inner_a", effectInnerA)
              gl.setReactiveUniform("u_effect_inner_b", effectInnerB)
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
            <DialogButton onClick={() => setView("main")}>
              <div class="flex h-6 w-6">
                <Fa class="m-auto h-6 w-6" icon={faSliders} title="Main View" />
              </div>
            </DialogButton>

            <DialogButton onClick={() => setView("equations")}>
              <div class="flex h-6 w-6">
                <Fa
                  class="m-auto h-6 w-6"
                  icon={faGears}
                  title="Equation View"
                />
              </div>
            </DialogButton>

            <DialogButton class="mr-auto" onClick={() => setView("help")}>
              <div class="flex h-6 w-6">
                <Fa
                  class="m-auto h-6 w-6"
                  icon={faQuestion}
                  title="Help View"
                />
              </div>
            </DialogButton>

            <DialogButton
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
            </DialogButton>
          </>
        }
      >
        <Radio<Theme>
          get={theme}
          label="Theme"
          options={["simple", "gradient", "plot", "trig", "black", "none"]}
          set={setTheme}
        />

        <Radio<InnerTheme>
          class="mt-2"
          get={innerTheme}
          label="Inner Theme"
          options={["black", "gradient", "plot", "blobs"]}
          set={setInnerTheme}
        />

        {CheckboxGroup({
          get class() {
            const o = themeMap[theme()]
            const i = innerThemeMap[innerTheme()]

            if (!(o.a || o.b || o.c || i.a || i.b)) {
              return "mt-2 opacity-30 pointer-events-none"
            } else {
              return "mt-2"
            }
          },
          get options() {
            const o = themeMap[theme()]
            const i = innerThemeMap[innerTheme()]

            const all = [
              [o.a, effectOuterA, setEffectOuterA],
              [o.b, effectOuterB, setEffectOuterB],
              [o.c, effectOuterC, setEffectOuterC],
              [i.a, effectInnerA, setEffectInnerA],
              [i.b, effectInnerB, setEffectInnerB],
            ] as const

            const opts = all.filter(([x]) => x)

            if (opts.length) {
              return opts
            } else {
              return [
                [
                  <em>no color options available</em>,
                  () => false,
                  () => {},
                ] as const,
              ]
            }
          },
        })}

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
              const value = Math.round(Math.exp(v))
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
              const value = Math.round(Math.exp(v) - 1)
              setMinDetail(value)

              if (value > detail()) {
                setDetail(value)
              }
            }}
          />

          <Range
            class={
              theme() == "plot" || innerTheme() == "plot" ? "mb-2" : "mb-6"
            }
            name="Fractal Size"
            min={Math.log(0.1)}
            max={Math.log(100)}
            step="any"
            get={() => Math.log(fractalSize())}
            getLabel={() => fractalSize().toFixed(2)}
            set={(v) => setFractalSize(Math.exp(v))}
          />

          <Show when={theme() == "plot" || innerTheme() == "plot"}>
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

          {gl ?
            <ColorModifiers gl={gl} save />
          : undefined}
        </Show>

        <Show when={view() == "help"}>
          <h3 class="mb-2 mt-4 text-center font-semibold">
            Rendering process (depends on theme)
          </h3>

          <div class="flex flex-col gap-2">
            {p`To start, the variable ${"p"} is set to the complex number represented by its point on-screen (e.g. the center is ${"0"}, a unit above is ${"i"}, a unit to the right is ${"1"}, and so on). The variable ${"c"} is set to ${c()}, and the variable ${"z"} is set to ${z()}.
            `}

            <Show
              when={theme() == "none"}
              fallback={[
                p`${"z"} is then set to ${equation()} (iteration function). That is repeated is applied until ${"z"} is more than ${fractalSize()} (fractal size) units away from the origin for a maximum of ${detail()} (detail level) repetitions.`,
                themeMap[theme()].help({
                  a: effectOuterA(),
                  b: effectOuterB(),
                  c: effectOuterC(),
                }).main,
                innerThemeMap[innerTheme()].help({
                  a: effectInnerA(),
                  b: effectInnerB(),
                }).main,
              ]}
            >
              {p`${"z"} is then set to ${equation()} (iteration function). That is repeated ${detail()} (detail level) times.`}
              {
                innerThemeMap[innerTheme()].help({
                  a: effectInnerA(),
                  b: effectInnerB(),
                }).none
              }
            </Show>
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
