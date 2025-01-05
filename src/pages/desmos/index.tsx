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

  const search = new URLSearchParams(location.search)

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

  gc.setExpression({
    id: "__fractal_explorer_list_fn0",
    latex: "f_{path}\\left(z,0\\right)=z",
  })

  gc.setExpression({
    id: "__fractal_explorer_list_fnn",
    latex:
      "f_{path}\\left(z,n\\right)=f_{path}\\left(\\operatorname{join}\\left(z,f_{eq}\\left(f_{c}\\left(P\\right),z\\left[z.\\operatorname{length}\\right],P\\right)\\right),n-1\\right)",
  })

  if (!gc.getExpressions().some((x) => x.id == "__fractal_explorer_list_p")) {
    gc.setExpression({
      id: "__fractal_explorer_list_p",
      latex: "P=-0.11+0.77i",
      color: "#808080",
      hidden: false,
      dragMode: "XY",
    })
  }

  gc.setExpression({
    id: "__fractal_explorer_list_path",
    latex: "P_{path}=f_{path}\\left(\\left[P\\right],100\\right)",
    color: "#808080",
    lines: true,
  })

  bounds: if (!search.has("desmosState")) {
    const left = +(search.get("left") ?? NaN)
    const top = +(search.get("top") ?? NaN)
    const right = +(search.get("right") ?? NaN)
    const bottom = +(search.get("bottom") ?? NaN)

    if (isNaN(left) || isNaN(top) || isNaN(right) || isNaN(bottom)) {
      break bounds
    }

    gc.setMathBounds({ bottom, left, right, top })
  }

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

  function latexToDesmos(source: string) {
    return source
      .replace(/\\desmos{(.)}/g, "$1")
      .replace(/\\frozenmouse{([^}]+)}/g, "\\left($1\\right)")
      .replace(/\\frozentime{([^}]+)}/g, "\\left($1\\right)")
      .replace(/\\operatorname{unsign}/g, () => {
        gc.setExpression({
          id: "__fractal_explorer_unsign",
          latex:
            "f_{unsign}(z)=\\left|z.\\operatorname{real}\\right|+i\\left|z.\\operatorname{imag}\\right|",
        })
        return "f_{unsign}"
      })
  }

  createEffect(() => {
    gc.setExpression({
      id: "__fractal_explorer_c",
      latex: "f_c\\left(p\\right)=" + latexToDesmos(vars.c()),
      hidden: true,
    })
  })

  createEffect(() => {
    gc.setExpression({
      id: "__fractal_explorer_z",
      latex: "f_z\\left(p\\right)=" + latexToDesmos(vars.z()),
      hidden: true,
    })
  })

  createEffect(() => {
    gc.setExpression({
      id: "__fractal_explorer_f",
      latex: "f_{eq}\\left(c,z,p\\right)=" + latexToDesmos(vars.eq()),
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
