import "./a1"
import { mq } from "./a2"
import "./mathquill.postcss"

function MathField(props: {
  value: string
  onInput?: (value: string) => void
}) {
  return (
    <div
      class="w-full p-4 text-xl"
      ref={(el) => {
        const field = mq.MathField(el, {
          autoSubscriptNumerals: true,
        })
        field.latex(props.value)
        const el2 = field.el()
        console.log(el2)
      }}
    ></div>
  )
}

export function Main() {
  return (
    <>
      <div class="flex flex-col bg-red-50 p-0 *:!text-black">
        <MathField value="y=\int_{-2}^{1}x^2 dx" />
      </div>
    </>
  )
}
