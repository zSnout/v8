import { For, Index, createMemo, createSignal, onMount } from "solid-js"

interface ReadonlyNode {
  readonly label: string
  readonly connections: readonly number[]
  readonly x: number
  readonly y: number
}

interface Node {
  label: string
  connections: number[]
  x: number
  y: number
}

interface Position {
  readonly x1: number
  readonly x2: number
  readonly y: number
}

export function Main() {
  const [position, setPosition] = createSignal<Position>({
    x1: -10,
    x2: 10,
    y: 0,
  })

  const [nodes, setNodes] = createSignal<readonly ReadonlyNode[]>([
    {
      label: "hello",
      connections: [1],
      x: 2,
      y: 2,
    },

    {
      label: "world",
      connections: [0, 2],
      x: -2,
      y: 0,
    },

    {
      label: "werld",
      connections: [1],
      x: 5,
      y: 7,
    },
  ])

  const [divHW, setDivHW] = createSignal(1)

  const truePosition = createMemo(() => {
    const { x1, x2, y } = position()
    const hw = divHW()

    return {
      x1,
      x2,
      y1: y - ((x2 - x1) * hw) / 2,
      y2: y + ((x2 - x1) * hw) / 2,
    }
  })

  const div = (
    <div
      class="relative h-full w-full"
      ref={(el) => {
        onMount(() => {
          setDivHW(el.clientHeight / el.clientWidth)
        })

        const observer = new ResizeObserver(([entry]) => {
          setDivHW(entry!.contentRect.height / entry!.contentRect.width)
        })

        observer.observe(el)
      }}
    >
      <Index each={nodes()}>
        {(item, index) => (
          <div
            class="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center whitespace-pre rounded-full bg-z-body-selected"
            style={{
              top:
                ((truePosition().y2 - item().y) /
                  (truePosition().y2 - truePosition().y1)) *
                  100 +
                "%",
              left:
                (1 -
                  (truePosition().x2 - item().x) /
                    (truePosition().x2 - truePosition().x1)) *
                  100 +
                "%",
            }}
          >
            ({item().x}, {item().y})
          </div>
        )}
      </Index>
    </div>
  )

  return div
}
