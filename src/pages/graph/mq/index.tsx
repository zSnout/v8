import {
  nodeToTree,
  treeToGLSL,
  treeToLatex,
} from "@/components/glsl/math/output"
import { parse } from "@/components/glsl/math/parse"
import { error } from "@/components/result"
import { MQEditable } from "@/mathquill"
import { parseLatex } from "@/mathquill/parse"
import { createMemo, createSignal } from "solid-js"

export function Main() {
  const [latex, setLatex] = createSignal("y=ax^2+bx+c")
  const [plaintext, setPlaintext] = createSignal("y")
  const [mathspeak, setMathspeak] = createSignal("y")
  const [precedence, setPrecedence] = createSignal(-1)
  const [glslTree, setGlslTree] = createSignal({})
  const [glsl, setGlsl] = createSignal("")

  const output = createMemo(() => {
    const value = parseLatex(latex())
    if (value.ok) {
      try {
        const tree = nodeToTree(value.value)
        setGlslTree(tree)
        setGlsl(treeToGLSL(tree))
      } catch (err) {
        setGlslTree(error(err))
      }
    } else {
      setGlslTree({})
    }
    return value
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
            setPlaintext(mq.text())
          }}
          ref={(mq) => {
            setTimeout(() => {
              mq.latex(
                // String.raw`\left(z-m\right)^{2}\times\dual{c}{m}\times\frozenmouse{2+3i}\piecewise{x^{2}-3}{x<4}{\log_{2}x}{4<x\le89}{a}{b}{c}{d}\align{243&3}{43&3^{26^{2^{3^{3}}}}}`,
                String.raw`\align{22267}{&65543}{&23}{4}{&5^{6^{7}}}{}`,
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
          setGlslTree(tree.value)
          setGlsl(treeToGLSL(tree.value))
          const node = treeToLatex(tree.value)
          setPrecedence(node.precedence)
          setLatex(node.value)
        }}
      />

      <div>precedence: {precedence()}</div>
      <div>{latex()}</div>
      <div>{plaintext()}</div>
      <div>{mathspeak()}</div>
      <div>{glsl()}</div>
      <pre class="bg-red-100 text-z dark:bg-red-950">
        {JSON.stringify(glslTree(), undefined, 2)}
      </pre>
      <pre class="bg-blue-100 text-z dark:bg-blue-950">
        {JSON.stringify(output(), undefined, 2)}
      </pre>
    </>
  )
}
