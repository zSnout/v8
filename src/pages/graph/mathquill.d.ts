declare module "mathquill" {
  export interface IMathFieldConfig {
    spaceBehavesLikeTab?: boolean
    leftRightIntoCmdGoes?: "up" | "down"
    restrictMismatchedBrackets?: boolean
    sumStartsWithNEquals?: boolean
    supSubsRequireOperand?: boolean
    charsThatBreakOutOfSupSub?: string
    autoSubscriptNumerals?: boolean
    autoCommands?: string
    autoOperatorNames?: string
    substituteTextarea?: () => void
    handlers?: {
      deleteOutOf?: (direction: Direction, mathField: MathField) => void
      moveOutOf?: (direction: Direction, mathField: MathField) => void
      selectOutOf?: (direction: Direction, mathField: MathField) => void
      downOutOf?: (mathField: MathField) => void
      upOutOf?: (mathField: MathField) => void
      edit?: (mathField: MathField) => void
      enter?: (mathField: MathField) => void
    }
  }

  export enum Direction {
    R,
    L,
  }

  export interface MathField {
    el(): HTMLElement
    cmd(latex: string): void
    latex(latex: string): void
    latex(): string
    focus(): void
    select(): void
    revert(): void
    reflow(): void
    blur(): void
    write(latex: string): void
    clearSelection(): void
    moveToLeftEnd(): void
    moveToRightEnd(): void
    moveToDirEnd(direction: Direction): void
    keystroke(keys: string): void
    typedText(text: string): void
    config(newConfig: IMathFieldConfig): void
  }

  export declare interface MQ {
    StaticMath: (html_element: any) => MathField
    MathField: (html_element: any, config?: IMathFieldConfig) => MathField
  }

  export declare interface MathQuillType {
    getInterface: (n: 2) => MQ
  }

  global {
    declare const MathQuill: MathQuillType
  }

  export default MathQuill
}
