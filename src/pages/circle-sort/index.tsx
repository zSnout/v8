import { Range } from "@/components/fields/Range"
import { createSignal } from "solid-js"

function tick() {
  return new Promise<void>((resolve) => setTimeout(resolve))
}

export function Main() {
  let canvas: HTMLCanvasElement | undefined
  let ctx: CanvasRenderingContext2D | null | undefined

  const [speed, setSpeed] = createSignal(10)
  const [items, setItems] = createSignal(360)

  function render(arcs: number[]) {
    if (!ctx) {
      return
    }

    const gradient = ctx.createConicGradient(0, 200, 200)

    for (let index = 0; index < arcs.length; index++) {
      const hue = arcs[index]!

      gradient.addColorStop(index / arcs.length, `hsl(${hue}deg 100% 50%)`)
      gradient.addColorStop(
        (index + 1) / arcs.length,
        `hsl(${hue}deg 100% 50%)`,
      )
    }

    ctx.fillStyle = gradient
    ctx.ellipse(200, 200, 200, 200, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  // Not sure how many times I've copied this, but it's certainly a lot.
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  function shuffle<T>(array: T[]) {
    let current = array.length
    let random

    while (current > 0) {
      random = Math.floor(Math.random() * current)
      current--
      ;[array[current], array[random]] = [array[random]!, array[current]!]
    }
  }

  function makeSort(
    fn: (array: number[], display: () => Promise<void>) => Promise<any>,
  ) {
    return async (event: { currentTarget: HTMLCanvasElement }) => {
      canvas = event.currentTarget
      ctx = canvas.getContext("2d")

      const array = Array.from(
        { length: items() },
        (_, i) => (i * 360) / items(),
      )
      shuffle(array)

      render(array)
      await tick()

      let tickCount = 0

      await fn(array, async () => {
        if (++tickCount % ~~speed() == 0) {
          render(array)
          await tick()
        }
      })

      render(array)
      await tick()
    }
  }

  const BUBBLE_SORT = makeSort(async (array, display) => {
    let n = array.length

    do {
      for (let i = 1; i < n; i++) {
        if (array[i - 1]! > array[i]!) {
          ;[array[i - 1], array[i]] = [array[i]!, array[i - 1]!]
          await display()
        }
      }

      n--
    } while (n > 1)
  })

  const INSERTION_SORT = makeSort(async (array, display) => {
    let i = 1

    while (i < array.length) {
      let x = array[i]!
      let j = i - 1

      while (j >= 0 && array[j]! > x) {
        array[j + 1] = array[j]!
        await display()
        j = j - 1
      }

      array[j + 1] = x
      await display()
      i = i + 1
    }
  })

  const MERGE_SORT = makeSort(async function mergeSort(
    array,
    display,
    start = 0,
    end = array.length,
  ) {
    function merge(left: number[], right: number[]) {
      let result: number[] = []

      while (left.length && right.length) {
        if (left[0]! <= right[0]!) {
          result.push(left.shift()!)
        } else {
          result.push(right.shift()!)
        }
      }

      // Either left or right may have elements left; consume them.
      // (Only one of the following loops will actually be entered.)
      while (left.length) {
        result.push(left.shift()!)
      }

      while (right.length) {
        result.push(right.shift()!)
      }

      return result
    }

    // Base case. A list of zero or one elements is sorted, by definition.
    if (end - start <= 1) {
      await display()
      return
    }

    const midpoint = ~~((start + end) / 2)

    // Recursively sort both sublists.
    await mergeSort(array, display, start, midpoint)
    await mergeSort(array, display, midpoint, end)

    const merged = merge(
      array.slice(start, midpoint),
      array.slice(midpoint, end),
    )

    for (let index = 0; index < merged.length; index++) {
      array[start + index] = merged[index]!
      await display()
    }

    await display()

    console.log("done", { start, end })
  })

  return (
    <div class="flex flex-1 flex-col">
      <canvas
        class="m-auto aspect-square h-[400px] w-[400px] max-w-full"
        width={400}
        height={400}
        ref={(el) => {
          canvas = el
          ctx = canvas.getContext("2d")

          render(
            Array(360)
              .fill(0)
              .map((_, i) => i),
          )
        }}
        onClick={(event) => MERGE_SORT(event)}
      />

      <Range
        class="mt-6"
        get={speed}
        set={setSpeed}
        name="Speed"
        min={1}
        max={100}
        step={1}
        decimalDigits={0}
      />

      <Range
        class="mt-6"
        get={() => Math.log(items())}
        set={(x) => setItems(Math.exp(x))}
        name="Items"
        min={Math.log(60)}
        max={Math.log(21600)}
        step="any"
        getLabel={() => items().toString()}
        labelSize={5}
        decimalDigits={2}
      />
    </div>
  )
}
