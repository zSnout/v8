import { Heading } from "@/components/Heading"
import { Index, createSignal } from "solid-js"

export type Key = readonly [
  standard: string,

  main: string,
  shift: string,
  alt: string,
  altShift: string,
]

const KEY_DATA = [
  [
    ["`", "(", ")", "<", ">"],
    ["1", "󱥳", "󱤹", "󱥗", "󱥹"],
    ["2", "󱥮", "󱤾", "󱥑", "󱤁"],
    ["3", "󱤼", "󱤽", "󱤋", "󱥽"],
    ["4", "󱥩", "󱤈", "󱤲", "󱦡"],
    ["5", "󱤭", "󱥌", "󱥃", "󱥻"],
    ["6", "󱤨", "󱥣", "󱥦", "󱦃"],
    ["7", "󱤊", "󱥢", "󱥴", "󱦀"],
    ["8", "󱤖", "󱥶", "󱤦", "󱥸"],
    ["9", "󱤄", "󱦐", "󱥇", "󱦣"],
    ["0", "󱤂", "󱦑", "󱥋", "🗧"],
    ["-", "‍", "‍", "󱦓", "󱦒"],
    ["=", "󱦕", "󱦖", "󱦔", "󱦙"],
  ],
  [
    ["q", "󱥙", "󱥤", "󱤜", "󱤺"],
    ["w", "󱤡", "󱥵", "󱥚", "󱥲"],
    ["e", "󱤉", "󱥖", "󱥓", "󱥼"],
    ["r", "󱥫", "󱤤", "󱤫", "󱦇"],
    ["t", "󱥬", "󱥭", "󱥥", "󱥾"],
    ["y", "󱤬", "󱤇", "󱤗", "󱦁"],
    ["u", "󱥞", "󱤕", "󱥰", "󱥯"],
    ["i", "󱤍", "󱤎", "󱤏", "󱦂"],
    ["o", "󱥄", "󱤌", "󱥜", "󱥺"],
    ["p", "󱥔", "󱥈", "󱥒", "󱥕"],
    ["[", "󱦗", "󱦚", "[", "{"],
    ["]", "󱦘", "󱦛", "]", "}"],
    ["\\", "/", "_", "\\", "|"],
  ],
  [
    ["a", "󱤀", "󱤆", "󱤔", "󱤅"],
    ["s", "󱥡", "󱥠", "󱥛", "󱥘"],
    ["d", "󱥨", "󱤪", "󱤥", "󱤃"],
    ["f", "󱥍", "󱥐", "󱤚", "󱦠"],
    ["g", "󱥆", "󱤟", "󱤣", "󱦅"],
    ["h", "󱥂", "󱥝", "󱥊", "󱦢"],
    ["j", "󱤑", "󱤓", "󱤐", "󱤒"],
    ["k", "󱤘", "󱤙", "󱤛", "󱦈"],
    ["l", "󱤧", "󱤮", "󱤩", "󱤯"],
    [";", "󱦜", "󱦝", ";", ":"],
    ["'", "'", '"', "+", "*"],
  ],
  [
    ["z", "󱥧", "󱤢", "󱤷", "󱤸"],
    ["x", "󱥉", "󱤶", "󱥱", "󱥟"],
    ["c", "󱥎", "󱥅", "󱤞", "󱦄"],
    ["v", "󱥷", "󱥪", "󱤝", "󱥿"],
    ["b", "󱥁", "󱤿", "󱥏", "󱤵"],
    ["n", "󱦆", "󱤻", "󱤠", "󱥀"],
    ["m", "󱤴", "󱤰", "󱤱", "󱤳"],
    [",", "、", "「", ",", "『"],
    [".", "。", "」", ".", "』"],
    ["/", "-", "=", "!", "?"],
  ],
]

function splitByCodePoint(text) {
  const output = []
  let index = 0
  let value

  while (((value = text.codePointAt(index)), value != null)) {
    output.push(String.fromCodePoint(value))
    index += String.fromCodePoint(value).length
  }

  return output
}

function getKeyData() {
  function makeRow(data) {
    if (data.length != 5) {
      throw new Error("Expected five rows of data.")
    }

    const [standard, main, shift, alt, altShift] = data.map(splitByCodePoint)

    return standard.map((standard, index) => [
      standard,
      main[index],
      shift[index],
      alt[index],
      altShift[index],
    ])
  }

  const KEY_DATA = `
\`1234567890-=
(󱥳󱥮󱤼󱥩󱤭󱤨󱤊󱤖󱤄󱤂‍󱦕)
)󱤹󱤾󱤽󱤈󱥌󱥣󱥢󱥶󱦐󱦑‍󱦖
<󱥗󱥑󱤋󱤲󱥃󱥦󱥴󱤦󱥇󱥋󱦓󱦔
>󱥹󱤁󱥽󱦡󱥻󱦃󱦀󱥸󱦣🗧󱦒󱦙
qwertyuiop[]\\
󱥙󱤡󱤉󱥫󱥬󱤬󱥞󱤍󱥄󱥔󱦗󱦘/
󱥤󱥵󱥖󱤤󱥭󱤇󱤕󱤎󱤌󱥈󱦚󱦛_
󱤜󱥚󱥓󱤫󱥥󱤗󱥰󱤏󱥜󱥒[]\\
󱤺󱥲󱥼󱦇󱥾󱦁󱥯󱦂󱥺󱥕{}|
asdfghjkl;'
󱤀󱥡󱥨󱥍󱥆󱥂󱤑󱤘󱤧󱦜'
󱤆󱥠󱤪󱥐󱤟󱥝󱤓󱤙󱤮󱦝"
󱤔󱥛󱤥󱤚󱤣󱥊󱤐󱤛󱤩;+
󱤅󱥘󱤃󱦠󱦅󱦢󱤒󱦈󱤯:*
zxcvbnm,./
󱥧󱥉󱥎󱥷󱥁󱦆󱤴、。-
󱤢󱤶󱥅󱥪󱤿󱤻󱤰「」=
󱤷󱥱󱤞󱤝󱥏󱤠󱤱,.!
󱤸󱥟󱦄󱥿󱤵󱥀󱤳『』?
`
    .trim()
    .split("\n")

  return [
    makeRow(KEY_DATA.slice(0, 5)),
    makeRow(KEY_DATA.slice(5, 10)),
    makeRow(KEY_DATA.slice(10, 15)),
    makeRow(KEY_DATA.slice(15, 20)),
  ]
}

export function Main() {
  const [prompt, setPrompt] = createSignal({
    answer: "󱥬󱥔󱦜",
    typed: "",
  })

  return (
    <div class="mt-auto flex w-full max-w-lg flex-1 flex-col">
      <Heading>o pana e sitelen pona ni:</Heading>

      <CharTable />
    </div>
  )
}
