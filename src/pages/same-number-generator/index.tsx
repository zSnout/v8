import { IntegratedField } from "@/learn/el/IntegratedField"
import { create } from "random-seed"
import { createMemo, createSignal, Index } from "solid-js"

export function Main() {
  const [pwd, setPwd] = createSignal("")
  const [min_, setMin] = createSignal(1)
  const [max_, setMax] = createSignal(10)

  const [items, setItems] = createSignal<number>(200)
  const data = createMemo(() => {
    const min = min_()
    const max = max_()
    const minSeed = create("" + min).intBetween(0, 0xffffff)
    const maxSeed = create("" + max).intBetween(0, 0xffffff)
    const gen = create(pwd() + minSeed * maxSeed)
    const gen2 = create(pwd() + minSeed * maxSeed)
    return Array.from({ length: items() }, () => {
      const int = gen.intBetween(min, max)
      return {
        int,
        text: Array<void>(int.toString().length)
          .fill()
          .map(() => {
            const val = gen2.intBetween(0, 35)

            if (val > 9) {
              if (gen2.intBetween(0, 1)) {
                return val.toString(36).toUpperCase()
              } else {
                return val.toString(36).toLowerCase()
              }
            }

            return val.toString(36)
          })
          .join(""),
      }
    })
  })

  return (
    <div>
      <div class="mb-4 grid grid-cols-3 gap-2">
        <IntegratedField
          label="Min"
          onInput={(e) => setMin(+e)}
          rtl={false}
          type="number"
          value={min_().toString()}
        />
        <IntegratedField
          label="Max"
          onInput={(e) => setMax(+e)}
          rtl={false}
          type="number"
          value={max_().toString()}
        />
        <IntegratedField
          label="Password"
          onInput={(e) => setPwd(e)}
          rtl={false}
          type="password"
          value={pwd()}
        />
      </div>
      <table class="w-full list-inside list-[leading-zero] marker:min-w-8 marker:font-mono marker:text-sm marker:text-z-dimmed">
        <tbody>
          <Index each={data()}>
            {(data, index) => (
              <tr>
                <td class="w-8 text-sm text-z-dimmed">{index + 1}.</td>
                <td class="pr-2 text-right font-mono">{data().int}</td>
                <td class="pl-2 font-mono">{data().text}</td>
              </tr>
            )}
          </Index>
        </tbody>
      </table>
    </div>
  )
}
