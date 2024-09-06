export class BigMaybeHalf {
  constructor(
    readonly value: bigint,
    readonly isOverTwo = false,
  ) {}

  toString(maxDigits = 6, expDigits = 1): string {
    let value = this.value

    const neg = value < 0n ? "-" : ""

    if (this.isOverTwo) {
      value /= 2n
    }

    const isHalf = this.isOverTwo && this.value % 2n != 0n
    const abs = value < 0n ? -value : value

    const str = abs.toString()
    if (str.length + neg.length + +isHalf <= maxDigits) {
      if (isHalf) {
        return neg + str + ".5"
      } else {
        return neg + str
      }
    }

    return `${neg}${str[0]}.${str.slice(1, 1 + expDigits)}e${str.length - 1}`
  }
}
