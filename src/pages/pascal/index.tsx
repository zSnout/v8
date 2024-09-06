import { pascal } from "@/components/factorial"
import { compile, type Compiled } from "@/components/glsl/math/pascal"
import type { BigMaybeHalf } from "@/components/maybehalf"
import { error } from "@/components/result"
import { ShortcutManager } from "@/learn/lib/shortcuts"
import { createRemSize, createScreenSize } from "@/learn/lib/size"
import { MQEditable } from "@/mathquill"
import { parseLatex } from "@/mathquill/parse"
import { batch, createMemo, createSignal, For, Show, untrack } from "solid-js"
import { createStore } from "solid-js/store"
import { Portal } from "solid-js/web"

const SQRT_1_3 = 1 / Math.sqrt(3)

type Selection = "red" | "yellow" | "green" | "blue" | "purple"

const FILL = {
  red: "fill-[--zx-bg-red]",
  yellow: "fill-[--zx-bg-yellow]",
  green: "fill-[--zx-bg-green]",
  blue: "fill-[--zx-bg-blue]",
  purple: "fill-[--zx-bg-purple]",
}

const BG = {
  red: "bg-[--zx-bg-red]",
  yellow: "bg-[--zx-bg-yellow]",
  green: "bg-[--zx-bg-green]",
  blue: "bg-[--zx-bg-blue]",
  purple: "bg-[--zx-bg-purple]",
}

const STROKE = {
  red: "stroke-[--zx-stroke-red]",
  yellow: "stroke-[--zx-stroke-yellow]",
  green: "stroke-[--zx-stroke-green]",
  blue: "stroke-[--zx-stroke-blue]",
  purple: "stroke-[--zx-stroke-purple]",
}

const TEXT = {
  red: "fill-[--zx-text-red]",
  yellow: "fill-[--zx-text-yellow]",
  green: "fill-[--zx-text-green]",
  blue: "fill-[--zx-text-blue]",
  purple: "fill-[--zx-text-purple]",
}

const COLORS = ["red", "yellow", "green", "blue", "purple"] as const

export function Main() {
  const [expr, setExpr] = createStore({
    red: "nmod2=0",
    yellow: "",
    green: "",
    blue: "",
    purple: "",
  })

  const exec = COLORS.map(
    (color) =>
      [
        color,
        createMemo(() => {
          try {
            const node = parseLatex(expr[color])
            if (!node.ok) {
              return node
            }
            return compile(node.value, ["n"] as const)
          } catch (e) {
            return error(e)
          }
        }),
      ] as const,
  )

  const fns = createMemo(() => {
    const output: [(typeof COLORS)[number], Compiled<"n">][] = []
    for (const [color, acc] of exec) {
      const fn = acc()
      if (fn.ok) {
        output.push([color, fn.value])
      }
    }
    return output
  })

  const [width, setWidth] = createSignal(64)
  const halfWidth = createMemo(() => width() / 2)
  const height = createMemo(() => 3 * halfWidth() * SQRT_1_3)
  const pathEnd = createMemo(
    () =>
      `v ${width() * SQRT_1_3} l ${halfWidth()} ${halfWidth() * SQRT_1_3} l ${halfWidth()} ${-halfWidth() * SQRT_1_3} v ${-width() * SQRT_1_3} l -${halfWidth()} ${-halfWidth() * SQRT_1_3} l -${halfWidth()} ${halfWidth() * SQRT_1_3}`,
  )

  function getSelection({ value }: BigMaybeHalf): Selection | null {
    if (value == 0n) {
      return null
    }
    for (const [color, fn] of fns()) {
      try {
        if (fn({ n: value })) {
          return color
        }
      } catch (e) {
        console.error(e)
      }
    }
    return null
  }

  function zoom(scale: number) {
    batch(() => {
      const currentWidth = untrack(width)
      const nextWidth = setWidth((x) => Math.max(16, Math.min(256, x * scale)))
      const ratio = nextWidth / currentWidth
      setOx((x) => (x + size.width / 2) * ratio - size.width / 2)
      setOy((y) => (y + size.height / 2) * ratio - size.height / 2)
    })
  }

  const manager = new ShortcutManager()
  manager.scoped({ key: "-" }, () => zoom(0.5))
  manager.scoped({ key: "+" }, () => zoom(2))
  manager.scoped({ key: "=" }, () => zoom(2))

  let svg!: SVGSVGElement
  const size = createScreenSize()
  const [ox, setOx] = createSignal(-size.width / 2 + halfWidth())
  const [oy, setOy] = createSignal(-3 * height())
  const oxp = createMemo(() => ox() / width())
  const oyp = createMemo(() => oy() / height())
  const rem = createRemSize()

  const mapX: Record<number, number> = {
    [WheelEvent.DOM_DELTA_PIXEL]: 1,
    get [WheelEvent.DOM_DELTA_LINE]() {
      return untrack(rem)
    },
    get [WheelEvent.DOM_DELTA_PAGE]() {
      return untrack(() => size.width)
    },
  }

  const mapY: Record<number, number> = {
    [WheelEvent.DOM_DELTA_PIXEL]: 1,
    get [WheelEvent.DOM_DELTA_LINE]() {
      return untrack(rem)
    },
    get [WheelEvent.DOM_DELTA_PAGE]() {
      return untrack(() => size.height)
    },
  }

  const xc = createMemo(() => Math.ceil(size.width / width()) + 3)
  const yc = createMemo(() => Math.ceil(size.height / height()) + 2)

  const xbm = createMemo(() => Math.floor(ox() / (width() * xc())) * xc())
  const ybm = createMemo(() => Math.floor(oy() / (height() * yc())) * yc())

  const xi = createMemo(() => Array.from({ length: xc() }, (_, i) => i))
  const yi = createMemo(() => Array.from({ length: yc() }, (_, i) => i))

  const [hx, setHx] = createSignal(0)
  const [hy, setHy] = createSignal(0)

  const unselected = (<g />) as SVGGElement
  const selected = (<g />) as SVGGElement

  return (
    <>
      <svg
        class="fixed inset-0"
        ref={svg!}
        viewBox={`0 0 ${size.width} ${size.height}`}
        onWheel={(event) => {
          event.preventDefault()
          setOx((x) => x + event.deltaX * (mapX[event.deltaMode] ?? 1))
          setOy((y) => y + event.deltaY * (mapY[event.deltaMode] ?? 1))
        }}
      >
        {unselected}
        {selected}

        <For each={xi()}>
          {(xi) => (
            <For each={yi()}>
              {(yi) => {
                const xp0 = createMemo(() => {
                  if (xbm() + (xi + (yi % 2 ? 1.5 : 1)) < oxp()) {
                    return xbm() + (xi + xc())
                  } else {
                    return xbm() + xi
                  }
                })

                const yp = createMemo(() => {
                  if (ybm() + (yi + 1) < oyp()) {
                    return ybm() + (yi + yc())
                  } else {
                    return ybm() + yi
                  }
                })

                const xp = createMemo(() => xp0() + Math.floor(yp() / 2))

                const x = createMemo(
                  () => width() * xp0() - ox() - (yp() % 2 ? halfWidth() : 0),
                )

                const y = createMemo(() => height() * yp() - oy())

                const value = createMemo(() =>
                  pascal(BigInt(xp()), BigInt(yp())),
                )

                const valueAsStr = createMemo(() => {
                  const w = width()
                  const v = value()
                  return v.toString(12 * (Math.max(64, w) / 64), 2)
                })

                const valueStrLen = createMemo(() => {
                  const str = valueAsStr()
                  if (str == "0") {
                    return 6
                  }
                  let len = str.length
                  if (yp() < 0) {
                    if (!str.startsWith("-")) {
                      len++
                    }
                    if (!str.includes("e") && !str.includes(".5")) {
                      len += 2
                    }
                  }
                  return len
                })

                const fontSize = createMemo(() => {
                  const w = width()
                  const len = valueStrLen()
                  return (1.5 * w) / Math.max(4, len) + "px"
                })

                const selection = createMemo(() => getSelection(value()))

                const el = (
                  <g
                    onmouseover={() => {
                      setHx(xp())
                      setHy(yp())
                    }}
                  >
                    <path
                      d={`M ${x()} ${y()} ${pathEnd()}`}
                      fill="transparent"
                      stroke-width={value() ? 1 : 0}
                      class={
                        !value().value ? ""
                        : !selection() ?
                          "stroke-z-border transition"
                        : `${STROKE[selection()!]} ${FILL[selection()!]} transition`

                      }
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />

                    <Show when={width() > 20}>
                      <text
                        x={x() + width() / 2}
                        y={y() + halfWidth() * SQRT_1_3}
                        text-anchor="middle"
                        alignment-baseline="central"
                        class={
                          "whitespace-pre transition " +
                          (!value().value ? "fill-[--zx-text-muted]"
                          : !selection() ? "fill-z-text"
                          : TEXT[selection()!])
                        }
                        font-size={fontSize()}
                      >
                        {valueAsStr()}
                        {/* {`${xp()},${yp()}`} */}
                        {/* {`${yp() - xp()},${-xp() - 1}`} */}
                      </text>
                    </Show>
                  </g>
                )

                return (
                  <Portal mount={selection() ? selected : unselected} isSVG>
                    {el}
                  </Portal>
                )
              }}
            </For>
          )}
        </For>
      </svg>

      <div class="absolute left-40 top-40 flex flex-col gap-1">
        <p class="whitespace-pre rounded bg-z-text px-3 py-1 font-mono text-z-bg-body shadow transition">
          x:{Math.round(hx()).toString().padStart(6, " ")}
          <br />
          y:{Math.round(hy()).toString().padStart(6, " ")}
        </p>
        <For each={["red", "yellow", "green", "blue", "purple"] as const}>
          {(key, index) => (
            <div
              class="group"
              classList={{
                "opacity-30": !expr[key].trim(),
              }}
            >
              <MQEditable
                class={"w-full rounded px-2 py-1 shadow transition " + BG[key]}
                latex={expr[key]}
                edit={(mq) => setExpr(key, mq.latex())}
              />
              <span>
                {(() => {
                  if (!expr[key].trim()) {
                    return
                  }
                  const v = exec[index()]?.[1]()
                  if (!v || v.ok) {
                    return
                  }
                  return "⚠️ " + v.reason
                })()}
              </span>
            </div>
          )}
        </For>
      </div>
    </>
  )
}
