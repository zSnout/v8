import { For, Show, batch, createMemo, createSignal, onMount } from "solid-js"

interface Node {
  readonly label: string
  readonly locked: boolean
  readonly x: number
  readonly y: number
}

interface Link {
  readonly a: number
  readonly b: number
  readonly n: number
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
  readonly moved: boolean
}

interface Linking {
  readonly index: number
  readonly x2: number
  readonly y2: number
  readonly moved: boolean
}

export function Main() {
  function iterate(time: number) {
    const { attraction, center, repulsion } = forces()
    const list = nodes()
    const currentHeld = dragging()?.index

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

    for (const { a, b, n } of links()) {
      const na = list[a]!
      const nb = list[b]!
      const d = Math.hypot(na.x - nb.x, na.y - nb.y)
      const atan = Math.atan2(na.y - nb.y, na.x - nb.x)

      attractions[a] = {
        x: attractions[a]!.x - n * attraction * (Math.cos(atan) * d),
        y: attractions[a]!.y - n * attraction * (Math.sin(atan) * d),
        n: attractions[a]!.n + n,
      }

      attractions[b] = {
        x: attractions[b]!.x + n * attraction * (Math.cos(atan) * d),
        y: attractions[b]!.y + n * attraction * (Math.sin(atan) * d),
        n: attractions[b]!.n + n,
      }
    }

    return list.map((node, index) => {
      if (node.locked || currentHeld == index) {
        return node
      }

      const n = Math.max(1, attractions[index]!.n)

      return {
        ...node,
        x: node.x + (diffs[index]!.x + attractions[index]!.x / n) * time,
        y: node.y + (diffs[index]!.y + attractions[index]!.y / n) * time,
      }
    })
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
    { a: 1, b: 0, n: 1 },
    { a: 1, b: 2, n: 1 },
    { a: 1, b: 3, n: 1 },
  ])

  const [forces] = createSignal<Forces>({
    center: 1,
    repulsion: 1,
    attraction: 0.1,
  })

  const [width, setWidth] = createSignal(1)
  const [height, setHeight] = createSignal(1)
  const [scale] = createSignal(100)
  const [speed] = createSignal(5)
  const [showNodes, setShowNodes] = createSignal(true)
  const [makeLinksOnClick, setMakeLinksOnClick] = createSignal(true)
  const [dragging, setDragging] = createSignal<Dragged>()
  const [linking, setLinking] = createSignal<Linking>()

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
      setDragging((dragged) => {
        if (!dragged) {
          return
        }

        const { index, mx, my } = dragged

        const dx = ((event.clientX - mx) / innerWidth) * position().w

        const dy =
          (((event.clientY - my) / innerHeight) * position().w * height()) /
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
          mx: event.clientX,
          my: event.clientY,
          moved: true,
        }
      })

      setLinking((linking) => {
        if (!linking) {
          return
        }

        const { index } = linking

        const cursor = mouseToSVG(event.clientX, event.clientY)

        return {
          index,
          x2: cursor.x / scale(),
          y2: cursor.y / scale(),
          moved: true,
        }
      })
    })

    document.addEventListener("pointerup", () => {
      batch(() => {
        setDragging((drag): undefined => {
          if (!drag) {
            return
          }

          if (!drag.moved) {
            setNodes((nodes) => {
              const next = [...nodes]

              next[drag.index] = {
                ...next[drag.index]!,
                locked: !next[drag.index]!.locked,
              }

              return next
            })
          }

          return
        })

        setLinking((link): undefined => {
          if (!link) {
            return
          }

          if (link.moved) {
            const closestNode = nodes()
              .map((node, index) => ({
                ...node,
                distance: Math.hypot(node.x - link.x2, node.y - link.y2),
                index,
              }))
              .filter((node) => node.index != link.index)
              .filter((node) => node.distance < 48 / scale())
              .sort((a, b) => a.distance - b.distance)[0]

            if (closestNode) {
              setLinks((links) => {
                const existing = links.findIndex(
                  ({ a, b }) =>
                    (a == link.index && b == closestNode.index) ||
                    (a == closestNode.index && b == link.index),
                )

                if (existing != -1) {
                  const next = [...links]

                  next[existing] = {
                    ...next[existing]!,
                    n: next[existing]!.n + 1,
                  }

                  return next
                } else {
                  return links.concat({
                    a: link.index,
                    b: closestNode.index,
                    n: 1,
                  })
                }
              })
            }
          } else {
            const linkIndex = link.index

            batch(() => {
              setNodes((nodes) => {
                const next = [...nodes]
                next.splice(link.index, 1)
                return next
              })

              setLinks((links) => {
                const next = links
                  .map(({ a, b, n }) => {
                    if (a == linkIndex || b == linkIndex) {
                      return undefined
                    }

                    const next = {
                      a: a > linkIndex ? a - 1 : a,
                      b: b > linkIndex ? b - 1 : b,
                      n,
                    }

                    return next
                  })
                  .filter((x): x is typeof x & {} => !!x)

                console.log(next)

                return next
              })
            })
          }
        })
      })
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
      onPointerDown={(event) => {
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
        }

        click(cx, cy)
      }}
    >
      <Show when={linking()}>
        {(link) => (
          <line
            x1={nodes()[link().index]!.x * scale()}
            y1={nodes()[link().index]!.y * scale()}
            x2={link().x2 * scale()}
            y2={link().y2 * scale()}
            class="stroke-z-text-heading"
            stroke-dasharray="4px 2px"
            stroke-width={1}
          />
        )}
      </Show>

      <For each={links()}>
        {(link) => (
          <line
            class="stroke-z-text-heading"
            stroke-width={link.n}
            x1={nodes()[link.a]!.x * scale()}
            y1={nodes()[link.a]!.y * scale()}
            x2={nodes()[link.b]!.x * scale()}
            y2={nodes()[link.b]!.y * scale()}
            stroke-linecap="round"
          ></line>
        )}
      </For>

      <Show when={showNodes()}>
        <For each={nodes()}>
          {(node, index) => (
            <>
              <foreignObject
                x={scale() * node.x - 48}
                y={scale() * node.y - 48}
                width={96}
                height={96}
              >
                <div
                  class="flex h-full w-full select-none items-center justify-center rounded-full border border-z-text-heading text-z-text"
                  classList={{
                    "bg-z-body": !node.locked,
                    "bg-z-body-selected": node.locked,
                  }}
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopImmediatePropagation()

                    if ((event.button == 2) != makeLinksOnClick()) {
                      const cursor = mouseToSVG(event.clientX, event.clientY)

                      setLinking({
                        index: index(),
                        x1: node.x,
                        y1: node.y,
                        x2: cursor.x / scale(),
                        y2: cursor.y / scale(),
                        moved: false,
                      })
                    } else {
                      setDragging({
                        index: index(),
                        mx: event.clientX,
                        my: event.clientY,
                        moved: false,
                      })
                    }
                  }}
                  onClick={(event) => {
                    event.preventDefault()
                  }}
                  onContextMenu={(event) => {
                    event.preventDefault()
                  }}
                >
                  {index()}
                </div>
              </foreignObject>
            </>
          )}
        </For>
      </Show>
    </svg>
  )

  return (
    <div class="relative h-full w-full">
      {svg}

      <div class="absolute left-4 top-4 flex select-none flex-col backdrop-blur">
        <button onClick={() => setShowNodes((x) => !x)}>
          {showNodes() ? "click to hide nodes" : "click to show nodes"}
        </button>

        <button onClick={() => setMakeLinksOnClick((x) => !x)}>
          {makeLinksOnClick() ? "make links on click" : "drag on click"}
        </button>
      </div>
    </div>
  )
}
