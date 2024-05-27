import { Fa } from "@/components/Fa"
import {
  IconDefinition,
  faClock,
  faMousePointer,
  faSliders,
} from "@fortawesome/free-solid-svg-icons"
import { createEffect, untrack } from "solid-js"
import { isServer } from "solid-js/web"
import "./mathquill.css"
import {
  DOMView,
  L,
  LatexCmds,
  LatexRecursiveContext,
  Letter,
  MQNode,
  MathBlock,
  MathCommand,
  R,
  U_ZERO_WIDTH_SPACE,
  V3,
  getInterface,
  h,
  latexMathParser,
} from "./mathquill.js"
export type * from "./mathquill"

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

  getDualDepth() {
    var level = 0
    var walkUp = function (item: any, level: number) {
      if (
        item instanceof MQNode &&
        item.ctrlSeq &&
        item.ctrlSeq.toLowerCase().search("dual") >= 0
      )
        level += 1
      if (item && item.parent) return walkUp(item.parent, level)
      else return level
    }
    return walkUp(this, level)
  }

  finalizeTree() {
    var endsL = this.getEnd(L)
    var endsR = this.getEnd(R)
    this.upInto = endsR.upOutOf = endsL
    this.downInto = endsL.downOutOf = endsR
    endsL.ariaLabel = "numerator"
    endsR.ariaLabel = "denominator"
    if (this.getDualDepth() > 1) {
      this.mathspeakTemplate = [
        "NestedDualLargeValue,",
        "NestedDualSmallValue",
        ", EndNestedDualMode",
      ]
    } else {
      this.mathspeakTemplate = [
        "DualLargeValue,",
        "DualSmallValue",
        ", EndDualMode",
      ]
    }
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

LatexCmds.limit = LatexCmds.lim = class Limit extends MathCommand {
  constructor(ctrlSeq: string, domView: DOMView, textTemplate: string[]) {
    super(ctrlSeq, domView, textTemplate)
    this.ctrlSeq = "\\lim"
    this.domView = new DOMView(1, function (blocks) {
      return h("span", { class: "mq-limit mq-non-leaf" }, [
        h("span", { class: "mq-limit-label" }, [h.text("lim")]),
        h.block("span", { class: "mq-limit-sub mq-non-leaf" }, blocks[0]),
      ])
    })
    this.textTemplate = ["lim(", ")"]
    this.mathspeakTemplate = ["Limit", "EndLimit"]
  }

  override mathspeak(opts: any) {
    if (opts && opts.createdLeftOf) {
      var cursor = opts.createdLeftOf
      return cursor.parent.mathspeak()
    }
    return super.mathspeak()
  }

  override latexRecursive(ctx: LatexRecursiveContext) {
    this.checkCursorContextOpen(ctx)
    ctx.latex += "\\lim_{"
    this.getEnd(L).latexRecursive(ctx)
    ctx.latex += "}"
    this.checkCursorContextClose(ctx)
  }

  override parser() {
    return latexMathParser.subBlock
      .map(function (block) {
        const limit = new Limit("\\lim", undefined!, undefined!)
        limit.blocks = [block]
        block.adopt(limit, 0, 0)
        return limit
      })
      .or(super.parser())
  }
}

LatexCmds.align = class extends MathCommand {
  constructor(ctrlSeq: string, domView: DOMView, textTemplate: string[]) {
    super(ctrlSeq, domView, textTemplate)
    this.ctrlSeq = "\\align"
    this.domView = new DOMView(4, function (blocks) {
      return h("span", { class: "mq-align mq-non-leaf" }, [
        h.block(
          "span",
          { class: "mq-align-item mq-align-a mq-align-1 mq-non-leaf" },
          blocks[0],
        ),
        h.block(
          "span",
          { class: "mq-align-item mq-align-a mq-align-2 mq-non-leaf" },
          blocks[1],
        ),
        h.block(
          "span",
          { class: "mq-align-item mq-align-b mq-align-1 mq-non-leaf" },
          blocks[2],
        ),
        h.block(
          "span",
          { class: "mq-align-item mq-align-b mq-align-2 mq-non-leaf" },
          blocks[3],
        ),
      ])
    })
    this.textTemplate = ["align(", "", ")(", "", ")"]
    this.mathspeakTemplate = ["Align", "Then", "NextLine", "Then", "EndAlign"]
  }

  override mathspeak(opts: any) {
    if (opts && opts.createdLeftOf) {
      var cursor = opts.createdLeftOf
      return cursor.parent.mathspeak()
    }
    return super.mathspeak()
  }

  override latexRecursive(ctx: LatexRecursiveContext) {
    this.checkCursorContextOpen(ctx)
    ctx.latex += "\\begin{align*}"
    this.blocks[0]!.latexRecursive(ctx)
    ctx.latex += "&"
    this.blocks[1]!.latexRecursive(ctx)
    ctx.latex += "\\"
    this.blocks[2]!.latexRecursive(ctx)
    ctx.latex += "&"
    this.blocks[3]!.latexRecursive(ctx)
    ctx.latex += "\\end{align*}"
    this.checkCursorContextClose(ctx)
  }
}

// LatexCmds.piecewise = class extends MathCommand {
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

export abstract class MathExtendable extends MathCommand {
  constructor(
    ctrlSeq: string,
    domView: DOMView,
    textTemplate: string[],
    size: number | undefined,
  ) {
    super(ctrlSeq, domView, textTemplate)
    if (size == null) {
      size = this.defaultSize()
    }
    this.updateDomView(size)
    this.updateTemplates(size)
  }

  setSize(size: number) {
    const prev = this._el!
    this.updateDomView(size)
    this.updateTemplates(size)
    this.createBlocks()
    this._el = this.domView.render(this.blocks!)
    prev.replaceWith(this._el)
  }

  createBlocks() {
    const prev = this.blocks
    const numBlocks = this.numBlocks()
    const blocks = (this.blocks = Array(numBlocks))
    for (let i = 0; i < numBlocks; i += 1) {
      let next = prev?.[i]
      if (!next) {
        next = new MathBlock()
        next.domFrag().addClass("mq-empty")
      }
      blocks[i] = next
      next.adopt(this, this.getEnd(R), 0)
    }
    if (this.blocks[0]) {
      // @ts-expect-error these are annoying to type
      this.blocks[0][L] = 0
    }
    if (this.blocks[this.blocks.length - 1]) {
      // @ts-expect-error these are annoying to type
      this.blocks[this.blocks.length - 1][R] = 0
    }
  }

  abstract defaultSize(): number

  abstract updateTemplates(size: number): void

  abstract updateDomView(size: number): void

  override mathspeak(opts: any) {
    if (opts && opts.createdLeftOf) {
      var cursor = opts.createdLeftOf
      return cursor.parent.mathspeak()
    }
    return super.mathspeak()
  }
}

LatexCmds.piecewise = class extends MathExtendable {
  override defaultSize(): number {
    return 4
  }

  override updateDomView(size: number): void {
    this.domView = new DOMView(size, (blocks)=>h('span',{class:"mq-non-leaf"}))
  }

  override updateTemplates(size: number): void {}
}

export const config: Readonly<V3.Config> = Object.freeze({
  autoOperatorNames:
    "sin sinh arcsin arcsinh cos cosh arccos arccosh tan tanh arctan arctanh csc csch arccsc arccsch sec sech arcsec arcsech cot coth arccot arccoth distance for and or not mod iter real imag log ln exp length sign angle unsign fx fy",
  autoCommands:
    "sum prod alpha nu beta xi Xi gamma Gamma delta Delta pi Pi epsilon varepsilon rho varrho zeta sigma Sigma varsigma eta tau theta vartheta Theta upsilon Upsilon iota phi varphi Phi kappa chi lambda Lambda psi Psi mu omega Omega sqrt nthroot integral cross ans dual abs infinity infty limit choose binom digamma",
  infixOperatorNames: "mod",
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
