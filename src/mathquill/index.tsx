import { Fa } from "@/components/Fa"
import {
  IconDefinition,
  faClock,
  faMousePointer,
  faSliders,
} from "@fortawesome/free-solid-svg-icons"
import "./mathquill.css"
import { DOMView, LatexCmds, Letter, getInterface } from "./mathquill.js"
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

export const mq = getInterface(3)
