import * as regular from "@fortawesome/free-regular-svg-icons"
import * as solid from "@fortawesome/free-solid-svg-icons"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

export interface FlagInfo {
  valueOf(): number
  readonly bg: `bg-${string} dark:bg-${string}`
  readonly text: `text-${string}`
  readonly color: string
}

export const ALL_FLAGS: readonly FlagInfo[] = [
  {
    valueOf: () => 1,
    color: "Red",
    bg: "bg-red-200 dark:bg-red-800",
    text: "text-red-500",
  },
  {
    valueOf: () => 2,
    color: "Orange",
    bg: "bg-orange-200 dark:bg-orange-800",
    text: "text-orange-500",
  },
  {
    valueOf: () => 3,
    color: "Green",
    bg: "bg-green-200 dark:bg-green-800",
    text: "text-green-500",
  },
  {
    valueOf: () => 4,
    color: "Blue",
    bg: "bg-blue-200 dark:bg-blue-800",
    text: "text-blue-500",
  },
  {
    valueOf: () => 5,
    color: "Pink",
    bg: "bg-pink-200 dark:bg-pink-800",
    text: "text-pink-500",
  },
  {
    valueOf: () => 6,
    color: "Teal",
    bg: "bg-teal-200 dark:bg-teal-800",
    text: "text-teal-500",
  },
  {
    valueOf: () => 7,
    color: "Purple",
    bg: "bg-purple-200 dark:bg-purple-800",
    text: "text-purple-500",
  },
]

export interface MarkInfo {
  valueOf(): number
  readonly fill: IconDefinition
  readonly outline: IconDefinition
  readonly shape: string
}

// TODO: remove prettier-ignore
// prettier-ignore
export const ALL_MARKS: readonly MarkInfo[] = [
  {valueOf:()=>1, fill:solid.faSquare,outline:regular.faSquare,shape:"Square"},
  {valueOf:()=>2, fill:solid.faCircle,outline:regular.faCircle,shape:"Circle"},
  {valueOf:()=>3, fill:solid.faHeart,outline:regular.faHeart,shape:"Heart"},
  {valueOf:()=>4, fill:solid.faStar,outline:regular.faStar,shape:"Star"},
  {valueOf:()=>5, fill:solid.faComment,outline:regular.faComment,shape:"Comment"},
  {valueOf:()=>6, fill:solid.faFile,outline:regular.faFile,shape:"File"},
  {valueOf:()=>7, fill:solid.faBookmark,outline:regular.faBookmark,shape:"Bookmark"},
]

export function add(last: number, flag: { valueOf(): number }) {
  return last | (2 << flag.valueOf())
}

export function toggle(last: number, flag: { valueOf(): number }) {
  return last ^ (2 << flag.valueOf())
}

export function remove(last: number, flag: { valueOf(): number }) {
  return last & ~(2 << flag.valueOf())
}

export function has(flags: number, flag: { valueOf(): number }) {
  return !!(flags & (2 << flag.valueOf()))
}
