import { DndEvent, SHADOW_ITEM_MARKER_PROPERTY_NAME } from "solid-dnd-directive"
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
      onConsider?: EventHandlerUnion<T, DndEvent>
      onFinalize?: EventHandlerUnion<T, DndEvent>
    }

    interface CustomEventHandlersLowerCase<T> {
      onlatextargetfind?: EventHandlerUnion<T, LatexTargetFindEvent>
      onconsider?: EventHandlerUnion<T, DndEvent>
      onfinalize?: EventHandlerUnion<T, DndEvent>
    }
  }
}

declare module "solid-dnd-directive" {
  type DndItemExtends = Partial<
    Record<typeof SHADOW_ITEM_MARKER_PROPERTY_NAME, boolean | undefined>
  >

  interface DndItem extends DndItemExtends {
    id: number | string
    [x: string]: unknown
  }

  type DndEvent = CustomEvent<{ items: DndItem[] }>
}
