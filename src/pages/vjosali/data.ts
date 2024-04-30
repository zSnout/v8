export const RISOLI = "/viossa72.pdf"

export function sortWords(a: string, b: string) {
  const ax = a.startsWith("-") ? 0 : a.endsWith("-") ? 1 : 2
  const bx = b.startsWith("-") ? 0 : b.endsWith("-") ? 1 : 2

  if (ax - bx != 0) {
    return ax - bx
  }

  return a > b ? 1 : -1
}

export function sortPairs(
  [a]: readonly [string, ...unknown[]],
  [b]: readonly [string, ...unknown[]],
) {
  return sortWords(a, b)
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
  | "toshitel"
  | "strela"
  | "namting"
  | "glugting"
  | "kun"
  | "(sjiranai)"

// TODO: add info about all priority two words
export type Priority2 =
  | "ze-"
  | 100
  | "auto"
  | "azyci"
  | "bamba"
  | "berk"
  | "bjelu"
  | "breska"
  | "cunin"
  | "daremdjin"
  | "dua"
  | "dush"
  | "farza"
  | "film"
  | "flacha"
  | "froreenj"
  | "hanj"
  | "hant"
  | "henci"
  | "hiven"
  | "imang"
  | "ishi"
  | "ivel"
  | "jetta"
  | "joki"
  | "luvan"
  | "kawari"
  | "kompju"
  | "kotnen"
  | "kun"
  | "kury"
  | "kyajdz"
  | "ljeta"
  | "luvan"
  | "marojzschine"
  | "milenjal"
  | "mjes"
  | "mora"
  | "mulbaksu"
  | "naht"
  | "namting"
  | "neo"
  | "niden"
  | "noito"
  | "ogoi"
  | "ohare"
  | "onna"
  | "ovashi"
  | "pan"
  | "paperi"
  | "piman"
  | "pisma"
  | "pitsa"
  | "pravda"
  | "rinj"
  | "sakana"
  | "sdanie"
  | "shirutro"
  | "sjikno"
  | "skhola"
  | "skwalo"
  | "spil"
  | "stift"
  | "suksu"
  | "tajkadzin"
  | "talvi"
  | "terbi"
  | "timba"
  | "tulla"
  | "ufne"
  | "upasnen"
  | "uso"
  | "utenvona"
  | "varge"
  | "vauva"
  | "velt"
  | "vera"
  | "vet"
  | "viha"
  | "zehant"
  | "zeme"
  | "zespil"
  | "zeus"

export type ImiOsTatoeba =
  | {
      readonly imi: string
      readonly tatoeba?: readonly string[] | undefined
    }
  | {
      readonly imi?: string | undefined
      readonly tatoeba: readonly string[]
    }
  | {
      readonly imi?: string | undefined
      readonly tatoeba?: readonly string[] | undefined
    }

export interface BaseWordData {
  readonly emoji: string
  readonly fal: Fal | readonly [Fal, ...Fal[]]
  readonly falnen: Falnen | readonly [Falnen, ...Falnen[]]
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
  20: ["per ringo torta cola bra warui cafe", "kotoba du al pashun"],
  21: "afto tuo asoko ringo huin pashun bluma lera -djin pinue",
  22: "ie fugel baum maredur",
  23: ["namai fu huin", "jaa ie ka du un"],
  24: ["ru ciro midore au lezi glug cafe", "ie pashun lera nam sore du lik"],
  25: ["awen slucha bra warui glau trict", "un du au nai ka"],
  26: ["vil nam mis", "afto mama oy pashun"],
  27: ["da pinuno hanu oy", "os vil afto nai"],
  28: [
    "bite danke nil gomen cer ringo banan",
    "ka da pinuno nai hanu vil anta na un bra",
  ],
  29: "jalaka hanu kaku siru cola valtsa tasti ergo suru kotoba",
  30: ["os gelt aschor", "vil nam glug du un mange"],
  31: [
    "ein ni tre kiere go eksi nana kase non den apar mange lasku",
    "os tsisai sama au ie",
  ],
  32: ["mit kuchi se me hir corva njui hana", "du nam"],
  33: "tropos per nam sjkoi siru maha",
  34: ["deki", "un nam jalaka hanu nai"],
  35: ["ting hjerne torta cer tualet gavat riso katana plas", "kotoba nam"],
  36: ["men har vil", "ringo banan nai un nam sore ting"],
  37: "tyd dan ima mirai",
  38: [
    "gammel ryodjin mama papa fi kzin sawi bruur sisco un matetun matetundjin pojk tutr lapsi mipi nia fami",
    "un",
  ],
  39: [
    "roza ru portocale ciro midore sini blau murasace shiro gris curo cafe",
    "al kotoba afto varge tsigau nai sama",
  ],
  40: "tsisai stuur",
  41: "simpel haaste",
  42: ["na", "un hanu du maha riso afto ergo plas hej vikoli"],
  43: ["daag uuk mwuai tosui", "kotoba per tyd stuur"],
  44: ["sho funn dzikjaan daag", "kotoba per tyd tsisai"],
  45: "prapataj akote paara praapa",
  46: "tsatain tun",
  47: ["vona sjinu uten", "kundr mit"],
  48: "strela nord west ost sud oba ljeva hina unna migi fura",
  49: ["klar tun", "kundr"],
  50: ["mietta k'", "pashun huin portocale ie al"],
  51: [
    "li sit iske",
    "au du nai glug iske sjinu vil lera viossa da hanu angl-",
  ],
  52: ["jam gaja sot magasin", "pashun na ringo nai banan nil ting mange"],
  53: ["grun naze cola jalaka", "ka afto pashun nai mange sore deki"],
  54: ["kara made rzinzai huomi", "pashun jalaka"],
  55: ["tsui", "sore hanu ringo"],
  56: ["plus minus gammel glau vapa bjurki ka", "stuur"],
  57: ["kjomi", "sore vil siru plus tsui afto os"],
  58: ["inje ecso kot huin baksu huomi", "kundr"],
  59: ["ein den hjaku tuhat lacsaq catie ip- kn-", "lasku ni tre kiere go"],
  60: ["hadji owari bli- po-", "un nai nam kundr glau"],
  61: ["benj jamete", "un jalaka nai lik sama kundr"],
  62: ["uwaki", "ka na viossa nai deki hanu afto grun angl- kotoba ie espanj-"],
  63: "heljo vulcanis aifroidis gaja airis jainos crenos mirairis posaidis",
  64: ["plasdai sol gaja avara luna -dai samui vapa lantdai", "kundr stuur"],
  65: ["-yena libre na circas kaku", "pashun kini sore"],
  66: ["-yena auki kini kot dvera na", "kundr"],
  67: "auki kini",
  68: [
    "fraut ringo crusca portocale lemo banan bestfraut uva vinjafraut cerfraut ahavja nihunfraut persefraut mago ananas niog afefraut fugelfraut",
    "al afto du deki nam",
  ],
  69: ["fal -ki", "jam ni fu pashun dare ka viossa au nai"],
  70: [
    "spor svar",
    "du vil os nai nam ting sot ie bra os warui na du ka tyd ima un mange -s mwuai daag",
  ],
  71: [
    "spor dare doko cosce naze perka hur katai atai",
    "dare vinjafraut fraut har un jam ringo tre sjkoi du jainos kara bruk",
  ],
  72: ["fugel maredur atechi protofugel bihmidur njudur dur bagge", "al"],
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
    lyk: ["ni"],
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
    falnen: "(sjiranai)",
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
    falnen: "(sjiranai)",
    imi: "un vil ke du ...",
    lyk: ["da"],
    tatoeba: ["namtsa = 'un vil ke du nam'"],
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
    falnen: "(sjiranai)",
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
  aja: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    lyk: ["sjkoi"],
    tatoeba: ["du aja auto"],
  },
  akk: {
    emoji: "",
    fal: "hofliko",
    falnen: "(sjiranai)",
    kundr: ["nai"],
  },
  akote: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    imi: "prapataj tsisai",
    kundr: ["praapa"],
    lyk: ["paara"],
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
  ander: {
    emoji: "",
    fal: "atai",
    falnen: "(sjiranai)",
    tatoeba: [
      `A har ringo au banan.
B: da anta fraut na un.
A anta ringo.
B: nai ringo, da anta ander fraut.
A anta banan.`,
    ],
  },
  anta: {
    emoji: "🫴",
    fal: "suruko",
    falnen: "(sjiranai)",
    tatoeba: ["un har ringo. un anta ringo na du. ima, du har ringo."],
  },
  apar: {
    emoji: "",
    fal: "atai",
    falnen: "lasku",
    imi: "atai fu afto ting ie tsisai.",
    kundr: ["mange"],
    tatoeba: [
      "un har apar ringo: 🍎🍎🍎. du har mange ringo: 🍎🍎🍎🍎🍎🍎🍎🍎🍎🍎.",
    ],
  },
  apu: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
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
    falnen: "(sjiranai)",
    imi: "aschordjin har mange gelt.",
    lyk: ["gelt"],
  },
  asoko: {
    emoji: "",
    fal: "atai",
    falnen: "(sjiranai)",
    imi: "asoko ting ie na prapa fu un",
    lyk: ["afto", "tuo"],
  },
  atai: {
    emoji: "🔢",
    fal: "tingko",
    falnen: "lasku",
    lyk: ["lasku"],
    tatoeba: [
      "atai fu ringo inje 🍎🍎 ie ni",
      "atai fu ringo inje 🍎🍎🍎🍎 ie kiere",
    ],
  },
  atechi: {
    emoji: "🦎🐍",
    fal: "tingko",
    falnen: "vonating",
    kakutro: ["riobohna"],
  },
  au: {
    emoji: "➕",
    fal: "etuniko",
    falnen: "(sjiranai)",
    imi: "'X au Y suru' imi 'X suru. Y suru sama.'",
    tatoeba: ["un har ringo au banan. un: 💁🍎🍌"],
  },
  auauau: {
    emoji: "➕...",
    fal: "troko",
    falnen: "(sjiranai)",
    imi: "'X au Y au Z auauau' imi 'X au Y au Z au ting sama'",
    tatoeba: ["kotoba fraut imi ringo au banan au ananas au cerfraut auau"],
    kakutro: ["auau"],
  },
  auki: {
    emoji: "🔓📖📭📂",
    fal: "suruko",
    falnen: "(sjiranai)",
    kundr: ["kini"],
    tatoeba: ["🔓📖📭📂 ie auki. 🔒📘📪📁 ie kini."],
  },
  auto: {
    emoji: "🚗🚓🚘🚖",
    fal: "tingko",
    falnen: "(sjiranai)",
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
    falnen: "(sjiranai)",
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
    lyk: ["mulbaksu"],
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
      "un nam. li un benj nam, sit un nam. li un jamete nam, sit un nai nam.",
    ],
  },
  berk: {
    emoji: "🗻⛰️🏔️",
    fal: "tingko",
    falnen: "(sjiranai)",
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
  bistra: {
    emoji: "🐌🚋🐢",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "bruk tyd stuur",
    kundr: ["hiras"],
  },
  bite: {
    emoji: "🥺🙏",
    fal: "hofliko",
    falnen: "(sjiranai)",
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
    falnen: "(sjiranai)",
  },
  bjurki: {
    emoji: "🤮🤒🤧🤢",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "vona waryj",
  },
  bjurkiplas: {
    emoji: "🏥",
    fal: "tingko",
    falnen: "(sjiranai)",
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
    falnen: "(sjiranai)",
    tatoeba: [
      `A sjkoi 🧱 kara.
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
    falnen: "(sjiranai)",
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
    falnen: "(sjiranai)",
    imi: "suruko per mit. li du bruk ting, du (suruko) mit sore.",
    lyk: ["mit"],
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
    falnen: "(sjiranai)",
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
    falnen: "(sjiranai)",
    imi: "ting ka mange dur har inje sore au ka mahasjkoi 🩸",
  },
  cerfraut: {
    emoji: "🍓",
    fal: "tingko",
    falnen: "fraut",
  },
  circas: {
    emoji: "💡🔦🔆🏮",
    fal: "tingko",
    falnen: "(sjiranai)",
    kundr: ["kury"],
  },
  ciro: {
    emoji: "💛🟡🟨",
    fal: "lihko",
    falnen: "varge",
  },
  cocro: {
    emoji: "",
    fal: ["tingko", "suruko"],
    falnen: "(sjiranai)",
    kakutro: ["kokoro", "aistia"],
  },
  cola: {
    emoji: "😴💤🛌",
    fal: "suruko",
    falnen: "(sjiranai)",
    tatoeba: ["al pershunn mus cola, os sore sjinu"],
  },
  corva: {
    emoji: "👂",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  cosce: {
    emoji: "",
    fal: "sporko",
    falnen: "(sjiranai)",
    imi: "ka tyd",
  },
  crenos: {
    emoji: "🪐",
    fal: "tingko",
    falnen: "plasnamae",
    imi: "heljo eksis na pandos fun",
  },
  cris: {
    emoji: "🦁🦈⚠️",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "afto deki shinu du",
    kundr: ["siha"],
    tatoeba: ["🐯 cris. 🐱 siha."],
  },
  crusca: {
    emoji: "🍐",
    fal: "tingko",
    falnen: "fraut",
  },
  cunin: {
    emoji: "👑🫅",
    fal: "lihko",
    falnen: "(sjiranai)",
  },
  curo: {
    emoji: "⚫🖤⬛",
    fal: "lihko",
    falnen: "varge",
    kundr: ["shiro"],
  },

  // #region D
  da: {
    emoji: "",
    fal: "kokoroko",
    falnen: "(sjiranai)",
    imi: "'da X' imi 'oy du, un vil ka du X. du mus X.'",
    lyk: ["-tsa"],
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
    tatoeba: ["inje daag ein, solh sjkoi un kara, un made, un kara gen"],
  },
  dan: {
    emoji: "⬅️🕰️",
    fal: "troko",
    falnen: "raz",
    imi: "tyd ka nai ieima na her",
    lyk: ["ima"],
    kundr: ["mirai"],
    tatoeba: [
      `A nam.
A nai nam.
A dan nam.`,
    ],
  },
  danke: {
    emoji: "🙏😁",
    fal: "hofliko",
    falnen: "(sjiranai)",
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
    falnen: "(sjiranai)",
    imi: "ka pashun",
  },
  darem: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  daremdjin: {
    emoji: "👮👮‍♂️👮‍♀️",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  de: {
    emoji: "🕰️",
    fal: "medko",
    falnen: "tyd",
    kundr: ["ze"],
    tatoeba: ["un nam de glug. eins (ima), un nam. nis, un glug."],
  },
  davai: {
    emoji: "🥳🎉🎊",
    fal: "kokoroko",
    falnen: "(sjiranai)",
    tatoeba: ["li du kokore glaumange, sit du vil hanu 'davai'"],
  },
  der: {
    emoji: "📍👉",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "tuo plas",
    lyk: ["hapigo", "her"],
  },
  deki: {
    emoji: "",
    fal: "troko",
    falnen: "(sjiranai)",
    kakutro: ["-ki"],
    tatoeba: ["du deki nam 🍎", "du nai deki nam 🚗"],
  },
  den: {
    emoji: "🔟",
    fal: "tingko",
    falnen: "lasku",
    imi: "10",
  },
  denwa: {
    emoji: "📱",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "~ kompjunen",
    lyk: ["kompju"],
  },
  diskord: {
    emoji: "",
    fal: "tingko",
    falnen: "plasnamae",
  },
  dok: {
    emoji: "🫵",
    fal: "pashko",
    falnen: "pashko",
    imi: "du mange",
    lyk: ["du"],
  },
  doko: {
    emoji: "📍?",
    fal: "sporko",
    falnen: "(sjiranai)",
    imi: "ka plas",
  },
  dronet: {
    emoji: "👸",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "cunin onna",
  },
  du: {
    emoji: "🫵",
    fal: "pashko",
    falnen: "pashko",
    lyk: ["dok"],
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
    falnen: "(sjiranai)",
  },
  dvera: {
    emoji: "🚪",
    fal: "tingko",
    falnen: "(sjiranai)",
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
    fal: "medko",
    falnen: "(sjiranai)",
    kundr: ["inje"],
  },
  efles: {
    emoji: "👃👍",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "braa na njui",
    kundr: ["froreenj"],
  },
  ein: {
    emoji: "1️⃣",
    fal: "atai",
    falnen: "lasku",
    imi: "1",
  },
  eins: {
    emoji: "🥇",
    fal: "lihko",
    falnen: "lasku",
    imi: "ein + -s",
  },
  eksi: {
    emoji: "6️⃣",
    fal: "atai",
    falnen: "lasku",
    imi: "6",
  },
  ende: {
    emoji: "",
    fal: "troko",
    falnen: "raz",
    imi: "dan au ima",
  },
  enterrena: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "inje + ter + -yena",
  },
  ergo: {
    emoji: "👷🧑‍🏫🧑‍💼",
    fal: "suruko",
    falnen: "(sjiranai)",
  },

  // #region F
  fal: {
    emoji: "🟨🔴🔷",
    fal: "tingko",
    falnen: "(sjiranai)",
    tatoeba: ["yam ni fal fu pershun: dare ka hanuki viossa, a dare ka nai"],
  },
  fami: {
    emoji: "👪👨‍👨‍👧‍👧👨‍👩‍👦‍👦👨‍👨‍👧‍👦",
    fal: "tingko",
    falnen: "fami",
  },
  farza: {
    emoji: "🌡️📏⚖️📐",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "ting per sjiru ka vecht os pitka osos",
  },
  festako: {
    emoji: "",
    fal: "tingko",
    falnen: "hanutro",
    imi: "kotobanen ka akote na ranjako",
    tatoeba: [
      "inje kotoba 'amerikalant', -lant ie festako",
      "inje kotoba 'tres', -s ie festako.",
    ],
  },
  fi: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "mipi fu ryodjin os matetundjin fsore",
  },
  film: {
    emoji: "🎞️",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "ting ke 📹 ufne",
  },
  flacha: {
    emoji: "🏁🏳️‍🌈🏳️🚩",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  fras: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "~ kotoba mange",
    lyk: ["kotoba", "punkt"],
  },
  fraut: {
    emoji: "🍎🍓🥝🍑🍒🍋🍌🥭",
    fal: "tingko",
    falnen: "fraut",
  },
  froreenj: {
    emoji: "👃👎",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "warui na njyi",
    kundr: ["efles"],
  },
  fshto: {
    emoji: "📥🧠👍",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "'un siru braa'",
    lyk: ["siru"],
  },
  fu: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
  },
  fuga: {
    emoji: "🃏🪪💳",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "librenen ka opeta sirunen",
    tatoeba: ["vi spil mit fuga"],
  },
  fugel: {
    emoji: "🐧🦉🦅🐥🦜🐦🦆🐔",
    fal: "tingko",
    falnen: "vonating",
  },
  fugelfraut: {
    emoji: "🥝",
    fal: "tingko",
    falnen: "fraut",
    kakutro: ["afefraut"],
  },
  funn: {
    emoji: "",
    fal: "tingko",
    falnen: "tyd",
    tatoeba: ["jam 60 funn na ein dzikjann", "jan 1440 funn na ein daag"],
  },
  fura: {
    emoji: "",
    fal: "tingko",
    falnen: "strela",
    kundr: ["hina"],
  },

  // #region G
  gaja: {
    emoji: "🌏🌍🌎",
    fal: "tingko",
    falnen: "plasnamae",
    imi: "heljo ke un au du vona na",
  },
  gammel: {
    emoji: "🧓👵👴",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["neo"],
  },
  gavat: {
    emoji: "🎁",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  gelt: {
    emoji: "💰💵🪙",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["aschor"],
  },
  gen: {
    emoji: "🕰️+1",
    fal: "troko",
    falnen: "raz",
    imi: "ein plus raz",
    tatoeba: ["A: oy B, da hanu!\nB hanu.\nA: da hanu gen!\nB hanu gen."],
  },
  glau: {
    emoji: "😁😄😃😀",
    fal: "lihko",
    falnen: "kokoro",
  },
  glaubi: {
    emoji: "½",
    fal: "troko",
    falnen: "(sjiranai)",
    imi: "mellan akk au nai",
    tatoeba: [
      `100 = akk
50 = glaubi
0 = nai`,
    ],
  },
  glossa: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "ting ke al pershun hanu mit",
    kakutro: ["-ossa"],
  },
  glug: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "nam iske os cafe osos",
    lyk: ["nam"],
  },
  go: {
    emoji: "5️⃣",
    fal: "atai",
    falnen: "lasku",
  },
  godja: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "ka akote na ecso fu ting",
    lyk: ["piel"],
    tatoeba: [
      "aldjin har godja",
      "godja fu pashun ie lacte stuur vonatro na sore",
      "li du vil nam portocale 🍊, sit du mus mahanaigvir godja fsore",
    ],
  },
  gomen: {
    emoji: "😔🙏🙇",
    fal: "kokoroko",
    falnen: "(sjiranai)",
  },
  gos: {
    emoji: "👍➡️🧑",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "bra na hanudjin; aparlyk dua",
    tatoeba: ["du gos ≈ bra na du"],
  },
  gris: {
    emoji: "🩶",
    fal: "lihko",
    falnen: "varge",
  },
  grun: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    lyk: ["naze", "per"],
  },
  gus: {
    emoji: "👍",
    fal: "suruko",
    falnen: "(sjiranai)",
    tatoeba: ["li du gus ting, ting bra na du."],
  },
  gvir: {
    emoji: "🐴🌲✅",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "ein os plusein afto ie na velt. ~ jam afto.",
    tatoeba: ["🐴 gvir. 🦄 nai gvir."],
  },

  // #region H
  haaste: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["simpel"],
  },
  hadji: {
    emoji: "",
    fal: "suruko",
    falnen: "raz",
    kakutro: ["bli-"],
  },
  haesa: {
    emoji: "🗣️📛",
    fal: "suruko",
    falnen: "(sjiranai)",
    tatoeba: [`A haesa B "C". namae fu B "C" na A`],
  },
  hana: {
    emoji: "👃",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["njui"],
  },
  hanj: {
    emoji: "½",
    fal: "tingko",
    falnen: "lasku",
    imi: "mellan tsatain na al au nil",
  },
  hant: {
    emoji: "🖐️✋",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  hanu: {
    emoji: "🗣️",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  hapigo: {
    emoji: "📍👉",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "asoko plas",
    lyk: ["her", "der"],
  },
  har: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  hej: {
    emoji: "",
    fal: "pashko",
    falnen: "pashko",
    imi: "sore mange",
    lyk: ["sore"],
  },
  hel: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "al fu afto ting",
    kundr: ["tel"],
    tatoeba: ["🎂 hel torta. 🍰 tel torta."],
  },
  helenakaku: {
    emoji: "𝓀𝒶𝓀𝓊",
    fal: "suruko",
    falnen: "(sjiranai)",
    tatoeba: ["𝒶𝒻𝓉ℴ 𝒽ℯ𝓁ℯ𝓃𝒶𝓀𝒶𝓀𝓊. afto nai helenakaku."],
  },
  heljo: {
    emoji: "🪐🌎",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "plasdaidai",
  },
  henci: {
    emoji: "💭👃➡️🫁",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "",
  },
  her: {
    emoji: "📍⬇️",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "afto plas",
    lyk: ["hapigo", "der"],
  },
  hina: {
    emoji: "",
    fal: "tingko",
    falnen: "strela",
    kundr: ["fura"],
  },
  hir: {
    emoji: "🔉➡️👂",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "zan sjkoi na corva fdu",
  },
  hiras: {
    emoji: "🚄🐆⚡",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "bruk tyd tsisai",
    kundr: ["bistra"],
  },
  hiven: {
    emoji: "🍨🍦",
    fal: "tingko",
    falnen: "namting",
    kakutro: ["marojzschine", "upasnen"],
  },
  hjaku: {
    emoji: "💯",
    fal: "tingko",
    falnen: "lasku",
    imi: "100 (denden)",
  },
  hjerne: {
    emoji: "🧠",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  hofli: {
    emoji: "🙂🙇🙏",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["kushipa"],
    tatoeba: [
      "li pashun hanu 'danke' au 'nil' au 'gomen', sore hofli. li sore hanu 'blin' au 'shaisa', sore kushipa.",
    ],
  },
  hono: {
    emoji: "🔥",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  hor: {
    emoji: "💇💇‍♂️💇‍♀️",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  huin: {
    emoji: "🐶",
    fal: "tingko",
    falnen: "vonating",
  },
  huomi: {
    emoji: "🏠🏡🏚️",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  huomilehti: {
    emoji: "🏠📄",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "lehti ka du se cosce du eins se libre",
  },
  hur: {
    emoji: "",
    fal: "sporko",
    falnen: "(sjiranai)",
    imi: "ka tropos? mit ka?",
  },
  hyske: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "siru dan au benj shiru ima",
    kundr: ["vasu"],
  },

  // #region I
  icen: {
    emoji: "🤔",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "icen oba X = hur du mietta oba X",
    tatoeba: [
      "icen oba ringo: UN VIHA RINGO, un dua ringo, ringo nai bra au nai warui",
    ],
  },
  ie: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "suruko ke mangedjin bruk akote lihko os tingko cosce hej vil suruko per tingko os lihko",
  },
  ima: {
    emoji: "🕰️⬇️",
    fal: "troko",
    falnen: "raz",
    imi: "afto tyd",
    lyk: ["dan", "mirai"],
  },
  imang: {
    emoji: "🧲",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  imi: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    lyk: ["tatoeba"],
    tatoeba: ["'fshto' imi 'un siru braa na hjerne fun'"],
  },
  inje: {
    emoji: "📥",
    fal: "medko",
    falnen: "(sjiranai)",
    lyk: ["mellan"],
    kundr: ["ecso"],
  },
  ipkiere: {
    emoji: "",
    fal: "tingko",
    falnen: "lasku",
    imi: "1,000,000,000,000",
  },
  ipni: {
    emoji: "",
    fal: "tingko",
    falnen: "lasku",
    imi: "1,000,000",
    kakutro: ["milyon"],
  },
  iptre: {
    emoji: "",
    fal: "tingko",
    falnen: "lasku",
    imi: "1,000,000,000",
  },
  ishi: {
    emoji: "🪨",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  iske: {
    emoji: "🚰💧💦🌊",
    fal: "tingko",
    falnen: "glugting",
  },
  ivel: {
    emoji: "🌆",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "tyd akote owari fu daag cosce daag bli naht",
  },

  // #region J
  jaa: {
    emoji: "👋",
    fal: "hofliko",
    falnen: "(sjiranai)",
  },
  jainos: {
    emoji: "",
    fal: "tingko",
    falnen: "plasnamae",
  },
  jalaka: {
    emoji: "🚶🚶‍♂️🚶‍♀️",
    fal: "suruko",
    falnen: "(sjiranai)",
    lyk: ["sjkoi"],
  },
  jam: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  jamete: {
    emoji: "🛑",
    fal: "suruko",
    falnen: "(sjiranai)",
    kundr: ["benj"],
  },
  jetta: {
    emoji: "✈️🛩️🛫🛬",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  joki: {
    emoji: ">50%",
    fal: "atai",
    falnen: "(sjiranai)",
    lyk: ["al", "joku"],
  },
  joku: {
    emoji: "",
    fal: "atai",
    falnen: "(sjiranai)",
    lyk: ["al", "joki", "nil"],
  },

  // #region K
  "k'": {
    emoji: "",
    fal: "troko",
    falnen: "(sjiranai)",
    kakutro: ["ke"],
  },
  ka: {
    emoji: "¿❓❔?",
    fal: "sporko",
    falnen: "(sjiranai)",
  },
  kaku: {
    emoji: "✍️",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  kara: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    kundr: ["made"],
    tatoeba: ["pashun jalaka huomi kara = 🚶 ⬅️ 🏠"],
  },
  kase: {
    emoji: "8️⃣",
    fal: "atai",
    falnen: "lasku",
  },
  katai: {
    emoji: "",
    fal: "sporko",
    falnen: "lasku",
    imi: "ka atai?",
  },
  katana: {
    emoji: "🔪🗡️",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  kawari: {
    emoji: "🥺❤️✨",
    fal: "kokoroko",
    falnen: "(sjiranai)",
    tatoeba: [
      `A se 🐶.
A: kawari!!! ❤️😍✨💖`,
    ],
  },
  kiere: {
    emoji: "4️⃣",
    fal: "atai",
    falnen: "lasku",
  },
  kini: {
    emoji: "🔒🚪📪📁",
    fal: "suruko",
    falnen: "(sjiranai)",
    kundr: ["auki"],
    tatoeba: [
      "du deki jalaka na dvera auki, men du nai deki jalaka na dvera kini.",
    ],
  },
  kirain: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["silba", "kotoba"],
    tatoeba: ["K-I-R-A-I-N"],
  },
  kjannos: {
    emoji: "文↔A",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "nasi kotoba fu ein glossa ander glossa made",
    tatoeba: ["'hello' na anglossa ie 'hola' na espanjossa"],
  },
  kjomi: {
    emoji: "🤔",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "vil suru plus tsui jokuting",
  },
  klar: {
    emoji: "🪟🧊🔍◌",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "du deki se inje afto ting",
    kundr: ["tun"],
  },
  kntre: {
    emoji: "-3",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "nil uten tre",
    tatoeba: ["kntre mit tre sama nil"],
  },
  kolarum: {
    emoji: "🛌",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "rum per cola",
    tatoeba: ["du cola na kolarun"],
  },
  kompju: {
    emoji: "🖥️💻",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["denwa"],
  },
  kot: {
    emoji: "🐱",
    fal: "tingko",
    falnen: "vonating",
    lyk: ["kotnen"],
  },
  kotnen: {
    emoji: "🐱🤏",
    fal: "tingko",
    falnen: "vonating",
    imi: "neo kot, kot ka bli gvir na tyd akote",
    lyk: ["kot"],
  },
  kotoba: {
    emoji: "",
    fal: "tingko",
    falnen: "hanutro",
    lyk: ["kirain", "silba", "fras"],
  },
  kuchi: {
    emoji: "👄",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  kun: {
    emoji: "♀️♂️⚧︎",
    fal: "tingko",
    falnen: "kun",
  },
  kundr: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  kushipa: {
    emoji: "🤪🤬🖕",
    fal: "suruko",
    falnen: "(sjiranai)",
    kundr: ["hofli"],
    tatoeba: [
      "li pashun hanu 'danke' au 'nil' au 'gomen', sore hofli. li sore hanu 'blin' au 'shaisa', sore kushipa.",
    ],
  },
  kury: {
    emoji: "🌑🕶️",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["circas"],
  },
  kyajdz: {
    emoji: "🥢",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  kzin: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "lapsi fu fi",
  },

  // #region L
  lacsaq: {
    emoji: "",
    fal: "tingko",
    falnen: "lasku",
    imi: "10,000",
  },
  latsty: {
    emoji: "⋙⋘",
    fal: "troko",
    falnen: "(sjiranai)",
    imi: "plus os minus na al",
    lyk: ["plus", "minus"],
    tatoeba: [
      "A har 🍎. B har 🍎🍎. C har 🍎🍎🍎🍎. C har lacti plus. A har lacti minus.",
    ],
  },
  lantdai: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "lant stuur ka har mange lant inje sore",
  },
  lapsi: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "pashun ke ryodjin mahagvir",
    kundr: ["ryodjin"],
  },
  lasku: {
    emoji: "🔢",
    fal: "tingko",
    falnen: "lasku",
    lyk: ["atai"],
  },
  lehti: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "punkt mange",
    lyk: ["punkt", "pisma"],
    tatoeba: [
      `jaa,
ima, un ergomange.
ka slucha na du?
- sakawi kara`,
    ],
  },
  lemo: {
    emoji: "🍋",
    fal: "tingko",
    falnen: "fraut",
  },
  lera: {
    emoji: "🧑‍🎓",
    fal: "suruko",
    falnen: "(sjiranai)",
    kundr: ["opeta"],
  },
  lezi: {
    emoji: "👀📘",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "se libre",
    lyk: ["libre"],
  },
  li: {
    emoji: "",
    fal: "etuniko",
    falnen: "(sjiranai)",
    lyk: ["sit"],
    tatoeba: ["li du nai nam, sit du sjiny"],
  },
  libre: {
    emoji: "📘📖📔📚",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["lezi"],
  },
  lik: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    lyk: ["sama"],
    kundr: ["tsigau"],
  },
  ljeta: {
    emoji: "🪽✈️🦋🐦🪰",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "sjkoi na luft",
  },
  ljeva: {
    emoji: "⬅️",
    fal: "tingko",
    falnen: "strela",
    kakutro: ["larava"],
    kundr: ["migi"],
  },
  luft: {
    emoji: "💨💭☁️",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["vint"],
    tatoeba: ["du treng luft na sore, os du sjiny"],
  },
  luna: {
    emoji: "🌑🌕",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["sol"],
  },
  luvan: {
    emoji: "🥕",
    fal: "tingko",
    falnen: "ovashi",
    kakutro: ["karroqhn"],
  },

  // #region M
  made: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    kundr: ["kara"],
    tatoeba: ["pershun jalaka huomi made = 🏠 ⬅️ 🚶"],
  },
  magasin: {
    emoji: "🏬🏪",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  mago: {
    emoji: "🥭",
    fal: "tingko",
    falnen: "fraut",
  },
  maha: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  mama: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "ryodjin onna",
    lyk: ["ryodjin", "papa"],
  },
  mange: {
    emoji: "",
    fal: "lihko",
    falnen: "lasku",
    kundr: ["apar"],
  },
  maredur: {
    emoji: "🐟🦈🦐🐙🦑🐬🐠",
    fal: "tingko",
    falnen: "vonating",
  },
  matetun: {
    emoji: "💍",
    fal: "suruko",
    falnen: "fami",
    lyk: ["matetundjin"],
  },
  matetundjin: {
    emoji: "💍🧑",
    fal: "tingko",
    falnen: "fami",
    lyk: ["matetun"],
  },
  me: {
    emoji: "👁️",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  mekji: {
    emoji: "👉",
    fal: "suruko",
    falnen: "(sjiranai)",
    tatoeba: [
      "🫵 hantnen mëkiiqh na du",
      "👇 hantnen mëkji na unna",
      "du mekji ting grun du vil k'anderdjin kjomi sore",
    ],
  },
  mellan: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    lyk: ["inje"],
    tatoeba: ["2 mellan 1 au 3", "3 mellan 1 au 4", "glaubi mellan akk au nai"],
  },
  men: {
    emoji: "",
    fal: "etuniko",
    falnen: "(sjiranai)",
  },
  midore: {
    emoji: "🟩💚🟢",
    fal: "lihko",
    falnen: "varge",
  },
  mietta: {
    emoji: "🤔💭",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "~ hanu inje hjerne fdu",
  },
  migi: {
    emoji: "➡️",
    fal: "tingko",
    falnen: "(sjiranai)",
    kundr: ["ljeva"],
  },
  milenjal: {
    emoji: "🥑",
    fal: "tingko",
    falnen: "ovashi",
  },
  mirairis: {
    emoji: "",
    fal: "tingko",
    falnen: "plasnamae",
    imi: "heljo nanas na pandos fun",
  },
  minus: {
    emoji: "",
    fal: "troko",
    falnen: "(sjiranai)",
    lyk: ["latsty"],
    kundr: ["plus"],
  },
  mipi: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "pershun ka har ryodjin sama",
  },
  mirai: {
    emoji: "🕰️➡️",
    fal: "tingko",
    falnen: "raz",
    kundr: ["dan"],
    lyk: ["ima"],
  },
  mis: {
    emoji: "🐭🐁",
    fal: "tingko",
    falnen: "vonating",
  },
  mit: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    lyk: ["bruk"],
  },
  mjes: {
    emoji: "♂️👦👨👴",
    fal: "lihko",
    falnen: "kun",
  },
  mono: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "jam ting fu fal ein, na fal plusein",
    tatoeba: [
      "🍎🍎🍎🍎🍎 ru mono",
      "🍎🍎🍏🍎🍎 nai ru mono grun jam ringo midore",
    ],
  },
  mora: {
    emoji: "🌅",
    fal: "tingko",
    falnen: "raz",
    imi: "tyd cosce sol bligvir",
  },
  mul: {
    emoji: "🗑️",
    lyk: ["mulbaksu"],
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  mulbaksu: {
    emoji: "🗑️",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "ting ke du anta mul inje",
    lyk: ["mul", "baksu"],
  },
  murasace: {
    emoji: "💜🟣🟪",
    fal: "lihko",
    falnen: "varge",
  },
  mus: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "lyk treng, men du nai deki sinu",
    lyk: ["treng"],
    tatoeba: ["du mus pinuno, os vi nai deki benj na jetta!"],
  },
  mwuai: {
    emoji: "",
    fal: "tingko",
    falnen: "tyd",
  },

  // #region N
  na: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
  },
  naht: {
    emoji: "🌉🌃🌑",
    fal: "tingko",
    falnen: "tyd",
  },
  nai: {
    emoji: "❌",
    fal: "troko",
    falnen: "(sjiranai)",
    kundr: ["akk"],
  },
  nam: {
    emoji: "🍱➡️👄",
    fal: "suruko",
    falnen: "namting",
    lyk: ["glug"],
  },
  namai: {
    emoji: "📛",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  namting: {
    emoji: "🍌🥭🐟🥗🥐🥖🍗🍳",
    fal: "tingko",
    falnen: "namting",
  },
  nana: {
    emoji: "7️⃣",
    fal: "atai",
    falnen: "lasku",
  },
  nasi: {
    emoji: "🫸",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "du mahasjkoi ting plas kara ander plas made",
  },
  naze: {
    emoji: "",
    fal: "sporko",
    falnen: "(sjiranai)",
    imi: "ka grun?",
    lyk: ["grun", "perka"],
  },
  neo: {
    emoji: "👶✨📱",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["gammel"],
  },
  ni: {
    emoji: "2️⃣",
    fal: "atai",
    falnen: "lasku",
    lyk: ["-a"],
  },
  nia: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "lapsi fu mipi",
  },
  niden: {
    emoji: "20",
    fal: "atai",
    falnen: "lasku",
    imi: "20",
  },
  nihunfraut: {
    emoji: "🍒",
    fal: "tingko",
    falnen: "fraut",
  },
  nil: {
    emoji: "0️⃣",
    fal: "atai",
    falnen: "lasku",
    lyk: ["joku"],
    kundr: ["al"],
  },
  nilting: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "nil ting",
  },
  niog: {
    emoji: "🥥",
    fal: "tingko",
    falnen: "fraut",
  },
  njudur: {
    emoji: "🐶🐱🐘🐯🦓",
    fal: "tingko",
    falnen: "vonating",
  },
  njui: {
    emoji: "💭➡️👃",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["hana"],
  },
  noito: {
    emoji: "🧵🧶",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  non: {
    emoji: "9️⃣",
    fal: "atai",
    falnen: "lasku",
  },
  nord: {
    emoji: "🧭⬆️",
    fal: "tingko",
    falnen: "strela",
  },

  // #region O
  oba: {
    emoji: "⬆️",
    fal: "tingko",
    falnen: "strela",
    imi: "kundr unna; tsui",
  },
  ogoi: {
    emoji: "🔊📢",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  ohare: {
    emoji: "🙏🥺🥗🍱",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "vil nam",
  },
  ojogi: {
    emoji: "🏊🏊‍♂️🏊‍♀️",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "sjkoi na iske",
    lyk: ["ojogidjin"],
  },
  ojogidjin: {
    emoji: "🏊🏊‍♀️🏊‍♂️",
    fal: "tingko",
    falnen: "vonating",
    imi: "pashun ke ojogi",
    lyk: ["ojogi"],
  },
  onna: {
    emoji: "♀︎👧👩👵",
    fal: "lihko",
    falnen: "kun",
  },
  opeta: {
    emoji: "🧑‍🏫👨‍🏫👩‍🏫",
    fal: "suruko",
    falnen: "(sjiranai)",
    kundr: ["lera"],
  },
  os: {
    emoji: "/",
    fal: "etuniko",
    falnen: "(sjiranai)",
  },
  ost: {
    emoji: "🧭➡️",
    fal: "tingko",
    falnen: "strela",
  },
  ovashi: {
    emoji: "🥗🥕🥬🫑",
    fal: "tingko",
    falnen: "ovashi",
  },
  owari: {
    emoji: "🏁",
    fal: "suruko",
    falnen: "raz",
    kakutro: ["po-"],
  },
  oy: {
    emoji: "📣",
    fal: "kokoroko",
    falnen: "(sjiranai)",
    tatoeba: ["A vil afto: B hyr A. A hanu: 'oy B!'"],
  },

  // #region P
  paara: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
    lyk: ["praapa", "akote"],
  },
  pan: {
    emoji: "🥐🥖🍞🥨",
    fal: "tingko",
    falnen: "namting",
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
    fal: "tingko",
    falnen: "fami",
    imi: "ryodjin mjes",
    lyk: ["ryodjin", "mama"],
  },
  paperi: {
    emoji: "📰📃📄📝",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  pashun: {
    emoji: "👶🧒👧👦🧑👩👨🧑‍🦱",
    fal: "tingko",
    falnen: "vonating",
    kakutro: ["-djin"],
  },
  per: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    lyk: ["perka", "grun"],
  },
  perka: {
    emoji: "",
    fal: "sporko",
    falnen: "(sjiranai)",
    imi: "ka per?",
    lyk: ["per", "naze"],
  },
  persefraut: {
    emoji: "🍑",
    fal: "tingko",
    falnen: "fraut",
  },
  piel: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "godja fu pashun",
    lyk: ["godja"],
  },
  piman: {
    emoji: "🫑🌶️",
    fal: "tingko",
    falnen: "ovashi",
  },
  pinue: {
    emoji: "🐧",
    fal: "tingko",
    falnen: "vonating",
  },
  pinuno: {
    emoji: "🔇🔈",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  pisma: {
    emoji: "📩",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["lehti"],
  },
  pitsa: {
    emoji: "🍕",
    fal: "tingko",
    falnen: "namting",
  },
  plas: {
    emoji: "🏠🏞️🏔️🎑🗺️",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  plasdai: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "plas stuur",
  },
  plus: {
    emoji: "",
    fal: "troko",
    falnen: "(sjiranai)",
    kundr: ["minus"],
    lyk: ["latsty"],
  },
  pojk: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
  },
  portocale: {
    emoji: "🍊🟧🧡🟠",
    fal: ["tingko", "lihko"],
    falnen: ["fraut", "varge"],
    imi: "fraut 🍊; varge 🟧🧡🟠",
  },
  posaidis: {
    emoji: "",
    fal: "tingko",
    falnen: "plasnamae",
    imi: "heljo kases na pandos fun",
  },
  praapa: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["akote"],
    lyk: ["paara"],
  },
  pranvera: {
    emoji: "🌹⛅🌱☔",
    fal: "tingko",
    falnen: "toshitel",
    imi: "toshitel ke mwuai 3s au 4s au 5s inje",
  },
  prapataj: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  pravda: {
    emoji: "✅",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["uso"],
  },
  protofugel: {
    emoji: "🦕🦖",
    fal: "tingko",
    falnen: "vonating",
  },
  punkt: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["fras", "lehti"],
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
    emoji: "🕰️",
    fal: "tingko",
    falnen: "raz",
    imi: "katai suru",
    tatoeba: [
      "un hanu ni raz. un 🗣️. un 🗣️.",
      "un hanu kiere raz. un 🗣️. un 🗣️. un 🗣️. un 🗣️.",
    ],
  },
  ri: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    imi: "ting suru ka?",
    lyk: ["te", "wa"],
    tatoeba: ["un nam ringo", "un te ringo ri nam"],
  },
  ringo: {
    emoji: "🍎🍏",
    fal: "tingko",
    falnen: "fraut",
  },
  rinj: {
    emoji: "📞",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  riso: {
    emoji: "🖼️",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  rjoho: {
    emoji: "",
    fal: "atai",
    falnen: "(sjiranai)",
    imi: "al hej",
    tatoeba: [
      `A: du vil cafe os iske?
B: un vil cafe AU iske! un vil rjoho!`,
    ],
  },
  roza: {
    emoji: "🩷💗🎀",
    fal: "lihko",
    falnen: "varge",
  },
  ru: {
    emoji: "🔴🟥❤️",
    fal: "lihko",
    falnen: "varge",
  },
  rum: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  ryodjin: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "mama au papa. ryodjin fu du maha du. du vona ryodjin kara.",
    lyk: ["mama", "papa"],
    kundr: ["lapsi"],
  },
  rzinzai: {
    emoji: "🏃🏃‍♂️🏃‍♀️",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "jalaka mit tyd tsisai",
  },

  // #region S
  sakana: {
    emoji: "🐟🐠",
    fal: "tingko",
    falnen: "vonating",
  },
  sakawi: {
    emoji: "",
    fal: "namae",
    falnen: "vonating",
    imi: "mahadjin fu afto kotoli",
  },
  sama: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
    lyk: ["lik"],
    kundr: ["tsigau"],
  },
  samui: {
    emoji: "🥶🧊❄️",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["vapa"],
  },
  sawi: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
    imi: "matetundjin fu lapsi os mipi",
  },
  scecso: {
    emoji: "📤🚶",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "sjkoi ecso made, sjkoi her kara",
    kundr: ["sceer"],
  },
  sceer: {
    emoji: "📥🚶",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "sjkoi her made",
    kundr: ["scecso"],
  },
  sdanie: {
    emoji: "🏠🏬🏢⛪",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  se: {
    emoji: "👀",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  sentaku: {
    emoji: "🤔💬",
    fal: "suruko",
    falnen: "(sjiranai)",
    tatoeba: [
      `A: du vil ros ringo os midori ringo?
B: un sentaku ros, sitte un vil ringo ros.
"un sentaku A" likk "li mono A os B, un vil A"`,
    ],
  },
  shiro: {
    emoji: "🤍⚪⬜🏳️",
    fal: "lihko",
    falnen: "varge",
    kundr: ["curo"],
  },
  shirutro: {
    emoji: "🧫🧪🧬🔬",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "tropos per siru",
  },
  sho: {
    emoji: "",
    fal: "tingko",
    falnen: "tyd",
  },
  siha: {
    emoji: "🐱🐟",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "afto naideki sjinu du",
    kundr: ["cris"],
    tatoeba: ["🦈 cris. 🐱 siha."],
  },
  silba: {
    emoji: "",
    fal: "tingko",
    falnen: "hanutro",
    lyk: ["kirain", "kotoba"],
  },
  simpel: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
    kundr: ["haaste"],
  },
  sini: {
    emoji: "🩵",
    fal: "lihko",
    falnen: "varge",
  },
  siru: {
    emoji: "📥🧠",
    fal: "suruko",
    falnen: "(sjiranai)",
    lyk: ["fshto"],
  },
  sisco: {
    emoji: "",
    fal: "tingko",
    falnen: "fami",
  },
  sit: {
    emoji: "",
    fal: "troko",
    falnen: "(sjiranai)",
    lyk: ["li"],
    tatoeba: ["li du nai glug iske, sit du sinu ☠️"],
  },
  sjikno: {
    emoji: "🍲🦵👨‍🦰",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  sjinu: {
    emoji: "☠️💀😵⚰️🪦",
    fal: "suruko",
    falnen: "(sjiranai)",
    kundr: ["vona"],
    lyk: ["utenvona"],
  },
  skhola: {
    emoji: "🏫",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  sjkoi: {
    emoji: "🚶‍♀️✈️🚝🚴🚘🚀🏊",
    fal: "suruko",
    falnen: "(sjiranai)",
    lyk: ["aja", "jalaka"],
  },
  skwalo: {
    emoji: "🦈",
    fal: "tingko",
    falnen: "(sjiranai)",
  },
  slucha: {
    emoji: "",
    fal: "suruko",
    falnen: "(sjiranai)",
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
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["luna"],
  },
  sore: {
    emoji: "",
    fal: "pashko",
    falnen: "pashko",
    lyk: ["hej"],
  },
  sot: {
    emoji: "🧁🍩🎂🍦🍯🍡🍭",
    fal: "lihko",
    falnen: "(sjiranai)",
  },
  spara: {
    emoji: "⬇️",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "sjkoi unna made",
  },
  spil: {
    emoji: "🎲🏏🎮👾🎳🎰🀄",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  spor: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    kundr: ["svar"],
  },
  sporko: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "spor kotoba",
    tatoeba: ["ka?", "naze?", "dare?", "doko?"],
  },
  stift: {
    emoji: "🖊️🖋️",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "tropos per kaku",
  },
  strela: {
    emoji: "←↖↓↔⇅",
    fal: "tingko",
    falnen: "strela",
  },
  stuur: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
  },
  sud: {
    emoji: "🧭⬇️",
    fal: "tingko",
    falnen: "strela",
  },
  sukha: {
    emoji: "👀🏹",
    fal: "suruko",
    falnen: "(sjiranai)",
  },
  suksu: {
    emoji: "🍂🍁🎃",
  },
  suru: {
    emoji: "",
  },
  suruko: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "kotoba per suru",
    tatoeba: ["rzinsai", "sjkoi", "nam", "nasi", "maha"],
  },
  surujna: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "suru yena",
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
    fal: "medko",
    falnen: "(sjiranai)",
    imi: "na afto tropos; mange MANGE",
  },
  talvi: {
    emoji: "❄️🏔️⛷️🧤",
  },
  tasti: {
    emoji: "🖱️👆",
  },
  tatoeba: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    lyk: ["imi"],
    tatoeba: ["tatoeba fu pershunn: 🧑🧓🫅👳🧑‍🦰", "tatoeba fu ringo: 🍎🍏"],
  },
  te: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    imi: "ka suru ting?",
    lyk: ["ri", "wa"],
    tatoeba: ["un nam ringo", "un te ringo ri nam"],
  },
  tel: {
    emoji: "",
    fal: "lihko",
    falnen: "(sjiranai)",
    imi: "al fu afto ting",
    kundr: ["hel"],
    tatoeba: ["🎂 hel torta. 🍰 tel torta."],
  },
  ter: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "ting k'joki baum vona na",
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
    emoji: "❄️🌹🌞🍂",
    fal: "tingko",
    falnen: "toshitel",
    imi: "~ tre mwuai",
  },
  tosui: {
    emoji: "",
  },
  tre: {
    emoji: "3️⃣",
    fal: "atai",
    falnen: "lasku",
  },
  treng: {
    emoji: "💀",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "mus, os du sjinu",
    lyk: ["mus"],
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
    kundr: ["sama", "lik"],
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
    kundr: ["klar"],
  },
  tuo: {
    emoji: "",
    lyk: ["afto", "asoko"],
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
    fal: "sporko",
    falnen: "(sjiranai)",
    imi: "ka suru?",
    tatoeba: [
      `A: uno huin?
B: huin maha huomi.`,
    ],
  },
  uso: {
    emoji: "❌",
    kundr: ["pravda"],
  },
  uten: {
    emoji: "",
  },
  utenvona: {
    emoji: "🪨🎸🚀",
    kundr: ["vona"],
    lyk: ["sjinu"],
  },
  uuk: {
    emoji: "",
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
    kundr: ["samui"],
  },
  varge: {
    emoji: "🎨❤️💚🟨🔷🟧🔴🟩",
  },
  vasu: {
    emoji: "🫥🧠",
    fal: "suruko",
    falnen: "(sjiranai)",
    imi: "shiru dan men nai shiru ima",
    kundr: ["hyske"],
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
  vint: {
    emoji: "💨💭☁️",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "jam vint cosce luft sjkoi",
    lyk: ["luft"],
  },
  vikoli: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "libre fu viossa na kompjusiru",
    tatoeba: ["https://vikoli.org"],
  },
  vil: {
    emoji: "",
  },
  vinjafraut: {
    emoji: "🍇",
    fal: "tingko",
    falnen: "fraut",
    kakutro: ["uva"],
  },
  viossa: {
    emoji: "",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "glossa fu vi",
    tatoeba: ["afto viossa!"],
  },
  vona: {
    emoji: "🌺🧒🦋",
    fal: "tingko",
    falnen: "vonating",
    kundr: ["sjinu", "utenvona"],
  },
  vrach: {
    emoji: "🧑‍⚕️👩‍⚕️👨‍⚕️",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "pashun ka ergo na bjurkiplas",
  },
  vulcanis: {
    emoji: "",
  },

  // #region W
  wa: {
    emoji: "",
    fal: "medko",
    falnen: "(sjiranai)",
    imi: "ka suru ting?",
    lyk: ["ri", "te"],
    tatoeba: ["huin ie blau", "huin wa blau ie"],
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
    emoji: "🧭⬅️",
    fal: "tingko",
    falnen: "strela",
  },

  // #region Z
  ze: {
    emoji: "🕰️",
    fal: "medko",
    falnen: "tyd",
    kundr: ["de"],
    tatoeba: ["un nam ze glug. eins, un glug. nis (ima), un nam."],
  },
  zedvera: {
    emoji: "🔗",
    fal: "tingko",
    falnen: "(sjiranai)",
    imi: "dvera ka du deki bruk per sjkoi na kompjusiru",
    tatoeba: ["https://vikoli.org/huomilehti"],
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
  "100": {
    emoji: "🤣😂😆",
    fal: "kokoroko",
    falnen: "(sjiranai)",
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
                .sort(sortWords),
              eins: false,
            },
          ] satisfies [string, WordData],
      ) || []),
    ])
    .sort(sortPairs),
)
