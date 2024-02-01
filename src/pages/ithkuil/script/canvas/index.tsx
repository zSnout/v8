import { fitViewBox } from "@zsnout/ithkuil/script"

function path(
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

export type Step =
  | { readonly type: "left"; readonly d: number }
  | { readonly type: "right"; readonly d: number }
  | { readonly type: "up"; readonly d: number }
  | { readonly type: "down"; readonly d: number }

// function genPaths2(x: number, y: number, steps: readonly Step[]): string {
//   let output = ""

//   for (let index = 0; index < steps.length; index++) {
//     const step = steps[index]!

//     if ("x" in step || "y" in step) {
//       const dx = step.x || 0
//       const dy = step.y || 0

//       if (dx && dy) {
//         // TODO thick diagonal
//       } else if (dx) {
//         output += path`
//           M ${x + 5} ${y - 5}
//           h ${dx - 10}
//           l 0 10
//           h ${-dx}
//           l 10 -10
//         `

//         x += dx
//       } else if (dy) {
//         output += path`
//           M ${x + 5} ${y - 5}
//           v ${dy}
//           l -10 10
//           v ${-dy}
//           l 10 -10
//         `

//         y += dy
//       }
//     } else {
//       // TODO thin diagonal line
//     }
//   }

//   return output
// }

function makePath(x: number, y: number, steps: readonly Step[]) {}

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
          d={makePath(45, 5, [
            { type: "left", d: 40 },
            { type: "up", d: 20 },
          ])}
        />
      </g>
    </svg>
  )
}
