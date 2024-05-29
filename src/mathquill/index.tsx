import { Fa } from "@/components/Fa"
import {
  IconDefinition,
  faClock,
  faMousePointer,
  faSliders,
} from "@fortawesome/free-solid-svg-icons"
import { createEffect, untrack } from "solid-js"
import { isServer } from "solid-js/web"
import {
  DOMView,
  L,
  LatexCmds,
  Letter,
  MQSymbol,
  MathBlock,
  MathCommand,
  Parser,
  R,
  SVG_SYMBOLS,
  U_ZERO_WIDTH_SPACE,
  V3,
  bindBinaryOperator,
  getInterface,
  h,
  latexMathParser,
} from "./mathquill.js"
import "./mathquill.postcss"
export type * from "./mathquill"

// NOTABLE CHANGES TO `MATHQUILL.JS`
//
// - `\lim` and `\limit` are custom nodes
// - LiveFraction stops extending to the left when it hits `\lim`
// - `customCharacters` option exists
// - `\lbrack`, `\rbrack`, `\slash`, and `\vert` display properly
// - MathQuill V1 isn't automatically loaded
// - `\lfloor` and `\lceil` work as brackets

export abstract class IconLetter extends Letter {
  constructor(letter: string) {
    super(letter)
    const icon = this.icon()
    const oldConsoleWarn = console.warn
    console.warn = () => {}
    const iconEl = (
      <span class="mq-icon">
        <span>{letter}</span>
        <Fa icon={icon} title={letter} />
      </span>
    )
    console.warn = oldConsoleWarn
    this.domView = new DOMView(0, function () {
      return iconEl
    })
  }

  abstract icon(): IconDefinition

  override italicize(active: boolean) {
    this.domFrag().toggleClass("mq-icon", active)
    this.domFrag().toggleClass("mq-icon-letter", !active)
    return Letter.prototype.italicize.call(this, active)
  }
}

LatexCmds["#"] =
  LatexCmds["⊙"] =
  LatexCmds.odot =
  LatexCmds.circledot =
    bindBinaryOperator("\\odot ", "&#8857;", "circle dot")

LatexCmds.t = class extends IconLetter {
  override icon(): IconDefinition {
    return faClock
  }
}

LatexCmds.m = class extends IconLetter {
  override icon(): IconDefinition {
    return faMousePointer
  }
}

LatexCmds.s = class extends IconLetter {
  override icon(): IconDefinition {
    return faSliders
  }
}

LatexCmds.dual = class extends MathCommand {
  constructor(ctrlSeq: string, domView: DOMView, textTemplate: string[]) {
    super(ctrlSeq, domView, textTemplate)
    this.ctrlSeq = "\\dual"
    this.domView = new DOMView(2, function (blocks) {
      return h("span", { class: "mq-non-leaf mq-dual-container" }, [
        h.block("span", { class: "mq-dual-numerator" }, blocks[0]),
        h.block("span", { class: "mq-dual-denominator" }, blocks[1]),
        h("span", { style: "display:inline-block;width:0" }, [
          h.text(U_ZERO_WIDTH_SPACE),
        ]),
      ])
    })
    this.textTemplate = ["(", ")dual(", ")"]
  }

  override mathspeak(opts: any) {
    if (opts && opts.createdLeftOf) {
      var cursor = opts.createdLeftOf
      return cursor.parent.mathspeak()
    }
    return super.mathspeak()
  }

  override finalizeTree() {
    var endsL = this.getEnd(L)
    var endsR = this.getEnd(R)
    this.upInto = endsR.upOutOf = endsL
    this.downInto = endsL.downOutOf = endsR
    endsL.ariaLabel = "dual-large"
    endsR.ariaLabel = "dual-small"
    this.mathspeakTemplate = ["Dual,", "DualSmall", ", EndDual"]
  }
}

LatexCmds.frozenmouse = class extends MathCommand {
  constructor(ctrlSeq: string, domView: DOMView, textTemplate: string[]) {
    super(ctrlSeq, domView, textTemplate)
    this.ctrlSeq = "\\frozenmouse"
    this.domView = new DOMView(1, function (blocks) {
      return h.block(
        "span",
        { class: "mq-frozen", style: "--label:'mouse'" },
        blocks[0],
      )
    })
    this.textTemplate = ["frozenmouse(", ")"]
    this.mathspeakTemplate = ["FrozenMouse", "EndFrozenMouse"]
  }

  override mathspeak(opts: any) {
    if (opts && opts.createdLeftOf) {
      var cursor = opts.createdLeftOf
      return cursor.parent.mathspeak()
    }
    return super.mathspeak()
  }
}

LatexCmds.frozentime = class extends MathCommand {
  constructor(ctrlSeq: string, domView: DOMView, textTemplate: string[]) {
    super(ctrlSeq, domView, textTemplate)
    this.ctrlSeq = "\\frozentime"
    this.domView = new DOMView(1, function (blocks) {
      return h.block(
        "span",
        { class: "mq-frozen", style: "--label:'time'" },
        blocks[0],
      )
    })
    this.textTemplate = ["frozentime(", ")"]
    this.mathspeakTemplate = ["FrozenTime", "EndFrozenTime"]
  }

  override mathspeak(opts: any) {
    if (opts && opts.createdLeftOf) {
      var cursor = opts.createdLeftOf
      return cursor.parent.mathspeak()
    }
    return super.mathspeak()
  }
}

// LatexCmds.align = class extends MathCommand {
//   constructor(ctrlSeq: string, domView: DOMView, textTemplate: string[]) {
//     super(ctrlSeq, domView, textTemplate)
//     this.ctrlSeq = "\\align"
//     this.domView = new DOMView(4, function (blocks) {
//       return h("span", { class: "mq-align mq-non-leaf" }, [
//         h.block(
//           "span",
//           { class: "mq-align-item mq-align-a mq-align-1 mq-non-leaf" },
//           blocks[0],
//         ),
//         h.block(
//           "span",
//           { class: "mq-align-item mq-align-a mq-align-2 mq-non-leaf" },
//           blocks[1],
//         ),
//         h.block(
//           "span",
//           { class: "mq-align-item mq-align-b mq-align-1 mq-non-leaf" },
//           blocks[2],
//         ),
//         h.block(
//           "span",
//           { class: "mq-align-item mq-align-b mq-align-2 mq-non-leaf" },
//           blocks[3],
//         ),
//       ])
//     })
//     this.textTemplate = ["align(", "", ")(", "", ")"]
//     this.mathspeakTemplate = ["Align", "Then", "NextLine", "Then", "EndAlign"]
//   }

//   override mathspeak(opts: any) {
//     if (opts && opts.createdLeftOf) {
//       var cursor = opts.createdLeftOf
//       return cursor.parent.mathspeak()
//     }
//     return super.mathspeak()
//   }

//   override latexRecursive(ctx: LatexRecursiveContext) {
//     this.checkCursorContextOpen(ctx)
//     ctx.latex += "\\begin{align*}"
//     this.blocks[0]!.latexRecursive(ctx)
//     ctx.latex += "&"
//     this.blocks[1]!.latexRecursive(ctx)
//     ctx.latex += "\\"
//     this.blocks[2]!.latexRecursive(ctx)
//     ctx.latex += "&"
//     this.blocks[3]!.latexRecursive(ctx)
//     ctx.latex += "\\end{align*}"
//     this.checkCursorContextClose(ctx)
//   }
// }

export abstract class Extendable extends MathCommand {
  constructor(
    ctrlSeq?: string,
    domView?: DOMView,
    textTemplate?: string[],
    size?: number | undefined,
  ) {
    super(ctrlSeq, domView, textTemplate)
    if (size == null) {
      size = this.defaultSize()
    }
    this.updateDomView(size)
    this.updateTemplates(size)
  }

  private __setBlocks(prev: ArrayLike<MathBlock | undefined>) {
    const numBlocks = this.numBlocks()
    const blocks = (this.blocks = Array<MathBlock>(numBlocks))
    for (let i = 0; i < numBlocks; i += 1) {
      let next = prev?.[i]
      if (!next) {
        next = new MathBlock()
        next.domFrag().addClass("mq-empty")
      }
      blocks[i] = next
      next.adopt(this, this.getEnd(R), 0)
    }
    if (blocks[0]) {
      blocks[0][L] = 0
    }
    if (blocks[blocks.length - 1]) {
      blocks[blocks.length - 1]![R] = 0
    }
  }

  setBlocks(blocks: (MathBlock | undefined)[]) {
    const prev = this._el!
    const size = blocks.length
    this.updateDomView(size)
    this.updateTemplates(size)
    this.__setBlocks(blocks)
    this._el = this.domView.render(this.blocks!)
    prev.replaceWith(this._el)
    for (const block of this.blocks) {
      if (block.isEmpty()) {
        block.domFrag().addClass("mq-empty")
      }
    }
    this.finalizeTree?.()
  }

  extendLeft(size: number) {
    const next = Array.from({ length: size }, (_, i) =>
      this.blocks.at(i - size),
    )
    this.setBlocks(next)
  }

  extendRight(size: number) {
    const next = Array.from({ length: size }, (_, i) => this.blocks[i])
    this.setBlocks(next)
  }

  createBlocks() {
    const blocks = this.blocks || []
    this.__setBlocks(
      Array.from(
        { length: this.numBlocks() },
        (_, i) => blocks[i] || undefined,
      ),
    )
  }

  abstract defaultSize(): number

  abstract validateBlocks(blocks: MathBlock[]): (MathBlock | undefined)[]

  abstract updateTemplates(size: number): void

  abstract updateDomView(size: number): void

  override parser(): Parser<this> {
    const block = Parser.string("{")
      .then(() => latexMathParser)
      .skip(Parser.string("}"))

    return block.many().map((raw) => {
      const blocks = (this.blocks = this.validateBlocks(raw).map(
        (x) => x || new MathBlock(),
      ))
      for (let i = 0; i < blocks.length; i += 1) {
        blocks[i]!.adopt(this, this.getEnd(R), 0)
      }
      this.updateTemplates(blocks.length)
      this.updateDomView(blocks.length)
      return this
    })
  }

  override mathspeak(opts: any) {
    if (opts && opts.createdLeftOf) {
      var cursor = opts.createdLeftOf
      return cursor.parent.mathspeak()
    }
    return super.mathspeak()
  }
}

LatexCmds.piecewise = LatexCmds.switch = class extends Extendable {
  constructor(
    ctrlSeq?: string,
    domView?: DOMView,
    textTemplate?: string[],
    size?: number | undefined,
  ) {
    super(ctrlSeq, domView, textTemplate, size)
    this.ctrlSeq = "\\piecewise"
  }

  override defaultSize(): number {
    return 4
  }

  override validateBlocks(blocks: MathBlock[]): (MathBlock | undefined)[] {
    if (blocks.length == 0) {
      return [undefined, undefined]
    }

    if (blocks.length % 2) {
      return (blocks as (MathBlock | undefined)[]).concat(undefined)
    }

    return blocks
  }

  override updateDomView(size: number): void {
    const leftSymbol = SVG_SYMBOLS["{"]
    const rightSymbol = SVG_SYMBOLS["}"]
    this.domView = new DOMView(size, (blocks) => {
      const inner = blocks.map((block, index) =>
        h.block(
          "span",
          {
            class:
              index % 2
                ? "mq-non-leaf mq-piecewise-right" +
                  (index == size - 1 ? " mq-piecewise-final" : "")
                : "mq-non-leaf mq-piecewise-left",
          },
          block,
        ),
      )
      return h(
        // be set by createLeftOf or parser
        "span",
        { class: "mq-non-leaf mq-bracket-container mq-piecewise-container" },
        [
          h(
            "span",
            {
              style: "width:" + leftSymbol.width,
              class: "mq-scaled mq-bracket-l mq-paren",
            },
            [leftSymbol.html()],
          ),
          h(
            "span",
            {
              style:
                "margin-left:" +
                leftSymbol.width +
                ";margin-right:" +
                rightSymbol.width,
              class: "mq-bracket-middle mq-non-leaf mq-piecewise-grid",
            },
            inner,
          ),
          h(
            "span",
            {
              style: "width:" + rightSymbol.width,
              class: "mq-scaled mq-bracket-r mq-paren",
            },
            [rightSymbol.html()],
          ),
        ],
      )
    })
  }

  override updateTemplates(size: number): void {
    if (size == 0) {
      this.textTemplate = ["piecewise()"]
    } else {
      this.textTemplate = [
        "piecewise(",
        ...Array.from({ length: size }, (_, i) => {
          if (i == size - 1) {
            return ")"
          }
          if (i % 2) {
            return " if "
          } else {
            return ","
          }
        }),
      ]
    }

    if (size == 0) {
      this.mathspeakTemplate = ["EmptyPiecewise"]
    } else {
      this.mathspeakTemplate = [
        "Piecewise",
        ...Array.from({ length: size }, (_, i) => {
          if (i == size - 1) {
            return "EndPiecewise"
          }
          if (i % 2) {
            return " If "
          } else {
            return " Alternative "
          }
        }),
      ]
    }
  }

  override finalizeTree() {
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]!
      const above = this.blocks[i - 2]
      const below = this.blocks[i + 2]
      block.upOutOf =
        above ||
        (() => {
          this.extendLeft(this.numBlocks() + 2)
          return this.blocks[i]!
        })
      block.downOutOf =
        below ||
        (() => {
          this.extendRight(this.numBlocks() + 2)
          return this.blocks[i + 2]!
        })
      block.deleteOutOf = (dir, cursor) => {
        if (dir == L) {
          if (i % 2) {
            cursor.insAtRightEnd(this.blocks[i - 1]!)
          } else {
            if (this.blocks.length <= 2) {
              cursor.insLeftOf(this)
              return
            }
            this.setBlocks(this.blocks.toSpliced(i % 2 ? i - 1 : i, 2))
            const next = this.blocks[i - 2] || this.blocks[i]
            if (next) {
              cursor.insAtLeftEnd(next)
            } else {
              cursor.insLeftOf(this)
            }
          }
        } else {
          if (i % 2) {
            if (this.blocks.length <= 2) {
              cursor.insRightOf(this)
              return
            }
            this.setBlocks(this.blocks.toSpliced(i % 2 ? i - 1 : i, 2))
            const next = this.blocks[i - 1]
            if (next) {
              cursor.insAtLeftEnd(next)
            } else {
              cursor.insRightOf(this)
            }
          } else {
            cursor.insAtRightEnd(this.blocks[i - 1]!)
          }
        }
      }
    }
  }
}

LatexCmds.align = class extends Extendable {
  constructor(
    ctrlSeq?: string,
    domView?: DOMView,
    textTemplate?: string[],
    size?: number | undefined,
  ) {
    super(ctrlSeq, domView, textTemplate, size)
    this.ctrlSeq = "\\align"
  }

  override defaultSize(): number {
    return 2
  }

  override validateBlocks(blocks: MathBlock[]): (MathBlock | undefined)[] {
    if (blocks.length == 0) {
      return [undefined]
    }

    return blocks
  }

  override updateDomView(size: number): void {
    this.domView = new DOMView(size, (blocks) => {
      return h(
        "span",
        { class: "mq-non-leaf mq-align-grid" },
        blocks.map((block, index) => {
          const left = block.getEnd(L)
          return h.block(
            "span",
            {
              class:
                "mq-align-item mq-non-leaf" +
                (left instanceof Ampersand
                  ? " mq-align-sameline"
                  : " mq-align-newline"),
              style:
                "--index:" +
                blocks
                  .slice(0, index + 1)
                  .reduce(
                    (a, b) => (b.getEnd(L) instanceof Ampersand ? a : a + 1),
                    0,
                  ),
            },
            block,
          )
        }),
      )
    })
  }

  override updateTemplates(size: number): void {
    if (size == 0) {
      this.textTemplate = ["align()"]
    } else {
      this.textTemplate = [
        "align(",
        ...Array.from({ length: size }, (_, i) => {
          if (i == size - 1) {
            return ")"
          } else {
            return ","
          }
        }),
      ]
    }

    if (size == 0) {
      this.mathspeakTemplate = ["EmptyAlign"]
    } else {
      this.mathspeakTemplate = [
        "Align",
        ...Array.from({ length: size }, (_, i) => {
          if (i == size - 1) {
            return "EndAlign"
          } else {
            return "LineBreak"
          }
        }),
      ]
    }
  }

  override finalizeTree() {
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i]!
      const above = this.blocks[i - 1]
      const below = this.blocks[i + 1]
      block.upOutOf =
        above ||
        (() => {
          this.extendLeft(this.numBlocks() + 1)
          return this.blocks[i]!
        })
      block.downOutOf =
        below ||
        (() => {
          this.extendRight(this.numBlocks() + 1)
          return this.blocks[i + 1]!
        })
      block.deleteOutOf = (dir, cursor) => {
        if (dir == R) {
          throw new Error("TODO: implement this")
        }
        if (block.getEnd(L) instanceof Ampersand) {
          
        }
        // if (dir == L) {
        //   if (this.blocks.length <= 1) {
        //     cursor.insLeftOf(this)
        //     return
        //   }
        //   this.setBlocks(this.blocks.toSpliced(i, 1))
        //   const next = this.blocks[i - 1] || this.blocks[i]
        //   if (next) {
        //     cursor.insAtLeftEnd(next)
        //   } else {
        //     cursor.insLeftOf(this)
        //   }
        // } else {
        //   if (this.blocks.length <= 1) {
        //     cursor.insRightOf(this)
        //     return
        //   }
        //   this.setBlocks(this.blocks.toSpliced(i, 1))
        //   const next = this.blocks[i]
        //   if (next) {
        //     cursor.insAtRightEnd(next)
        //   } else {
        //     cursor.insRightOf(this)
        //   }
        // }
      }
    }
  }
}

class Ampersand extends MQSymbol {
  constructor() {
    super(
      "&",
      h("span", { class: "mq-amp mq-nonSymbola" }, [h.text("&")]),
      "&",
      "ampersand",
    )
  }
}

LatexCmds["&"] = Ampersand

export const config: Readonly<V3.Config> = Object.freeze({
  autoOperatorNames:
    "sin sinh arcsin arcsinh cos cosh arccos arccosh tan tanh arctan arctanh csc csch arccsc arccsch sec sech arcsec arcsech cot coth arccot arccoth distance for not mod iter real imag log ln exp length sign angle unsign fx fy",
  autoCommands:
    "sum prod coprod alpha nu beta xi Xi gamma Gamma delta Delta pi Pi epsilon varepsilon rho varrho zeta sigma Sigma varsigma eta tau theta vartheta Theta upsilon Upsilon iota phi varphi Phi kappa chi lambda Lambda psi Psi mu omega Omega sqrt nthroot integral cross ans dual infinity infty lim choose binom digamma piecewise switch floor ceil and or",
  autoSubscriptNumerals: true,
  disableAutoSubstitutionInSubscripts: true,
  tripleDotsAreEllipsis: true,
  enableDigitGrouping: true,
  spaceBehavesLikeTab: true,
  statelessClipboard: false,
  sumStartsWithNEquals: true,
  supSubsRequireOperand: true,
  restrictMismatchedBrackets: true,
})

export const mq = getInterface(3)

export function MQEditable(
  props: {
    class?: string | undefined
    latex: string
    ref?(field: V3.EditableMathQuill): void
  } & V3.HandlerOptions,
) {
  const className = untrack(() => props.class)

  return (
    <div
      class={className + (isServer ? "" : " mq-editable-field mq-math-mode")}
      ref={(el) => {
        const field = mq.MathField(el, { ...config, handlers: props })
        createEffect(() => {
          const latex = props.latex
          if (field.latex() != latex) {
            field.latex(latex)
          }
        })
        props.ref?.(field)
      }}
    />
  )
}
