import type { Operator } from "./parse"

export type Complex = [real: number, imaginary: number]

function multiply([x1, y1]: Complex, [x2, y2]: Complex): Complex {
  //   (x1 + y1i) (x2 + y2i)
  // = (x1 x2 - y1 y2) + (x2 y1 + x1 y2) i
  return [x1 * x2 - y1 * y2, x2 * y1 + x1 * y2]
}

function add([x1, y1]: Complex, [x2, y2]: Complex): Complex {
  return [x1 + x2, y1 + y2]
}

function exp([a, b]: Complex): Complex {
  //    e ^ (a + bi)
  // = (e ^ a) (e ^ bi)
  // = (e ^ a) (cos b + i sin b)

  return [Math.exp(a) * Math.cos(b), Math.exp(a) * Math.sin(b)]
}

export const binary: Record<
  Operator,
  (left: Complex, right: Complex) => Complex
> = {
  "+"(a, b) {
    return add(a, b)
  },

  "-"([x1, y1], [x2, y2]) {
    return [x1 - x2, y1 - y2]
  },

  "*"(a, b) {
    return multiply(a, b)
  },

  "#"([x1, y1], [x2, y2]) {
    return [x1 * x2, y1 * y2]
  },

  "/"([x1, y1], [x2, y2]) {
    //    (x1 + y1i)                           /  (x2 + y2i)
    // = ((x1 + y1i) (x2 - y2i))               / ((x2 + y2i) (x2 - y2i))
    // = ((x1 + y1i) (x2 - y2i))               / (x2 x2 + y2 y2)
    // = ((x1 x2 + y1 y2) + (x2 y1 - x1 y2) i) / (x2 x2 + y2 y2)
    const denom = x2 * x2 + y2 * y2
    return [(x1 * x2 - y1 * y2) / denom, (x2 * y1 + x1 * y2) / denom]
  },

  "^"([a, b], p) {
    // https://math.stackexchange.com/a/9778

    const radius = Math.hypot(a, b)
    const theta = Math.atan2(b, a)

    return exp(multiply([Math.log(radius), theta], p))
  },

  "**"([x1, y1], [x2, y2]) {
    //   (x1 + y1i) (x2 + y2i)
    // = (x1 x2 - y1 y2) + (x2 y1 + x1 y2) i
    return [x1 * x2 - y1 * y2, x2 * y1 + x1 * y2]
  },
}
