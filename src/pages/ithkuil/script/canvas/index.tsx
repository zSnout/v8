import { Blink, CORES } from "@zsnout/ithkuil/script"

export function path(data: TemplateStringsArray, ...values: number[]): string {
  return String.raw(
    { raw: data },
    ...values.map((value) => String(Math.round(value * 1e6) / 1e6)),
  )
}

export function scriptify1(
  [x1, y1]: [x: number, y: number],
  [x2, y2]: [x: number, y: number],
): string {
  // if (y1 < y2) {
  //   ;[x1, y1, x2, y2] = [x2, y2, x1, y1]
  // }

  const angle = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2
  const tx = 10 * Math.cos(angle)
  const ty = 10 * Math.sin(angle)
  const x4 =
    ((y1 - y2) * (x1 + tx) + (x2 - x1) * (ty - x1)) / (x1 + y1 - x2 - y2)
  const y4 = x1 + y1 - x4
  const x3 = x4 - x1 + x2
  const y3 = y4 - y1 + y2

  return path`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`
}

export function scriptify(
  [x1, y1]: [x: number, y: number],
  [x2, y2]: [x: number, y: number],
): string {
  const angle = (Math.atan2(y2 - y1, x2 - x1) + 2 * Math.PI) % Math.PI

  const [tx, ty] = angle == 0 || angle == Math.PI ? [-10, 10] : [7.5, -7.5]

  const x4 = x1 + tx
  const y4 = y1 + ty
  const x3 = x2 + tx
  const y3 = y2 + ty

  return path`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`
}

export function all(points: [number, number][]) {
  return (
    <>
      {points.map(([x, y]) => (
        <path
          d={`M ${x} ${y} l 0.01 0`}
          stroke="red"
          stroke-width={5}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      ))}

      {points.slice(1).map((p2, i) => (
        <path d={scriptify(points[i]!, p2)} />
      ))}
    </>
  )
}

type Offset =
  | { h: number; v?: undefined; d?: number }
  | { h?: undefined; v: number }
  | { x: number; y: number; d?: number }

const THIN_STROKE_WIDTH = 2.5
const THIN_STROKE_DIAG_WIDTH = 2.5 * Math.SQRT1_2

export function generatePaths(
  x: number,
  y: number,
  offsets: Offset[],
): string[] {
  const outputs: string[] = []

  for (let index = 0; index < offsets.length; index++) {
    const offset = offsets[index]!

    if ("h" in offset && offset.h != null) {
      if (offset.d != null) {
        outputs.push(
          path`
M ${x + 5} ${y - 5}
h ${offset.h}
l ${-offset.d - 5} ${offset.d + 5}
h ${-THIN_STROKE_WIDTH}
l ${offset.d - 5} ${-offset.d + 5}
h ${-offset.h + THIN_STROKE_WIDTH}
z`,
        )

        x += offset.h - offset.d
        y += offset.d - THIN_STROKE_WIDTH
      } else {
        outputs.push(
          path`M ${x + 5} ${y - 5} h ${offset.h} l -10 10 h ${-offset.h} z`,
        )

        x += offset.h
      }
    } else if ("v" in offset && offset.v != null) {
      outputs.push(
        path`M ${x + 5} ${y - 5} v ${offset.v} l -10 10 v ${-offset.v} z`,
      )

      y += offset.v
    } else if (offset.d != null) {
      const angle = Math.atan2(offset.y, offset.x) + Math.PI

      outputs.push(
        path`
M ${x + 3.75} ${y - 3.75}
l ${offset.x} ${offset.y}
l ${-offset.d - 3.75} ${offset.d + 3.75}
l ${THIN_STROKE_DIAG_WIDTH * Math.cos(angle)} ${
          THIN_STROKE_DIAG_WIDTH * Math.sin(angle)
        }
l ${offset.d - 3.75} ${-offset.d + 3.75}
L ${x - 3.75} ${y + 3.75}
z`,
      )

      x += offset.x - offset.d
      y += offset.y + offset.d - THIN_STROKE_WIDTH
    } else {
      outputs.push(
        path`M ${x + 3.75} ${y - 3.75} l ${offset.x} ${
          offset.y
        } l -7.5 7.5 l ${-offset.x} ${-offset.y} z`,
      )

      x += offset.x
      y += offset.y
    }
  }

  return outputs
}

export function Main() {
  return (
    <svg class="m-auto w-full overflow-visible" viewBox="-20 -20 100 100">
      <g>
        <path d="M 0 0 l 40 0 l 0 70 l -40 0 z" fill="red" />
        {generatePaths(3.75, 3.75, [
          { x: 32.5, y: 32.5, d: 31.25 },
          { h: 40 },
        ]).map((x) => (
          <path d={x} />
        ))}
        <path d="M 0 0 l 40 0 l 0 70 l -40 0 z" stroke="green" fill="none" />
        <Blink>
          <path transform="translate(25 35)" d={CORES.r.shape} fill="blue" />
        </Blink>
      </g>
    </svg>
  )
}
