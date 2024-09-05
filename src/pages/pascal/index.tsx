import { createEventListener } from "@/components/create-event-listener"
import { pascal } from "@/components/factorial"
import type { BigMaybeHalf } from "@/components/maybehalf"
import { createRemSize, createScreenSize } from "@/learn/lib/size"
import { createMemo, createSignal, For, Show, untrack } from "solid-js"
import { Portal } from "solid-js/web"

const SQRT_1_3 = 1 / Math.sqrt(3)

type Selection = "red" | "yellow" | "green" | "blue" | "purple"

const BG = {
  red: "fill-[--zx-bg-red]",
  yellow: "fill-[--zx-bg-yellow]",
  green: "fill-[--zx-bg-green]",
  blue: "fill-[--zx-bg-blue]",
  purple: "fill-[--zx-bg-purple]",
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

export function Main() {
  const [width, setWidth] = createSignal(64)
  const halfWidth = createMemo(() => width() / 2)
  const height = createMemo(() => 3 * halfWidth() * SQRT_1_3)
  const pathEnd = createMemo(
    () =>
      `v ${width() * SQRT_1_3} l ${halfWidth()} ${halfWidth() * SQRT_1_3} l ${halfWidth()} ${-halfWidth() * SQRT_1_3} v ${-width() * SQRT_1_3} l -${halfWidth()} ${-halfWidth() * SQRT_1_3} l -${halfWidth()} ${halfWidth() * SQRT_1_3}`,
  )

  function getSelection({ isOverTwo, value }: BigMaybeHalf): Selection | null {
    if (value == 0n) {
      return null
    }
    if (isOverTwo) {
      return null
    }
    if (value == -1n) {
      return "blue"
    }
    if (value % 2n == 0n) {
      return "red"
    }
    return null
  }

  createEventListener(window, "keydown", (event) => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.defaultPrevented
    ) {
      return
    }

    if (event.key == "-") {
      event.preventDefault()
      setWidth((x) => x / 2)
    }
  })

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

  const unselected = (<g></g>) as SVGGElement
  const selected = (<g></g>) as SVGGElement

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

                const valueAsStr = createMemo(() => value().toString())

                const selection = createMemo(() => getSelection(value()))

                const el = (
                  <g>
                    <path
                      d={`M ${x()} ${y()} ${pathEnd()}`}
                      fill="none"
                      stroke-width={value() ? 1 : 0}
                      class={
                        !value() ? ""
                        : !selection() ?
                          "stroke-z-border"
                        : `${STROKE[selection()!]} ${BG[selection()!]}`
                      }
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />

                    <Show when={width() > 20}>
                      <text
                        x={x() + width() / 2}
                        y={y() + halfWidth() * SQRT_1_3}
                        text-anchor="middle"
                        alignment-baseline="middle"
                        class={
                          !value() ? "fill-slate-200"
                          : !selection() ?
                            "fill-z-text"
                          : TEXT[selection()!]
                        }
                        font-size={width() / 4 + "px"}
                      >
                        {/* {`${xp()},${yp()}`} */}
                        {valueAsStr()}
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

      <p class="absolute left-40 top-40 w-20 rounded border border-black bg-white px-4 py-1 text-right font-mono shadow-lg">
        {ox()}
        <br />
        {Math.round(oy())}
        <br />
        {xbm()}
      </p>
    </>
  )
}
