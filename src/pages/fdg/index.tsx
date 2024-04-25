import { For, Index, Show, createMemo, createSignal, onMount } from "solid-js"

interface Node {
  readonly label: string
  readonly locked: boolean
  readonly x: number
  readonly y: number
}

interface Link {
  readonly a: number
  readonly b: number
}

interface Position {
  readonly x: number
  readonly y: number
  readonly w: number
}

interface Forces {
  readonly repulsion: number
  readonly attraction: number
  readonly center: number
}

interface Dragged {
  readonly index: number
  readonly mx: number
  readonly my: number
}

export function Main() {
  function iterate(time: number) {
    const { attraction, center, repulsion } = forces()
    const list = nodes()
    const currentHeld = drag()?.index

    const diffs = list.map(({ x, y }) => ({ x: -center * x, y: -center * y }))
    const attractions = list.map(() => ({ x: 0, y: 0, n: 0 }))

    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list.length; j++) {
        if (i != j) {
          const ni = list[i]!
          const nj = list[j]!
          const d = Math.hypot(ni.x - nj.x, ni.y - nj.y)
          const atan = Math.atan2(ni.y - nj.y, ni.x - nj.x)

          diffs[i] = {
            x: diffs[i]!.x + repulsion * (Math.cos(atan) / d),
            y: diffs[i]!.y + repulsion * (Math.sin(atan) / d),
          }
        }
      }
    }

    for (const { a, b } of links()) {
      const na = list[a]!
      const nb = list[b]!
      const d = Math.hypot(na.x - nb.x, na.y - nb.y)
      const atan = Math.atan2(na.y - nb.y, na.x - nb.x)

      attractions[a] = {
        x: attractions[a]!.x - attraction * (Math.cos(atan) * d),
        y: attractions[a]!.y - attraction * (Math.sin(atan) * d),
        n: attractions[a]!.n + 1,
      }

      attractions[b] = {
        x: attractions[b]!.x + attraction * (Math.cos(atan) * d),
        y: attractions[b]!.y + attraction * (Math.sin(atan) * d),
        n: attractions[b]!.n + 1,
      }
    }

    return list.map((node, index) =>
      node.locked || currentHeld == index
        ? node
        : {
            ...node,
            x:
              node.x +
              (diffs[index]!.x +
                attractions[index]!.x / attractions[index]!.n) *
                time,
            y:
              node.y +
              (diffs[index]!.y +
                attractions[index]!.y / attractions[index]!.n) *
                time,
          },
    )
  }

  let lastTime = Date.now()
  setInterval(() => {
    const delta = -(lastTime - (lastTime = Date.now()))
    setNodes(iterate((speed() * delta) / 1000))
  })

  const [nodes, setNodes] = createSignal<readonly Node[]>([
    {
      label: "hello",
      x: 4,
      y: 3,
      locked: false,
    },
    {
      label: "world",
      x: -2,
      y: 0,
      locked: false,
    },
    {
      label: "werld",
      x: 3,
      y: -2,
      locked: false,
    },
    {
      label: "nobody",
      x: 5,
      y: 0,
      locked: false,
    },
  ])

  const position = createMemo<Position>(() => {
    return {
      x: 0,
      y: 0,
      w: 20,
    }
  })

  const [links, setLinks] = createSignal<readonly Link[]>([
    { a: 1, b: 0 },
    { a: 1, b: 2 },
    { a: 1, b: 3 },
  ])

  const [forces] = createSignal<Forces>({
    center: 1,
    repulsion: 1,
    attraction: 0.5,
  })

  const [width, setWidth] = createSignal(1)
  const [height, setHeight] = createSignal(1)
  const [scale] = createSignal(100)
  const [speed] = createSignal(5)
  const [showNodes, setShowNodes] = createSignal(true)
  const [drag, setDrag] = createSignal<Dragged>()

  const svgBox = createMemo(() => {
    const { x: xb, y: yb, w: wb } = position()
    const xc = xb * scale()
    const yc = yb * scale()
    const w = wb * scale()
    const hw = height() / width()

    const x = xc - w / 2
    const y = yc - (w * hw) / 2
    const h = w * hw

    return `${x} ${y} ${w} ${h}`
  })

  onMount(() => {
    document.addEventListener("pointermove", (event) => {
      setDrag((dragged) => {
        if (!dragged) {
          return
        }

        const { index, mx, my } = dragged

        const dx = ((event.screenX - mx) / innerWidth) * position().w

        const dy =
          (((event.screenY - my) / innerHeight) * position().w * height()) /
          width()

        setNodes((nodes) => {
          const next = [...nodes]

          next[index] = {
            ...next[index]!,
            x: next[index]!.x + dx,
            y: next[index]!.y + dy,
          }

          return next
        })

        return {
          index,
          mx: event.screenX,
          my: event.screenY,
        }
      })
    })

    document.addEventListener("pointerup", () => {
      setDrag(undefined)
    })
  })

  function mouseToSVG(cx: number, cy: number) {
    const pt = (svg as SVGSVGElement).createSVGPoint()
    pt.x = cx
    pt.y = cy

    const cursor = pt.matrixTransform(
      (svg as SVGSVGElement).getScreenCTM()!.inverse(),
    )

    return { x: cursor.x, y: cursor.y }
  }

  const svg = (
    <svg
      viewBox={svgBox()}
      class="relative h-full w-full"
      ref={(el) => {
        onMount(() => {
          setWidth(el.clientWidth)
          setHeight(el.clientHeight)
        })

        const observer = new ResizeObserver(() => {
          setWidth(el.clientWidth)
          setHeight(el.clientHeight)
        })

        observer.observe(el)
      }}
      onClick={(event) => {
        event.preventDefault()

        const cx = event.clientX
        const cy = event.clientY

        function click(cx: number, cy: number) {
          const cursor = mouseToSVG(cx, cy)

          setNodes((nodes) =>
            nodes.concat({
              x: cursor.x / scale(),
              y: cursor.y / scale(),
              label: "",
              locked: false,
            }),
          )

          setLinks((links) =>
            links.concat({
              a: links.length + 1,
              b: Math.floor(Math.random() * links.length),
            }),
          )
        }

        click(cx, cy)
      }}
    >
      <For each={links()}>
        {(link) => (
          <line
            class="stroke-black"
            stroke-width={1}
            x1={nodes()[link.a]!.x * scale()}
            y1={nodes()[link.a]!.y * scale()}
            x2={nodes()[link.b]!.x * scale()}
            y2={nodes()[link.b]!.y * scale()}
            stroke-linecap="round"
          ></line>
        )}
      </For>

      <Show when={showNodes()}>
        <Index each={nodes()}>
          {(node, index) => (
            <>
              <foreignObject
                x={scale() * node().x - 48}
                y={scale() * node().y - 48}
                width={96}
                height={96}
              >
                <div
                  class="flex h-full w-full select-none items-center justify-center rounded-full border border-black text-black"
                  classList={{
                    "bg-white": !node().locked,
                    "bg-z-body-selected": node().locked,
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault()

                    setDrag({
                      index,
                      mx: event.screenX,
                      my: event.screenY,
                    })
                  }}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopImmediatePropagation()
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault()

                    setNodes((nodes) => {
                      const next = [...nodes]

                      next[index] = {
                        ...next[index]!,
                        locked: !nodes[index]!.locked,
                      }

                      return next
                    })
                  }}
                >
                  {index}
                </div>
              </foreignObject>
            </>
          )}
        </Index>
      </Show>
    </svg>
  )

  return (
    <div class="relative h-full w-full">
      {svg}

      <div class="absolute left-4 top-4 bg-white backdrop-blur">
        <button onClick={() => setShowNodes((x) => !x)}>
          {showNodes() ? "click to hide nodes" : "click to show nodes"}
        </button>
      </div>
    </div>
  )
}
