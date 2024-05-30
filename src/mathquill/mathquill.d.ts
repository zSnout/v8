import type { JSX } from "solid-js"

/** The global MathQuill object */
export interface MathQuill {
  getInterface(version: 1): V1.API
  getInterface(version: 2): V1.API
  getInterface(version: 3): V3.API
}

export type Direction = -1 | 1

export namespace V3 {
  type HandlersWithDirection = V1.HandlersWithDirection
  type HandlersWithoutDirection = V1.HandlersWithoutDirection
  type HandlerOptions = V1.HandlerOptions<BaseMathQuill>
  type EmbedOptions = V1.EmbedOptions
  type EmbedOptionsData = V1.EmbedOptionsData

  type Config = Omit<V1.Config, "substituteKeyboardEvents" | "handlers"> & {
    handlers?: HandlerOptions
    customCharacters?: string | readonly string[]
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

export namespace V1 {
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
    prefixOperatorNames?: string
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

export interface DefaultJquery {
  (el: HTMLElement): DefaultJquery
  length: number
  [index: number]: HTMLElement | undefined
}

export var LatexCmds: Record<string, new (...args: any[]) => MQNode>
export var CharCmds: Record<string, new (...args: any[]) => MQNode>

export class NodeBase {
  parser(): Parser<this>
  isEmpty(): boolean
}

export type VertOutOf = MQNode | true

export interface MathspeakOptions {
  createdLeftOf?: Cursor
  ignoreShorthand?: boolean
}

export class MQNode extends NodeBase {
  [L]: MQNode | 0;
  [R]: MQNode | 0
  parent: MQNode | undefined
  domView: DOMView
  ctrlSeq: string
  textTemplate: string[]
  mathspeakTemplate: string[]
  mathspeak(opts?: MathspeakOptions): string
  getEnd(end: Direction): MQNode | 0
  children(): Fragment
  html(): void
  adopt(parent: MQNode, leftward: MQNode | 0, rightward: MQNode | 0): MQNode | 0
  upOutOf?: VertOutOf | ((cursor: Cursor) => VertOutOf)
  downOutOf?: VertOutOf | ((cursor: Cursor) => VertOutOf)
  moveOutOf(
    direction: Direction,
    cursor: Cursor,
    updown: "up" | "down" | undefined,
  ): void
  moveTowards(
    direction: Direction,
    cursor: Cursor,
    updown: "up" | "down" | undefined,
  ): void
  createDir(direction: Direction, cursor: Cursor): void
  createLeftOf(cursor: Cursor): void
  deleteOutOf(direction: Direction, cursor: Cursor): void
  deleteTowards(direction: Direction, cursor: Cursor): void
  unselectInto(direction: Direction, cursor: Cursor): void
  selectOutOf(direction: Direction, cursor: Cursor): void
  selectTowards(direction: Direction, cursor: Cursor): void
  ariaLabel: string
  domFrag(): DOMFragment
}

export interface LatexRecursiveContext {
  latex: string
}

export class MathElement extends MQNode {
  latexRecursive(ctx: LatexRecursiveContext): void
  checkCursorContextOpen(ctx: LatexRecursiveContext): void
  checkCursorContextClose(ctx: LatexRecursiveContext): void
}

export class MathCommand extends MathElement {
  constructor(ctrlSeq?: string, domView?: DOMView, textTemplate?: string[])
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
  finalizeTree?(): void
  moveTowards(
    dir: Direction,
    cursor: Cursor,
    updown: "up" | "down" | undefined,
  ): void
}

export class MQSymbol extends MathCommand {
  constructor(
    latex: string,
    html: JSX.Element,
    text: string,
    mathspeak?: string,
  )

  domView: DOMView
}

export class MathBlock extends MathElement {
  __blockTag: "block"
  domFrag(): DOMFragment
}

export var getInterface: MathQuill["getInterface"]

export class DOMView {
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

export class Variable extends MQSymbol {}

export class Letter extends Variable {
  constructor(letter: string)

  domView: DOMView
  domFrag(): DOMFragment
  italicize(isItalic: boolean): void
}

export class DOMFragment {
  constructor(left: Element | undefined, right: Element | undefined)
  toggleClass(name: string, active: boolean): void
  addClass(name: string): void
  insDirOf(dir: Direction, frag: DOMFragment): void
  ends?: { [L]: Element; [R]: Element }
}

export var SVG_SYMBOLS: {
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

export var U_ZERO_WIDTH_SPACE: string

export var L: -1

export var R: 1

export var h: {
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

export var latexMathParser: Parser<MathBlock> & {
  subBlock: Parser<MathBlock>
}

export type UnknownParserResult = any

export type ParserBody<T> = (
  stream: string,
  onSuccess: (stream: string, result: T) => UnknownParserResult,
  onFailure: (stream: string, msg: string) => UnknownParserResult,
) => T

export class Parser<T> {
  _: ParserBody<T>

  constructor(body: ParserBody<T>)

  parse(stream: unknown): T
  or<Q>(alternative: Parser<Q>): Parser<T | Q>
  then<Q>(next: Parser<Q> | ((result: T) => Parser<Q>)): Parser<Q>
  many(): Parser<T[]>
  times(min: number, max?: number): Parser<T[]>
  result<Q>(res: Q): Parser<Q>
  atMost(n: number): Parser<T[]>
  atLeast(n: number): Parser<T[]>
  map<Q>(fn: (result: T) => Q): Parser<Q>
  skip<Q>(two: Parser<Q>): Parser<T>

  static string(str: string): Parser<string>
  static regex(re: RegExp): Parser<string>
  static succeed<Q>(result: Q): Parser<Q>
  static fail(msg: string): Parser<never>

  static letter: Parser<string>
  static letters: Parser<string>
  static digit: Parser<string>
  static digits: Parser<string>
  static whitespace: Parser<string>
  static optWhitespace: Parser<string>

  static any: Parser<string>
  static all: Parser<string>
  static eof: Parser<string>
}

export var bindBinaryOperator: {
  (
    ctrlSeq?: string,
    htmlEntity?: string,
    text?: string,
    mathspeak?: string,
  ): new () => MQNode
}

export type NodeRef = MQNode | 0

export class Point {
  static copy(pt: Point): Point

  [L]: NodeRef;
  [R]: NodeRef
  parent: MQNode

  constructor(parent: MQNode, leftward: NodeRef, rightward: NodeRef)
  init(parent: MQNode, leftward: NodeRef, rightward: NodeRef): void
}

export class Cursor extends Point {
  controller: Controller
  parent: MQNode
  options: CursorOptions

  /** Slightly more than just a "cache", this remembers the cursor's position in each block node, so that we can return to the right
   * point in that node when moving up and down among blocks.
   */
  upDownCache: Record<number | string, Point | undefined>
  blink: () => void
  private readonly cursorElement
  private _domFrag
  selection: MQSelection | undefined
  intervalId: number
  anticursor: Anticursor | undefined

  constructor(
    initParent: MQNode,
    options: CursorOptions,
    controller: Controller,
  )

  setDOMFrag(frag: DOMFragment): this

  domFrag(): DOMFragment

  show(): this
  hide(): this
  withDirInsertAt(
    dir: Direction,
    parent: MQNode,
    withDir: NodeRef,
    oppDir: NodeRef,
  ): void
  /** Place the cursor before or after `el`, according the side specified by `dir`. */
  insDirOf(dir: Direction, el: MQNode): this
  insLeftOf(el: MQNode): this
  insRightOf(el: MQNode): this

  /** Place the cursor inside `el` at either the left or right end, according the side specified by `dir`. */
  insAtDirEnd(dir: Direction, el: MQNode): this
  insAtLeftEnd(el: MQNode): this
  insAtRightEnd(el: MQNode): this

  /**
   * jump up or down from one block Node to another:
   * - cache the current Point in the node we're jumping from
   * - check if there's a Point in it cached for the node we're jumping to
   *   + if so put the cursor there,
   *   + if not seek a position in the node that is horizontally closest to
   *     the cursor's current position
   */
  jumpUpDown(from: MQNode, to: MQNode): void
  getBoundingClientRectWithoutMargin(): { left: number; right: number }
  unwrapGramp(): void
  startSelection(): void
  endSelection(): void
  select(): boolean
  resetToEnd(controller: ControllerBase): void
  clearSelection(): this
  deleteSelection(): void
  replaceSelection(): MQSelection | undefined
  depth(): number
  isTooDeep(offset?: number): boolean

  // can be overridden
  selectionChanged(): void
}

export type Controller = unknown
export type CursorOptions = unknown
export type MQSelection = unknown
export type Anticursor = unknown
export type ControllerBase = unknown

export class Fragment {
  ends: {
    [L]: MQNode | 0
    [R]: MQNode | 0
  }

  constructor(withDir: MQNode | 0, oppDir: MQNode | 0, dir: Direction)

  domFrag(): DOMFragment
  adopt(parent: MQNode, leftward: MQNode | 0, rightward: MQNode | 0): MQNode
  disown(): Fragment
  remove(): Fragment
  each(fn: (node: MQNode) => void): void
}
