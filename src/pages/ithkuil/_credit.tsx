export function Credit(props: { sakawi: string; class?: string }) {
  return (
    <>
      <p class={props.class}>
        The {props.sakawi} were built by{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="https://github.com/zsakowitz"
        >
          this site's author, sakawi
        </a>
        , with{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="https://github.com/zsakowitz/ithkuil"
        >
          all source code available publicly on GitHub
        </a>
        .
      </p>

      <p class={props.class}>
        The calligraphic Ithkuil non-numeral characters were created by{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="https://discord.com/channels/131937038139260928/198559368772452352/1076980425941065818"
        >
          khmccurdy (956353925085278232) on Discord
        </a>
        .
      </p>

      <p class={props.class}>
        The calligraphic Ithkuil numerals (only available in the{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="/ithkuil/font"
        >
          Font Generator
        </a>
        ) were created by{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="https://discord.com/channels/131937038139260928/198559368772452352/1140761346955300974"
        >
          Pan Kamil (914507096626700331) on Discord
        </a>
        .
      </p>

      <p class={props.class}>
        Both sets of characters (handwritten and calligraphic) were compiled
        into fonts by{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="https://github.com/shankarsivarajan"
        >
          Shankar Sivarajan
        </a>
        .
      </p>

      <p class={props.class}>
        The custom character syntax for advanced alphabetic characters was
        designed by{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="https://github.com/ryanlo713"
        >
          Lucifer Caelius Delicatus
        </a>
        .
      </p>

      <p class={props.class}>
        The dictionaries for the root and affix searches are from the{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="https://docs.google.com/spreadsheets/d/1JdaG1PaSQJRE2LpILvdzthbzz1k_a0VT86XSXouwGy8/edit"
        >
          Collaborative Ithkuil IV Roots and Affixes Spreadsheet
        </a>
        .
      </p>
    </>
  )
}
