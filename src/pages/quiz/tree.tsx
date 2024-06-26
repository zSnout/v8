import { Tree, type TreeOf } from "@/components/tree"
import type { JSX } from "solid-js"
import { DirectTreeCard, Generator, Leaf, PartialCard } from "./shared"

// prettier-ignore
type BaseKanaNames =
  | "a" | "i" | "u" | "e" | "o" | "ka" | "ki" | "ku" | "ke" | "ko" | "sa"
  | "shi" | "su" | "se" | "so" | "ta" | "chi" | "tsu" | "te" | "to" | "na"
  | "ni" | "nu" | "ne" | "no" | "ha" | "hi" | "fu" | "he" | "ho" | "ma" | "mi"
  | "mu" | "me" | "mo" | "ya" | "yu" | "yo" | "ra" | "ri" | "ru" | "re" | "ro"
  | "wa" | "wo" | "n"

type WiWeKanaNames = "wi" | "we"

// prettier-ignore
type DakutenKanaNames =
  | "ga" | "gi" | "gu" | "ge" | "go" | "za" | "ji" | "zu" | "ze" | "zo" | "da"
  | "ji2" | "zu2" | "de" | "do" | "ba" | "bi" | "bu" | "be" | "bo" | "pa" | "pi"
  | "pu" | "pe" | "po"

type LittleKanaNames = "xya" | "xyu" | "xyo"

function kanaList(
  type: "Hiragana" | "Katakana",
  kana: { [romaji: string]: string },
): RawTree {
  return Object.fromEntries(
    Object.entries(kana).map(([romaji, kana]) => [
      romaji,
      new DirectTreeCard(
        romaji,
        romaji,
        (
          <>
            <span class="font-sans">{kana}</span>
            <span class="font-serif">{kana}</span>
            <span class="font-mono">{kana}</span>
          </>
        ),
        ["Japanese", type],
        1 / 30,
      ),
    ]),
  )
}

function kanaTree(
  type: "Hiragana" | "Katakana",
  base: Record<BaseKanaNames, string>,
  wiwe: Record<WiWeKanaNames, string>,
  dakuten: Record<DakutenKanaNames, string>,
  little: Record<LittleKanaNames, string>,
): RawTree {
  const { xya, xyo, xyu } = little
  const { ki, shi, chi, ni, hi, mi, ri } = base
  const { gi, ji, bi, pi } = dakuten
  return {
    Basic: kanaList(type, { ...base, ...wiwe }),
    Dakuten: kanaList(type, dakuten),
    Combination: kanaList(type, {
      kya: ki + xya,
      kyu: ki + xyu,
      kyo: ki + xyo,
      gya: gi + xya,
      gyu: gi + xyu,
      gyo: gi + xyo,
      sha: shi + xya,
      shu: shi + xyu,
      sho: shi + xyo,
      ja: ji + xya,
      ju: ji + xyu,
      jo: ji + xyo,
      cha: chi + xya,
      chu: chi + xyu,
      cho: chi + xyo,
      nya: ni + xya,
      nyu: ni + xyu,
      nyo: ni + xyo,
      hya: hi + xya,
      hyu: hi + xyu,
      hyo: hi + xyo,
      bya: bi + xya,
      byu: bi + xyu,
      byo: bi + xyo,
      pya: pi + xya,
      pyu: pi + xyu,
      pyo: pi + xyo,
      mya: mi + xya,
      myu: mi + xyu,
      myo: mi + xyo,
      rya: ri + xya,
      ryu: ri + xyu,
      ryo: ri + xyo,
    }),
  }
}

function kanaRead(
  kana: { [romaji: string]: string } & ({ ン: string } | { ん: string }),
): Node {
  const nn = "ん" in kana ? "ん" : "ン"
  const { ん, ン, ...rest } = kana

  function count(n: number): Node {
    return new Generator((id = "") => {
      if (!id) {
        for (let i = 0; i < n; i++) {
          id += random(Object.keys(rest))
          if (
            !(id.endsWith("ん") || id.endsWith("ン")) &&
            Math.random() < 0.25
          ) {
            i++
            if (i < n) {
              id += nn
            }
          }
        }
      }

      return new PartialCard(
        id,
        id,
        (id.match(/.[ゃゅょャュョ]?/g) || []).map((c) => kana[c]).join(""),
        ["Japanese", "Kana"],
        id,
      )
    }, 10)
  }

  return {
    "Random Character": count(1),
    "2 Characters": count(2),
    "3 Characters": count(3),
    "5 Characters": count(5),
    "8 Characters": count(8),
    "12 Characters": count(12),
  }
}

function each<T>(
  names: T[],
  card: (value: T) => Node,
  ...name: T extends string
    ? [name?: (x: T) => PropertyKey]
    : [name: (x: T) => PropertyKey]
): RawTree {
  const n = name[0] || String
  return Object.fromEntries(names.map((x) => [n(x), card(x)]))
}

const ssWords: [string, string][] = [
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_a.jpg", "a"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_akesi.jpg",
    "akesi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ala.jpg",
    "ala",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_alasa.jpg",
    "alasa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ale.jpg",
    "ale",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_anpa.jpg",
    "anpa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ante.jpg",
    "ante",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_anu.jpg",
    "anu",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_awen.jpg",
    "awen",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_e.jpg", "e"],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_en.jpg", "en"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_epiku.jpg",
    "epiku",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_esun.jpg",
    "esun",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ijo.jpg",
    "ijo",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ike.jpg",
    "ike",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ilo.jpg",
    "ilo",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_insa.jpg",
    "insa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_jaki.jpg",
    "jaki",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_jan.jpg",
    "jan",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_jasima.jpg",
    "jasima",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_jelo.jpg",
    "jelo",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_jo.jpg", "jo"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kala.jpg",
    "kala",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kalama.jpg",
    "kalama",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kama.jpg",
    "kama",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kasi.jpg",
    "kasi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ken.jpg",
    "ken",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kepeken.jpg",
    "kepeken",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kijetesantakalu.jpg",
    "kijetesantakalu",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kili.jpg",
    "kili",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kin.jpg",
    "kin",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kipisi.jpg",
    "kipisi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kiwen.jpg",
    "kiwen",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ko.jpg", "ko"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kokosila.jpg",
    "kokosila",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kon.jpg",
    "kon",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kule.jpg",
    "kule",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kulupu.jpg",
    "kulupu",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_kute.jpg",
    "kute",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_la.jpg", "la"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lanpan.jpg",
    "lanpan",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lape.jpg",
    "lape",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_laso.jpg",
    "laso",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lawa.jpg",
    "lawa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_leko.jpg",
    "leko",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_len.jpg",
    "len",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lete.jpg",
    "lete",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_li.jpg", "li"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lili.jpg",
    "lili",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_linja.jpg",
    "linja",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lipu.jpg",
    "lipu",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_loje.jpg",
    "loje",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lon.jpg",
    "lon",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_luka.jpg",
    "luka",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lukin.jpg",
    "lukin",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_lupa.jpg",
    "lupa",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ma.jpg", "ma"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_mama.jpg",
    "mama",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_mama_old.jpg",
    "mama (old)",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_mani.jpg",
    "mani",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_meli.jpg",
    "meli",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_meso.jpg",
    "meso",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_mi.jpg", "mi"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_mije.jpg",
    "mije",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_misekeke.jpg",
    "misikeke",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_moku.jpg",
    "moku",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_moli.jpg",
    "moli",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_monsi.jpg",
    "monsi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_monsuta.jpg",
    "monsuta",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_mu.jpg", "mu"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_mun.jpg",
    "mun",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_musi.jpg",
    "musi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_mute.jpg",
    "mute",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_n.jpg", "n"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_namako.jpg",
    "namako",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_nanpa.jpg",
    "nanpa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_nasa.jpg",
    "nasa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_nasin.jpg",
    "nasin",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_nena.jpg",
    "nena",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ni.jpg", "ni"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_nimi.jpg",
    "nimi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_noka.jpg",
    "noka",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_o.jpg", "o"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_oko.jpg",
    "oko",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_olin.jpg",
    "olin",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_ona.jpg",
    "ona",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_open.jpg",
    "open",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pakala.jpg",
    "pakala",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pali.jpg",
    "pali",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_palisa.jpg",
    "palisa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pan.jpg",
    "pan",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pana.jpg",
    "pana",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pi.jpg", "pi"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pilin.jpg",
    "pilin",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pimeja.jpg",
    "pimeja",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pini.jpg",
    "pini",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pipi.jpg",
    "pipi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_poka.jpg",
    "poka",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_poki.jpg",
    "poki",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_pona.jpg",
    "pona",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sama.jpg",
    "sama",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_seli.jpg",
    "seli",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_selo.jpg",
    "selo",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_seme.jpg",
    "seme",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sewi.jpg",
    "sewi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sijelo.jpg",
    "sijelo",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sike.jpg",
    "sike",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sin.jpg",
    "sin",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sina.jpg",
    "sina",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sinpin.jpg",
    "sinpin",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sitelen.jpg",
    "sitelen",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_soko.jpg",
    "soko",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_sona.jpg",
    "sona",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_soweli.jpg",
    "soweli",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_suli.jpg",
    "suli",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_suno.jpg",
    "suno",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_supa.jpg",
    "supa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_suwi.jpg",
    "suwi",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_tan.jpg",
    "tan",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_taso.jpg",
    "taso",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_tawa.jpg",
    "tawa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_telo.jpg",
    "telo",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_tenpo.jpg",
    "tenpo",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_toki.jpg",
    "toki",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_tomo.jpg",
    "tomo",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_tonsi.jpg",
    "tonsi",
  ],
  ["https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_tu.jpg", "tu"],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_unpa.jpg",
    "unpa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_uta.jpg",
    "uta",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_utala.jpg",
    "utala",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_walo.jpg",
    "walo",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_wan.jpg",
    "wan",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_waso.jpg",
    "waso",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_wawa.jpg",
    "wawa",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_weka.jpg",
    "weka",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nimi_wile.jpg",
    "wile",
  ],
]

const ssPunctuation: [string, string][] = [
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nmpi_period.jpg",
    "[.]",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nmpi_comma.jpg",
    "[,]",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nmpi_exclamation.jpg",
    "[!]",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nmpi_question.jpg",
    "[?]",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nmpi_colon.jpg",
    "[:]",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nmpi_cartouche.jpg",
    "[cartouche]",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/nimi/t47_nmpi_capsule.jpg",
    "[capsule]",
  ],
]

const ssLetters: [string, string][] = [
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xx.jpg",
    "--",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xj.jpg",
    "j-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xk.jpg",
    "k-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xl.jpg",
    "l-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xm.jpg",
    "m-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xn.jpg",
    "n-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xp.jpg",
    "p-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xs.jpg",
    "s-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xt.jpg",
    "t-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xw.jpg",
    "w-",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xa.jpg",
    "-a",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xe.jpg",
    "-e",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xi.jpg",
    "-i",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xo.jpg",
    "-o",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xu.jpg",
    "-u",
  ],
  [
    "https://jonathangabel.com/images/t47_tokipona/kalalili/t47_kalalili_xxn.jpg",
    "-n",
  ],
]

type RawTree = TreeOf<Leaf>

// TODO: improve node finding algorithm

type Node = RawTree | Leaf

function random<T>(x: readonly T[]): T {
  if (x.length == 0) {
    throw new RangeError("Array must not be empty.")
  }

  return x[Math.floor(x.length * Math.random())]!
}

function ss(ss: [string, string][]): Node {
  return each(
    ss,
    ([src, label]) =>
      new DirectTreeCard(
        label,
        label,
        <img class="mx-auto w-24 max-w-full" src={src} />,
        ["toki pona", "sitelen sitelen"],
        1 / 50,
      ),
    (x) => x[1],
  )
}

const nums = [
  { n: 0, jp: "TODO", time: "TODO" },
  { n: 1, jp: "いち", time: "いち" },
  { n: 2, jp: "に", time: "に" },
  { n: 3, jp: "さん", time: "さん" },
  { n: 4, jp: "し、よん", time: "し" },
  { n: 5, jp: "ご", time: "ご" },
  { n: 6, jp: "ろく", time: "ろく" },
  { n: 7, jp: "しち、なな", time: "しち" },
  { n: 8, jp: "はち", time: "はち" },
  { n: 9, jp: "く、きゅう", time: "く" },
  { n: 10, jp: "じゅう", time: "じゅう" },
  { n: 11, jp: "じゅういち", time: "じゅういち" },
  { n: 12, jp: "じゅうに", time: "じゅうに" },
]

function randint(includedMin: number, excludedMax: number): number {
  return Math.floor(Math.random() * (excludedMax - includedMin)) + includedMin
}

function color(
  source: readonly string[],
  makeId: () => string,
  idToColor = (x: string) => x,
  idToAnswer: (x: string) => JSX.Element = (x: string) => x,
) {
  return new Generator((id = makeId()) => {
    return new PartialCard(
      "<color>",
      (
        <div
          class="h-96 w-full rounded"
          style={{ "background-color": idToColor(id) }}
        />
      ),
      idToAnswer(id),
      ["Color", ...source],
      id,
    )
  }, 20)
}

export const tree = new Tree<Leaf>(
  {
    Color: {
      "RGB Hex Code": color(
        ["RGB", "Hex Code"],
        () =>
          "#" +
          randint(0, 16 ** 6)
            .toString(16)
            .padStart(6, "0"),
      ),
      "RGB Decimal Values": color(
        ["RGB", "Decimal Value"],
        () => `rgb(${randint(0, 256)} ${randint(0, 256)} ${randint(0, 256)})`,
      ),
      HSL: color(
        ["HSL"],
        () =>
          `hsl(${randint(0, 360)}deg ${randint(0, 101)}% ${randint(0, 101)}%)`,
      ),
      HWB: color(
        ["HWB"],
        () =>
          `hwb(${randint(0, 360)}deg ${randint(0, 101)}% ${randint(0, 101)}%)`,
      ),
    },
    Japanese: {
      Hiragana: {
        ...kanaTree(
          "Hiragana",
          {
            a: "あ",
            i: "い",
            u: "う",
            e: "え",
            o: "お",
            ka: "か",
            ki: "き",
            ku: "く",
            ke: "け",
            ko: "こ",
            sa: "さ",
            shi: "し",
            su: "す",
            se: "せ",
            so: "そ",
            ta: "た",
            chi: "ち",
            tsu: "つ",
            te: "て",
            to: "と",
            na: "な",
            ni: "に",
            nu: "ぬ",
            ne: "ね",
            no: "の",
            ha: "は",
            hi: "ひ",
            fu: "ふ",
            he: "へ",
            ho: "ほ",
            ma: "ま",
            mi: "み",
            mu: "む",
            me: "め",
            mo: "も",
            ya: "や",
            yu: "ゆ",
            yo: "よ",
            ra: "ら",
            ri: "り",
            ru: "る",
            re: "れ",
            ro: "ろ",
            wa: "わ",
            wo: "を",
            n: "ん",
          },
          {
            wi: "ゐ",
            we: "ゑ",
          },
          {
            ga: "が",
            gi: "ぎ",
            gu: "ぐ",
            ge: "げ",
            go: "ご",
            za: "ざ",
            ji: "じ",
            zu: "ず",
            ze: "ぜ",
            zo: "ぞ",
            da: "だ",
            ji2: "ぢ",
            zu2: "づ",
            de: "で",
            do: "ど",
            ba: "ば",
            bi: "び",
            bu: "ぶ",
            be: "べ",
            bo: "ぼ",
            pa: "ぱ",
            pi: "ぴ",
            pu: "ぷ",
            pe: "ぺ",
            po: "ぽ",
          },
          {
            xya: "ゃ",
            xyu: "ゅ",
            xyo: "ょ",
          },
        ),
        Reading: kanaRead({
          あ: "a",
          い: "i",
          う: "u",
          え: "e",
          お: "o",
          か: "ka",
          き: "ki",
          く: "ku",
          け: "ke",
          こ: "ko",
          さ: "sa",
          し: "shi",
          す: "su",
          せ: "se",
          そ: "so",
          た: "ta",
          ち: "chi",
          つ: "tsu",
          て: "te",
          と: "to",
          な: "na",
          に: "ni",
          ぬ: "nu",
          ね: "ne",
          の: "no",
          は: "ha",
          ひ: "hi",
          ふ: "fu",
          へ: "he",
          ほ: "ho",
          ま: "ma",
          み: "mi",
          む: "mu",
          め: "me",
          も: "mo",
          や: "ya",
          ゆ: "yu",
          よ: "yo",
          ら: "ra",
          り: "ri",
          る: "ru",
          れ: "re",
          ろ: "ro",
          わ: "wa",
          を: "wo",
          ん: "n",
          ゐ: "wi",
          ゑ: "we",
          が: "ga",
          ぎ: "gi",
          ぐ: "gu",
          げ: "ge",
          ご: "go",
          ざ: "za",
          じ: "ji",
          ず: "zu",
          ぜ: "ze",
          ぞ: "zo",
          だ: "da",
          ぢ: "ji",
          づ: "zu",
          で: "de",
          ど: "do",
          ば: "ba",
          び: "bi",
          ぶ: "bu",
          べ: "be",
          ぼ: "bo",
          ぱ: "pa",
          ぴ: "pi",
          ぷ: "pu",
          ぺ: "pe",
          ぽ: "po",
          きゃ: "kya",
          きゅ: "kyu",
          きょ: "kyo",
          ぎゃ: "gya",
          ぎゅ: "gyu",
          ぎょ: "gyo",
          しゃ: "sha",
          しゅ: "shu",
          しょ: "sho",
          じゃ: "ja",
          じゅ: "ju",
          じょ: "jo",
          ちゃ: "cha",
          ちゅ: "chu",
          ちょ: "cho",
          にゃ: "nya",
          にゅ: "nyu",
          にょ: "nyo",
          ひゃ: "hya",
          ひゅ: "hyu",
          ひょ: "hyo",
          びゃ: "bya",
          びゅ: "byu",
          びょ: "byo",
          ぴゃ: "pya",
          ぴゅ: "pyu",
          ぴょ: "pyo",
          みゃ: "mya",
          みゅ: "myu",
          みょ: "myo",
          りゃ: "rya",
          りゅ: "ryu",
          りょ: "ryo",
        }),
      },
      Katakana: {
        ...kanaTree(
          "Katakana",
          {
            a: "ア",
            i: "イ",
            u: "ウ",
            e: "エ",
            o: "オ",
            ka: "カ",
            ki: "キ",
            ku: "ク",
            ke: "ケ",
            ko: "コ",
            sa: "サ",
            shi: "シ",
            su: "ス",
            se: "セ",
            so: "ソ",
            ta: "タ",
            chi: "チ",
            tsu: "ツ",
            te: "テ",
            to: "ト",
            na: "ナ",
            ni: "ニ",
            nu: "ヌ",
            ne: "ネ",
            no: "ノ",
            ha: "ハ",
            hi: "ヒ",
            fu: "フ",
            he: "ヘ",
            ho: "ホ",
            ma: "マ",
            mi: "ミ",
            mu: "ム",
            me: "メ",
            mo: "モ",
            ya: "ヤ",
            yu: "ユ",
            yo: "ヨ",
            ra: "ラ",
            ri: "リ",
            ru: "ル",
            re: "レ",
            ro: "ロ",
            wa: "ワ",
            wo: "ヲ",
            n: "ン",
          },
          {
            wi: "ヰ",
            we: "ヱ",
          },
          {
            ga: "ガ",
            gi: "ギ",
            gu: "グ",
            ge: "げ",
            go: "ゴ",
            za: "ザ",
            ji: "ジ",
            zu: "ズ",
            ze: "ゼ",
            zo: "ゾ",
            da: "ダ",
            ji2: "ヂ",
            zu2: "ヅ",
            de: "デ",
            do: "ド",
            ba: "バ",
            bi: "ビ",
            bu: "ブ",
            be: "ベ",
            bo: "ボ",
            pa: "パ",
            pi: "ピ",
            pu: "プ",
            pe: "ペ",
            po: "ポ",
          },
          {
            xya: "ャ",
            xyu: "ュ",
            xyo: "ョ",
          },
        ),
        "More Combos": kanaList("Katakana", {
          va: "ヴァ",
          vi: "ヴィ",
          vu: "ヴ",
          ve: "ヴェ",
          vo: "ヴォ",
          fa: "ファ",
          fi: "フィ",
          fe: "フェ",
          fo: "フォ",
          wi: "ウィ",
          we: "ウェ",
          wo: "ウォ",
          tsa: "ツァ",
          tsi: "ツィ",
          tse: "ツェ",
          tso: "ツォ",
          twu: "トゥ",
          dwu: "ドゥ",
          thi: "ティ",
          dhi: "ディ",
        }),
        Reading: kanaRead({
          ア: "a",
          イ: "i",
          ウ: "u",
          エ: "e",
          オ: "o",
          カ: "ka",
          キ: "ki",
          ク: "ku",
          ケ: "ke",
          コ: "ko",
          サ: "sa",
          シ: "shi",
          ス: "su",
          セ: "se",
          ソ: "so",
          タ: "ta",
          チ: "chi",
          ツ: "tsu",
          テ: "te",
          ト: "to",
          ナ: "na",
          ニ: "ni",
          ヌ: "nu",
          ネ: "ne",
          ノ: "no",
          ハ: "ha",
          ヒ: "hi",
          フ: "fu",
          ヘ: "he",
          ホ: "ho",
          マ: "ma",
          ミ: "mi",
          ム: "mu",
          メ: "me",
          モ: "mo",
          ヤ: "ya",
          ユ: "yu",
          ヨ: "yo",
          ラ: "ra",
          リ: "ri",
          ル: "ru",
          レ: "re",
          ロ: "ro",
          ワ: "wa",
          ウォ: "wo",
          ン: "n",
          ウィ: "wi",
          ウェ: "we",
          ガ: "ga",
          ギ: "gi",
          グ: "gu",
          げ: "ge",
          ゴ: "go",
          ザ: "za",
          ジ: "ji",
          ズ: "zu",
          ゼ: "ze",
          ゾ: "zo",
          ダ: "da",
          ヂ: "ji",
          ヅ: "zu",
          デ: "de",
          ド: "do",
          バ: "ba",
          ビ: "bi",
          ブ: "bu",
          ベ: "be",
          ボ: "bo",
          パ: "pa",
          ピ: "pi",
          プ: "pu",
          ペ: "pe",
          ポ: "po",
          キャ: "kya",
          キュ: "kyu",
          キョ: "kyo",
          ギャ: "gya",
          ギュ: "gyu",
          ギョ: "gyo",
          シャ: "sha",
          シュ: "shu",
          ショ: "sho",
          ジャ: "ja",
          ジュ: "ju",
          ジョ: "jo",
          チャ: "cha",
          チュ: "chu",
          チョ: "cho",
          ニャ: "nya",
          ニュ: "nyu",
          ニョ: "nyo",
          ヒャ: "hya",
          ヒュ: "hyu",
          ヒョ: "hyo",
          ビャ: "bya",
          ビュ: "byu",
          ビョ: "byo",
          ピャ: "pya",
          ピュ: "pyu",
          ピョ: "pyo",
          ミャ: "mya",
          ミュ: "myu",
          ミョ: "myo",
          リャ: "rya",
          リュ: "ryu",
          リョ: "ryo",
          ヴァ: "va",
          ヴィ: "vi",
          ヴ: "vu",
          ヴェ: "ve",
          ヴォ: "vo",
          ファ: "fa",
          フィ: "fi",
          フェ: "fe",
          フォ: "fo",
          ツァ: "tsa",
          ツィ: "tsi",
          ツェ: "tse",
          ツォ: "tso",
          トゥ: "twu",
          ドゥ: "dwu",
          ティ: "thi",
          ディ: "dhi",
        }),
      },
      Numbers: {
        "1~10": each(
          nums.slice(1, 11),
          ({ n, jp }) => {
            return new DirectTreeCard(
              n + "",
              n,
              jp,
              ["Japanese", "Numbers"],
              1 / 20,
            )
          },
          (n) => n.n,
        ),
        "11~19": each(
          nums.slice(1, 10),
          ({ n, jp }) => {
            return new DirectTreeCard(
              10 + n + "",
              10 + n,
              jp
                .split("、")
                .map((x) => "じゅう" + x)
                .join("、"),
              ["Japanese", "Numbers"],
              1 / 20,
            )
          },
          (n) => 10 + n.n,
        ),
        "20~100": each(
          [2, 3, 4, 5, 6, 7, 8, 9, 10],
          (n) => {
            return new DirectTreeCard(
              10 * n + "",
              10 * n,
              [
                ,
                ,
                "にじゅう",
                "さんじゅう",
                "よんじゅう",
                "ごじゅう",
                "ろくじゅう",
                "ななじゅう",
                "はちじゅう",
                "きゅうじゅう",
                "ひゃく",
              ][n],
              ["Japanese", "Numbers"],
              1 / 20,
            )
          },
          (n) => "" + 10 * n,
        ),
      },
      Time: {
        "O'Clock": each(
          nums.slice(1, 13),
          ({ n, time }) =>
            new DirectTreeCard(
              n + ":00",
              n + ":00",
              time + "じ",
              ["Japanese", "Time"],
              1 / 20,
            ),
          (n) => n.n + ":00",
        ),
        "Half Hour": each(
          nums.slice(1, 13),
          ({ n, time }) =>
            new DirectTreeCard(
              n + ":30",
              n + ":30",
              time + "じはん",
              ["Japanese", "Time"],
              1 / 20,
            ),
          (n) => n.n + ":30",
        ),
      },
    },
    Mathematics: {
      Squares: each(
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        (b) =>
          each(
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            (y) => {
              const x = 10 * b + y
              return new DirectTreeCard(
                x + "²",
                x + "²",
                x * x + "",
                ["Mathematics", "Squares"],
                1 / 20,
              )
            },
            (y) => 10 * b + y + "",
          ),
        (b) => `${10 * b + 1}~${10 * b + 10}`,
      ),
    },
    "toki pona": {
      "sitelen sitelen": {
        Letters: ss(ssLetters),
        Punctuation: ss(ssPunctuation),
        Words: ss(ssWords),
      },
    },
  },
  (value): value is Leaf =>
    value instanceof DirectTreeCard || value instanceof Generator,
)

export const { leaves, groups } = tree.count((leaf) => {
  if (leaf instanceof Generator) {
    return leaf.cardCount
  } else {
    return 1
  }
})
