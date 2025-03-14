// gravity should drag towards average of locked nodes
// make forces adjustable

import {
  For,
  JSX,
  Show,
  batch,
  createMemo,
  createSignal,
  onMount,
} from "solid-js"

const RING_VALUES = [2, 5, 8]

export interface Node {
  readonly label: JSX.Element
  readonly locked: boolean
  readonly x: number
  readonly y: number
  readonly emoji?: JSX.Element | undefined
  readonly ring?: number | undefined
  readonly noBorder?: boolean | undefined
  readonly el?: JSX.Element | undefined
  readonly preferredY?: number | undefined
}

export interface MutableNode {
  label: JSX.Element
  locked: boolean
  x: number
  y: number
  emoji?: JSX.Element | undefined
  ring?: number | undefined
  border?: boolean | undefined
  el?: JSX.Element | undefined
  preferredY?: number | undefined
}

export interface Link {
  readonly a: number
  readonly b: number
  readonly n: number
  readonly vert?: number | undefined // a or b
}

export interface MutableLink {
  a: number
  b: number
  n: number
  vert?: number | undefined // a or b
}

export interface Position {
  readonly x: number
  readonly y: number
  readonly w: number
}

export interface Forces {
  readonly center: number
  readonly preferredHeight: number

  readonly repulsion: number

  readonly attraction: number
  readonly vertOnlyWhenRepairing: number
  readonly vertOnlyWhenFixed: number
}

export interface Dragging {
  readonly index: number
  readonly mx: number
  readonly my: number
  readonly moved: boolean
}

export interface Linking {
  readonly index: number
  readonly x2: number
  readonly y2: number
  readonly moved: boolean
}

export type FDG = ReturnType<typeof createForceDirectedGraph>

export function createForceDirectedGraph(props?: {
  hideLinks?: boolean
  smallText?: boolean
}) {
  if (typeof document == "undefined") {
    throw new Error("<ForceDirectedGraph /> may only be loaded client-side.")
  }

  function iterate(time: number) {
    const {
      center,
      preferredHeight,
      repulsion,
      attraction,
      vertOnlyWhenRepairing,
      vertOnlyWhenFixed,
    } = forces()
    const list = nodes()
    const currentHeld = dragging()?.index

    const diffs = list.map(({ x, y, ring = 0, preferredY }) => {
      const rawSize = Math.hypot(x, y) - ring
      const direction = Math.atan2(y, x) + (rawSize > 0 ? Math.PI : 0)
      const size = Math.abs(rawSize) * center
      const diff = {
        x: size * Math.cos(direction),
        y: size * Math.sin(direction),
      }
      if (preferredY != null) {
        diff.y += (preferredY - y) * preferredHeight
      }
      return diff
    })

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

    for (const { a, b, n, vert } of links()) {
      const na = list[a]!
      const nb = list[b]!
      let dx: number, dy: number
      if (vert == a || vert == b) {
        const n0 = vert == a ? list[a]! : list[b]!
        const n1 = vert == a ? list[b]! : list[a]!
        const d = n0.y - n1.y
        dx = 0
        // positive dy means n0 up, n1 down
        if (d > 0) {
          // n0 is lower / has more y
          dy = (d + 1) * n * vertOnlyWhenRepairing
        } else {
          // n0 is higher / has less y
          dy = (n * vertOnlyWhenFixed) / (1 - d)
        }
        if (vert == b) {
          dy = -dy
        }
      } else {
        const d = Math.hypot(na.x - nb.x, na.y - nb.y)
        const atan = Math.atan2(na.y - nb.y, na.x - nb.x)
        dx = n * attraction * (Math.cos(atan) * d)
        dy = n * attraction * (Math.sin(atan) * d)
      }

      attractions[a] = {
        x: attractions[a]!.x - dx,
        y: attractions[a]!.y - dy,
        n: attractions[a]!.n + n,
      }

      attractions[b] = {
        x: attractions[b]!.x + dx,
        y: attractions[b]!.y + dy,
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
        y:
          node.y +
          +moveY() * (diffs[index]!.y + attractions[index]!.y / n) * time,
      }
    })
  }

  let lastTime = Date.now()
  setInterval(() => {
    const delta = -(lastTime - (lastTime = Date.now()))
    setNodes(iterate(Math.min((speed() * delta) / 1000, 1)))
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

  const [position, setPosition] = createSignal<Position>({
    x: 0,
    y: 0,
    w: 40,
  })

  const [links, setLinks] = createSignal<readonly Link[]>([
    { a: 1, b: 0, n: 1 },
    { a: 1, b: 2, n: 1 },
    { a: 1, b: 3, n: 1 },
  ])

  const [forces, setForces] = createSignal<Forces>({
    center: 1,
    preferredHeight: 1,
    repulsion: 1,
    attraction: 0.25,
    vertOnlyWhenFixed: 0.25,
    vertOnlyWhenRepairing: 0.25,
  })

  // Set internally
  const [width, setWidth] = createSignal(1)
  const [height, setHeight] = createSignal(1)
  const [dragging, setDragging] = createSignal<Dragging>()
  const [linking, setLinking] = createSignal<Linking>()

  // May be set externally
  const [scale, setScale] = createSignal(100)
  const [speed, setSpeed] = createSignal(5)
  const [showNodes, setShowNodes] = createSignal(true)
  const [makeLinksOnClick, setMakeLinksOnClick] = createSignal(true)
  const [moveY, setMoveY] = createSignal(true)
  const [showField, setShowField] = createSignal(false)
  const [scrollZoom, setScrollZoom] = createSignal(true)

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
                    n: next[existing]!.n + 10,
                  }

                  return next
                } else {
                  return links.concat({
                    a: link.index,
                    b: closestNode.index,
                    n: 1,
                    vert: link.index,
                  })
                }
              })
            }
          } else {
            const linkIndex = link.index

            setNodes((nodes) => {
              const next = [...nodes]
              next.splice(link.index, 1)
              return next
            })

            setLinks((links) => {
              const next = links
                .map(({ a, b, n, ...link }) => {
                  if (a == linkIndex || b == linkIndex) {
                    return undefined
                  }

                  const next = {
                    ...link,
                    a: a > linkIndex ? a - 1 : a,
                    b: b > linkIndex ? b - 1 : b,
                    n,
                  }

                  return next
                })
                .filter((x): x is typeof x & {} => !!x)

              return next
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

  const values = Array(51)
    .fill(0)
    .map((_, i) => (i * 20) / 51 - 10)

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

          setNodes((nodes) => {
            const ring =
              RING_VALUES[Math.floor(RING_VALUES.length * Math.random())]!
            return nodes.concat({
              x: cursor.x / scale(),
              y: cursor.y / scale(),
              label: "" + ring,
              locked: false,
              // ring,
            })
          })
        }

        click(cx, cy)
      }}
      onWheel={(event) => {
        const { x: xpos, y: ypos, w } = position()
        const h = (height() / width()) * w

        const xp = event.clientX / event.currentTarget.clientWidth
        const yp = event.clientY / event.currentTarget.clientHeight

        const x = (xp - 0.5) * w + xpos
        const y = (yp - 0.5) * h + ypos

        const size = Math.sign(event.deltaY) * event.deltaY ** 2

        const n = size > 0 ? 1.1 : 0.9

        setPosition({
          x: w * (n - 1) * (0.5 - xp) + xpos,
          y: h * (n - 1) * (0.5 - yp) + ypos,
          w: w * n,
        })
      }}
    >
      <Show when={showField()}>
        <For each={values}>
          {(x) => (
            <For each={values}>
              {(y) => {
                const strength = createMemo(() => {
                  let sx = 0
                  let sy = 0

                  const self = { x, y }
                  const list = nodes()
                  const { repulsion } = forces()

                  for (const { x, y } of list) {
                    const d = Math.hypot(x - self.x, y - self.y)
                    const atan = Math.atan2(y - self.y, x - self.x)

                    sx += repulsion * (Math.cos(atan) / d)
                    sy += repulsion * (Math.sin(atan) / d)
                  }

                  const norm = Math.hypot(sx, sy) * 5

                  return { x: -sx / norm, y: -sy / norm, n: norm }
                })

                return (
                  <line
                    x1={scale() * x}
                    y1={scale() * y}
                    x2={scale() * (x + strength().x)}
                    y2={scale() * (y + strength().y)}
                    stroke-width={1}
                    class="stroke-z-text-heading"
                  />
                )
              }}
            </For>
          )}
        </For>
      </Show>

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

      <Show when={!props?.hideLinks}>
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
      </Show>

      <Show when={showNodes()}>
        <For each={nodes()}>
          {(node, index) => (
            <>
              <foreignObject
                x={scale() * node.x - 48}
                y={scale() * node.y - 48}
                width={96}
                height={96}
                overflow="visible"
              >
                <div
                  class="relative flex h-full w-full select-none items-center justify-center rounded-full border border-z-text-heading"
                  classList={{
                    "bg-z-body": !node.locked,
                    "bg-z-body-selected": node.locked,
                    "text-3xl": !props?.smallText,
                    "text-2xl": props?.smallText,
                    "border-none": node.noBorder || !!node.emoji,
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
                  <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl">
                    {node.emoji}
                  </div>
                  {node.el || (
                    <span class="relative">{node.emoji ? "" : node.label}</span>
                  )}
                </div>
              </foreignObject>
            </>
          )}
        </For>
      </Show>
    </svg>
  ) as SVGSVGElement

  return {
    // Displayed objects
    svg,

    // Core signals
    forces,
    setForces,
    links,
    setLinks,
    nodes,
    setNodes,
    position,
    setPosition,

    // Internal signals
    width,
    height,
    dragging,
    linking,

    // Configuration
    showNodes,
    setShowNodes,
    makeLinksOnClick,
    setMakeLinksOnClick,
    moveY,
    setMoveY,
    scale,
    setScale,
    speed,
    setSpeed,
    showField,
    setShowField,
  }
}

export function Main() {
  const {
    svg,
    setShowNodes,
    showNodes,
    makeLinksOnClick,
    setMakeLinksOnClick,
    moveY,
    setMoveY,
    forces,
    setForces,
    setPosition,
  } = createForceDirectedGraph()

  setPosition({ x: 0, y: 0, w: 15 })

  return (
    <div class="relative h-full w-full">
      {svg}

      <div class="absolute left-4 top-4 flex select-none flex-col gap-2 backdrop-blur">
        <button onClick={() => setShowNodes((x) => !x)} class="text-left">
          {showNodes() ? "click to hide nodes" : "click to show nodes"}
        </button>
        <button
          class="flex flex-col text-left"
          onClick={() => setMakeLinksOnClick((x) => !x)}
        >
          <strong>left button can:</strong>
          <p>
            {makeLinksOnClick() ?
              "click a node to delete it"
            : "click a node to lock it"}
          </p>
          <p>
            {makeLinksOnClick() ?
              "drag to connect nodes"
            : "drag a node to to move it"}
          </p>
          <p>click empty space to make a node</p>
          <strong>right button can:</strong>
          <p>
            {makeLinksOnClick() ?
              "click a node to lock it"
            : "click a node to delete it"}
          </p>
          <p>
            {makeLinksOnClick() ?
              "drag a node to move it"
            : "drag to connect nodes"}
          </p>
          <strong>click here to toggle mouse buttons</strong>
        </button>
        <button onClick={() => setMoveY((x) => !x)} class="text-left">
          {moveY() ? "click to stop y movement" : "click to allow y movement"}
        </button>
        <label>
          <input
            min={0}
            max={5}
            value={forces().center}
            step="any"
            type="range"
            onInput={(event) =>
              setForces((forces) => ({
                ...forces,
                center: event.currentTarget.valueAsNumber,
              }))
            }
          />
          center force
        </label>
        <label>
          <input
            min={0}
            max={5}
            value={forces().attraction}
            step="any"
            type="range"
            onInput={(event) =>
              setForces((forces) => ({
                ...forces,
                attraction: event.currentTarget.valueAsNumber,
              }))
            }
          />
          attraction force
        </label>
        <label>
          <input
            min={0}
            max={5}
            value={forces().repulsion}
            step="any"
            type="range"
            onInput={(event) =>
              setForces((forces) => ({
                ...forces,
                repulsion: event.currentTarget.valueAsNumber,
              }))
            }
          />
          repulsion force
        </label>
      </div>
    </div>
  )
}
