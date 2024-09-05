export class BigMaybeHalf {
  constructor(
    readonly value: bigint,
    readonly isOverTwo = false,
  ) {}

  toString(maxDigits = 6): string {
    let value = this.value

    if (this.isOverTwo) {
      value /= 2n
    }

    const isHalf = this.isOverTwo && this.value % 2n == 1n

    const str = value.toString()
    if (str.length + +isHalf <= maxDigits) {
      if (isHalf) {
        return str + ".5"
      } else {
        return str
      }
    }

    const neg = value < 0n ? "-" : ""
    const abs = value < 0n ? -value : value
    const digits = abs.toString()
    return `${neg}${digits[0]}.${digits[1]}e${digits.length - 1}`
  }
}
