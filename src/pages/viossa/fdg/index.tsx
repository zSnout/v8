import { MutableLink, MutableNode, createForceDirectedGraph } from "../../fdg"
import { makeWordList, slides } from "../data"

const list = makeWordList()

export function Main() {
  const items = Object.keys(slides).concat(...list.keys())

  const nodes: MutableNode[] = Object.keys(slides).map((slide) => ({
    label: slide,
    locked: false,
    x: Math.random(),
    y: Math.random(),
  }))

  const links: MutableLink[] = []

  for (const { taughtIn, referencedIn, word } of list.values()) {
    nodes.push({
      label: word,
      locked: false,
      x: Math.random(),
      y: Math.random(),
    })

    for (const taught of taughtIn) {
      links.push({
        a: nodes.length - 1,
        b: items.indexOf("" + taught),
        n: 5,
      })
    }

    for (const referenced of referencedIn) {
      links.push({
        a: nodes.length - 1,
        b: items.indexOf("" + referenced),
        n: 0.1,
      })
    }
  }

  const { svg, setNodes, setLinks, setPosition } = createForceDirectedGraph()

  setPosition({ x: 0, y: 0, w: 20 })
  setNodes(nodes)
  setLinks(links)

  return <div class="relative h-full w-full">{svg}</div>
}