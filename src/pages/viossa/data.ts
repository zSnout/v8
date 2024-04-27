export type Content =
  | string // shorthand for taught words
  | [taught: string, exposed: string]

export type WordType =
  | "tingko"
  | "suruko"
  | "lihko"
  | "pashko"
  | "medko"
  | "troposko"
  | "sporko"
  | "kotobanen"
  | "namae"

export interface WordData {
  readonly emoji?: (string & {}) | "" | undefined
  readonly fal?: WordType | undefined
  readonly falnen?: "varge" | "fami" | "fraut" | "ovashi" | undefined
  readonly imi?: string | undefined
  readonly lyk?: readonly string[] | undefined
  readonly kundr?: readonly string[] | undefined
  readonly riso?: string | undefined
  readonly tatoeba?: readonly string[] | undefined
}

export const slides: Record<number, Content> = {
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
    "os tsisai sama au auauau ie",
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
  46: ["vona sjinu uten", "kundr mit"],
  47: "strela nord west ost sud oba ljeva larava hina unna migi fura",
  48: ["klar tun", "kundr"],
  49: ["mietta k'", "pashun huin portocale ie al"],
  50: [
    "li sit iske",
    "au du nai glug iske sjinu vil lera viossa da hanu angl-",
  ],
  51: ["jam gaia sot magasin", "pashun na ringo nai banan nil ting mange"],
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
}

const others =
  "-a -ara -dai -djin -ki -yena -s un -tsa afefraut afto ahavia aifroidis ain airis aistia akk akote al ananas anta apar apu aschor asoko atai atechi au auauau auki auto azyci aja bagge baksu bamba banan baum berk bestfraut bite bjelu bjurki bjurkiplas blau bli bli- blin bluma bonaplas bra breska bruk brun bruur boozy catie cer cerfraut cine circas ciro cocro cola corva cosce crenos crusca cunin curo da daag dan danke dare darem daremdjin davai deer deki den discord doich- dok doko dronet du dua dush dur dvera dzikjaan ecso efles ein eksi ende enterrena ergo fami farge farza fi film flacha fraut froreenj fshto fu fuga fugel fugelfraut funn gaia gammel gavat gaia gelt glau glossa glug go godja gomen gris grun gvir haaste hadji hana hant hanu hapigo har hanj her hej hel helenakaku heljo henci hiven hjerne hor huin huomilehti hur hir hyske ie ima imang imi inje ipkiere ipni iptre isi iske ivel jaa jainos jalaka jam jamete joki joku ka kaku kara karroqhn kase katai katana kawaji kiere kini kirain kjannos kjomi klar kntre kolarum kompju corva kot kotnen kotoba kuchi kun kundr kury kyajdz kzin lacsaq lacte lapsi lasku lezi lehti lemo lera li libre lik ljeta luft luna luvan made mago maha mama mange maredur marojzschine matetundjin me mellan men midore milenjal milyon minairis mipi mirai mis mit mjes mono mora mucc mulbaksu mulkaban murasace mwuai na naht nai nam namting nana nasi naze neo ni nia niden nihunfraut nil nilting niog njudur noito nord non njui ogoi ohare ojogidzin onna opeta os ost ovashi owari oy paara pan papa paperi pashun per persefraut festako piel piman pinue pinuno pisma pitsa plas po- pojk portocale godja posaidis praapa pranvera prapataj pravda protofugel punkt ranjako ri ringo rinj riso rjoho roza ru rum ryodjin sakana sama samui sawi scecso sceer sdanie se shiro shirutro sho sidt sjikno silba simpel sini siru sisco skhola skwalo slucha sol sore sot spara spil spor sporko stift strela stuur sud sukha suksu suru suruko syryjna tajkadjin tak talvi tatuiba te tel ter terbi timba ting torta toshitel tosui tre treng trict tropos tsatain tsigau tsisai tsui tualet tuhat tulla tun tuo tutr tyd ufne un uno upasnen uso uten utenvona uuk uva valtsa vapa vasu vauva velt vera vet vi viha vikoli vil vinaphrayt vona vratsch vulcanis wa we west ze- zedvera zehant zeme zespil zeus jetta"

export interface Word extends WordData {
  readonly kotoba: string
  readonly opetaNa: readonly number[]
  readonly hanuNa: readonly number[]
}

export interface MutableWord {
  kotoba: string
  opetaNa: number[]
  hanuNa: number[]
}

export function makeWordList(): ReadonlyMap<string, Word> {
  const map = new Map<string, MutableWord>()

  for (const [index, slide] of Object.entries(slides)) {
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

  for (const word of others.split(" ")) {
    if (!map.has(word)) {
      map.set(word, {
        hanuNa: [],
        opetaNa: [],
        kotoba: word,
      })
    }
  }

  for (const [key, value] of Object.entries(data)) {
    let mapval = map.get(key)

    if (!mapval) {
      mapval = { hanuNa: [], opetaNa: [], kotoba: key }
      map.set(key, mapval)
    }

    Object.assign(mapval, value)
  }

  return new Map(
    Array.from(map).sort(([a], [b]) => {
      const ax = a.startsWith("-") ? 0 : a.endsWith("-") ? 1 : 2
      const bx = b.startsWith("-") ? 0 : b.endsWith("-") ? 1 : 2

      if (ax - bx != 0) {
        return ax - bx
      }

      return a > b ? 1 : -1
    }),
  )
}

export const data: Record<string, WordData> = {
  // #region ranjako
  "angl-": {
    emoji: "🇬🇧🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  },
  "bli-": {
    emoji: "",
  },
  "doich-": {
    emoji: "🇩🇪",
  },
  "espanj-": {
    emoji: "🇪🇸",
  },
  "ip-": {
    emoji: "",
  },
  "kn-": {
    emoji: "",
  },
  "nihon-": {
    emoji: "🇯🇵",
  },
  "po-": {
    emoji: "🏁",
  },
  "ze-": {
    emoji: "⚡",
  },

  // #region festako
  "-a": {
    emoji: "",
  },
  "-ara": {
    emoji: "",
  },
  "-dai": {
    emoji: "",
  },
  "-djin": {
    emoji: "🧑🧓🧒",
  },
  "-ki": {
    emoji: "",
  },
  "-ossa": {
    emoji: "",
  },
  "-s": {
    emoji: "",
  },
  "-tsa": {
    emoji: "",
  },
  "-yena": {
    emoji: "",
  },

  // #region A
  afefraut: {
    emoji: "🥝",
  },
  afto: {
    emoji: "",
  },
  ahavia: {
    emoji: "🫐",
  },
  aifroidis: {
    emoji: "",
  },
  ain: {
    emoji: "1️⃣",
  },
  airis: {
    emoji: "",
  },
  aistia: {
    emoji: "",
  },
  aja: {
    emoji: "",
  },
  akk: {
    emoji: "",
  },
  akote: {
    emoji: "",
  },
  al: {
    emoji: "",
  },
  ananas: {
    emoji: "🍍",
  },
  anta: {
    emoji: "🫴",
  },
  apar: {
    emoji: "",
  },
  apu: {
    emoji: "",
  },
  aschor: {
    emoji: "🤑🏦💸",
  },
  asoko: {
    emoji: "",
  },
  atai: {
    emoji: "",
  },
  atechi: {
    emoji: "🦎",
  },
  au: {
    emoji: "➕",
  },
  auauau: {
    emoji: "➕...",
  },
  auki: {
    emoji: "",
  },
  auto: {
    emoji: "🚗🚓🚘🚖",
  },
  awen: {
    emoji: "",
  },
  azyci: {
    emoji: "🫘",
  },

  // #region B
  bagge: {
    emoji: "🐛🐜🐝🪲",
  },
  baksu: {
    emoji: "📦🎁🗳️🥡",
  },
  bamba: {
    emoji: "💣",
  },
  banan: {
    emoji: "🍌",
  },
  baum: {
    emoji: "🌴🌳🌲🎄",
  },
  benj: {
    emoji: "",
  },
  berk: {
    emoji: "🗻⛰️🏔️",
  },
  bestfraut: {
    emoji: "🍉🍈",
  },
  bite: {
    emoji: "🥺🙏",
  },
  bjelu: {
    emoji: "🔔🛎️",
  },
  bjurki: {
    emoji: "🤮🤒🤧🤢",
  },
  bjurkiplas: {
    emoji: "🏥",
  },
  blau: {
    emoji: "💙🔵🟦🔷",
  },
  bli: {
    emoji: "",
  },
  blin: {
    emoji: "",
  },
  bluma: {
    emoji: "🪷🌷🌺💐🌻🪻🌸🌹",
  },
  bonaplas: {
    emoji: "",
  },
  boozy: {
    emoji: "😡😠",
  },
  bra: {
    emoji: "👍",
  },
  breska: {
    emoji: "🐢",
  },
  bruk: {
    emoji: "",
  },
  brun: {
    emoji: "🤎🟤🟫",
  },
  bruur: {
    emoji: "",
  },

  // #region C
  cafe: {
    emoji: "☕🤎🟤🟫",
  },
  catie: {
    emoji: "",
  },
  cer: {
    emoji: "🫀",
  },
  cerfraut: {
    emoji: "🍓",
  },
  cine: {
    emoji: "",
  },
  circas: {
    emoji: "💡🔦🔆🏮",
  },
  ciro: {
    emoji: "💛🟡🟨",
  },
  cocro: {
    emoji: "",
  },
  cola: {
    emoji: "😴💤🛌",
  },
  corva: {
    emoji: "👂",
  },
  cosce: {
    emoji: "",
  },
  crenos: {
    emoji: "",
  },
  crusca: {
    emoji: "🍐",
  },
  cunin: {
    emoji: "",
  },
  curo: {
    emoji: "⚫🖤⬛",
  },

  // #region D
  da: {
    emoji: "",
  },
  daag: {
    emoji: "",
  },
  dan: {
    emoji: "⬅️🕰️",
  },
  danke: {
    emoji: "🙏😁",
  },
  dare: {
    emoji: "",
  },
  darem: {
    emoji: "",
  },
  daremdjin: {
    emoji: "👮👮‍♂️👮‍♀️",
  },
  davai: {
    emoji: "🥳🎉🎊",
  },
  deer: {
    emoji: "",
  },
  deki: {
    emoji: "",
  },
  den: {
    emoji: "🔟",
  },
  discord: {
    emoji: "",
  },
  dok: {
    emoji: "",
  },
  doko: {
    emoji: "",
  },
  dronet: {
    emoji: "👸",
  },
  du: {
    emoji: "🫵",
  },
  dua: {
    emoji: "😍🥰🫶",
  },
  dur: {
    emoji: "",
  },
  dush: {
    emoji: "🛀🚿",
  },
  dvera: {
    emoji: "🚪",
  },
  dzikjaan: {
    emoji: "",
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
  },
  funn: {
    emoji: "",
  },
  fura: {
    emoji: "",
  },

  // #region G
  gaia: {
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
  glossa: {
    emoji: "",
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
    emoji: "",
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
  lapsi: {
    emoji: "",
  },
  larava: {
    emoji: "⬅️",
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
  minairis: {
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
  papa: {
    emoji: "",
  },
  paperi: {
    emoji: "📰📃📄📝",
  },
  pashun: {
    emoji: "👶🧒👧👦🧑👩👨🧑‍🦱",
  },
  per: {
    emoji: "",
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
  ranjako: {
    emoji: "",
  },
  raz: {
    emoji: "",
  },
  ri: {
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
  vinaphrayt: {
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
  },

  // #region 100
  100: {
    emoji: "🤣😂😆",
  },
}
