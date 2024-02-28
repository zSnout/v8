import { Index, Show, createSignal } from "solid-js"

function floor(x: number) {
  if (x < 10) {
    const whole = Math.floor(x)
    const frac = Math.floor((Math.floor(x * 100) / 100 - whole) * 100) / 100

    return (
      <span>
        {whole}
        <span class="opacity-30">{frac.toString().slice(1)}</span>
      </span>
    )
  }

  if (x < 100) {
    const whole = Math.floor(x)
    const frac = Math.floor((Math.floor(x * 10) / 10 - whole) * 10) / 10

    return (
      <span>
        {whole}
        <span class="opacity-30">{frac.toString().slice(1)}</span>
      </span>
    )
  }

  return <span>{Math.floor(x)}</span>
}

const labels = {
  3: "thousand",
  6: "million",
  9: "billion",
  12: "trillion",
  15: "quadrillion",
  18: "quintillion",
  21: "sextillion",
  24: "septillion",
  27: "octillion",
  30: "nonillion",
  33: "decillion",
} as Record<number, string>

function Display(props: { die: number | "" }) {
  if (props.die == "") {
    return <span class="text-center">⋯</span>
  }

  const die = Math.abs(Math.floor(props.die))

  if (die < 1_000) {
    return die
  }

  const power = Math.floor(Math.log10(die) / 3) * 3
  const low = 10 ** power

  const label = {
    3: "thousand",
    6: "million",
    9: "billion",
    12: "trillion",
    15: "quadrillion",
    18: "quintillion",
    21: "sextillion",
    24: "septillion",
    27: "octillion",
    30: "nonillion",
    33: "decillion",
  }[power]

  return (
    <div class="flex flex-col items-center">
      <span class="text-xl">{floor(die / low)}</span>

      {label ? (
        <span class="text-sm">{label}</span>
      ) : (
        <span class="text-sm">
          × 10<sup>{power}</sup>
        </span>
      )}
    </div>
  )
}

function choose() {
  return Math.floor(1 / (1 - Math.random()))
}

export function Main() {
  const [canRoll, setCanRoll] = createSignal(true)

  const [dice, setDice] = createSignal<readonly (number | "")[]>([
    "",
    "",
    "",
    "",
    "",
  ])

  return (
    <div class="flex w-full flex-col">
      <div class="mt-4 flex flex-wrap justify-center gap-2">
        <Index each={dice()}>
          {(die) => (
            <div class="z-field flex h-20 w-20 items-center justify-center text-3xl font-light">
              {(die(), (<Display die={die()} />))}
            </div>
          )}
        </Index>
      </div>

      <button
        disabled={!canRoll()}
        class="z-field mx-auto mt-8"
        onClick={() => {
          if (!canRoll()) {
            return
          }

          setCanRoll(false)

          const count = dice().length
          const time = 1000
          const start = Date.now()

          const interval = setInterval(() => {
            if (Date.now() - start > time) {
              clearInterval(interval)
              setCanRoll(true)
            }

            setDice(Array(count).fill(0).map(choose))
          })
        }}
      >
        Reroll dice...
      </button>
    </div>
  )
}
