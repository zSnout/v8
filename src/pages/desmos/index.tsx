import "https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"

import { WebGLNoSquareCoordinateCanvas } from "@/components/glsl/canvas/coordinate"
import { createDesmosNodeToGlsl } from "@/components/glsl/math/output"
import { unwrap } from "@/components/result"
import { createSearchParam } from "@/components/search-params"
import { createEffect } from "solid-js"
import { Portal } from "solid-js/web"
import { MainInner } from "../fractal-explorer"

export function Main() {
  let gl: WebGLNoSquareCoordinateCanvas | undefined

  const desmosEl = (<div class="fixed inset-0" />) as HTMLDivElement

  const gc = Desmos.GraphingCalculator(desmosEl, {
    border: false,
    // @ts-expect-error bad typings
    complex: true,
  })

  const [state, setState] = createSearchParam(
    "desmosState",
    JSON.stringify(gc.getState()),
  )

  gc.setState(JSON.parse(state()))

  gc.observeEvent("change", () => setState(JSON.stringify(gc.getState())))

  const [clearConverter, treeToGlsl, fragPragma] = createDesmosNodeToGlsl(
    gc,
    () => gl,
  )

  const { el: canvas, vars } = MainInner({
    createCanvas(el) {
      const local = (gl = unwrap(
        WebGLNoSquareCoordinateCanvas.of(
          el,
          gc.graphpaperBounds.mathCoordinates,
        ),
      ))

      gc.observe("graphpaperBounds", () =>
        local.setCoords(gc.graphpaperBounds.mathCoordinates),
      )

      return gl
    },
    treeToGlsl: { desmosNodeToGlsl: treeToGlsl },
    get fragMods() {
      return fragPragma()
    },
    beforeTreeToGlsl: clearConverter,
  })

  createEffect(() => {
    gc.setExpression({
      id: "__fractal_explorer_c",
      latex: "f_c\\left(p\\right)=" + vars.c(),
      hidden: true,
    })
  })

  createEffect(() => {
    gc.setExpression({
      id: "__fractal_explorer_z",
      latex: "f_z\\left(p\\right)=" + vars.z(),
      hidden: true,
    })
  })

  createEffect(() => {
    gc.setExpression({
      id: "__fractal_explorer_f",
      latex:
        "f_{eq}\\left(c,z,p\\right)=" +
        vars.eq().replace(/\\desmos{(.)}/g, "$1"),
      hidden: true,
    })
  })

  const mount = desmosEl.querySelector(".dcg-grapher")!

  for (const child of mount.children) {
    ;(child as HTMLElement).style.zIndex = "10"
    const position = (child as HTMLElement).computedStyleMap().get("position")
    if (position == null || position == "static") {
      ;(child as HTMLElement).style.position = "relative"
    }
  }

  return (
    <div>
      {desmosEl}

      <Portal mount={mount}>
        <div class="absolute inset-0 size-full">{canvas}</div>
      </Portal>
    </div>
  )
}
