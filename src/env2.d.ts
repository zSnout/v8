import { DndEvent } from "solid-dnd-directive"
import { LatexTargetFindEvent } from "./components/graph/latex"

declare module "solid-js" {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface DOMAttributes<T> {
      "data-latex"?:
        | "leaf" // used on numbers, symbol, etc.
        | "shape" // used on radical signs and brackets
        | "group" // used on empty spaces which contains other symbols

      "data-latex-ignore"?: boolean // makes children not be considered targets
    }

    interface CustomEventHandlersCamelCase<T> {
      onLatexTargetFind?: EventHandlerUnion<T, LatexTargetFindEvent>
    }

    interface CustomEventHandlersLowerCase<T> {
      onlatextargetfind?: EventHandlerUnion<T, LatexTargetFindEvent>
      onconsider?: EventHandlerUnion<T, DndEvent>
      onfinalize?: EventHandlerUnion<T, DndEvent>
    }
  }
}

declare module "solid-dnd-directive" {
  interface DndItem {
    id: number | string
    isDndShadowItem?: boolean
    [x: string]: unknown
  }

  type DndEvent = CustomEvent<{ items: DndItem[] }>
}