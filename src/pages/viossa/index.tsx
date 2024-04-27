import { MutableLink, MutableNode, createForceDirectedGraph } from "../fdg"

type Content =
  | string // shorthand for taught words
  | [taught: string, exposed: string]

const slides: Record<number, Content> = {
  11: "jaa",
  12: ["akk nai fshto ka bluma", "eins kotoba -ara danke nil ie"],
  13: ["un du sore vi dok hej", "pashun kotoba"],
  14: "pashun -djin opeta lera tajka ojogi",
  15: "glossa -ossa angl- nihon- espanj-",
  16: "kundr",
  17: "sama lik tsigau",
  18: "kirain silba kotoba fras punkt",
  19: "nil joku al ru midore",
  20: "afto tuo asoko ringo huin pashun bluma lera -djin pinue",
  21: "ie fugel baum maredur",
  22: ["namai fu f- huin", "jaa ie ka du un"],
  23: ["ru ciro midore au lezi glug cafe", "ie pashun lera nam sore du lik"],
  24: ["awen slucha bra warui glau trict", "un du au nai ka"],
  25: ["vil nam mis", "afto mama oy pashun"],
  26: ["da pinuno hanu oy", "os vil afto nai"],
  27: [
    "bite danke nil gomen cer ringo banan",
    "ka da pinuno nai hanu vil anta na un bra",
  ],
  28: "jalaka hanu kaku siru cola valtsa tasti ergo suru kotoba",
  29: ["os gelt aschor", "vil nam glug du un mange"],
  30: [
    "ein ni tre kiere go eksi nana kase non den apar mange lasku",
    "os tsisai sama au auauau ie",
  ],
  31: ["mit kuchi se me hir corva njui hana", "du nam"],
  32: "tropos per nam skoi siru maha",
  33: ["deki", "un nam jalaka hanu nai"],
  34: ["ting hjerne torta cer tualet gavat riso katana plas", "kotoba nam"],
  35: ["men har vil", "ringo banan nai un nam sore ting"],
  36: "tyd dan ima mirai",
  37: [
    "gammel ryo -djin mama papa fi kzin sawi brur sisco un matetun pojk tutr lapsi mipi nia",
    "un",
  ],
  38: [
    "roza ru portocale ciro midore sini blau murasace shiro gris curo brun",
    "al kotoba afto farge tsigau nai sama",
  ],
  39: "tsisai stuur",
  40: "simpel haaste",
  41: ["na", "un hanu du maha riso afto ergo plas hej vikoli"],
  42: ["daag uuk mwuai tosui", "kotoba per tyd stuur"],
  43: ["sho funn dzikjaan daag", "kotoba per tyd tsisai"],
  44: "prapataj akote paara praapa",
  45: "tsatain tun",
  46: ["vona sinu uten", "kundr mit"],
  47: "strela nord west ost sud oba ljeva larava hina unna migi fura",
  48: ["klar tun", "kundr"],
  49: ["mietta k'", "pashun huin portocale ie al"],
  50: ["li sit iske", "au du nai glug iske sinu vil lera viossa da hanu angl-"],
  51: ["jam gaia sot magasin", "pashun na ringo nai banan nil ting mange"],
  52: ["grun naze cola jalaka", "ka afto pashun nai mange sore deki"],
  53: ["kara made rzinzai huomi", "pashun jalaka"],
  54: ["tsui", "sore hanu ringo"],
  55: ["plus minus gammel glau vapa bjurki ka", "stuur"],
  56: ["kjomi", "sore vil siru plus tsui afto os"],
  57: ["ine ecso kot huin baksu huomi", "kundr"],
  58: ["ein den hjaku tuhat lacsaq catie ip- kn-", "lasku ni tre kiere go"],
  59: ["hadji owari bli- po-", "un nai nam kundr glau"],
  60: ["benj jamete", "un jalaka nai lik sama kundr"],
  61: ["uwaki", "ka na viossa nai deki hanu afto grun angl- kotoba ie espanj-"],
}

interface Word {
  readonly word: string
  readonly taughtIn: readonly number[]
  readonly referencedIn: readonly number[]
}

interface MutableWord {
  word: string
  taughtIn: number[]
  referencedIn: number[]
}

function makeWordList(): ReadonlyMap<string, Word> {
  const map = new Map<string, MutableWord>()

  for (const [index, slide] of Object.entries(slides)) {
    const taught =
      typeof slide == "string" ? slide.split(" ") : slide[0].split(" ")

    const referenced = typeof slide == "string" ? [] : slide[1].split(" ")

    for (const word of taught) {
      const existing = map.get(word) || {
        word,
        taughtIn: [],
        referencedIn: [],
      }

      if (!existing.taughtIn.includes(+index)) {
        existing.taughtIn.push(+index)
      }

      map.set(word, existing)
    }

    for (const word of referenced) {
      const existing = map.get(word) || {
        word,
        taughtIn: [],
        referencedIn: [],
      }

      if (!existing.referencedIn.includes(+index)) {
        existing.referencedIn.push(+index)
      }

      map.set(word, existing)
    }
  }

  return map
}

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
        n: 1,
      })
    }

    // for (const referenced of referencedIn) {
    //   links.push({
    //     a: nodes.length - 1,
    //     b: items.indexOf("" + referenced),
    //     n: 1,
    //   })
    // }
  }

  const { svg, setNodes, setLinks, setPosition } = createForceDirectedGraph()

  setPosition({ x: 0, y: 0, w: 20 })
  setNodes(nodes)
  setLinks(links)

  return <div class="relative h-full w-full">{svg}</div>
}
