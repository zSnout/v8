import { MutableLink, MutableNode, createForceDirectedGraph } from "../../fdg"
import { makeWordList } from "../../vjosali/data"

const list = makeWordList()

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })

export function Main() {
  const values = Array.from(list.values()).filter((x) => x.eins)
  const keys = values.map((x) => x.kotoba)

  const nodes: MutableNode[] = []
  const links: MutableLink[] = []

  for (let index = 0; index < values.length; index++) {
    const value = values[index]!

    const r = Math.random() ** 0.5 * 10
    const t = Math.random() * 2 * Math.PI

    nodes.push({
      label: value.kotoba,
      emoji: segmenter.segment(value.emoji).containing(0)?.segment,
      locked: false,
      x: Math.cos(t) * r,
      y: Math.sin(t) * r,
    })

    for (const lyk of value.lyk || []) {
      links.push({
        a: index,
        b: keys.indexOf(lyk),
        n: 1,
      })
    }

    for (const [, i] of values
      .map((x, i) => [x, i] as const)
      .filter(([x]) => x.falnen == value.falnen && x.kotoba != value.kotoba)) {
      links.push({
        a: index,
        b: i,
        n: 1,
      })
    }

    const myEmoji = segmenter.segment(value.emoji).containing(0)?.segment

    if (myEmoji) {
      for (const [, i] of values
        .map((x, i) => [x, i] as const)
        .filter(
          ([x]) =>
            x.kotoba != value.kotoba &&
            segmenter.segment(x.emoji).containing(0)?.segment == myEmoji,
        )) {
        links.push({
          a: index,
          b: i,
          n: 5,
        })
      }
    }
  }

  const { setForces, svg, setNodes, setLinks, setPosition, setSpeed } =
    createForceDirectedGraph({ hideLinks: true, smallText: true })

  setSpeed(1)
  setPosition({ x: 0, y: 0, w: 80 })
  setForces((x) => ({ ...x, attraction: 1 }))
  setNodes(nodes)
  setLinks(links)

  return <div class="relative h-full w-full">{svg}</div>
}
