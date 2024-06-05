import { batch } from "solid-js"
import { MutableLink, MutableNode, createForceDirectedGraph } from "../fdg"

const data = `一	一				
二	二	一	一		
三	三	一	一	一	
七	七				
十	十				
口	口				
日	日				
月	月				
田	田				
目	目				
古	古	十	口		
明	明	日	月		
早	早	日	十		
世	世	十	十	十	
丨	丨				
丶	丶				
自	自	丶	目		
白	白	丶	日		
百	百	一	丶	日	
中	中	丨	口		
千	千	丶	十		
舌	舌	千	口		
寸	寸	丶			
卜	卜	丨	丶		
上	上	卜	一		
下	下	一	卜		
animal legs					
貝	貝	目	animal legs		
員	員	口	貝		
儿	儿				
見	見	目	儿		
元	元	二	儿		
頁	頁	百	animal legs		
頑	頑	元	頁		
勹	勹				
負	負	勹	貝		
勺	勺	勹	丶		
的	的	白	勺		
horns					
首	首	horns	一	自	
乙	乙				
直	直	一	丨	十	目
具	具	目	一	animal legs	
真	真	十	具		
工	工	一	丨	一	
side		一	丨		
刀	刀				
切	切	七	刀		
別	別	口	勹	刀	
丁	丁	一	丨		
可	可	丁	口		
子	子				
女	女				
好	好	女	子		
母	母	口	一	丶	丶
兄	兄	口	儿		
小	小	丶	丨	丶	
少	少	小	丶		
大	大				
夕	夕				
外	外	夕	卜		
名	名	夕	口		
厂	厂	一	丨		
石	石	厂	口		
肖	肖				
太	太	大	丶		
川	川	丨	丨	丨	
水	水				
泉	泉	白	水		
原	原	泉	厂		
願	願	原	頁		
消	消	水	肖		
土	土	十	一		
寺	寺	土	寸		
時	時	日	寺		`
  .split("\n")
  .map((row) => {
    const [name, kanji, ...inner] = row.split("\t")

    return {
      name: name || "",
      kanji: kanji || "",
      inner: inner.filter((x) => x).filter((x, i, a) => a.indexOf(x) == i),
    }
  })

export function Main() {
  const nodes: MutableNode[] = []
  for (const { name } of data) {
    nodes.push({
      x: Math.random() * 10 - 5,
      y: Math.random() * 10 - 5,
      locked: false,
      label: name,
      el: (
        <span class="rounded-3xl border border-z-text-heading bg-white p-2 text-center text-9xl">
          {name}
        </span>
      ),
    })
  }

  const links: MutableLink[] = []
  for (const { name, inner } of data) {
    const bi = data.findIndex((x) => x.name == name)

    for (const prev of inner) {
      const ai = data.findIndex((x) => x.name == prev)

      links.push({
        a: ai,
        b: bi,
        n: 1,
        vert: ai,
      })

      links.push({
        a: ai,
        b: bi,
        n: 0.1,
      })
    }
  }

  const { svg, setNodes, setLinks, setPosition, setSpeed, setForces } =
    createForceDirectedGraph()

  batch(() => {
    setPosition({ x: 0, y: 0, w: 50 })
    setSpeed(200)
    setNodes(nodes)
    setLinks(links)
    setForces({
      center: 0.1,
      repulsion: 1,
      attraction: 1,
    })
  })

  return <div class="relative h-full w-full">{svg}</div>
}
