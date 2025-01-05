import "https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"

import { WebGLNoSquareCoordinateCanvas } from "@/components/glsl/canvas/coordinate"
import { createDesmosToFractalConverter } from "@/components/glsl/math/output"
import { unwrap } from "@/components/result"
import { Portal } from "solid-js/web"
import { Main as MainDefault } from "../fractal-explorer"

export function Main() {
  let gl: WebGLNoSquareCoordinateCanvas | undefined

  const desmosEl = (<div class="fixed inset-0" />) as HTMLDivElement

  const gc = Desmos.GraphingCalculator(desmosEl, { border: false })

  const [clearConverter, treeToGlsl, fragPragma] =
    createDesmosToFractalConverter(gc, () => gl)

  const canvas = (
    <MainDefault
      createCanvas={(el) => {
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
      }}
      treeToGlsl={{ desmosNodeToGlsl: treeToGlsl }}
      fragMods={fragPragma()}
    />
  )

  return (
    <div>
      {desmosEl}

      <Portal mount={desmosEl.querySelector(".dcg-grapher")!}>
        <div class="absolute inset-0 size-full mix-blend-multiply">
          {canvas}
        </div>
      </Portal>
    </div>
  )
}
