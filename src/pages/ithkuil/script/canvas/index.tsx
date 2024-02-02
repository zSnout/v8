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

function makePath(x: number, y: number, steps: readonly Step[]): string {
  function segment(
    last: "initial" | Step["type"],
    step: Step,
    rest: readonly Step[],
  ): string {
    let nextSegment = ""

    try {
      if (rest[0]) {
        nextSegment = segment(step.type, rest[0], rest.slice(1))
      }
    } catch {}

    switch (step.type) {
      case "left": {
        switch (last) {
          case "initial":
            return path`
              M ${x + 5} ${y - 5}
              l -10 10
              h ${-step.d + 10}
              ${nextSegment || "h -10 l 10 -10"}
              h ${step.d}
              z
            `

          case "left":
          case "right":
            throw new Error("Invalid segment sequence.")

          case "up":
            return path`
              h ${-step.d + 10}
              ${nextSegment || "h -10 l 10 -10"}
              h ${step.d}
              v 10
            `

          case "down":
            return path`
              l -10 10
              h ${-step.d + 10}
              ${nextSegment || "h -10 l 10 -10"}
              h ${step.d - 10}
            `
        }
      }

      case "right": {
        switch (last) {
          case "initial":
            return path`
              M ${x - 5 + step.d} ${y + 5}
              h ${-step.d}
              l 10 -10
              h ${step.d - 10}
              ${nextSegment || "h 10 l -10 10"}
              z
            `

          case "left":
          case "right":
            throw new Error("Invalid segment sequence.")

          case "up":
            return path`
              l 10 -10
              h ${step.d - 10}
              ${nextSegment || "h 10 l -10 10"}
              h ${-step.d + 10}
            `

          case "down":
            return path`
              h ${step.d - 10}
              ${nextSegment || "h 10 l -10 10"}
              h ${-step.d}
              v -10
            `
        }
      }

      case "up": {
        switch (last) {
          case "initial":
            return path`
              M ${x - 5} ${y + 5 - step.d}
              v ${step.d - 10}
              l -10 10
              v ${-step.d}
              ${nextSegment || "l 10 -10 v 10"}
              z
            `

          case "left":
            return path`
              h -10
              v ${-step.d}
              ${nextSegment || "l 10 -10 v 10"}
              v ${step.d - 10}
            `

          case "right":
            return path`
              v ${-step.d + 10}
              ${nextSegment || "l 10 -10 v 10"}
              v ${step.d - 10}
              l -10 10
            `

          case "up":
          case "down":
            throw new Error("Invalid segment sequence.")
        }
      }

      case "down": {
        switch (last) {
          case "initial":
            return path`
              M ${x + 5} ${y - 5}
              v ${step.d}
              ${nextSegment || "l -10 10 v -10"}
              v ${-step.d + 10}
              l 10 -10
              z
            `

          case "left":
            return path`
              v ${step.d - 10}
              ${nextSegment || "l -10 10 v -10"}
              v ${-step.d + 10}
              l 10 -10
            `

          case "right":
            return path`
              h 10
              v ${step.d}
              ${nextSegment || "l -10 10 v -10"}
              v ${-step.d + 10}
            `

          case "up":
          case "down":
            throw new Error("Invalid segment sequence.")
        }
      }
    }
  }

  const first = steps[0]

  if (!first) {
    return ""
  }

  return segment("initial", first, steps.slice(1)).replace("z", "")
}

export function Main() {
  const GRID = `
    M 0 000 h 300 M 000 0 v 300
    M 0 020 h 300 M 020 0 v 300
    M 0 040 h 300 M 040 0 v 300
    M 0 060 h 300 M 060 0 v 300
    M 0 080 h 300 M 080 0 v 300

    M 0 100 h 300 M 100 0 v 300
    M 0 120 h 300 M 120 0 v 300
    M 0 140 h 300 M 140 0 v 300
    M 0 160 h 300 M 160 0 v 300
    M 0 180 h 300 M 180 0 v 300
  `

  return (
    <svg
      class="m-auto max-h-[calc(100vh_-_7rem)] max-w-full overflow-visible"
      viewBox="-5 -5 200 200"
    >
      <g>
        <path d={GRID} stroke="blue" stroke-width={0.1} />
        <path d={GRID} stroke="blue" transform="scale(5)" stroke-width={0.2} />

        <path
          stroke="red"
          fill-rule="nonzero"
          d={makePath(45, 5, [
            { type: "left", d: 40 },
            { type: "down", d: 60 },
          ])}
        />

        <path
          stroke="red"
          fill-rule="nonzero"
          d={makePath(65, 5, [
            { type: "right", d: 40 },
            { type: "down", d: 60 },
            { type: "left", d: 40 },
            { type: "down", d: 60 },
            { type: "right", d: 40 },
            { type: "down", d: 60 },
            { type: "left", d: 40 },
          ])}
        />

        <path
          stroke="red"
          fill-rule="nonzero"
          d={makePath(5, 85, [{ type: "down", d: 60 }])}
        />

        <path
          stroke="red"
          fill-rule="nonzero"
          d={makePath(35, 85, [
            { type: "up", d: 60 },
            { type: "right", d: 40 },
            { type: "down", d: 20 },
          ])}
        />

        <path
          stroke="red"
          fill-rule="nonzero"
          d={makePath(55, 125, [
            { type: "up", d: 20 },
            { type: "left", d: 20 },
            { type: "down", d: 60 },
            { type: "right", d: 20 },
            { type: "up", d: 20 },
            { type: "right", d: 20 },
          ])}
        />

        <path
          stroke="red"
          fill-rule="nonzero"
          d={makePath(85, 85, [{ type: "right", d: 40 }])}
        />

        <path
          stroke="red"
          fill-rule="nonzero"
          d={makePath(85, 105, [
            { type: "right", d: 40 },
            { type: "down", d: 40 },
          ])}
        />

        <path
          stroke="red"
          fill-rule="nonzero"
          d={makePath(165, 65, [
            { type: "left", d: 40 },
            { type: "up", d: 40 },
            { type: "right", d: 40 },
          ])}
        />
      </g>
    </svg>
  )
}
