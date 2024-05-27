// @ts-check

import type { JSX } from "solid-js"

/** The global MathQuill object */
export declare interface MathQuill {
  getInterface(version: 1): V1.API
  getInterface(version: 2): V1.API
  getInterface(version: 3): V3.API
}

export declare type Direction = -1 | 1

export declare namespace V3 {
  type HandlersWithDirection = V1.HandlersWithDirection
  type HandlersWithoutDirection = V1.HandlersWithoutDirection
  type HandlerOptions = V1.HandlerOptions<BaseMathQuill>
  type EmbedOptions = V1.EmbedOptions
  type EmbedOptionsData = V1.EmbedOptionsData

  type SpecializableLetter = "m" | "t"

  type Config = Omit<V1.Config, "substituteKeyboardEvents" | "handlers"> & {
    handlers?: HandlerOptions
    specializedLetters?: SpecializedLetters
  }

  interface BaseMathQuill {
    id: number
    data: { [key: string]: any }
    config(opts: Config): BaseMathQuill
    revert: () => HTMLElement
    latex(latex: string): BaseMathQuill
    latex(): string
    reflow: () => void
    el: () => HTMLElement
    getAriaLabel(): string
    setAriaLabel(str: string): BaseMathQuill
    html: () => string
    mathspeak: () => string
    text(): string
  }

  interface EditableMathQuill {
    id: number
    data: { [key: string]: any }
    revert: () => HTMLElement
    config(opts: Config): EditableMathQuill
    latex(latex: string): EditableMathQuill
    latex(): string
    reflow: () => void
    el: () => HTMLElement
    getAriaLabel(): string
    setAriaLabel(str: string): EditableMathQuill
    html: () => string
    mathspeak: () => string
    text(): string
    selection(): {
      latex: string
      startIndex: number
      endIndex: number
    }

    select: () => EditableMathQuill
    moveToRightEnd: () => EditableMathQuill
    moveToLeftEnd: () => EditableMathQuill
    cmd: (latex: string) => EditableMathQuill
    write: (latex: string) => EditableMathQuill
    keystroke: (key: string, evt?: KeyboardEvent) => EditableMathQuill
    typedText: (text: string) => EditableMathQuill
    clearSelection: () => EditableMathQuill
    blur: () => EditableMathQuill
    focus: () => EditableMathQuill
    getAriaPostLabel: () => string
    setAriaPostLabel: (str: string, timeout?: number) => EditableMathQuill
    ignoreNextMousedown: (func: () => boolean) => EditableMathQuill
    clickAt: (x: number, y: number, el: HTMLElement) => EditableMathQuill
    dropEmbedded: (x: number, y: number, data: EmbedOptions) => void
  }

  interface API {
    (el: HTMLElement): BaseMathQuill | null

    StaticMath(el: null | undefined): null
    StaticMath(el: HTMLElement, config?: Config): BaseMathQuill

    MathField(el: null | undefined): null
    MathField(el: HTMLElement, config?: Config): EditableMathQuill

    InnerMathField(el: null | undefined): null
    InnerMathField(el: HTMLElement, config?: Config): EditableMathQuill

    TextField?: {
      (el: null | undefined): null
      (el: HTMLElement, config?: Config): EditableMathQuill
    }

    L: -1
    R: 1
    config(options: Config): void
    registerEmbed(
      name: string,
      options: (data: V1.EmbedOptionsData) => V1.EmbedOptions,
    ): void
  }
}

export declare namespace V1 {
  interface Config<$ = DefaultJquery> {
    ignoreNextMousedown?: (_el: MouseEvent) => boolean
    substituteTextarea?: () => HTMLElement
    substituteKeyboardEvents?: (
      textarea: $,
      controller: unknown,
    ) => {
      select: (text: string) => void
    }

    restrictMismatchedBrackets?: boolean | "none"
    typingSlashCreatesNewFraction?: boolean
    charsThatBreakOutOfSupSub?: string
    sumStartsWithNEquals?: boolean
    autoSubscriptNumerals?: boolean
    supSubsRequireOperand?: boolean
    spaceBehavesLikeTab?: boolean
    typingAsteriskWritesTimesSymbol?: boolean
    typingSlashWritesDivisionSymbol?: boolean
    typingPercentWritesPercentOf?: boolean
    resetCursorOnBlur?: boolean | undefined
    leftRightIntoCmdGoes?: "up" | "down"
    enableDigitGrouping?: boolean
    tripleDotsAreEllipsis?: boolean
    mouseEvents?: boolean
    maxDepth?: number
    disableCopyPaste?: boolean
    statelessClipboard?: boolean
    onPaste?: () => void
    onCut?: () => void
    overrideTypedText?: (text: string) => void
    overrideKeystroke?: (key: string, event: KeyboardEvent) => void
    autoOperatorNames?: string
    infixOperatorNames?: string
    autoCommands?: string
    logAriaAlerts?: boolean
    autoParenthesizedFunctions?: string
    quietEmptyDelimiters?: string
    disableAutoSubstitutionInSubscripts?: boolean
    interpretTildeAsSim?: boolean
    handlers?: HandlerOptions<BaseMathQuill<$>>
  }

  interface Handler<MQClass> {
    (mq: MQClass): void
    (dir: Direction, mq: MQClass): void
  }

  type HandlersWithDirection = "moveOutOf" | "deleteOutOf" | "selectOutOf"
  type HandlersWithoutDirection =
    | "reflow"
    | "enter"
    | "upOutOf"
    | "downOutOf"
    | "edited"
    | "edit"
  type HandlerOptions<MQClass = unknown> = Partial<
    {
      [K in HandlersWithDirection]: (dir: Direction, mq: MQClass) => void
    } & {
      [K in HandlersWithoutDirection]: (mq: MQClass) => void
    }
  >
  type HandlerName = keyof HandlerOptions

  interface BaseMathQuill<$ = DefaultJquery> {
    id: number
    data: { [key: string]: any }
    revert: () => $
    latex(latex: string): void
    latex(): string
    reflow: () => void
    el: () => HTMLElement
    getAriaLabel: () => string
    setAriaLabel: (str: string) => void
    html: () => string
    mathspeak: () => string
    text(): string
  }

  interface EditableMathQuill extends BaseMathQuill {
    select: () => void
    moveToRightEnd: () => void
    cmd: (latex: string) => void
    write: (latex: string) => void
    keystroke: (key: string, evt?: KeyboardEvent) => void
    typedText: (text: string) => void
    clearSelection: () => void
    blur: () => void
    focus: () => void
    getAriaPostLabel: () => string
    setAriaPostLabel: (str: string, timeout?: number) => void
    ignoreNextMousedown: (func: () => boolean) => void
    clickAt: (x: number, y: number, el: HTMLElement) => void
  }

  interface EmbedOptions {
    latex?: () => string
    text?: () => string
    htmlString?: string
  }
  type EmbedOptionsData = any

  interface API {
    (el: HTMLElement): BaseMathQuill | null

    StaticMath(el: null | undefined): null
    StaticMath(el: HTMLElement, config?: Config): BaseMathQuill

    MathField(el: null | undefined): null
    MathField(el: HTMLElement, config?: Config): EditableMathQuill

    InnerMathField(el: null | undefined): null
    InnerMathField(el: HTMLElement, config?: Config): EditableMathQuill

    TextField?: {
      (el: null | undefined): null
      (el: HTMLElement, config?: Config): EditableMathQuill
    }

    L: -1
    R: 1
    config(options: Config): void
    registerEmbed(
      name: string,
      options: (data: EmbedOptionsData) => EmbedOptions,
    ): void
  }
}

export declare interface DefaultJquery {
  (el: HTMLElement): DefaultJquery
  length: number
  [index: number]: HTMLElement | undefined
}

export declare var LatexCmds: Record<
  string,
  | (new (...args: any[]) => { domView: DOMView })
  | ((...args: any[]) => { domView: DOMView })
>

export declare class NodeBase {}

export declare class MQNode extends NodeBase {
  domView: DOMView
  ctrlSeq: string
  textTemplate: string[]
  mathspeakTemplate: string[]
  mathspeak(opts?: any)
  getEnd(end: number): any
  adopt(parent: MQNode, leftward: MQNode | 0, rightward: MQNode | 0): void
}

export interface LatexRecursiveContext {
  latex: string
}

export declare class MathElement extends MQNode {
  latexRecursive(ctx: LatexRecursiveContext): void
  checkCursorContextOpen(ctx: LatexRecursiveContext): void
  checkCursorContextClose(ctx: LatexRecursiveContext): void
}

export declare class MathCommand extends MathElement {
  constructor(ctrlSeq: string, domView: DOMView, textTemplate: string[])
  setCtrlSeqHtmlAndText(
    ctrlSeq: string,
    domView: DOMView,
    textTemplate: string[],
  ): void
  upInto: unknown
  downInto: unknown
  blocks: MathBlock[]
  _el: HTMLElement | SVGElement
  numBlocks(): number
}

export declare class MQSymbol extends MathCommand {
  constructor(
    latex: string,
    html: JSX.Element,
    text: string,
    mathspeak?: string,
  )

  domView: DOMView
}

export declare class MathBlock extends MathElement {
  __blockTag: "block"
  domFrag(): DOMFragment
}

export declare var getInterface: MathQuill["getInterface"]

export declare class DOMView {
  constructor(children: 0, contents: (blocks: []) => JSX.Element)
  constructor(children: 1, contents: (blocks: [MathBlock]) => JSX.Element)
  constructor(
    children: 2,
    contents: (blocks: [MathBlock, MathBlock]) => JSX.Element,
  )
  constructor(
    children: 3,
    contents: (blocks: [MathBlock, MathBlock, MathBlock]) => JSX.Element,
  )
  constructor(
    children: 4,
    contents: (
      blocks: [MathBlock, MathBlock, MathBlock, MathBlock],
    ) => JSX.Element,
  )
  constructor(children: number, contents: (blocks: MathBlock[]) => JSX.Element)

  childCount: number
  render: (blocks: MathBlock[]) => HTMLElement | SVGElement
}

export declare class Variable extends MQSymbol {}

export declare class Letter extends Variable {
  constructor(letter: string)

  domView: DOMView
  domFrag(): DOMFragment
  italicize(isItalic: boolean): void
}

export declare class DOMFragment {
  toggleClass(name: string, active: boolean): void
  addClass(name: string): void
}

export declare var SVG_SYMBOLS: {
  sqrt: { width: string; html: () => JSX.Element }
  "|": { width: string; html: () => JSX.Element }
  "[": { width: string; html: () => JSX.Element }
  "]": { width: string; html: () => JSX.Element }
  "(": { width: string; html: () => JSX.Element }
  ")": { width: string; html: () => JSX.Element }
  "{": { width: string; html: () => JSX.Element }
  "}": { width: string; html: () => JSX.Element }
  "&#8741;": { width: string; html: () => JSX.Element }
  "&lang;": { width: string; html: () => JSX.Element }
  "&rang;": { width: string; html: () => JSX.Element }
}

export declare var U_ZERO_WIDTH_SPACE: string

export declare var L: number

export declare var R: number

export declare var h: {
  <K extends keyof HTMLElementTagNameMap>(
    type: K,
    attribute: object,
    children?: JSX.Element[],
  ): HTMLElementTagNameMap[K]
  <K extends "path" | "svg">(
    type: K,
    attribute: object,
    children?: JSX.Element[],
  ): SVGElementTagNameMap[K]
  (type: string, attribute: object, children?: JSX.Element[]): JSX.Element
  block(type: string, attribute: object, block: MathBlock): JSX.Element
  text(text: string): JSX.Element
}

// FIXME: give this a better type
export declare var latexMathParser: any
