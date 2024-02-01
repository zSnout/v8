import { fitViewBox } from "@zsnout/ithkuil/script"

export function path(
  data: TemplateStringsArray,
  ...values: (number | string)[]
): string {
  return String.raw(
    { raw: data },
    ...values.map((value) =>
      typeof value == "string" ? value : Math.round(value * 1e6) / 1e6,
    ),
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

export type Step =
  | { readonly x: number; readonly y?: undefined } // horiz
  | { readonly x?: undefined; readonly y: number } // vert
  | { readonly x: number; readonly y: number } // thick diagonal
  | { readonly d: number } // thin diagonal

export function generatePaths(
  x: number,
  y: number,
  offsets: readonly Offset[],
): string[] {
  const THIN_STROKE_WIDTH = 2.4
  const THIN_STROKE_DIAG_WIDTH = 2.4 * Math.SQRT1_2

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
h ${-offset.h + THIN_STROKE_WIDTH}`,
        )

        x += offset.h - offset.d
        y += offset.d - THIN_STROKE_WIDTH
      } else {
        outputs.push(
          path`M ${x + 5} ${y - 5}
h ${offset.h}
l -10 10
h ${-offset.h}`,
        )

        x += offset.h
      }
    } else if ("v" in offset && offset.v != null) {
      outputs.push(
        path`M ${x + 5} ${y - 5}
v ${offset.v}
l -10 10
v ${-offset.v}`,
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
L ${x - 3.75} ${y + 3.75}`,
      )

      x += offset.x - offset.d
      y += offset.y + offset.d - THIN_STROKE_WIDTH
    } else {
      outputs.push(
        path`M ${x + 3.75} ${y - 3.75}
l ${offset.x} ${offset.y}
l -7.5 7.5
l ${-offset.x} ${-offset.y}`,
      )

      x += offset.x
      y += offset.y
    }
  }

  return [outputs.join("")]
}

const CORE_PATHS = {
  l: {
    x: 10,
    y: 5,
    path: [{ v: 35 }, { h: 22.4, d: 27.4 }, { h: 40 }],
  },

  r: {
    x: 3.75,
    y: 3.75,
    path: [{ x: 32.5, y: 32.4, d: 31.2 }, { h: 40 }],
  },

  m: {
    x: 5,
    y: 5,
    path: [
      {
        v: 35,
      },
    ],
  },
} satisfies Record<string, Path> as Record<string, Path>

export function genPaths2(
  x: number,
  y: number,
  steps: readonly Step[],
): string {
  let output = ""

  for (let index = 0; index < steps.length; index++) {
    const prev = steps[index - 1]
    const step = steps[index]!
    const next = steps[index + 1]

    if ("x" in step || "y" in step) {
      const dx = step.x || 0
      const dy = step.y || 0

      if (dx && dy) {
        // TODO thick diagonal
      } else if (dx) {
        const WAS_LAST_NEGATIVE_VERTICAL = prev
          ? ("x" in prev && prev.x && !prev.y && prev.x < 0) !== dx < 0
          : false

        if (WAS_LAST_NEGATIVE_VERTICAL) {
          output += path`
            M ${x - 5} ${y - 5}
            h ${dx + 10}
            l -10 10
            h ${-dx}
            l 0 -10
          `
        } else {
          output += path`
            M ${x + 5} ${y - 5}
            h ${dx}
            l -10 10
            h ${-dx}
            l 10 -10
          `
        }

        x += dx
      } else if (dy) {
        const WAS_LAST_NEGATIVE_HORIZONTAL = prev
          ? ("x" in prev && prev.x && !prev.y && prev.x < 0) !== dy < 0
          : false

        if (WAS_LAST_NEGATIVE_HORIZONTAL) {
          output += path`
            M ${x + 5} ${y + 5}
            v ${dy - 10}
            l -10 10
            v ${-dy}
            l 10 0
          `
        } else {
          output += path`
            M ${x + 5} ${y - 5}
            v ${dy}
            l -10 10
            v ${-dy}
            l 10 -10
          `
        }

        y += dy
      }
    } else {
      // TODO thin diagonal line
    }
  }

  return output
}

// export function genPaths3(
//   x: number,
//   y: number,
//   steps_: readonly Step[],
// ): string {
//   type TrueStep =
//     | { type: "horiz"; dx: number }
//     | { type: "vert"; dy: number }
//     | { type: "diag"; dx: number; dy: number }
//     | { type: "thin"; d: number }

//   const steps = steps_
//     .map((step): TrueStep | undefined => {
//       if ("x" in step || "y" in step) {
//         const dx = step.x || 0
//         const dy = step.y || 0

//         if (dx && dy) {
//           return { type: "diag", dx, dy }
//         } else if (dx) {
//           return { type: "horiz", dx }
//         } else if (dy) {
//           return { type: "vert", dy }
//         } else {
//           return undefined
//         }
//       } else {
//         return { type: "thin", d: step.d }
//       }
//     })
//     .filter((x) => x) as TrueStep[]

//   const first = steps[0]

//   if (!first) {
//     return ""
//   }

//   const rest = steps.slice(1)
//   const next = steps[1]

//   switch (first.type) {
//     case "horiz":
//       if (first.dx) {
//       } else {
//       }

//     case "vert":

//     case "diag":

//     case "thin":
//   }
// }

export function Main() {
  return (
    <svg
      class="m-auto max-h-[calc(100vh_-_7rem)] max-w-full overflow-visible"
      ref={(el) => setTimeout(() => fitViewBox(el, 10))}
    >
      <g>
        <path
          stroke="red"
          fill-rule="nonzero"
          d={genPaths2(45, 5, [{ x: 40 }, { y: -20 }, { x: 40 }, { y: 50 }])}
        />

        {/* <path d="M 0 0      H 40      V 70 H 0 z" fill="red" />

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
                transform="translate(18.75 35)"
                d={
                  CORES[Object.keys(CORE_PATHS).at(-1) as keyof typeof CORES]
                    ?.shape
                }
                fill="blue"
              />
            ) as SVGPathElement
          }
        /> */}
      </g>
    </svg>
  )
}
