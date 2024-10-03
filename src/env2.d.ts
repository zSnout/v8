import type { JSX } from "solid-js"
import type { LatexTargetFindEvent } from "./components/graph/latex"

export type CtxCreateMenu = (createMenu: () => JSX.Element) => void
export type CtxEvent = CustomEvent<CtxCreateMenu>

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
      onCtx?: EventHandlerUnion<T, CtxEvent>
      // onConsider?: EventHandlerUnion<T, DndEvent>
      // onFinalize?: EventHandlerUnion<T, DndEvent>
    }

    interface CustomEventHandlersLowerCase<T> {
      onlatextargetfind?: EventHandlerUnion<T, LatexTargetFindEvent>
      onctx?: EventHandlerUnion<T, CtxEvent>
      // onconsider?: EventHandlerUnion<T, DndEvent>
      // onfinalize?: EventHandlerUnion<T, DndEvent>
    }
  }
}
