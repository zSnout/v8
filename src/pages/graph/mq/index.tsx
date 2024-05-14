import { mq, type V3 } from "@/mathquill"
import { createSignal, untrack } from "solid-js"

export function EditableMathQuill(
  props: {
    class?: string | undefined
    initialLatex: string
    ref?(field: V3.EditableMathQuill): void
  } & V3.HandlerOptions,
) {
  return (
    <div
      class={props.class}
      ref={(el) => {
        const field = mq.MathField(el, {
          autoOperatorNames:
            "sin sinh asin arcsin cos cosh acos arccos tan tanh atan arctan csc csch acsc arccsc sec sech asec arcsec cot coth acot arccot distance for and or not mod screen pixel iter",
          autoCommands:
            "sum prod alpha nu beta xi Xi gamma Gamma delta Delta pi Pi epsilon varepsilon rho varrho zeta sigma Sigma eta tau theta vartheta Theta upsilon Upsilon iota phi varphi Phi kappa chi lambda Lambda psi Psi mu omega Omega sqrt nthroot int real imag time mouse",
          infixOperatorNames: "mod",
          autoSubscriptNumerals: true,
          disableAutoSubstitutionInSubscripts: true,
          enableDigitGrouping: true,
          spaceBehavesLikeTab: true,
          statelessClipboard: true,
          sumStartsWithNEquals: true,
          handlers: props,
          supSubsRequireOperand: true,
        })

        props.ref?.(field)
      }}
    >
      {untrack(() => props.initialLatex)}
    </div>
  )
}

export function Main() {
  const [latex, setLatex] = createSignal("y=ax^2+bx+c")
  const [mathspeak, setMathspeak] = createSignal("y")

  return (
    <>
      <div class="contents text-xl">
        <EditableMathQuill
          class="rounded-lg border border-z px-3 py-2"
          initialLatex={latex()}
          edit={(mq) => {
            setLatex(mq.latex())
            setMathspeak(mq.mathspeak())
          }}
        />
      </div>

      <div>{latex()}</div>
      <div>{mathspeak()}</div>
    </>
  )
}
