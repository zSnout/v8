import {
  faBookAtlas,
  faInfoCircle,
  faWarning,
} from "@fortawesome/free-solid-svg-icons"

/**
 * @type {Record<
 *   string,
 *   [
 *     icon: import("@fortawesome/free-solid-svg-icons").IconDefinition,
 *     classes: string,
 *     tagline: string,
 *     article: string,
 *   ]
 * >}
 */
export const STYLES = {
  todo: [
    faWarning,
    "border-yellow-300 bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800",
    "Incomplete note:",
    "DRAFT",
  ],
  btw: [
    faInfoCircle,
    "border-blue-300 bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800",
    "By the way...",
    "EXTRA",
  ],
  cite: [
    faBookAtlas,
    "border-orange-300 bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-100 dark:border-orange-800",
    "Source information:",
    "CITES",
  ],
}
