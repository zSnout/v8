import { mq, type V3 } from "@/mathquill"

function EditableMathQuill(props: {
  class?: string | undefined
  initialLatex: string
  ref?(field: V3.EditableMathQuill): void
}) {
  return (
    <div
      class={props.class}
      ref={(el) => {
        const field = mq!.MathField(el, {
          autoOperatorNames:
            "sin sinh asin arcsin cos cosh acos arccos tan tanh atan arctan csc csch acsc arccsc sec sech asec arcsec cot coth acot arccot distance for and",
          autoSubscriptNumerals: true,
          disableAutoSubstitutionInSubscripts: true,
          enableDigitGrouping: true,
          spaceBehavesLikeTab: true,
          statelessClipboard: true,
        })

        props.ref?.(field)
      }}
    >
      {props.initialLatex}
    </div>
  )
}

export function Main() {
  return (
    <>
      <div class="contents text-xl">
        <EditableMathQuill
          class="rounded-lg border border-z px-3 py-2"
          initialLatex="y=ax^2+bx+c"
        />
      </div>
    </>
  )
}
