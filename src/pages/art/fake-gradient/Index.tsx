import { Canvas2D } from "@/components/Canvas2D"
import { LabeledCheckbox } from "@/components/fields/Checkbox"
import { Range } from "@/components/fields/Range"
import { DynamicOptions } from "@/components/nav/Options"
import { createSignal } from "solid-js"

function tick() {
  return new Promise<number>((resolve) => requestAnimationFrame(resolve))
}

function cubic(value: number) {
  return value * value * (3 - 2 * value)
}

export function Index() {
  const [smoothness, setSmoothness] = createSignal(1)
  const [pixelation, setPixelation] = createSignal(1)
  const [drawColumns, setDrawColumns] = createSignal(false)

  let asyncId = 0

  return (
    <>
      <DynamicOptions>
        <Range
          class="mb-3 w-full"
          decimalDigits={0}
          name="Smoothness"
          min={1}
          max={100}
          step={1}
          get={smoothness}
          set={setSmoothness}
        />

        <Range
          class="mb-3 w-full"
          decimalDigits={2}
          name="Pixelation"
          min={0.05}
          max={1}
          step="any"
          get={pixelation}
          set={setPixelation}
        />

        <LabeledCheckbox
          checked={drawColumns()}
          label="Draw by Columns?"
          onInput={(event) => setDrawColumns(event.currentTarget.checked)}
        />
      </DynamicOptions>

      <Canvas2D
        class="h-full w-full flex-1 [image-rendering:pixelated]"
        pixelation={pixelation}
        draw={async (context, { width, height }) => {
          const $smoothness = smoothness()
          const $drawColumns = drawColumns()
          const myAsyncId = ++asyncId

          const setRandomColor = (column: number) => {
            let value = 0

            for (let k = 0; k < $smoothness; k++) {
              value += Math.random() < cubic(column / width) ? 0 : 255
            }

            value /= $smoothness

            context.fillStyle = `rgb(${value},${value},${value})`
          }

          if ($drawColumns) {
            for (let i = 0; i < width; i++) {
              if (i % 10 == 0) {
                await tick()

                if (myAsyncId != asyncId) {
                  return
                }
              }

              setRandomColor(i)

              context.fillRect(i, 0, 1, height)
            }
          } else {
            for (let i = 0; i < width; i++) {
              if (i % 10 == 0) {
                await tick()

                if (myAsyncId != asyncId) {
                  return
                }
              }

              for (let j = 0; j < height; j++) {
                setRandomColor(i)

                context.fillRect(i, j, 1, 1)
              }
            }
          }
        }}
      />
    </>
  )
}
