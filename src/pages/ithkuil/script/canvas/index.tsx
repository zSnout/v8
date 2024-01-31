// export function scriptify(
//   [x1, y1]: [x: number, y: number],
//   [x2, y2]: [x: number, y: number],
// ): string {
//   let lft
//   let top
//   let rht
//   let btm

//   if (y1 < y2) {
//     top = [x1 + 4.4, y1 - 5.6]
//     btm = [x2 - 4.4, y2 + 5.6]
//   } else {
//     top = [x2 + 4.4, y2 - 5.6]
//     btm = [x1 - 4.4, y1 + 5.6]
//   }

//   if (x1 < x2) {
//     lft = [x1 - 5.6, y1 + 4.4]
//     rht = [x2 + 5.6, y2 - 4.4]
//   } else {
//     lft = [x2 - 5.6, y2 + 4.4]
//     rht = [x1 + 5.6, y1 - 4.4]
//   }

//   return `M ${top[0]} ${top[1]} L ${rht[0]} ${rht[1]} L ${btm[0]} ${btm[1]} L ${lft[0]} ${lft[1]} Z`
// }

function path(data: TemplateStringsArray, ...values: number[]): string {
  return String.raw(
    { raw: data },
    ...values.map((value) => String(Math.round(value * 1e6) / 1e6)),
  )
}

export function scriptify(
  [x1, y1]: [x: number, y: number],
  [x2, y2]: [x: number, y: number],
): string {
  if (y1 < y2) {
    ;[x1, y1, x2, y2] = [x2, y2, x1, y1]
  }

  const angle = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2
  const tx = 10 * Math.cos(angle)
  const ty = 10 * Math.sin(angle)
  const slope = (y2 - y1) / (x2 - x1)
  const x4 =
    ((y1 - y2) * (x1 + tx) + (x2 - x1) * (ty - x1)) / (x1 + y1 - x2 - y2)
  const y4 = x1 + y1 - x4
  const x3 = x4 - x1 + x2
  const y3 = y4 - y1 + y2

  return path`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`
}

function all(points: [number, number][]) {
  return (
    <>
      {points.map(([x, y]) => (
        <path
          d={`M ${x} ${y} l 0.01 0`}
          stroke="red"
          stroke-width={5}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      ))}

      {points.slice(1).map((p2, i) => (
        <path d={scriptify(points[i]!, p2)} />
      ))}
    </>
  )
}

import "@zsnout/ithkuil/script"

export function Main() {
  return (
    <svg class="m-auto h-80 w-80" viewBox="-100 -100 200 200">
      {all([
        [60, 0],
        [0, 0],
        [0, 50],
      ])}
    </svg>
  )
}
