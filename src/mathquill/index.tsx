import { Fa } from "@/components/Fa"
import {
  IconDefinition,
  faClock,
  faMousePointer,
  faSliders,
} from "@fortawesome/free-solid-svg-icons"
import { createEffect, untrack } from "solid-js"
import "./mathquill.css"
import {
  DOMView,
  L,
  LatexCmds,
  Letter,
  MQNode,
  MathCommand,
  R,
  U_ZERO_WIDTH_SPACE,
  V3,
  getInterface,
  h,
} from "./mathquill.js"
import { isServer } from "solid-js/web"
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
        h.block("span", { class: "mq-dual-numerator" }, blocks[0]!),
        h.block("span", { class: "mq-dual-denominator" }, blocks[1]!),
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
    return MathCommand.prototype.mathspeak.call(this)
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
        blocks[0]!,
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
    return MathCommand.prototype.mathspeak.call(this)
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
        blocks[0]!,
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
    return MathCommand.prototype.mathspeak.call(this)
  }
}

export const config: Readonly<V3.Config> = Object.freeze({
  autoOperatorNames:
    "sin sinh arcsin arcsinh cos cosh arccos arccosh tan tanh arctan arctanh csc csch arccsc arccsch sec sech arcsec arcsech cot coth arccot arccoth distance for and or not mod iter real imag log ln exp length sign angle",
  autoCommands:
    "sum prod alpha nu beta xi Xi gamma Gamma delta Delta pi Pi epsilon varepsilon rho varrho zeta sigma Sigma eta tau theta vartheta Theta upsilon Upsilon iota phi varphi Phi kappa chi lambda Lambda psi Psi mu omega Omega sqrt nthroot int cross ans dual abs fx fy",
  infixOperatorNames: "mod",
  autoSubscriptNumerals: true,
  disableAutoSubstitutionInSubscripts: true,
  tripleDotsAreEllipsis: true,
  enableDigitGrouping: true,
  spaceBehavesLikeTab: true,
  statelessClipboard: true,
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
