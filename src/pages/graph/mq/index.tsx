import { treeToLatex } from "@/components/glsl/math/output"
import { parse } from "@/components/glsl/math/parse"
import { MQEditable } from "@/mathquill"
import { parseLatex } from "@/mathquill/parse"
import { createMemo, createSignal } from "solid-js"

export function Main() {
  const [latex, setLatex] = createSignal("y=ax^2+bx+c")
  const [mathspeak, setMathspeak] = createSignal("y")
  const [precedence, setPrecedence] = createSignal(-1)
  const [glslTree, setGlslTree] = createSignal({})

  const output = createMemo(() => {
    return parseLatex(latex())
  })

  return (
    <>
      <div class="contents text-xl">
        <MQEditable
          class="z-field rounded-lg border border-z p-0 shadow-none [&_.mq-root-block]:px-3 [&_.mq-root-block]:py-3"
          latex={latex()}
          edit={(mq) => {
            setLatex(mq.latex())
            setMathspeak(mq.mathspeak())
          }}
          ref={(mq) => {
            setTimeout(() => {
              mq.latex(
                "\\left(z-m\\right)^2+c-m\\cross\\dual{c}{m}\\cross\\frozenmouse{2+3i}",
              )
            })
          }}
        />
      </div>

      <input
        type="text"
        class="z-field my-4 rounded-lg border border-z px-3 py-2 font-mono text-xl shadow-none"
        onInput={(event) => {
          const { value } = event.currentTarget
          const tree = parse(value)
          if (!tree.ok) {
            console.error("invalid: " + tree.reason)
            return
          }
          setGlslTree(tree)
          const node = treeToLatex(tree.value)
          setPrecedence(node.precedence)
          setLatex(node.value)
        }}
      />

      <div>precedence: {precedence()}</div>
      <div>{latex()}</div>
      <div>{mathspeak()}</div>
      <pre class="bg-red-100">{JSON.stringify(glslTree(), undefined, 2)}</pre>
      <pre class="bg-blue-100">{JSON.stringify(output(), undefined, 2)}</pre>
    </>
  )
}
