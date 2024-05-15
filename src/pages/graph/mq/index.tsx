import { mq, type V3 } from "@/mathquill"
import { tokenize, tokensToTree } from "@/mathquill/parse"
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
            "sin sinh asin arcsin cos cosh acos arccos tan tanh atan arctan csc csch acsc arccsc sec sech asec arcsec cot coth acot arccot distance for and or not mod iter real imag log ln exp",
          autoCommands:
            "sum prod alpha nu beta xi Xi gamma Gamma delta Delta pi Pi epsilon varepsilon rho varrho zeta sigma Sigma eta tau theta vartheta Theta upsilon Upsilon iota phi varphi Phi kappa chi lambda Lambda psi Psi mu omega Omega sqrt nthroot int cross ans mouse time dual",
          infixOperatorNames: "mod",
          autoSubscriptNumerals: true,
          disableAutoSubstitutionInSubscripts: true,
          tripleDotsAreEllipsis: true,
          enableDigitGrouping: true,
          spaceBehavesLikeTab: true,
          statelessClipboard: true,
          sumStartsWithNEquals: true,
          handlers: props,
          supSubsRequireOperand: true,
          restrictMismatchedBrackets: true,
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
          class="rounded-lg border border-z [&_.mq-root-block]:px-3 [&_.mq-root-block]:py-3"
          initialLatex={latex()}
          edit={(mq) => {
            setLatex(mq.latex())
            setMathspeak(mq.mathspeak())
          }}
          ref={(mq) => {
            setTimeout(() => {
              mq.latex("2+\\mouse+4")
            })
          }}
        />
      </div>

      <div>{latex()}</div>
      <div>{mathspeak()}</div>

      <pre>{JSON.stringify(tokensToTree(tokenize(latex())), undefined, 2)}</pre>
    </>
  )
}
