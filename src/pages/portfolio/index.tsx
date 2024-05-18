import { Fa } from "@/components/Fa"
import {
  IconDefinition,
  faCalendarCheck,
  faClockFour,
} from "@fortawesome/free-regular-svg-icons"

import fractalExplorer from "@/assets/portfolio/fractal-explorer.png"
import { faBookJournalWhills, faCheck } from "@fortawesome/free-solid-svg-icons"

export type Icon =
  | "ts"
  | "js"
  | "solid"
  | "astro"
  | "vite"
  | "py"
  | "tailwind"
  | "glsl"
  | "vue"

export type Status = "draft" | "in progress" | "complete" | "constant revision"

export function createIcon(icon: Icon) {
  switch (icon) {
    case "ts":
      return (
        <div class="flex h-12 w-12 items-end justify-end rounded-lg bg-[#3078c6] px-1 text-2xl font-semibold text-white transition">
          TS
        </div>
      )

    case "js":
      return (
        <div class="flex h-12 w-12 items-end justify-end rounded-lg bg-[#f8d900] px-1 text-2xl font-bold text-black transition">
          JS
        </div>
      )

    case "glsl":
      return (
        <div class="flex h-12 w-12 items-end justify-end rounded-lg bg-gradient-to-br from-pink-500 via-blue-400 to-green-500 px-1 text-sm font-bold text-black transition">
          GLSL
        </div>
      )

    case "solid":
      return (
        <svg
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1 transition dark:bg-slate-900"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 166 155.3"
        >
          <defs>
            <linearGradient
              id="a"
              gradientUnits="userSpaceOnUse"
              x1="27.5"
              y1="3"
              x2="152"
              y2="63.5"
            >
              <stop offset=".1" stop-color="#76b3e1" />
              <stop offset=".3" stop-color="#dcf2fd" />
              <stop offset="1" stop-color="#76b3e1" />
            </linearGradient>
            <linearGradient
              id="b"
              gradientUnits="userSpaceOnUse"
              x1="95.8"
              y1="32.6"
              x2="74"
              y2="105.2"
            >
              <stop offset="0" stop-color="#76b3e1" />
              <stop offset=".5" stop-color="#4377bb" />
              <stop offset="1" stop-color="#1f3b77" />
            </linearGradient>
            <linearGradient
              id="c"
              gradientUnits="userSpaceOnUse"
              x1="18.4"
              y1="64.2"
              x2="144.3"
              y2="149.8"
            >
              <stop offset="0" stop-color="#315aa9" />
              <stop offset=".5" stop-color="#518ac8" />
              <stop offset="1" stop-color="#315aa9" />
            </linearGradient>
            <linearGradient
              id="d"
              gradientUnits="userSpaceOnUse"
              x1="75.2"
              y1="74.5"
              x2="24.4"
              y2="260.8"
            >
              <stop offset="0" stop-color="#4377bb" />
              <stop offset=".5" stop-color="#1a336b" />
              <stop offset="1" stop-color="#1a336b" />
            </linearGradient>
          </defs>
          <path
            d="M163 35S110-4 69 5l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30z"
            fill="#76b3e1"
          />
          <path
            d="M163 35S110-4 69 5l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30z"
            opacity=".3"
            fill="url(#a)"
          />
          <path
            d="M52 35l-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21S92 26 52 35z"
            fill="#518ac8"
          />
          <path
            d="M52 35l-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21S92 26 52 35z"
            opacity=".3"
            fill="url(#b)"
          />
          <path
            d="M134 80a45 45 0 00-48-15L24 85 4 120l112 19 20-36c4-7 3-15-2-23z"
            fill="url(#c)"
          />
          <path
            d="M114 115a45 45 0 00-48-15L4 120s53 40 94 30l3-1c17-5 23-21 13-34z"
            fill="url(#d)"
          />
        </svg>
      )

    case "astro":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 85 107"
          fill="none"
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1 transition dark:bg-slate-900"
        >
          <path
            d="M27.5894 91.1365C22.7555 86.7178 21.3444 77.4335 23.3583 70.7072C26.8503 74.948 31.6888 76.2914 36.7005 77.0497C44.4375 78.2199 52.0359 77.7822 59.2232 74.2459C60.0454 73.841 60.8052 73.3027 61.7036 72.7574C62.378 74.714 62.5535 76.6892 62.318 78.6996C61.7452 83.5957 59.3086 87.3778 55.4332 90.2448C53.8835 91.3916 52.2437 92.4167 50.6432 93.4979C45.7262 96.8213 44.3959 100.718 46.2435 106.386C46.2874 106.525 46.3267 106.663 46.426 107C43.9155 105.876 42.0817 104.24 40.6845 102.089C39.2087 99.8193 38.5066 97.3081 38.4696 94.5909C38.4511 93.2686 38.4511 91.9345 38.2733 90.6309C37.8391 87.4527 36.3471 86.0297 33.5364 85.9478C30.6518 85.8636 28.37 87.6469 27.7649 90.4554C27.7187 90.6707 27.6517 90.8837 27.5847 91.1341L27.5894 91.1365Z"
            fill="url(#paint0_linear_1_59)"
          />
          <path
            d="M27.5894 91.1365C22.7555 86.7178 21.3444 77.4335 23.3583 70.7072C26.8503 74.948 31.6888 76.2914 36.7005 77.0497C44.4375 78.2199 52.0359 77.7822 59.2232 74.2459C60.0454 73.841 60.8052 73.3027 61.7036 72.7574C62.378 74.714 62.5535 76.6892 62.318 78.6996C61.7452 83.5957 59.3086 87.3778 55.4332 90.2448C53.8835 91.3916 52.2437 92.4167 50.6432 93.4979C45.7262 96.8213 44.3959 100.718 46.2435 106.386C46.2874 106.525 46.3267 106.663 46.426 107C43.9155 105.876 42.0817 104.24 40.6845 102.089C39.2087 99.8193 38.5066 97.3081 38.4696 94.5909C38.4511 93.2686 38.4511 91.9345 38.2733 90.6309C37.8391 87.4527 36.3471 86.0297 33.5364 85.9478C30.6518 85.8636 28.37 87.6469 27.7649 90.4554C27.7187 90.6707 27.6517 90.8837 27.5847 91.1341L27.5894 91.1365Z"
            class="fill-black transition dark:opacity-0"
          />
          <path
            d="M0 69.5866C0 69.5866 14.3139 62.6137 28.6678 62.6137L39.4901 29.1204C39.8953 27.5007 41.0783 26.3999 42.4139 26.3999C43.7495 26.3999 44.9325 27.5007 45.3377 29.1204L56.1601 62.6137C73.1601 62.6137 84.8278 69.5866 84.8278 69.5866C84.8278 69.5866 60.5145 3.35233 60.467 3.21944C59.7692 1.2612 58.5911 0 57.0029 0H27.8274C26.2392 0 25.1087 1.2612 24.3634 3.21944C24.3108 3.34983 0 69.5866 0 69.5866Z"
            class="fill-black transition dark:fill-white"
          />
          <defs>
            <linearGradient
              id="paint0_linear_1_59"
              x1="22.4702"
              y1="107"
              x2="69.1451"
              y2="84.9468"
              gradientUnits="userSpaceOnUse"
            >
              <stop stop-color="#D83333" />
              <stop offset="1" stop-color="#F041FF" />
            </linearGradient>
          </defs>
        </svg>
      )

    case "vite":
      return (
        <svg
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1 transition dark:bg-slate-900"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 128 128"
        >
          <defs>
            <linearGradient
              id="vitea"
              x1="6"
              x2="235"
              y1="33"
              y2="344"
              gradientTransform="translate(0 .937) scale(.3122)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stop-color="#41d1ff" />
              <stop offset="1" stop-color="#bd34fe" />
            </linearGradient>
            <linearGradient
              id="viteb"
              x1="194.651"
              x2="236.076"
              y1="8.818"
              y2="292.989"
              gradientTransform="translate(0 .937) scale(.3122)"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stop-color="#ffea83" />
              <stop offset=".083" stop-color="#ffdd35" />
              <stop offset="1" stop-color="#ffa800" />
            </linearGradient>
          </defs>
          <path
            fill="url(#vitea)"
            d="M124.766 19.52 67.324 122.238c-1.187 2.121-4.234 2.133-5.437.024L3.305 19.532c-1.313-2.302.652-5.087 3.261-4.622L64.07 25.187a3.09 3.09 0 0 0 1.11 0l56.3-10.261c2.598-.473 4.575 2.289 3.286 4.594Zm0 0"
          />
          <path
            fill="url(#viteb)"
            d="M91.46 1.43 48.954 9.758a1.56 1.56 0 0 0-1.258 1.437l-2.617 44.168a1.563 1.563 0 0 0 1.91 1.614l11.836-2.735a1.562 1.562 0 0 1 1.88 1.836l-3.517 17.219a1.562 1.562 0 0 0 1.985 1.805l7.308-2.223c1.133-.344 2.223.652 1.985 1.812l-5.59 27.047c-.348 1.692 1.902 2.614 2.84 1.164l.625-.968 34.64-69.13c.582-1.16-.421-2.48-1.69-2.234l-12.185 2.352a1.558 1.558 0 0 1-1.793-1.965l7.95-27.562A1.56 1.56 0 0 0 91.46 1.43Zm0 0"
          />
        </svg>
      )

    case "py":
      return (
        <svg
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1 transition dark:bg-slate-900"
          version="1.0"
          viewBox="0 0 111.161356 111.161356"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs id="defs4">
            <linearGradient id="linearGradient2795">
              <stop
                style="stop-color:#b8b8b8;stop-opacity:0.49803922;"
                offset="0"
                id="stop2797"
              />
              <stop
                style="stop-color:#7f7f7f;stop-opacity:0;"
                offset="1"
                id="stop2799"
              />
            </linearGradient>
            <linearGradient id="linearGradient2787">
              <stop
                style="stop-color:#7f7f7f;stop-opacity:0.5;"
                offset="0"
                id="stop2789"
              />
              <stop
                style="stop-color:#7f7f7f;stop-opacity:0;"
                offset="1"
                id="stop2791"
              />
            </linearGradient>
            <linearGradient id="linearGradient3676">
              <stop
                style="stop-color:#b2b2b2;stop-opacity:0.5;"
                offset="0"
                id="stop3678"
              />
              <stop
                style="stop-color:#b3b3b3;stop-opacity:0;"
                offset="1"
                id="stop3680"
              />
            </linearGradient>
            <linearGradient id="linearGradient3236">
              <stop
                style="stop-color:#f4f4f4;stop-opacity:1"
                offset="0"
                id="stop3244"
              />
              <stop
                style="stop-color:white;stop-opacity:1"
                offset="1"
                id="stop3240"
              />
            </linearGradient>
            <linearGradient id="linearGradient4671">
              <stop
                style="stop-color:#ffd43b;stop-opacity:1;"
                offset="0"
                id="stop4673"
              />
              <stop
                style="stop-color:#ffe873;stop-opacity:1"
                offset="1"
                id="stop4675"
              />
            </linearGradient>
            <linearGradient id="linearGradient4689">
              <stop
                style="stop-color:#5a9fd4;stop-opacity:1;"
                offset="0"
                id="stop4691"
              />
              <stop
                style="stop-color:#306998;stop-opacity:1;"
                offset="1"
                id="stop4693"
              />
            </linearGradient>
            <linearGradient
              x1="224.23996"
              y1="144.75717"
              x2="-65.308502"
              y2="144.75717"
              id="linearGradient2987"
              href="#linearGradient4671"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(100.2702,99.61116)"
            />
            <linearGradient
              x1="172.94208"
              y1="77.475983"
              x2="26.670298"
              y2="76.313133"
              id="linearGradient2990"
              href="#linearGradient4689"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(100.2702,99.61116)"
            />
            <linearGradient
              href="#linearGradient4689"
              id="linearGradient2587"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(100.2702,99.61116)"
              x1="172.94208"
              y1="77.475983"
              x2="26.670298"
              y2="76.313133"
            />
            <linearGradient
              href="#linearGradient4671"
              id="linearGradient2589"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(100.2702,99.61116)"
              x1="224.23996"
              y1="144.75717"
              x2="-65.308502"
              y2="144.75717"
            />
            <linearGradient
              href="#linearGradient4689"
              id="linearGradient2248"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(100.2702,99.61116)"
              x1="172.94208"
              y1="77.475983"
              x2="26.670298"
              y2="76.313133"
            />
            <linearGradient
              href="#linearGradient4671"
              id="linearGradient2250"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(100.2702,99.61116)"
              x1="224.23996"
              y1="144.75717"
              x2="-65.308502"
              y2="144.75717"
            />
            <linearGradient
              href="#linearGradient4671"
              id="linearGradient2255"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.562541,0,0,0.567972,-11.5974,-7.60954)"
              x1="224.23996"
              y1="144.75717"
              x2="-65.308502"
              y2="144.75717"
            />
            <linearGradient
              href="#linearGradient4689"
              id="linearGradient2258"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.562541,0,0,0.567972,-11.5974,-7.60954)"
              x1="172.94208"
              y1="76.176224"
              x2="26.670298"
              y2="76.313133"
            />
            <radialGradient
              href="#linearGradient2795"
              id="radialGradient2801"
              cx="61.518883"
              cy="132.28575"
              fx="61.518883"
              fy="132.28575"
              r="29.036913"
              gradientTransform="matrix(1,0,0,0.177966,0,108.7434)"
              gradientUnits="userSpaceOnUse"
            />
            <linearGradient
              href="#linearGradient4671"
              id="linearGradient1475"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.562541,0,0,0.567972,-14.99112,-11.702371)"
              x1="150.96111"
              y1="192.35176"
              x2="112.03144"
              y2="137.27299"
            />
            <linearGradient
              href="#linearGradient4689"
              id="linearGradient1478"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(0.562541,0,0,0.567972,-14.99112,-11.702371)"
              x1="26.648937"
              y1="20.603781"
              x2="135.66525"
              y2="114.39767"
            />
            <radialGradient
              href="#linearGradient2795"
              id="radialGradient1480"
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(1.7490565e-8,-0.23994696,1.054668,3.7915457e-7,-83.7008,142.46201)"
              cx="61.518883"
              cy="132.28575"
              fx="61.518883"
              fy="132.28575"
              r="29.036913"
            />
          </defs>
          <path
            style="fill:url(#linearGradient1478);fill-opacity:1"
            d="M 54.918785,9.1927421e-4 C 50.335132,0.02221727 45.957846,0.41313697 42.106285,1.0946693 30.760069,3.0991731 28.700036,7.2947714 28.700035,15.032169 v 10.21875 h 26.8125 v 3.40625 h -26.8125 -10.0625 c -7.792459,0 -14.6157588,4.683717 -16.7499998,13.59375 -2.46181998,10.212966 -2.57101508,16.586023 0,27.25 1.9059283,7.937852 6.4575432,13.593748 14.2499998,13.59375 h 9.21875 v -12.25 c 0,-8.849902 7.657144,-16.656248 16.75,-16.65625 h 26.78125 c 7.454951,0 13.406253,-6.138164 13.40625,-13.625 v -25.53125 c 0,-7.2663386 -6.12998,-12.7247771 -13.40625,-13.9374997 C 64.281548,0.32794397 59.502438,-0.02037903 54.918785,9.1927421e-4 Z m -14.5,8.21875012579 c 2.769547,0 5.03125,2.2986456 5.03125,5.1249996 -2e-6,2.816336 -2.261703,5.09375 -5.03125,5.09375 -2.779476,-1e-6 -5.03125,-2.277415 -5.03125,-5.09375 -10e-7,-2.826353 2.251774,-5.1249996 5.03125,-5.1249996 z"
            id="path1948"
          />
          <path
            style="fill:url(#linearGradient1475);fill-opacity:1"
            d="m 85.637535,28.657169 v 11.90625 c 0,9.230755 -7.825895,16.999999 -16.75,17 h -26.78125 c -7.335833,0 -13.406249,6.278483 -13.40625,13.625 v 25.531247 c 0,7.266344 6.318588,11.540324 13.40625,13.625004 8.487331,2.49561 16.626237,2.94663 26.78125,0 6.750155,-1.95439 13.406253,-5.88761 13.40625,-13.625004 V 86.500919 h -26.78125 v -3.40625 h 26.78125 13.406254 c 7.792461,0 10.696251,-5.435408 13.406241,-13.59375 2.79933,-8.398886 2.68022,-16.475776 0,-27.25 -1.92578,-7.757441 -5.60387,-13.59375 -13.406241,-13.59375 z m -15.0625,64.65625 c 2.779478,3e-6 5.03125,2.277417 5.03125,5.093747 -2e-6,2.826354 -2.251775,5.125004 -5.03125,5.125004 -2.76955,0 -5.03125,-2.29865 -5.03125,-5.125004 2e-6,-2.81633 2.261697,-5.093747 5.03125,-5.093747 z"
            id="path1950"
          />
          <ellipse
            style="opacity:0.44382;fill:url(#radialGradient1480);fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:15.4174;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"
            id="path1894"
            cx="55.816761"
            cy="127.70079"
            rx="35.930977"
            ry="6.9673119"
          />
        </svg>
      )

    case "tailwind":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 54 33"
          class="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1 transition dark:bg-slate-900"
        >
          <g clip-path="url(#prefix__clip0)">
            <path
              fill="#38bdf8"
              fill-rule="evenodd"
              d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
              clip-rule="evenodd"
            />
          </g>
          <defs>
            <clipPath id="prefix__clip0">
              <path fill="#fff" d="M0 0h54v32.4H0z" />
            </clipPath>
          </defs>
        </svg>
      )

    case "vue":
      // TODO:
      throw new Error("unimplemented")
  }
}

const icons: Record<Status, IconDefinition> = {
  draft: faBookJournalWhills,
  "in progress": faClockFour,
  complete: faCheck,
  "constant revision": faCalendarCheck,
}

export interface PortfolioEntry {
  readonly title: string
  readonly date: string
  readonly status: Status
  readonly image: string
  readonly icons: readonly [Icon, ...Icon[]]
}

const entries: readonly PortfolioEntry[] = [
  {
    title: "Fractal Explorer",
    date: "March 2023",
    status: "constant revision",
    image: fractalExplorer,
    icons: ["astro", "glsl", "solid", "tailwind"],
  },

  {
    title: "zSnout 8",
    date: "January 2023",
    status: "constant revision",
    image: "",
    icons: ["astro", "glsl", "solid", "tailwind"],
  },

  {
    title: "zSnout 7",
    date: "March 2022",
    status: "constant revision",
    image: "",
    icons: ["astro", "glsl", "solid", "tailwind"],
  },

  {
    title: "Fractal Explorer",
    date: "March 2022",
    status: "constant revision",
    image: fractalExplorer,
    icons: ["astro", "glsl", "solid", "tailwind"],
  },

  {
    title: "zSnout 6",
    date: "March 2022",
    status: "constant revision",
    image: "",
    icons: ["vite", "vue", "ts"],
  },
]

export function Entry(props: { entry: PortfolioEntry }) {
  return (
    <div class="relative h-72 w-full select-none rounded-xl">
      <img
        class="absolute left-0 top-0 h-full w-full rounded-xl object-cover"
        src={props.entry.image}
      />

      <div class="absolute left-0 top-0 h-full w-full">
        <div class="absolute bottom-0 left-0 flex items-end">
          <div class="select-text rounded-bl-xl rounded-tr-xl border-r border-t border-z-bg-body bg-z-bg-body-partial px-3 py-2 text-2xl font-extralight text-z-heading backdrop-blur-lg transition">
            {props.entry.title}
          </div>

          <div class="ml-4 rounded-t border-x border-t border-z-bg-body bg-z-bg-body-partial px-2 text-sm font-extralight text-z-heading backdrop-blur-lg transition">
            {props.entry.date}
          </div>

          <div class="ml-4 flex items-center rounded-t border-x border-t border-z-bg-body bg-z-bg-body-partial px-2 text-sm font-extralight text-z-heading backdrop-blur-lg transition">
            <Fa
              class="mr-1.5 h-5 w-4 transition icon-z-text-heading"
              icon={icons[props.entry.status]}
              title="check"
            />
            {props.entry.status}
          </div>
        </div>

        <div class="absolute right-0 top-0 grid h-full grid-flow-col-dense grid-rows-[3rem,3rem,3rem,3rem] gap-3 rounded-r-xl border-l border-l-z-bg-body bg-z-bg-body-partial p-3 backdrop-blur-lg transition">
          {props.entry.icons.map(createIcon)}
        </div>
      </div>
    </div>
  )
}

export function Main() {
  return entries.map((entry) => <Entry entry={entry} />)
}
