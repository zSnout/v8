export const RISOLI = "/viossa71.pdf"

function sort(a: string, b: string) {
  const ax = a.startsWith("-") ? 0 : a.endsWith("-") ? 1 : 2
  const bx = b.startsWith("-") ? 0 : b.endsWith("-") ? 1 : 2

  if (ax - bx != 0) {
    return ax - bx
  }

  return a > b ? 1 : -1
}

function sortPairs(
  [a]: readonly [string, ...unknown[]],
  [b]: readonly [string, ...unknown[]],
) {
  return sort(a, b)
}

export type Content =
  | string // shorthand for no exposed words
  | [taught: string, exposed: string]

export type Fal =
  | "tingko"
  | "suruko"
  | "lihko"
  | "troko"
  | "pashko"
  | "medko"
  | "sporko"
  | "kotobanen"
  | "namae"
  | "hofliko"
  | "atai"
  | "etuniko"
  | "kokoroko"

export type Falnen =
  | "varge"
  | "fami"
  | "fraut"
  | "hanutro"
  | "lasku"
  | "ovashi"
  | "pashko"
  | "plasnamae"
  | "raz" // lyk ima, ende
  | "tyd" // lyk sho, mwuai
  | "vonating"
  | "kokoro"
  | "(shiranai)"

export type ImiOsTatoeba =
  | {
      readonly imi: string
      readonly tatoeba?: readonly string[] | undefined
    }
  | {
      readonly imi?: string
      readonly tatoeba: readonly string[]
    }

export interface BaseWordData {
  readonly emoji: string
  readonly fal: Fal | readonly Fal[]
  readonly falnen: Falnen
  readonly lyk?: readonly string[] | undefined
  readonly kakutro?: readonly string[] | undefined
  readonly kundr?: readonly string[] | undefined
}

export type RawWordData = BaseWordData & ImiOsTatoeba

export type WordData = RawWordData & {
  readonly eins: boolean
}

// #region riso
export const riso: Record<number, Content> = {
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
  22: ["namai fu huin", "jaa ie ka du un"],
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
    "os tsisai sama au ie",
  ],
  31: ["mit kuchi se me hir corva njui hana", "du nam"],
  32: "tropos per nam skoi siru maha",
  33: ["deki", "un nam jalaka hanu nai"],
  34: ["ting hjerne torta cer tualet gavat riso katana plas", "kotoba nam"],
  35: ["men har vil", "ringo banan nai un nam sore ting"],
  36: "tyd dan ima mirai",
  37: [
    "gammel ryo -djin mama papa fi kzin sawi bruur sisco un matetun pojk tutr lapsi mipi nia",
    "un",
  ],
  38: [
    "roza ru portocale ciro midore sini blau murasace shiro gris curo cafe",
    "al kotoba afto farge tsigau nai sama",
  ],
  39: "tsisai stuur",
  40: "simpel haaste",
  41: ["na", "un hanu du maha riso afto ergo plas hej vikoli"],
  42: ["daag uuk mwuai tosui", "kotoba per tyd stuur"],
  43: ["sho funn dzikjaan daag", "kotoba per tyd tsisai"],
  44: "prapataj akote paara praapa",
  45: "tsatain tun",
  46: ["vona sjinu uten", "kundr mit"],
  47: "strela nord west ost sud oba ljeva hina unna migi fura",
  48: ["klar tun", "kundr"],
  49: ["mietta k'", "pashun huin portocale ie al"],
  50: [
    "li sit iske",
    "au du nai glug iske sjinu vil lera viossa da hanu angl-",
  ],
  51: ["jam gaja sot magasin", "pashun na ringo nai banan nil ting mange"],
  52: ["grun naze cola jalaka", "ka afto pashun nai mange sore deki"],
  53: ["kara made rzinzai huomi", "pashun jalaka"],
  54: ["tsui", "sore hanu ringo"],
  55: ["plus minus gammel glau vapa bjurki ka", "stuur"],
  56: ["kjomi", "sore vil siru plus tsui afto os"],
  57: ["inje ecso kot huin baksu huomi", "kundr"],
  58: ["ein den hjaku tuhat lacsaq catie ip- kn-", "lasku ni tre kiere go"],
  59: ["hadji owari bli- po-", "un nai nam kundr glau"],
  60: ["benj jamete", "un jalaka nai lik sama kundr"],
  61: ["uwaki", "ka na viossa nai deki hanu afto grun angl- kotoba ie espanj-"],
  62: "heljo vulcanis aifroidis gaja airis jainos crenos mirairis posaidis",
  63: ["plasdai sol gaja avara luna -dai samui vapa lantdai", "kundr stuur"],
  64: ["-yena libre na circas kaku", "pashun kini sore"],
  65: ["-yena auki kini kot dvera na", "kundr"],
  66: "auki kini",
  67: [
    "fraut ringo crusca portocale lemo banan bestfraut uva vinjafraut cerfraut ahavja nihunfraut persefraut mago ananas niog afefraut fugelfraut",
    "al afto du deki nam",
  ],
  68: ["fal -ki", "jam ni fu pashun dare ka viossa au nai"],
  69: [
    "spor svar",
    "du vil os nai nam ting sot ie bra os warui na du ka tyd ima un mange -s mwuai daag",
  ],
  70: [
    "spor dare doko cosce naze perka hur katai atai",
    "dare vinjafraut fraut har un jam ringo tre skoi du jainos kara bruk",
  ],
  71: [
    "fugel maraidur atechi riobohna protofugel bihmidur njudur dur bagge",
    "al",
  ],
}

export type Word = WordData & {
  readonly kotoba: string
  readonly opetaNa: readonly number[]
  readonly hanuNa: readonly number[]
}

export interface MutableWord {
  kotoba: string
  opetaNa: number[]
  hanuNa: number[]
}

export interface Slide {
  readonly index: number
  readonly opetako: readonly string[]
  readonly hanuko: readonly string[]
}

export interface MutableSlide {
  index: number
  opetako: string[]
  hanuko: string[]
}

export function makeWordList(): ReadonlyMap<string, Word> {
  const map = new Map<string, MutableWord>()

  for (const [index, slide] of Object.entries(riso)) {
    const taught =
      typeof slide == "string" ? slide.split(" ") : slide[0].split(" ")

    const referenced = typeof slide == "string" ? [] : slide[1].split(" ")

    for (const word of taught) {
      const existing = map.get(word) || {
        kotoba: word,
        opetaNa: [],
        hanuNa: [],
      }

      if (!existing.opetaNa.includes(+index)) {
        existing.opetaNa.push(+index)
      }

      map.set(word, existing)
    }

    for (const word of referenced) {
      const existing = map.get(word) || {
        kotoba: word,
        opetaNa: [],
        hanuNa: [],
      }

      if (!existing.hanuNa.includes(+index)) {
        existing.hanuNa.push(+index)
      }

      map.set(word, existing)
    }
  }

  for (const [key, value] of Object.entries(kotobasirupravda)) {
    let mapval = map.get(key)

    if (!mapval) {
      mapval = { hanuNa: [], opetaNa: [], kotoba: key }
      map.set(key, mapval)
    }

    Object.assign(mapval, value)
  }

  let missing: string[] = []
  for (const key of map.keys()) {
    if (!(key in kotobasirupravda)) {
      missing.push(key)
    }
  }
  if (missing.length) {
    throw new Error("Missing words " + missing.join(", ") + " from database.")
  }

  return new Map(
    Array.from(map as any as Map<string, Word>).sort(([a], [b]) => {
      const ax = a.startsWith("-") ? 0 : a.endsWith("-") ? 1 : 2
      const bx = b.startsWith("-") ? 0 : b.endsWith("-") ? 1 : 2

      if (ax - bx != 0) {
        return ax - bx
      }

      return a > b ? 1 : -1
    }),
  )
}

export function makeSlideList(): ReadonlyMap<number, Slide> {
  const map = new Map<number, MutableSlide>()

  for (const [index, slide] of Object.entries(riso)) {
    const opetako =
      typeof slide == "string" ? slide.split(" ") : slide[0].split(" ")

    const hanuko = typeof slide == "string" ? [] : slide[1].split(" ")

    map.set(+index, {
      index: +index,
      hanuko,
      opetako,
    })
  }

  return map
}

const kotobasirumahena: Record<string, RawWordData> = {
  // #region ranjako
  "angl-": {
    emoji: "🇬🇧🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    fal: "namae",
    falnen: "plasnamae",
    imi: "fu anglant os anglossa",
  },
  "doich-": {
    emoji: "🇩🇪",
    fal: "namae",
    falnen: "plasnamae",
    imi: "fu doichlant os doichossa",
  },
  "espanj-": {
    emoji: "🇪🇸",
    fal: "namae",
    falnen: "plasnamae",
    imi: "fu espanjalant os espanjossa",
  },
  "ip-": {
    emoji: "",
    fal: "kotobanen",
    falnen: "lasku",
    tatoeba: [
      "ipni sama 1,000,000 sama milyon.",
      "iptre sama 1,000,000,000.",
      "ipkiere sama 1,000,000,000,000.",
    ],
  },
  "kn-": {
    emoji: "–",
    fal: "kotobanen",
    falnen: "lasku",
    imi: "nil uten lasku",
    tatoeba: [
      "kntre sama nil uten tre.",
      "kn-lasku sama nil uten lasku afto. ",
    ],
  },
  "nihon-": {
    emoji: "🇯🇵",
    fal: "namae",
    falnen: "plasnamae",
    imi: "fu nihonlant os nihonossa",
  },

  // #region festako
  "-a": {
    emoji: "2️⃣",
    fal: "kotobanen",
    falnen: "lasku",
    imi: "jam ni fu afto",
    tatoeba: ["un har ein huin. un har ni huina. un har tre huinara."],
  },
  "-ara": {
    emoji: "🔢",
    fal: "kotobanen",
    falnen: "lasku",
    imi: "jam plusni fu afto",
    tatoeba: ["un har ein huin. un har ni huina. un har tre huinara."],
  },
  "-dai": {
    emoji: "",
    fal: "kotobanen",
    falnen: "(shiranai)",
    imi: "afto ie plustuur de altyd.",
    tatoeba: [
      "amerikalant ie lant. noramerikalantdai ie lantdai (sore har lant mange inje sore).",
    ],
  },
  "-s": {
    emoji: "🥇🥈🥉",
    fal: "kotobanen",
    falnen: "lasku",
    tatoeba: [
      "un nam sotting. un nammirai ovashi. eins, un nam sotting. nis, un nam ovashi.",
      "un au du rzinsaj. un rzinsaj mit tsisai tyd. du rzinsaj mit stuur tyd. un owari eins, au du owari nis.",
    ],
  },
  "-tsa": {
    emoji: "",
    fal: "kotobanen",
    falnen: "(shiranai)",
  },
  "-yena": {
    emoji: "",
    fal: "kotobanen",
    falnen: "hanutro",
    tatoeba: [
      "kot auki circas. circas aukiyena na kot.",
      "un kaku libre. libre kakuyena (na un).",
    ],
  },

  // #region A
  afto: {
    emoji: "",
    fal: "atai",
    falnen: "(shiranai)",
    // imi: "afto ting ie ting ka du deki ", // TODO: 🫵👆👉📥
    lyk: ["asoko", "tuo"],
  },
  ahavja: {
    emoji: "🫐",
    fal: "tingko",
    falnen: "fraut",
  },
  aifroidis: {
    emoji: "",
    fal: "namae",
    falnen: "plasnamae",
    imi: "heljo nis na pandos fun",
  },
  airis: {
    emoji: "",
    fal: "namae",
    falnen: "plasnamae",
    imi: "heljo kieres na pandos fun",
  },
  aistia: {
    emoji: "",
  },
  aja: {
    emoji: "",
  },
  akk: {
    emoji: "",
    fal: "hofliko",
    falnen: "(shiranai)",
    kundr: ["nai"],
  },
  akote: {
    emoji: "",
    fal: "medko",
    imi: "prapataj tsisai",
    kundr: ["praapa"],
    tatoeba: [
      "nuyorkplas na akote fu newarkplas, men sore na praapa fu nihonlant",
    ],
  },
  al: {
    emoji: "",
    fal: "atai",
    falnen: "lasku",
    kundr: ["nil"],
    lyk: ["joku", "joki"],
    tatoeba: ["al ringo ru: 🍎🍎🍎🍎🍎. nai al ringo ru: 🍎🍎🍎🍏🍎."],
  },
  ananas: {
    emoji: "🍍",
    fal: "tingko",
    falnen: "fraut",
  },
  anta: {
    emoji: "🫴",
    fal: "suruko",
    falnen: "(shiranai)",
    tatoeba: ["un har ringo. un anta ringo na du. ima, du har ringo."],
  },
  apar: {
    emoji: "",
    fal: "atai",
    falnen: "lasku",
    imi: "atai fu afto ting ie tsisai.",
    tatoeba: [
      "un har apar ringo: 🍎🍎🍎. du har mange ringo: 🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎.",
    ],
  },
  apu: {
    emoji: "",
    fal: "suruko",
    falnen: "(shiranai)",
    tatoeba: [
      `🧑‍🎓: ka 'atai'?
🧑: nai siru. oy gammeldjin, da apu!
🧑‍🏫: 'atai' lyk 'lasku'. inje 🍎🍎, atai fu ringo ie ni. ringo nai har lasku.
opetadjin apu mellandjin na opeta.`,
    ],
  },
  aschor: {
    emoji: "🤑🏦💸",
    fal: "lihko",
    falnen: "(shiranai)",
    imi: "aschordjin har mange gelt.",
    lyk: ["gelt"],
  },
  asoko: {
    emoji: "",
    fal: "atai",
    falnen: "(shiranai)",
    imi: "asoko ting ie na prapa fu un",
    lyk: ["afto", "tuo"],
  },
  atai: {
    emoji: "🔢",
    fal: "tingko",
    falnen: "lasku",
    tatoeba: [
      "atai fu ringo inje 🍎🍎 ie ni",
      "atai fu ringo inje 🍎🍎🍎🍎 ie kiere",
    ],
  },
  atechi: {
    emoji: "🦎🐍",
    fal: "tingko",
    falnen: "vonating",
  },
  au: {
    emoji: "➕",
    fal: "etuniko",
    falnen: "(shiranai)",
    imi: "'X au Y suru' imi 'X suru. Y suru sama.'",
    tatoeba: ["un har ringo au banan. un: 💁🍎🍌"],
  },
  auauau: {
    emoji: "➕...",
    fal: "troko",
    falnen: "(shiranai)",
    imi: "'X au Y au Z auauau' imi 'X au Y au Z au ting sama'",
    tatoeba: ["kotoba fraut imi ringo au banan au ananas au cerfraut auau"],
    kakutro: ["auau"],
  },
  auki: {
    emoji: "🔓📖📭📂",
    fal: "suruko",
    falnen: "(shiranai)",
    kundr: ["kini"],
    tatoeba: ["🔓📖📭📂 ie auki. 🔒📘📪📁 ie kini."],
  },
  auto: {
    emoji: "🚗🚓🚘🚖",
    fal: "tingko",
    falnen: "(shiranai)",
  },
  avara: {
    emoji: "🌌",
    fal: "tingko",
    falnen: "plasnamae",
    imi: "mangenilting",
    tatoeba: [
      "inje pandos, jam solh au heljara au avara mange.",
      "avara plas stuur. mange tsisai ting ie inje sore.",
    ],
  },
  awen: {
    emoji: "",
    fal: "troko",
    falnen: "(shiranai)",
    tatoeba: [
      `A: ka slucha?
B: un bra? au na du?
A: un bra auen!`,
    ],
  },
  azyci: {
    emoji: "🫘",
    fal: "tingko",
    falnen: "ovashi",
  },

  // #region B
  bagge: {
    emoji: "🐛🐜🐝🪲",
    fal: "tingko",
    falnen: "vonating",
  },
  baksu: {
    emoji: "📦🎁🗳️🥡",
    fal: "tingko",
    falnen: "vonating",
  },
  bamba: {
    emoji: "💣",
    fal: "tingko",
    falnen: "vonating",
  },
  banan: {
    emoji: "🍌",
    fal: "tingko",
    falnen: "vonating",
  },
  baum: {
    emoji: "🌴🌳🌲🎄",
    fal: "tingko",
    falnen: "vonating",
  },
  benj: {
    emoji: "",
    fal: "troko",
    falnen: "raz",
    kundr: ["jamete"],
    tatoeba: [
      "un nam. li un benj nam, sidt un nam. li un jamete nam, sidt un nai nam.",
    ],
  },
  berk: {
    emoji: "🗻⛰️🏔️",
    fal: "tingko",
    falnen: "(shiranai)",
  },
  bestfraut: {
    emoji: "🍉🍈",
    fal: "tingko",
    falnen: "fraut",
  },
  bihmidur: {
    emoji: "🦄🐲",
    fal: "tingko",
    falnen: "vonating",
    imi: "dur ka na gvir",
  },
  bite: {
    emoji: "🥺🙏",
    fal: "hofliko",
    falnen: "(shiranai)",
    imi: "brukena grun du vil hofli",
    tatoeba: [
      `A: bite, da pinuno!
B: du hofli mange 😊! un pinuno 🤫.`,
      `A: da pinuno!
B: du nai hofli 😠! un benj hanu 🗣️.`,
    ],
  },
  bjelu: {
    emoji: "🔔🛎️",
    fal: "tingko",
    falnen: "(shiranai)",
  },
  bjurki: {
    emoji: "🤮🤒🤧🤢",
    fal: "lihko",
    falnen: "(shiranai)",
    imi: "vona waryj",
  },
  bjurkiplas: {
    emoji: "🏥",
    fal: "tingko",
    falnen: "(shiranai)",
    imi: "plas ka bjurkidjin sjkoi kara grun sore vil mahanaibjurki", // TODO: kama
  },
  blau: {
    emoji: "💙🔵🟦🔷",
    fal: "lihko",
    falnen: "varge",
  },
  bli: {
    emoji: "",
    fal: "suruko",
    falnen: "raz",
    tatoeba: ["👶 bli 👵", "🐛 bli 🦋"],
  },
  blin: {
    emoji: "🤬",
    fal: "kokoroko",
    falnen: "(shiranai)",
    tatoeba: [
      `A skoi 🧱 kara.
A: blin!
A: jalak f'un waruiii!`,
    ],
  },
  bluma: {
    emoji: "🪷🌷🌺💐🌻🪻🌸🌹",
    fal: "tingko",
    falnen: "vonating",
  },
  boozy: {
    emoji: "😡😠",
    fal: "lihko",
    falnen: "kokoro",
    tatoeba: [
      `A ergo mange na sjkola. A nai vil ergo.
A: un cocro boozy! un nai vil ergo! al ie warui na un! 😡! un vil 👊 alting!`,
    ],
  },
  bra: {
    emoji: "👍",
    fal: "lihko",
    falnen: "(shiranai)",
    tatoeba: [
      `A: ka slucha na du?
B: un bra 👍! au na du?
A: un warui 👎.`,
    ],
  },
  breska: {
    emoji: "🐢",
    fal: "tingko",
    falnen: "vonating",
  },
  bruk: {
    emoji: "",
    fal: "suruko",
    falnen: "(shiranai)",
    imi: "suruko per mit. li du bruk ting, du (suruko) mit sore.",
  },
  bruur: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "mjes ka mahena na ryodjin sama",
    tatoeba: [
      "un har ein bruur. namae fsore ie sajli. ryodjin f'sajli sama ryodjin fun.",
    ],
  },

  // #region C
  cafe: {
    emoji: "☕🤎🟤🟫",
    fal: ["tingko", "lihko"],
    falnen: "(shiranai)",
  },
  catie: {
    emoji: "",
    fal: "tingko",
    falnen: "lasku",
    imi: "100,000",
  },
  cer: {
    emoji: "🫀",
    fal: "tingko",
    falnen: "(shiranai)",
    imi: "ting ka mange dur har inje sore au ka mahaskoi 🩸",
  },
  cerfraut: {
    emoji: "🍓",
    fal: "tingko",
    falnen: "fraut",
  },
  circas: {
    emoji: "💡🔦🔆🏮",
    fal: "tingko",
    falnen: "(shiranai)",
  },
  ciro: {
    emoji: "💛🟡🟨",
    fal: "lihko",
    falnen: "varge",
  },
  cocro: {
    emoji: "",
    fal: ["tingko", "suruko"],
    falnen: "(shiranai)",
    kakutro: ["kokoro"],
  },
  cola: {
    emoji: "😴💤🛌",
    fal: "suruko",
    falnen: "(shiranai)",
    tatoeba: ["al pershunn mus cola, os sore sjinu"],
  },
  corva: {
    emoji: "👂",
    fal: "tingko",
    falnen: "(shiranai)",
  },
  cosce: {
    emoji: "",
    fal: "sporko",
    falnen: "(shiranai)",
    imi: "ka tyd",
  },
  crenos: {
    emoji: "🪐",
    fal: "tingko",
    falnen: "plasnamae",
    imi: "heljo eksis na pandos fun",
  },
  crusca: {
    emoji: "🍐",
    fal: "tingko",
    falnen: "fraut",
  },
  cunin: {
    emoji: "👑🫅",
    fal: "lihko",
    falnen: "(shiranai)",
  },
  curo: {
    emoji: "⚫🖤⬛",
    fal: "lihko",
    falnen: "varge",
  },

  // #region D
  da: {
    emoji: "",
    fal: "kokoroko",
    falnen: "(shiranai)",
    imi: "'da X' imi 'oy du, un vil ka du X. du mus X.'",
    tatoeba: [
      `A hanu mange.
B: oy A, da pinuno!
A pinuno 🤐.`,
    ],
  },
  daag: {
    emoji: "🌞→🌓→🌞",
    fal: "tingko",
    falnen: "tyd",
    tatoeba: ["inje daag ein, solh skoi un kara, un made, un kara gen"],
  },
  dan: {
    emoji: "⬅️🕰️",
    fal: "troko",
    falnen: "raz",
    imi: "tyd ka nai ieima na her",
    tatoeba: [
      `A nam.
A nai nam.
A dan nam.`,
    ],
  },
  danke: {
    emoji: "🙏😁",
    fal: "hofliko",
    falnen: "(shiranai)",
    tatoeba: [
      "li pashun apu du, da hanu 'danki'",
      `A: ka 'bluma'?
B: bluma = 🌹.
A: danki!
B: nil wil!`,
    ],
  },
  dare: {
    emoji: "",
    fal: "sporko",
    falnen: "(shiranai)",
    imi: "ka pashun",
  },
  darem: {
    emoji: "",
    fal: "suruko",
    falnen: "(shiranai)",
  },
  daremdjin: {
    emoji: "👮👮‍♂️👮‍♀️",
    fal: "tingko",
    falnen: "(shiranai)",
  },
  davai: {
    emoji: "🥳🎉🎊",
    fal: "kokoroko",
    falnen: "(shiranai)",
    tatoeba: ["li du kokore glaumange, sit du vil hanu 'davai'"],
  },
  deer: {
    emoji: "📍👉",
    fal: "tingko",
    falnen: "(shiranai)",
    imi: "tuo plas",
  },
  deki: {
    emoji: "",
    fal: "troko",
    falnen: "(shiranai)",
    kakutro: ["-ki"],
    tatoeba: ["du deki nam 🍎", "du nai deki nam 🚗"],
  },
  den: {
    emoji: "🔟",
    fal: "tingko",
    falnen: "lasku",
    imi: "10",
  },
  diskord: {
    emoji: "",
    fal: "tingko",
    falnen: "plasnamae",
  },
  dok: {
    emoji: "🫵",
    fal: "pashko",
    falnen: "(shiranai)",
    imi: "du mange",
  },
  doko: {
    emoji: "📍?",
    fal: "sporko",
    falnen: "(shiranai)",
    imi: "ka plas",
  },
  dronet: {
    emoji: "👸",
    fal: "tingko",
    falnen: "(shiranai)",
    imi: "cunin onna",
  },
  du: {
    emoji: "🫵",
    fal: "pashko",
    falnen: "(shiranai)",
  },
  dua: {
    emoji: "😍🥰🫶",
    fal: "suruko",
    falnen: "kokoro",
  },
  dur: {
    emoji: "🦝🐶🦎🐟🪼🦈🐺🦀",
    fal: "tingko",
    falnen: "vonating",
  },
  dush: {
    emoji: "🛀🚿",
    fal: "suruko",
    falnen: "(shiranai)",
  },
  dvera: {
    emoji: "🚪",
    fal: "tingko",
    falnen: "(shiranai)",
  },
  dzikjaan: {
    emoji: "🕐🕑🕒🕓🕔",
    fal: "tingko",
    falnen: "tyd",
    tatoeba: ["jam 24 dzikjann na ein dag"],
  },

  // #region E
  ecso: {
    emoji: "📤",
  },
  efles: {
    emoji: "👃👍",
  },
  ein: {
    emoji: "1️⃣",
  },
  eins: {
    emoji: "",
  },
  eksi: {
    emoji: "6️⃣",
  },
  ende: {
    emoji: "",
  },
  enterrena: {
    emoji: "",
  },
  ergo: {
    emoji: "👷🧑‍🏫🧑‍💼",
  },

  // #region F
  fal: {
    emoji: "🟨🔴🔷",
    tatoeba: ["yam ni fal fu pershun: dare ka hanuki viossa, a dare ka nai"],
  },
  fami: {
    emoji: "👪👨‍👨‍👧‍👧👨‍👩‍👦‍👦👨‍👨‍👧‍👦",
  },
  farge: {
    emoji: "🎨❤️💚🟨🔷🟧🔴🟩",
  },
  farza: {
    emoji: "🌡️📏⚖️📐",
  },
  festako: {
    emoji: "",
  },
  fi: {
    emoji: "",
  },
  film: {
    emoji: "🎞️",
  },
  flacha: {
    emoji: "🏁🏳️‍🌈🏳️🚩",
  },
  fras: {
    emoji: "",
  },
  fraut: {
    emoji: "🍎🍓🥝🍑🍒🍋🍌🥭",
  },
  froreenj: {
    emoji: "👃👎",
  },
  fshto: {
    emoji: "📥🧠👍",
  },
  fu: {
    emoji: "",
  },
  fuga: {
    emoji: "",
  },
  fugel: {
    emoji: "🐧🦉🦅🐥🦜🐦🦆🐔",
  },
  fugelfraut: {
    emoji: "🥝",
    kakutro: ["afefraut"],
  },
  funn: {
    emoji: "",
  },
  fura: {
    emoji: "",
  },

  // #region G
  gaja: {
    emoji: "🌏🌍🌎",
  },
  gammel: {
    emoji: "🧓👵👴",
  },
  gavat: {
    emoji: "🎁",
  },
  gelt: {
    emoji: "💰💵🪙",
  },
  gen: {
    emoji: "🕰️+1",
    imi: "ein plus raz",
    tatoeba: ["A: oy B, da hanu!\nB hanu.\nA: da hanu gen!\nB hanu gen."],
  },
  glau: {
    emoji: "😁😄😃😀",
  },
  glaubi: {
    emoji: "½",
    imi: "mellan akk au nai",
    tatoeba: [
      `100 = akk
50 = glaubi
0 = nai`,
    ],
  },
  glossa: {
    emoji: "",
    kakutro: ["-ossa"],
  },
  glug: {
    emoji: "",
  },
  go: {
    emoji: "5️⃣",
  },
  godja: {
    emoji: "",
  },
  gomen: {
    emoji: "😔🙏🙇",
  },
  gos: {
    emoji: "👍➡️🧑",
    imi: "aparlyk dua",
    tatoeba: ["du gos ≈ bra na du"],
  },
  gris: {
    emoji: "🩶",
  },
  grun: {
    emoji: "",
  },
  gvir: {
    emoji: "",
  },

  // #region H
  haaste: {
    emoji: "",
  },
  hadji: {
    emoji: "",
    kakutro: ["bli-"],
  },
  hana: {
    emoji: "👃",
  },
  hanj: {
    emoji: "½",
  },
  hant: {
    emoji: "🖐️✋",
  },
  hanu: {
    emoji: "🗣️",
  },
  hapigo: {
    emoji: "",
  },
  har: {
    emoji: "",
  },
  hej: {
    emoji: "",
  },
  hel: {
    emoji: "",
  },
  helenakaku: {
    emoji: "",
  },
  heljo: {
    emoji: "🪐🌎",
  },
  henci: {
    emoji: "💭👃➡️🫁",
  },
  her: {
    emoji: "",
  },
  hina: {
    emoji: "",
  },
  hir: {
    emoji: "🔉➡️👂",
  },
  hiven: {
    emoji: "🍨🍦",
  },
  hjaku: {
    emoji: "💯",
  },
  hjerne: {
    emoji: "🧠",
  },
  hofli: {
    emoji: "🙂🙇🙏",
    fal: "suruko",
    kundr: ["kushipa"],
    tatoeba: [
      "li pashun hanu 'danke' au 'nil' au 'gomen', sore hofli. li sore hanu 'blin' au 'shaisa', sore kushipa.",
    ],
  },
  hor: {
    emoji: "",
  },
  huin: {
    emoji: "🐶",
  },
  huomi: {
    emoji: "🏠🏡🏚️",
  },
  huomilehti: {
    emoji: "",
  },
  hur: {
    emoji: "",
  },
  hyske: {
    emoji: "",
  },

  // #region I
  ie: {
    emoji: "",
  },
  ima: {
    emoji: "🕰️➡️",
  },
  imang: {
    emoji: "🧲",
  },
  imi: {
    emoji: "",
  },
  inje: {
    emoji: "📥",
  },
  ipkiere: {
    emoji: "",
  },
  ipni: {
    emoji: "",
  },
  iptre: {
    emoji: "",
  },
  isi: {
    emoji: "🪨",
  },
  iske: {
    emoji: "🚰💧💦🌊",
  },
  ivel: {
    emoji: "🌆",
  },

  // #region J
  jaa: {
    emoji: "👋",
  },
  jainos: {
    emoji: "",
  },
  jalaka: {
    emoji: "🚶🚶‍♂️🚶‍♀️",
  },
  jam: {
    emoji: "",
  },
  jamete: {
    emoji: "🛑",
  },
  jetta: {
    emoji: "✈️🛩️🛫🛬",
  },
  joki: {
    emoji: ">50%",
  },
  joku: {
    emoji: "",
  },

  // #region K
  "k'": {
    emoji: "",
  },
  ka: {
    emoji: "¿❓❔?",
  },
  kaku: {
    emoji: "✍️",
  },
  kara: {
    emoji: "",
  },
  karroqhn: {
    emoji: "🥕",
  },
  kase: {
    emoji: "8️⃣",
  },
  katai: {
    emoji: "",
  },
  katana: {
    emoji: "🔪🗡️",
  },
  kawaji: {
    emoji: "🥺❤️✨",
  },
  kiere: {
    emoji: "4️⃣",
  },
  kini: {
    emoji: "🔒🚪📪📁",
    fal: "suruko",
    falnen: "(shiranai)",
    tatoeba: [
      "du deki jalaka na dvera auki, men du nai deki jalaka na dvera kini.",
    ],
  },
  kirain: {
    emoji: "",
  },
  kjannos: {
    emoji: "",
  },
  kjomi: {
    emoji: "",
  },
  klar: {
    emoji: "",
  },
  kntre: {
    emoji: "",
  },
  kolarum: {
    emoji: "",
  },
  kompju: {
    emoji: "🖥️💻",
  },
  kot: {
    emoji: "🐱",
  },
  kotnen: {
    emoji: "🐱🤏",
  },
  kotoba: {
    emoji: "",
  },
  kuchi: {
    emoji: "👄",
  },
  kun: {
    emoji: "♀️♂️⚧︎",
  },
  kundr: {
    emoji: "",
  },
  kushipa: {
    emoji: "🤪🤬🖕",
    fal: "suruko",
    kundr: ["hofli"],
    tatoeba: [
      "li pashun hanu 'danke' au 'nil' au 'gomen', sore hofli. li sore hanu 'blin' au 'shaisa', sore kushipa.",
    ],
  },
  kury: {
    emoji: "🌑🕶️",
  },
  kyajdz: {
    emoji: "🥢",
  },
  kzin: {
    emoji: "",
  },

  // #region L
  lacsaq: {
    emoji: "",
  },
  lacte: {
    emoji: "",
  },
  lantdai: {
    emoji: "",
  },
  lapsi: {
    emoji: "",
  },
  lasku: {
    emoji: "🔢",
  },
  lehti: {
    emoji: "",
  },
  lemo: {
    emoji: "🍋",
  },
  lera: {
    emoji: "🧑‍🎓",
  },
  lezi: {
    emoji: "👀📘",
  },
  li: {
    emoji: "",
  },
  libre: {
    emoji: "📘📖📔📚",
  },
  lik: {
    emoji: "",
  },
  ljeta: {
    emoji: "🪽✈️🦋🐦🪰",
  },
  ljeva: {
    emoji: "⬅️",
    awenkakulyk: ["larava"],
  },
  luft: {
    emoji: "",
  },
  luna: {
    emoji: "🌑🌕",
  },
  luvan: {
    emoji: "🥕",
  },

  // #region M
  made: {
    emoji: "",
  },
  magasin: {
    emoji: "🏬🏪",
  },
  mago: {
    emoji: "🥭",
  },
  maha: {
    emoji: "",
  },
  mama: {
    emoji: "",
  },
  maraidur: {
    emoji: "",
  },
  mange: {
    emoji: "",
  },
  maredur: {
    emoji: "🐟🦈🦐🐙🦑🐬🐠",
  },
  marojzschine: {
    emoji: "🍦🍨",
  },
  matetun: {
    emoji: "💍🧑",
  },
  matetundjin: {
    emoji: "💍🧑",
  },
  me: {
    emoji: "👁️",
  },
  mellan: {
    emoji: "",
  },
  men: {
    emoji: "",
  },
  midore: {
    emoji: "🟩💚🟢",
  },
  mietta: {
    emoji: "🤔💭",
  },
  migi: {
    emoji: "➡️",
  },
  milenjal: {
    emoji: "🥑",
  },
  milyon: {
    emoji: "",
  },
  mirairis: {
    emoji: "",
  },
  minus: {
    emoji: "",
  },
  mipi: {
    emoji: "",
  },
  mirai: {
    emoji: "🕰️➡️",
  },
  mis: {
    emoji: "🐭🐁",
  },
  mit: {
    emoji: "",
  },
  mjes: {
    emoji: "♀︎👦👨👴",
  },
  mono: {
    emoji: "",
  },
  mora: {
    emoji: "🌅",
  },
  mucc: {
    emoji: "",
  },
  mulbaksu: {
    emoji: "🗑️",
  },
  mulkaban: {
    emoji: "",
  },
  murasace: {
    emoji: "💜🟣🟪",
  },
  mwuai: {
    emoji: "",
  },

  // #region N
  na: {
    emoji: "",
  },
  naht: {
    emoji: "🌉🌃🌑",
  },
  nai: {
    emoji: "❌",
  },
  nam: {
    emoji: "🍱➡️👄",
  },
  namai: {
    emoji: "📛",
  },
  namting: {
    emoji: "🍌🥭🐟🥗🥐🥖🍗🍳",
  },
  nana: {
    emoji: "7️⃣",
  },
  nasi: {
    emoji: "",
  },
  naze: {
    emoji: "",
  },
  neo: {
    emoji: "👶✨📱",
  },
  ni: {
    emoji: "2️⃣",
  },
  nia: {
    emoji: "",
  },
  niden: {
    emoji: "20",
  },
  nihunfraut: {
    emoji: "🍒",
  },
  nil: {
    emoji: "0️⃣",
  },
  nilting: {
    emoji: "",
  },
  niog: {
    emoji: "🥥",
  },
  njudur: {
    emoji: "🐶🐱🐘🐯🦓",
  },
  njui: {
    emoji: "💭➡️👃",
  },
  noito: {
    emoji: "🧵🧶",
  },
  non: {
    emoji: "9️⃣",
  },
  nord: {
    emoji: "",
  },

  // #region O
  oba: {
    emoji: "⬆️",
  },
  ogoi: {
    emoji: "🔊📢",
  },
  ohare: {
    emoji: "🙏🥺🥗🍱",
  },
  ojogi: {
    emoji: "🏊🏊‍♂️🏊‍♀️",
  },
  ojogidzin: {
    emoji: "",
  },
  onna: {
    emoji: "♀︎👧👩👵",
  },
  opeta: {
    emoji: "🧑‍🏫👨‍🏫👩‍🏫",
  },
  os: {
    emoji: "",
  },
  ost: {
    emoji: "",
  },
  ovashi: {
    emoji: "🥗🥕🥬🫑",
  },
  owari: {
    emoji: "🏁",
    kakutro: ["po-"],
  },
  oy: {
    emoji: "",
  },

  // #region P
  paara: {
    emoji: "",
  },
  pan: {
    emoji: "🥐🥖🍞🥨",
  },
  pandos: {
    emoji: "",
    fal: "tingko",
    falnen: "plasnamae",
    imi: "pandos har sol au heljo mange. jam mange pandos",
    tatoeba: [
      "pandos fun har solh au un au du au gaja au luna au heljo mange.",
    ],
  },
  papa: {
    emoji: "",
  },
  paperi: {
    emoji: "📰📃📄📝",
  },
  pashun: {
    emoji: "👶🧒👧👦🧑👩👨🧑‍🦱",
    kakutro: ["-djin"],
  },
  per: {
    emoji: "",
  },
  perka: {
    emoji: "",
    imi: "ka per?",
  },
  persefraut: {
    emoji: "🍑",
  },
  piel: {
    emoji: "",
  },
  piman: {
    emoji: "🫑🌶️",
  },
  pinue: {
    emoji: "🐧",
  },
  pinuno: {
    emoji: "🔇🔈",
  },
  pisma: {
    emoji: "📩",
  },
  pitsa: {
    emoji: "🍕",
  },
  plas: {
    emoji: "🏠🏞️🏔️🎑🗺️",
  },
  plasdai: {
    emoji: "",
  },
  plus: {
    emoji: "",
  },
  pojk: {
    emoji: "",
  },
  portocale: {
    emoji: "🍊🟧🧡🟠",
  },
  posaidis: {
    emoji: "",
  },
  praapa: {
    emoji: "",
  },
  pranvera: {
    emoji: "",
  },
  prapataj: {
    emoji: "",
  },
  pravda: {
    emoji: "✅",
  },
  protofugel: {
    emoji: "🦕🦖",
  },
  punkt: {
    emoji: "",
  },

  // #region R
  ranja: {
    emoji: "🫚",
    fal: "tingko",
    falnen: "vonating",
    tatoeba: ["baum har ranha unna ter"],
  },
  ranjako: {
    emoji: "",
    fal: "tingko",
    falnen: "hanutro",
    imi: "li jam festako lyk kotobanen, kotobastuur ie ranjako.",
    tatoeba: [
      "inje ko 'amerikalant', jam ranjako 'amerika' au kotobanen 'lant'",
    ],
  },
  raz: {
    emoji: "",
  },
  ri: {
    emoji: "",
  },
  riobohna: {
    emoji: "",
  },
  ringo: {
    emoji: "🍎🍏",
  },
  rinj: {
    emoji: "📞",
  },
  riso: {
    emoji: "🖼️",
  },
  rjoho: {
    emoji: "",
  },
  roza: {
    emoji: "🩷💗🎀",
  },
  ru: {
    emoji: "🔴🟥❤️",
  },
  rum: {
    emoji: "",
  },
  ryo: {
    emoji: "",
  },
  ryodjin: {
    emoji: "",
    imi: "mama au papa. ryodjin fu du maha du. du vona ryodjin kara.",
  },
  rzinzai: {
    emoji: "🏃🏃‍♂️🏃‍♀️",
  },

  // #region S
  sakana: {
    emoji: "🐟🐠",
  },
  sakawi: {
    emoji: "",
    fal: "namae",
    imi: "mahadjin fu afto kotoli",
  },
  sama: {
    emoji: "",
  },
  samui: {
    emoji: "🥶🧊❄️",
    kundr: ["vapa"],
  },
  sawi: {
    emoji: "",
    imi: "matetundjin fu lapsi os mipi",
  },
  scecso: {
    emoji: "📤🚶",
    imi: "sjkoi her kara",
  },
  sceer: {
    emoji: "📥🚶",
    imi: "sjkoi her made",
  },
  sdanie: {
    emoji: "🏠🏬🏢⛪",
  },
  se: {
    emoji: "👀",
  },
  shiro: {
    emoji: "🤍⚪⬜🏳️",
  },
  shirutro: {
    emoji: "🧫🧪🧬🔬",
  },
  sho: {
    emoji: "",
  },
  sidt: {
    emoji: "",
  },
  silba: {
    emoji: "",
  },
  simpel: {
    emoji: "",
  },
  sini: {
    emoji: "🩵",
  },
  siru: {
    emoji: "📥🧠",
  },
  sisco: {
    emoji: "",
  },
  sit: {
    emoji: "",
  },
  sjikno: {
    emoji: "🍲🦵👨‍🦰",
  },
  sjinu: {
    emoji: "☠️💀😵⚰️🪦",
  },
  skhola: {
    emoji: "🏫",
  },
  skoi: {
    emoji: "🚶‍♀️✈️🚝🚴🚘",
  },
  skwalo: {
    emoji: "🦈",
  },
  slucha: {
    emoji: "",
    fal: "suruko",
    falnen: "(shiranai)",
    imi: "~ suru ke jam",
    kakutro: ["hlutsza"],
    tatoeba: [
      `A: ka slucha na du?
B: un braa! danki, au na du?
A: un bra auen!`,
    ],
  },
  sol: {
    emoji: "🌞☀️",
  },
  sore: {
    emoji: "",
  },
  sot: {
    emoji: "🧁🍩🎂🍦🍯🍡🍭",
  },
  spara: {
    emoji: "",
  },
  spil: {
    emoji: "🎲🏏🎮👾🎳🎰🀄",
  },
  spor: {
    emoji: "",
  },
  sporko: {
    emoji: "",
  },
  stift: {
    emoji: "🖊️🖋️",
  },
  strela: {
    emoji: "←↖↓↔⇅",
  },
  stuur: {
    emoji: "",
  },
  sud: {
    emoji: "",
  },
  sukha: {
    emoji: "",
  },
  suksu: {
    emoji: "🍂🍁🎃",
  },
  suru: {
    emoji: "",
  },
  suruko: {
    emoji: "",
  },
  surujna: {
    emoji: "",
  },
  svar: {
    emoji: "",
    kundr: ["spor"],
  },

  // #region T
  tajka: {
    emoji: "✨🧙🪄",
  },
  tajkadzin: {
    emoji: "🧙🧙‍♀️🧙‍♂️",
  },
  tak: {
    emoji: "",
  },
  talvi: {
    emoji: "❄️🏔️⛷️🧤",
  },
  tasti: {
    emoji: "🖱️👆",
  },
  tatuiba: {
    emoji: "",
  },
  te: {
    emoji: "",
  },
  tel: {
    emoji: "",
  },
  ter: {
    emoji: "",
  },
  terbi: {
    emoji: "📺",
  },
  timba: {
    emoji: "🛎️🔔",
  },
  ting: {
    emoji: "🔮🥒🐀🧠🎂🫀🚽🎁",
  },
  torta: {
    emoji: "🧁🎂🍰",
  },
  toshitel: {
    emoji: "",
  },
  tosui: {
    emoji: "",
  },
  tre: {
    emoji: "3️⃣",
  },
  treng: {
    emoji: "",
  },
  trict: {
    emoji: "😭😢😥",
  },
  tropos: {
    emoji: "",
  },
  tsatain: {
    emoji: "🎯",
  },
  tsigau: {
    emoji: "",
  },
  tsisai: {
    emoji: "🤏",
  },
  tsui: {
    emoji: "",
  },
  tualet: {
    emoji: "🚽",
  },
  tuhat: {
    emoji: "",
  },
  tulla: {
    emoji: "🧑➡️🚪",
  },
  tun: {
    emoji: "",
  },
  tuo: {
    emoji: "",
  },
  tutr: {
    emoji: "",
  },
  tyd: {
    emoji: "🕰️⏳⏰⌚",
  },

  // #region U
  ufne: {
    emoji: "⏺️🎦",
  },
  un: {
    emoji: "",
  },
  unna: {
    emoji: "⬇️",
  },
  uno: {
    emoji: "",
  },
  upasnen: {
    emoji: "🍦🍨",
  },
  uso: {
    emoji: "❌",
  },
  uten: {
    emoji: "",
  },
  utenvona: {
    emoji: "🪨🎸🚀",
  },
  uuk: {
    emoji: "",
  },
  uva: {
    emoji: "🍇",
  },
  uwaki: {
    emoji: "❌🚫⛔",
  },

  // #region V
  valtsa: {
    emoji: "💃🕺",
  },
  vapa: {
    emoji: "🥵🔥",
  },
  vasu: {
    emoji: "",
  },
  vauva: {
    emoji: "👶",
  },
  velt: {
    emoji: "🌎🗺️🌐",
  },
  vera: {
    emoji: "☀️😎🏄‍♂️🏖️",
  },
  vet: {
    emoji: "🫁",
  },
  vi: {
    emoji: "",
  },
  viha: {
    emoji: "😡",
  },
  vikoli: {
    emoji: "",
  },
  vil: {
    emoji: "",
  },
  vinjafraut: {
    emoji: "🍇",
  },
  viossa: {
    emoji: "",
  },
  vona: {
    emoji: "🌺🧒🦋",
  },
  vratsch: {
    emoji: "",
  },
  vulcanis: {
    emoji: "",
  },

  // #region W
  wa: {
    emoji: "",
  },
  warui: {
    emoji: "👎",
  },
  we: {
    emoji: "",
    imi: "akk os nai?",
    tatoeba: [
      `A: du har huin we?
B: un har huin, akk.
A: braa. un dua huin.`,
    ],
  },
  west: {
    emoji: "",
  },

  // #region Z
  zedvera: {
    emoji: "",
  },
  zehant: {
    emoji: "🖱️",
  },
  zeme: {
    emoji: "📸🎥📷",
  },
  zespil: {
    emoji: "🎮",
  },
  zeus: {
    emoji: "⚡",
    kakutro: ["ze-"],
  },

  // #region 100
  100: {
    emoji: "🤣😂😆",
  },
}

const kotobasirupravda: Record<string, WordData> = Object.fromEntries(
  Object.entries(kotobasirumahena)
    .flatMap<[string, WordData]>(([key, value]) => [
      [key, { ...value, eins: true }],
      ...(value.kakutro?.map(
        (kotoba) =>
          [
            kotoba,
            {
              ...value,
              kakutro: value
                .kakutro!.filter((x) => x != kotoba)
                .concat(key)
                .sort(sort),
              eins: false,
            },
          ] satisfies [string, WordData],
      ) || []),
    ])
    .sort(sortPairs),
)
