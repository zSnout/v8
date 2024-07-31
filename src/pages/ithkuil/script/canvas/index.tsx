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
  | { readonly type: "dl"; readonly d: number }
  | { readonly type: "cap" }

export const THIN_LINE_WIDTH = 2.4

function makePath(
  x: number,
  y: number,
  steps: readonly Step[],
  throwOnError = false,
): string {
  /**
   * Here's an in-depth explanation of how this works:
   *
   * You might think this should be as simple as generating a shape for each
   * block and then overlapping them. And while that works, it has several
   * downsides.
   *
   * If we did that, we'd either need to force the script user to use multiple
   * <path>s to render this, which creates difficulty on their and causes
   * strokes to be drawn in the middle of characters; or we'd have to combine
   * the paths into a single one using `M` commands. This is undesirable because
   * a) it has the same multiple-stroke downside and b) SVGs have an odd
   * specification where if multiple shapes overlap, an empty space will be
   * drawn, even if `fill-rule: nonzero` is enabled. So we are unable to use
   * that method due to quirks of the specification.
   *
   * So instead, we join together all the steps into a single SVG path. This is
   * also difficult, but avoids the other problems. To do this, we use a
   * recursive approach. The first step is rendered, which renders the second
   * step inside it, which renders the third step inside it, and so on. To
   * account for the variation in directions and step types, the only
   * requirements each step has is that it needs to start in a specific place
   * and end in another specific place. The type of parent step (e.g. the first
   * step when rendering the second step) is then passed to the child step (e.g.
   * the second step rendered by the first step) so it knows the constraints.
   *
   * For example, the `right` step shape only actually renders this bit:
   *
   *        ───────── (child step)
   *      ╱
   *     ╱
   *     ──────────── (step starts here)
   *
   * The top section is `d-10` units long, and the bottom section is `d` units
   * long. It expects that the child step will connect them properly. The
   * diagonal there is only actually drawn if the `right` step is the first one
   * drawn. Otherwise, only the lines are drawn, with the other ends left up to
   * its parent and child steps.
   *
   * Importantly, these shapes are the same regardless of the child step,
   * although they may depend on the parent shape. This means that `N^2 + N`
   * shapes have to be programmed in if there are `N` path types, keeping it to
   * a reasonable level of complexity.
   *
   * The special `cap` step ends the SVG path with the appropriate cap. It is
   * automatically added on if no cap is otherwise found.
   *
   * ## Step Offsets
   *
   * Each step has an associated distance it travels, specified below.
   *
   * - `left(d)` travels `-d, 0` units
   * - `right(d)` travels `d, 0` units
   * - `top(d)` travels `0, -d` units
   * - `bottom(d)` travels `0, d` units
   * - `dl(d)` travels `-d, d` units, and an additional `THIN_LINE_WIDTH` units in
   *   the direction of the previous instruction
   * - `cap` does not travel
   *
   * ## Step Shapes
   *
   * Here is an overview of all initial step shapes (that is, what each shape
   * looks like if it is the first step in a path). `A` marks the beginning of
   * the child path, `B` marks the end of the child path, and `C` marks the
   * point at the initial X and Y coordinates. If two points look like they're
   * on the same line (horizontal or vertical), assume they are.
   *
   * **`left` shape**
   *
   *     B──────────────
   *                   ╱
   *                  C
   *                 ╱
   *     A──────────
   *
   * Top segment is `d` units long, bottom segment is `d-10` units long,
   * diagonal segment is `10,10` units long (10 in both X and Y directions).
   *
   * **`right` shape**
   *
   *         ─────────A
   *       ╱
   *      C
   *     ╱
   *     ───────────B
   *
   * Top segment is `d-10` units long, bottom segment is `d-2.4` units long,
   * diagonal segment is `10,10` units long (10 in both X and Y directions).
   *
   * **`up` shape**
   *
   *     A       B
   *     │       │
   *     │       │
   *     │       │
   *     │     ╱
   *     │   C
   *     │ ╱
   *
   * Left segment is `d` units long, right segment is `d-10` units long,
   * diagonal segment is `10,10` units long (10 in both X and Y directions).
   *
   * **`down` shape**
   *
   *           ╱ │
   *         C   │
   *       ╱     │
   *     │       │
   *     │       │
   *     │       │
   *     B       A
   *
   * Left segment is `d-10` units long, right segment is `d` units long,
   * diagonal segment is `10,10` units long (10 in both X and Y directions).
   *
   * **`dl` shape**
   *
   * TODO: add shape
   *
   * **`cap` shape**
   *
   * Not allowed to appear as an initial shape.
   *
   * @param last
   * @param step
   * @param rest
   * @returns
   */
  function segment(
    last: "initial" | Exclude<Step["type"], "cap" | "uncap">,
    step: Step,
    rest: readonly Step[],
  ): string {
    const nextSegment = () =>
      step.type == "cap" ? ""
      : rest[0] ? segment(step.type, rest[0], rest.slice(1))
      : segment(step.type, { type: "cap" }, [])

    const passSegment = () => {
      if (throwOnError) {
        throw new Error("Unsupported segment sequence.")
      }

      return segment(last, { type: "cap" }, [])
    }

    switch (step.type) {
      case "left": {
        switch (last) {
          case "initial":
            return path`
              M ${x + 5} ${y - 5}
              l -10 10
              h ${-step.d + 10}
              ${nextSegment()}
              h ${step.d}
              z
            `

          case "left":
          case "right":
            return passSegment()

          case "up":
            return path`
              h ${-step.d + 10}
              ${nextSegment()}
              h ${step.d}
              v 10
            `

          case "down":
            return path`
              l -10 10
              h ${-step.d + 10}
              ${nextSegment()}
              h ${step.d - 10}
            `

          case "dl":
            throw new Error("TODO: Unimplemented")
        }
      }

      case "right": {
        switch (last) {
          case "initial":
            return path`
              M ${x - 5 + step.d - 2.4} ${y + 5}
              h ${-step.d + 2.4}
              l 10 -10
              h ${step.d - 10}
              ${nextSegment()}
              z
            `

          case "left":
          case "right":
            return passSegment()

          case "up":
            return path`
              l 10 -10
              h ${step.d - 10}
              ${nextSegment()}
              h ${-step.d + 10}
            `

          case "down":
            return path`
              h ${step.d - 10}
              ${nextSegment()}
              h ${-step.d}
              v -10
            `

          case "dl":
            return path`
              h ${step.d - 10}
              ${nextSegment()}
              h ${-step.d - THIN_LINE_WIDTH}
            `
        }
      }

      case "up": {
        switch (last) {
          case "initial":
            return path`
              M ${x + 5} ${y + 5 - step.d}
              v ${step.d - 10}
              l -10 10
              v ${-step.d}
              ${nextSegment()}
              z
            `

          case "left":
            return path`
              h -10
              v ${-step.d}
              ${nextSegment()}
              v ${step.d - 10}
            `

          case "right":
            return path`
              v ${-step.d + 10}
              ${nextSegment()}
              v ${step.d - 10}
              l -10 10
            `

          case "up":
          case "down":
            return passSegment()

          case "dl":
            throw new Error("TODO: Unimplemented")
        }
      }

      case "down": {
        switch (last) {
          case "initial":
            return path`
              M ${x + 5} ${y - 5}
              v ${step.d}
              ${nextSegment()}
              v ${-step.d + 10}
              l 10 -10
              z
            `

          case "left":
            return path`
              v ${step.d - 10}
              ${nextSegment()}
              v ${-step.d + 10}
              l 10 -10
            `

          case "right":
            return path`
              h 10
              v ${step.d}
              ${nextSegment()}
              v ${-step.d + 10}
            `

          case "up":
          case "down":
            return passSegment()

          case "dl":
            return path`
              v ${step.d - THIN_LINE_WIDTH}
              ${nextSegment()}
              v ${-step.d + 10}
            `
        }
      }

      case "dl": {
        switch (last) {
          case "initial":
            return path`
              M ${x + 5} ${y - 5}
              h ${THIN_LINE_WIDTH}
              l ${-step.d} ${step.d}
              ${nextSegment()}
              l ${step.d} ${-step.d}
              z
            `

          case "left":
            return path`
              h ${-10 + THIN_LINE_WIDTH}
              l ${-step.d + 10} ${step.d - 10}
              ${nextSegment()}
              l ${step.d} ${-step.d}
            `

          case "right":
            return path`
              h ${10}
              l ${-step.d} ${step.d}
              ${nextSegment()}
              l ${step.d - 10} ${-step.d + 10}
            `

          case "up":
            return path`
              l ${-step.d + 10} ${step.d - 10}
              ${nextSegment()}
              l ${step.d + THIN_LINE_WIDTH} ${-step.d - THIN_LINE_WIDTH}
              l 10 -10
              v 10
            `

          case "down":
            return path`
              v ${THIN_LINE_WIDTH}
              l ${-step.d} ${step.d}
              ${nextSegment()}
              l ${step.d + THIN_LINE_WIDTH} ${-step.d - THIN_LINE_WIDTH}
              v -10
            `

          case "dl":
            return passSegment()
        }
      }

      case "cap": {
        switch (last) {
          case "initial":
            return ""

          case "left":
            return path`h -10 l 10 -10`

          case "right":
            return path`h 10 l -10 10`

          case "up":
            return path`l 10 -10 v 10`

          case "down":
            return path`l -10 10 v -10`

          case "dl":
            return path`l -10 10 h ${-THIN_LINE_WIDTH} l 10 -10`
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

function Path(props: { x: number; y: number; path: readonly Step[] }) {
  return (
    <path
      stroke="red"
      class="fill-black transition dark:fill-white"
      d={makePath(props.x, props.y, props.path)}
    />
  )
}

export function Main() {
  const GRID = `
    M 0 000 h 400 M 000 0 v 400
    M 0 010 h 400 M 010 0 v 400
    M 0 020 h 400 M 020 0 v 400
    M 0 030 h 400 M 030 0 v 400
    M 0 040 h 400 M 040 0 v 400
    M 0 050 h 400 M 050 0 v 400
    M 0 060 h 400 M 060 0 v 400
    M 0 070 h 400 M 070 0 v 400
    M 0 080 h 400 M 080 0 v 400
    M 0 090 h 400 M 090 0 v 400

    M 0 100 h 400 M 100 0 v 400
    M 0 110 h 400 M 110 0 v 400
    M 0 120 h 400 M 120 0 v 400
    M 0 130 h 400 M 130 0 v 400
    M 0 140 h 400 M 140 0 v 400
    M 0 150 h 400 M 150 0 v 400
    M 0 160 h 400 M 160 0 v 400
    M 0 170 h 400 M 170 0 v 400
    M 0 180 h 400 M 180 0 v 400
    M 0 190 h 400 M 190 0 v 400

    M 0 200 h 400 M 200 0 v 400
    M 0 210 h 400 M 210 0 v 400
    M 0 220 h 400 M 220 0 v 400
    M 0 230 h 400 M 230 0 v 400
    M 0 240 h 400 M 240 0 v 400
    M 0 250 h 400 M 250 0 v 400
    M 0 260 h 400 M 260 0 v 400
    M 0 270 h 400 M 270 0 v 400
    M 0 280 h 400 M 280 0 v 400
    M 0 290 h 400 M 290 0 v 400

    M 0 300 h 400 M 300 0 v 400
    M 0 310 h 400 M 310 0 v 400
    M 0 320 h 400 M 320 0 v 400
    M 0 330 h 400 M 330 0 v 400
    M 0 340 h 400 M 340 0 v 400
    M 0 350 h 400 M 350 0 v 400
    M 0 360 h 400 M 360 0 v 400
    M 0 370 h 400 M 370 0 v 400
    M 0 380 h 400 M 380 0 v 400
    M 0 390 h 400 M 390 0 v 400
  `

  return (
    <svg
      class="m-auto max-h-[calc(100vh_-_7rem)] max-w-full overflow-visible"
      viewBox="-5 -5 200 200"
    >
      <g>
        <path
          d={GRID}
          stroke="blue"
          transform="scale(0.5)"
          stroke-width={0.2}
        />
        <path d={GRID} stroke="blue" transform="scale(5)" stroke-width={0.2} />

        <Path
          x={45}
          y={5}
          path={[
            { type: "left", d: 40 },
            { type: "down", d: 60 },
          ]}
        />

        <Path
          x={65}
          y={5}
          path={[
            { type: "right", d: 40 },
            { type: "down", d: 60 },
            { type: "left", d: 40 },
            { type: "down", d: 60 },
            { type: "right", d: 40 },
            { type: "down", d: 40 },
            { type: "left", d: 40 },
          ]}
        />

        <Path x={5} y={85} path={[{ type: "down", d: 60 }]} />

        <Path
          x={25}
          y={85}
          path={[
            { type: "up", d: 60 },
            { type: "right", d: 40 },
            { type: "down", d: 20 },
          ]}
        />

        <Path
          x={45}
          y={125}
          path={[
            { type: "up", d: 20 },
            { type: "left", d: 20 },
            { type: "down", d: 60 },
            { type: "right", d: 20 },
            { type: "up", d: 20 },
            { type: "right", d: 20 },
          ]}
        />

        <Path x={85} y={85} path={[{ type: "right", d: 20 }]} />

        <Path
          x={85}
          y={105}
          path={[
            { type: "right", d: 40 },
            { type: "down", d: 40 },
          ]}
        />

        <Path
          x={145}
          y={85}
          path={[
            { type: "left", d: 20 },
            { type: "up", d: 80 },
            { type: "right", d: 40 },
            { type: "down", d: 20 },
          ]}
        />

        <Path
          x={125}
          y={165}
          path={[
            { type: "down", d: 20 },
            { type: "right", d: 40 },
          ]}
        />

        <Path x={165} y={85} path={[{ type: "dl", d: 20 }]} />

        <Path
          x={175}
          y={85}
          path={[
            { type: "right", d: 20 },
            { type: "dl", d: 20 },
          ]}
        />

        <Path
          x={175}
          y={125}
          path={[
            { type: "left", d: 20 },
            { type: "dl", d: 20 },
          ]}
        />

        <Path
          x={175}
          y={135}
          path={[
            { type: "down", d: 20 },
            { type: "dl", d: 10 },
          ]}
        />

        <Path
          x={185}
          y={195}
          path={[
            { type: "up", d: 20 - 2.4 },
            { type: "dl", d: 20 },
            // { type: "down", d: 20 },
          ]}
        />

        <path d={GRID} stroke="blue" stroke-width={0.2} />
        <path
          d={GRID}
          stroke="red"
          transform="scale(0.5)"
          stroke-width={0.25}
        />
      </g>
    </svg>
  )
}
