export type Content =
  | string // shorthand for taught words
  | [taught: string, exposed: string]

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
  "-a -ara -dai -deki -djin -ki -yena un -tsa afefraut afto ahavia aifroidis ain airis aistia akk akote al ananas anglosssa anta apar apu aschor asoko atai atechi au auau auauau auki auto azyci aja bagge baksu bamba banan baum berk bestfraut bite bjelu bjurki bjurkiplas blau bli bli- blin bluma bom bonaplas bra braa breska bruk brun bruur boozy catie cer cerfraut cine circas ciro cocro cola corva cosce crenos crusca cuaiz cunin curo da daag dan danke dare darem daremdjin davai de deer deki den discord doichlant dok doko dronet du dua dus dur dvera dzikjaan ecso efd efles ein eksi ende enterrena ergo espanossa faac fami farge farza fi film flacha fraas frasto fraut froreenj fshto fu fuga fugel fugelfraut fun funn gaia gammel gavat gaia gelt glau glossa glug go godja gomen gris grun gvir h haaste hadji han hana hant hanu hapigo har hara hanj her hej hel helenakaku heljo henci hiven hjacu hjerne hor https huin huome huomilehti hur huskie hir hyske ie ima imang imi inje ipkiere ipni iptre isi iske ivel jaa jainos jalaka jam jamete joki joku ka kaku kara karroqhn kase katai katana kawaji kiere kini kirain kirkas kjannos kjomi klar kntre kolarum kompju korva kot kotnen kotoba ktoeba kuchi kun kundr kury kyajdz kytsi kzin lacsaq lacte lapsi lasku leezy lehti lemo lera lestevikti li liber libre lik ljeta luft luna luvan likke made mago maha mama mange maredur marojzschine matetundjin me mellan men midore milenjal milyon minairis mipi mirai mis mit mjes mono mora mucc mulbaksy mulkaban murasace mwuai na naht nai naisjiru nam namae namting nana nasi naze neo ni nia niden nihunfraut nil nilting niog njudur njyi noito nord non njui ogoi ohare oishi ojogidzin onna opeta os ost ovashi owari oy paara pan papa paperi pas pashun per persefraut phestako phrayt piel piman pinue pinuno pisma pitkataj pitsa plas po- pojk portocale godja posaidis praapa pranvera prapataj pravda protofugel punkt ranjako ri rin ringo rinj riso rjoho rnai roza ru rum ryodjin rzinjsai saada sakana sakawi sama samui sawi scecso sceer schiknu sdanie se sevas shiro shirytro shker sho sidt sikno silba simpel sini siru siruting sisco sjacy sjiny sjirudan skoi skhola skwalo slucha sol solh sore sot spara spil spilsto spor sporko stift stolspil strela stuur sud sukha suksu suru suruko syryjna tajkadzin tak talvi tatuiba te tel ter terbi timba ting torta tosjitel tosui tre treng trict tropos tsatain tsigau tsisai tsui tualet tuhat tulla tun tuo tutr tuyn tyd uarue ue ufne un uno upasnen uscoe uso uten utenvona uuk uva valtsa vapa vasu vauva velt vera vet vi viha vikoli vil vinaphrayt vona vratsch vulcanis wa waryj we west ze- zedvera zehant zeme zespil zeus jetta"

export interface Word {
  readonly word: string
  readonly taughtIn: readonly number[]
  readonly referencedIn: readonly number[]
}

export interface MutableWord {
  word: string
  taughtIn: number[]
  referencedIn: number[]
}

export function makeWordList(): ReadonlyMap<string, Word> {
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

  for (const word of others.split(" ")) {
    if (!map.has(word)) {
      map.set(word, {
        referencedIn: [],
        taughtIn: [],
        word,
      })
    }
  }

  return map
}
