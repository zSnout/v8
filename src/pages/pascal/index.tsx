import { nCr } from "@/components/factorial"
import { createRemSize, createScreenSize } from "@/learn/lib/size"
import { createMemo, createSignal, For, untrack } from "solid-js"

const HEXAGON_WIDTH = 64
const HEXAGON_WIDTH_HALF = HEXAGON_WIDTH / 2
const HEXAGON_HEIGHT = HEXAGON_WIDTH * (1.5 / Math.sqrt(3))

export function Main() {
  let svg!: SVGSVGElement
  const size = createScreenSize()
  const [ox, setOx] = createSignal(0)
  const [oy, setOy] = createSignal(0)
  const oxp = createMemo(() => ox() / HEXAGON_WIDTH)
  const oyp = createMemo(() => oy() / HEXAGON_HEIGHT)
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

  const xc = createMemo(() => Math.floor(size.width / HEXAGON_WIDTH) + 3)
  const yc = createMemo(() => Math.floor(size.height / HEXAGON_HEIGHT) + 2)

  const xm = createMemo(() => Math.floor(ox() / HEXAGON_WIDTH))
  const ym = createMemo(() => Math.floor(oy() / HEXAGON_HEIGHT))

  const xbm = createMemo(() => Math.floor(ox() / (HEXAGON_WIDTH * xc())) * xc())
  const ybm = createMemo(
    () => Math.floor(oy() / (HEXAGON_HEIGHT * yc())) * yc(),
  )

  const xi = createMemo(() => Array.from({ length: xc() }, (_, i) => i))
  const yi = createMemo(() => Array.from({ length: yc() }, (_, i) => i))

  return (
    <>
      <svg
        class="fixed inset-0 bg-red-200"
        ref={svg!}
        viewBox={`0 0 ${size.width} ${size.height}`}
        onWheel={(event) => {
          event.preventDefault()
          setOx((x) => x + event.deltaX * (mapX[event.deltaMode] ?? 1))
          setOy((y) => y + event.deltaY * (mapY[event.deltaMode] ?? 1))
        }}
      >
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
                  () =>
                    HEXAGON_WIDTH * xp0() -
                    ox() -
                    (yi % 2 ? HEXAGON_WIDTH_HALF : 0),
                )

                const y = createMemo(() => HEXAGON_HEIGHT * yp() - oy())

                return (
                  <g>
                    <path
                      d={`M ${x()} ${y()} v ${64 / Math.sqrt(3)} l 32 ${32 / Math.sqrt(3)} l 32 ${-32 / Math.sqrt(3)} v ${-64 / Math.sqrt(3)} l -32 ${-32 / Math.sqrt(3)} l -32 ${32 / Math.sqrt(3)}`}
                      fill={
                        ["red", "orange", "yellow", "green", "blue", "purple"][
                          Math.min(xp(), yp() - xp())
                        ] || "white"
                      }
                      stroke-width={1}
                      stroke="black"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />

                    <text
                      x={x() + HEXAGON_WIDTH / 2}
                      y={y() + 32 / Math.sqrt(3)}
                      text-anchor="middle"
                      alignment-baseline="middle"
                    >
                      {/* {nCr(BigInt(xp()), BigInt(yp())).toString()} */}
                      {`${xp()},${yp()}`}
                    </text>
                  </g>
                )
              }}
            </For>
          )}
        </For>
      </svg>
      <p class="absolute left-40 top-40 w-20 bg-white px-4 py-1 text-right font-mono">
        {ox()}
        <br />
        {oy()}
        <br />
        {xbm()}
      </p>
    </>
  )
}
