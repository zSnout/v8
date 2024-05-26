import { error } from "@/components/result"
import {
  FDG,
  MutableNode as M,
  MutableLink,
  createForceDirectedGraph,
} from "@/pages/fdg"
import { diff, rgb_to_lab } from "color-diff"
import { JSX, batch, createSignal } from "solid-js"
import { isServer } from "solid-js/web"
import { ZipInfo, setOptions, unzip } from "unzipit"
import worker from "unzipit/dist/unzipit-worker?url"

type MutableNode = M & { email: string }

setOptions({ workerURL: worker })

const alerts = "x-" + Math.random().toString().slice(2)
function alert(info: JSX.Element) {
  if (isServer) {
    return
  }

  const el = (
    <div
      class="fixed bottom-4 left-1/2 w-96 max-w-full origin-center -translate-x-1/2 scale-100 rounded-md border border-red-400 bg-red-100 px-2 py-1 text-center text-z transition-all"
      id={alerts}
    >
      {info}
    </div>
  ) as HTMLDivElement

  setTimeout(() => {
    el.style.setProperty("--tw-scale-x", "1.25")
    el.style.setProperty("--tw-scale-y", "1.25")
    el.addEventListener(
      "transitionend",
      () => {
        el.style.setProperty("--tw-scale-x", "1")
        el.style.setProperty("--tw-scale-y", "1")
      },
      { once: true },
    )
  })

  setTimeout(() => {
    el.style.bottom = "0"
    el.style.opacity = "0"
  }, 3000)

  document.getElementById(alerts)?.remove()
  document.body.appendChild(el)
}

function Img(props: {
  zip: ZipInfo
  pfp: string
  bg: string
  children?: JSX.Element
}) {
  return (
    <div
      class="relative h-full w-full rounded-full bg-cover bg-center"
      style={{ "background-image": props.bg, "background-color": props.bg }}
    >
      {props.children}

      <img
        class="absolute -right-[12.5%] -top-[12.5%] h-[50%] w-[50%] rounded-full bg-white"
        ref={async (el) => {
          const photo = props.zip.entries["photos/" + props.pfp + ".jpeg"]
          if (!photo) {
            return
          }
          const blob = await photo.blob("image/jpeg")
          const url = URL.createObjectURL(blob)
          el.src = url
        }}
      />
    </div>
  )
}

function setNodes(graph: FDG, nodes: readonly MutableNode[]) {
  graph.setNodes((prev) => {
    return nodes.map((node) => {
      const p = prev.find((p) => "email" in p && p.email == node.email)

      if (p) {
        return { ...node, x: p.x, y: p.y }
      } else {
        return node
      }
    })
  })
}

async function showColors(zip: ZipInfo, graph: FDG) {
  const colors = zip.entries["data/colors.txt"]
  if (!colors) {
    throw new Error("theres no color data")
  }
  const data = (await colors.text()).split("\n").map((x, i) => {
    const [a, b] = x.split("\t")
    if (a && b) {
      let red = parseInt(b.slice(1, 3), 16)
      if (isNaN(red)) red = 0
      let green = parseInt(b.slice(1, 3), 16)
      if (isNaN(green)) green = 0
      let blue = parseInt(b.slice(1, 3), 16)
      if (isNaN(blue)) blue = 0

      return {
        email: a,
        color: b,
        index: i,
        rgb: { R: red, G: green, B: blue },
      }
    } else {
      throw new Error("invalid data in color file")
    }
  })
  const nodes: MutableNode[] = data.map((x) => ({
    label: "",
    el: <Img zip={zip} pfp={x.email} bg={x.color} />,
    noBorder: true,
    locked: false,
    x: 5 * Math.random() - 2.5,
    y: 5 * Math.random() - 2.5,
    email: x.email,
  }))
  const links: MutableLink[] = []
  for (const { rgb: a, index: i } of data) {
    for (const { rgb: b, index: j } of data) {
      if (i > j) {
        const d = diff(rgb_to_lab(a), rgb_to_lab(b))
        Object.assign(window, { diff })
        links.push({ a: i, b: j, n: (Math.abs(100 - d) / 100) ** 4 * 2 })
      }
    }
  }
  batch(() => {
    setNodes(graph, nodes)
    graph.setLinks(links)
    graph.setForces({
      center: 1,
      repulsion: 2,
      attraction: 1,
    })
  })
}

async function showAnimals(zip: ZipInfo, graph: FDG) {
  const colors = zip.entries["data/catsanddogs.txt"]
  if (!colors) {
    throw new Error("theres no animal data")
  }
  const data = await Promise.all(
    (await colors.text()).split("\n").map(async (x, i) => {
      const [a, b] = x.split("\t")
      if (a && (b == "cat" || b == "dog")) {
        return {
          email: a,
          animal: b,
          animalImg: URL.createObjectURL(
            await zip.entries["photos/" + b + ".jpeg"]?.blob("image/jpeg")!,
          ),
          index: i,
        }
      } else {
        throw new Error("invalid data in animal file")
      }
    }),
  )
  const nodes: MutableNode[] = data.map((x) => ({
    label: "",
    el: <Img zip={zip} pfp={x.email} bg={`url("${x.animalImg}")`} />,
    noBorder: true,
    locked: false,
    x: 5 * Math.random() - 2.5,
    y: 5 * Math.random() - 2.5,
    email: x.email,
  }))
  const links: MutableLink[] = []
  for (const { animal: a, index: i } of data) {
    for (const { animal: b, index: j } of data) {
      if (i > j && a == b) {
        links.push({ a: i, b: j, n: 1 })
      }
    }
  }
  batch(() => {
    setNodes(graph, nodes)
    graph.setLinks(links)
    graph.setForces({
      center: 1,
      repulsion: 2,
      attraction: 1,
    })
  })
}

async function showFractals(zip: ZipInfo, graph: FDG) {
  const fractals = zip.entries["data/fractals.txt"]
  if (!fractals) {
    throw new Error("theres no fractal data")
  }
  const data = await Promise.all(
    (await fractals.text()).split("\n").map(async (x, i) => {
      const [a, b, c] = x.split("\t")
      if (a && b && c) {
        return {
          email: a,
          fa: +b,
          fb: +c,
          fai: URL.createObjectURL(
            await zip.entries["photos/Option " + b + ".png"]?.blob(
              "image/png",
            )!,
          ),
          fbi: URL.createObjectURL(
            await zip.entries["photos/Option " + c + ".png"]?.blob(
              "image/png",
            )!,
          ),
          index: i,
        }
      } else {
        throw new Error("invalid data in fractal file")
      }
    }),
  )
  const nodes: MutableNode[] = data.map((x) => ({
    label: "",
    el: (
      <Img zip={zip} pfp={x.email} bg="black">
        <div class="flex h-full w-full overflow-clip rounded-full">
          <img class="h-full w-1/2 object-cover" src={x.fai} />
          <img class="h-full w-1/2 object-cover" src={x.fbi} />
        </div>
      </Img>
    ),
    noBorder: true,
    locked: false,
    x: 5 * Math.random() - 2.5,
    y: 5 * Math.random() - 2.5,
    email: x.email,
  }))
  const links: MutableLink[] = []
  for (const { index: i, fa: aa, fb: ab } of data) {
    for (const { index: j, fa: ba, fb: bb } of data) {
      if (i > j) {
        if (aa == ba || ab == ba || aa == bb || ab == bb) {
          links.push({
            a: i,
            b: j,
            n: +(aa == ba) + +(ab == ba) + +(aa == bb) + +(ab == bb),
          })
        }
      }
    }
  }
  batch(() => {
    setNodes(graph, nodes)
    graph.setLinks(links)
    graph.setForces({
      center: 1,
      repulsion: 2,
      attraction: 1,
    })
  })
}

export function Main() {
  const graph = createForceDirectedGraph({})
  graph.setPosition({ x: 0, y: 0, w: 10 })
  const [data, setData] = createSignal<ZipInfo>()

  async function show(fn: (zip: ZipInfo, graph: FDG) => void | Promise<void>) {
    const zip = data()
    if (!zip) {
      alert("no zip data yet")
      return
    }
    try {
      await fn(zip, graph)
    } catch (err) {
      console.error(err)
      alert("something bad happened: " + error(err).reason)
    }
  }

  return (
    <div class="relative h-full w-full">
      {graph.svg}

      <div class="absolute left-1/2 top-20 grid w-96 -translate-x-1/2 grid-cols-3 gap-2 *:rounded-md *:bg-z-body-selected *:px-2 *:py-1">
        <input
          class="col-span-3 w-full"
          type="file"
          value="give me ur data plz"
          onChange={async (event) => {
            try {
              const file = event.currentTarget.files?.[0]

              if (!file) {
                alert("uh i wanted ur file silly gimme a file plz")
                return
              }

              const buffer = await file.arrayBuffer()
              const data = await unzip(buffer)
              setData(data)
              show(showColors)
            } catch (err) {
              alert("uh something went wrong: " + error(err).reason)
            }
          }}
        />

        <button onClick={() => show(showColors)}>by colors</button>
        <button onClick={() => show(showAnimals)}>by animals</button>
        <button onClick={() => show(showFractals)}>by fractals</button>
        <button
          onClick={() => {
            const i = +setTimeout(() => {})
            for (let j = 0; j < i; j++) {
              clearTimeout(j)
            }
            const i2 = +setInterval(() => {})
            for (let j = 0; j < i2; j++) {
              clearInterval(j)
            }
          }}
        >
          stop forever
        </button>
      </div>
    </div>
  )
}
