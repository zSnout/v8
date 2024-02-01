import { Blink, CORES } from "@zsnout/ithkuil/script"

export function path(data: TemplateStringsArray, ...values: number[]): string {
  return String.raw(
    { raw: data },
    ...values.map((value) => String(Math.round(value * 1e6) / 1e6)),
  )
}

export type Offset =
  | { readonly h: number; readonly v?: undefined; readonly d?: number }
  | { readonly v: number; readonly h?: undefined }
  | { readonly x: number; readonly y: number; readonly d?: number }

export type Path = {
  readonly x: number
  readonly y: number
  readonly path: readonly Offset[]
}

export function generatePaths(
  cx: number,
  cy: number,
  offsets: readonly Offset[],
): string[] {
  const THIN_STROKE_WIDTH = 2.5
  const THIN_STROKE_DIAG_WIDTH = 2.5 * Math.SQRT1_2

  const outputs: string[] = []
  let x = 0
  let y = 0

  for (let index = 0; index < offsets.length; index++) {
    const offset = offsets[index]!

    if ("h" in offset && offset.h != null) {
      if (offset.d != null) {
        outputs.push(
          path`
M ${cx + 5} ${cy - 5}
h ${offset.h}
l ${-offset.d - 5} ${offset.d + 5}
h ${-THIN_STROKE_WIDTH}
l ${offset.d - 5} ${-offset.d + 5}
h ${-offset.h + THIN_STROKE_WIDTH}`,
        )

        cx += offset.h - offset.d
        cy += offset.d - THIN_STROKE_WIDTH
      } else {
        outputs.push(
          path`M ${cx + 5} ${cy - 5}
h ${offset.h}
l -10 10
h ${-offset.h}`,
        )

        cx += offset.h
      }
    } else if ("v" in offset && offset.v != null) {
      outputs.push(
        path`M ${cx + 5} ${cy - 5}
v ${offset.v}
l -10 10
v ${-offset.v}`,
      )

      cy += offset.v
    } else if (offset.d != null) {
      const angle = Math.atan2(offset.y, offset.x) + Math.PI

      outputs.push(
        path`
M ${cx + 3.75} ${cy - 3.75}
l ${offset.x} ${offset.y}
l ${-offset.d - 3.75} ${offset.d + 3.75}
l ${THIN_STROKE_DIAG_WIDTH * Math.cos(angle)} ${
          THIN_STROKE_DIAG_WIDTH * Math.sin(angle)
        }
l ${offset.d - 3.75} ${-offset.d + 3.75}
L ${cx - 3.75} ${cy + 3.75}`,
      )

      cx += offset.x - offset.d
      cy += offset.y + offset.d - THIN_STROKE_WIDTH
    } else {
      outputs.push(
        path`M ${cx + 3.75} ${cy - 3.75}
l ${offset.x} ${offset.y}
l -7.5 7.5
l ${-offset.x} ${-offset.y}`,
      )

      cx += offset.x
      cy += offset.y
    }
  }

  return [outputs.join("")]
}

const CORE_PATHS = {
  r: {
    x: 3.75,
    y: 3.75,
    path: [{ x: 32.5, y: 32.5, d: 31.25 }, { h: 40 }],
  },

  l: {
    x: 10,
    y: 5,
    path: [{ v: 35 }, { h: 22.4, d: 30 }],
  },
} satisfies Record<string, Path> as Record<string, Path>

export function Main() {
  return (
    <svg class="m-auto w-full overflow-visible" viewBox="-20 -20 100 100">
      <g>
        <path d="M 0 0      H 40      V 70 H 0 z" fill="red" />

        {generatePaths(
          Object.values(CORE_PATHS).at(-1)!.x,
          Object.values(CORE_PATHS).at(-1)!.y,
          Object.values(CORE_PATHS).at(-1)!.path,
        ).map((x) => (
          <path d={x} />
        ))}

        <Blink
          children={
            (
              <path
                transform="translate(25 35)"
                d={
                  CORES[Object.keys(CORE_PATHS).at(-1) as keyof typeof CORES]
                    ?.shape
                }
                fill="blue"
              />
            ) as SVGPathElement
          }
        />
      </g>
    </svg>
  )
}
