import { WebGLCoordinateCanvas } from "@/components/glsl/canvas/coordinate"
import { textToGLSL } from "@/components/glsl/math/output"
import { trackMouse } from "@/components/glsl/mixins/track-mouse"
import { trackTime } from "@/components/glsl/mixins/track-time"
import { unwrap } from "@/components/result"
import { For } from "solid-js"
import { Theme, themeMap } from "../fractal-explorer"
import fragmentSource from "../fractal-explorer/fragment.glsl"

let gl: WebGLCoordinateCanvas

const glCanvas = (
  <canvas
    width={440 * (globalThis.devicePixelRatio || 1)}
    height={440 * (globalThis.devicePixelRatio || 1)}
    ref={(canvas) =>
      (gl = unwrap(
        WebGLCoordinateCanvas.of(canvas, {
          top: 1.25,
          right: 0.5,
          bottom: -1.25,
          left: -2,
        }),
      ))
    }
  />
) as HTMLCanvasElement

export function Canvas(props: {
  class: string

  equation: string
  z: string
  c: string

  effectSplit: boolean
  detail: number
  fractalSize: number
  minDetail: number
  plotSize: number
  theme: Theme
  slider: number

  top: number
  left: number
  bottom: number
  right: number

  colorOffset: number
  spectrum: number
  smoothness: number
  repetition: number
  repetitionSign: number
}) {
  const [equationText, zText, cText] = [props.equation, props.z, props.c]

  const eq = textToGLSL(equationText)
  if (!eq.ok) {
  }

  const zEq = textToGLSL(zText)
  if (!zEq.ok) {
  }

  const cEq = textToGLSL(cText)
  if (!cEq.ok) {
  }

  if (!(eq.ok && zEq.ok && cEq.ok)) {
    return
  }

  return (
    <canvas
      class={props.class}
      ref={(canvas) => {
        setTimeout(() => {
          const ctx = canvas.getContext("2d")!

          if (!ctx) {
            console.error("no 2d context found")
            return
          }

          glCanvas.width = 440 * (globalThis.devicePixelRatio || 1)
          glCanvas.height = 440 * (globalThis.devicePixelRatio || 1)

          gl.setCoords({
            top: props.top,
            right: props.right,
            bottom: props.bottom,
            left: props.left,
          })

          gl.load(
            fragmentSource
              .replace(/EQ_Z/g, zEq.value)
              .replace(/EQ_C/g, cEq.value)
              .replace(/EQ/g, eq.value),
          )

          gl.setUniform("u_theme", themeMap[props.theme])
          gl.setUniform("u_effect_split", +props.effectSplit)
          gl.setUniform("u_detail", props.detail)
          gl.setUniform("u_detail_min", props.minDetail)
          gl.setUniform("u_fractal_size", props.fractalSize ** 2)
          gl.setUniform("u_plot_size", props.plotSize)
          gl.setUniform("u_slider", props.slider)

          gl.setUniform("u_color_offset", props.colorOffset / 360)
          gl.setUniform("u_color_spectrum", props.spectrum / 100)
          gl.setUniform("u_color_smoothness", 1 - props.smoothness / 100)
          gl.setUniform(
            "u_color_repetition",
            props.repetition * props.repetitionSign,
          )

          if (zEq.value.includes("u_mouse")) {
            trackMouse(gl)
          }

          if (
            zEq.value.includes("u_time") ||
            cEq.value.includes("u_time") ||
            eq.value.includes("u_time")
          ) {
            trackTime(gl)
          }

          gl.draw()

          canvas.width = canvas.clientWidth * devicePixelRatio
          canvas.height = canvas.clientHeight * devicePixelRatio
          ctx.drawImage(glCanvas, 0, 0, canvas.width, canvas.height)
        })
      }}
    />
  )
}

export function Fractal(props: { class: string; url: string }) {
  const url = new URL(props.url)

  const equation = (url.searchParams.get("equation") || "z^2+c")!
  const z = (url.searchParams.get("z") || "p")!
  const c = (url.searchParams.get("c") || "p")!
  const effectSplit = (url.searchParams.get("effectSplit") || null) != null
  const detail = +(url.searchParams.get("detail") || 100)!
  const fractalSize = +(url.searchParams.get("size") || 2)!
  const minDetail = +(url.searchParams.get("min_detail") || 0)!
  const plotSize = +(url.searchParams.get("plotSize") || 1)!
  const theme = (url.searchParams.get("theme") || "simple")! as Theme
  const slider = +(url.searchParams.get("slider") || 0)!
  const top = +(url.searchParams.get("top") || 1.25)!
  const left = +(url.searchParams.get("left") || -2)!
  const bottom = +(url.searchParams.get("bottom") || -1.25)!
  const right = +(url.searchParams.get("right") || 0.5)!
  const colorOffset = +(url.searchParams.get("colorOffset") || 0)!
  const spectrum = +(url.searchParams.get("spectrum") || 100)!
  const smoothness = +(url.searchParams.get("smoothness") || 100)!
  const repetition = +(url.searchParams.get("repetition") || 1)!
  const repetitionSign = +(url.searchParams.get("repetitionSign") || -1)!

  return (
    <Canvas
      class={props.class}
      equation={equation}
      z={z}
      c={c}
      effectSplit={effectSplit}
      detail={detail}
      fractalSize={fractalSize}
      minDetail={minDetail}
      plotSize={plotSize}
      theme={theme}
      slider={slider}
      top={top}
      left={left}
      bottom={bottom}
      right={right}
      colorOffset={colorOffset}
      spectrum={spectrum}
      smoothness={smoothness}
      repetition={repetition}
      repetitionSign={repetitionSign}
    />
  )
}

const FRACTALS = [
  "https://v8.zsnout.com/fractal-explorer?top=0.8234233154537663&right=0.018144838068416824&bottom=0.8181709391031092&left=0.01289246171775982",
  "https://v8.zsnout.com/fractal-explorer?top=-0.2470825091046157&right=0.36080929376344084&bottom=-0.2485878043953133&left=0.3593039984727434&equation=z%5E2%20%2B%202z%5E3%20%2B%20c%5E3%20%2B%202c%5E2&theme=gradient&colorOffset=177.79378742515&repetition=5.95704405&spectrum=28.9951347305389",
  "https://v8.zsnout.com/fractal-explorer?top=0.9036806541192504&right=-0.05550422341528134&bottom=0.8884295454781905&left=-0.07075533205633991&equation=z%5E2%20%2B%20c&theme=gradient&detail=440&split=",
  "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E2%2Bc%23fx&top=0.6124109336509034&right=-1.0364451711801372&bottom=0.550921590011006&left=-1.0979345148198165&theme=gradient&spectrum=19.7604790419162&colorOffset=161.322979041916",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%2Bz%2Bc&theme=gradient&detail=100&limit=2&colorOffset=106.807634730539&grayscale=0&repetition=1&noise=0&separation=0&overcolor=0&minIter=0&top=-0.3236023916381393&right=-1.1000885603523771&bottom=-0.27943492320910235&left=-1.1442560287813464",
  "https://v8.zsnout.com/fractal-explorer?equation=(z-($(-0.30867666568396235%2B-0.06060215212264164i)))%5E2%20%2B%20c-($(-0.30867666568396235%2B-0.06060215212264164i))&theme=gradient&top=-0.7699441130504783&right=-0.8768257407827537&bottom=-0.8143723831826022&left=-0.9212540109148785",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%20%2B%20c/z&theme=gradient&top=0.2843393872612489&right=-0.019615425965304342&bottom=0.1421571308069384&left=-0.16179768241961748",
  "https://v8.zsnout.com/fractal-explorer?top=1&right=1&bottom=-1&left=-1&equation=sinz%2Fc&theme=simple&size=4.148867313915856",
  "https://v8.zsnout.com/fractal-explorer?equation=(z%5E3%2B1)/(cz%5E2%2B1)&theme=gradient&top=7.792474057796062&right=2.3399178077568275&bottom=4.5915624523383745&left=-0.8609937976993065&size=3.2208083832335355&detail=1000&colorOffset=155.580089820359&spectrum=25.3134356287425&smoothness=66.6986339820359",
  "https://v8.zsnout.com/fractal-explorer?top=0.1049269514436077&right=-0.7465816870469891&bottom=0.10449756009721944&left=-0.7470110783933633&theme=simple&equation=z%5E2%20%2B%20c&detail=1000",
  "https://v8.zsnout.com/fractal-explorer?top=0.06767421603310363&right=1.086954203292915&bottom=-0.001463895888047755&left=1.017816091374455&theme=simple&equation=(z%5E-c)/c&detail=1000&size=2.7185628742515036&smoothness=60.018244760479&colorOffset=195.729790419162&split=",
  "https://v8.zsnout.com/fractal-explorer?top=0.8758411252606795&right=-0.13634717493221565&bottom=0.8161461353110555&left=-0.1960421648795152&theme=gradient&equation=z%5E3%2Bczzzzzz&detail=1000&size=1.996444610778444&split=&colorOffset=257.369011976048",
  "https://v8.zsnout.com/fractal-explorer?top=0.3278641536530892&right=1.1074929103649902&bottom=0.3271605886362774&left=1.1067893453481683&equation=c%5Ez-sin(z-c%5E2)&theme=simple&size=10&colorOffset=242.868637724551&smoothness=60.090755988024&detail=106&repetition=6.15061891233766",
  "https://v8.zsnout.com/fractal-explorer?top=-0.5745586518459166&right=0.42233872284171703&bottom=-0.60007643612824&left=0.3968209382553626&equation=c%5Ez-abs(z-c%5E2)%2Be%5Ei&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245&min_detail=26",
  "https://v8.zsnout.com/fractal-explorer?equation=abs(z%5E2)%20%2B%20c%23fx&top=1.0716516053531586&right=-0.21665886128100298&bottom=-0.7992571001470665&left=-2.0875675667812286",
  "https://v8.zsnout.com/fractal-explorer?top=-0.4428930452056955&right=0.43867499294143386&bottom=-0.5236118579786706&left=0.3579561801670489&equation=c%5Ez-abs(z-c%5E2)&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245",
  "https://v8.zsnout.com/fractal-explorer?top=-0.5764779917594502&right=0.41918811564625363&bottom=-0.5966906289299476&left=0.3989754784754023&equation=c%5Ez-abs(z-c%5E2)&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245&min_detail=26",
  "https://v8.zsnout.com/fractal-explorer?top=-0.64339537897206&right=0.43731864822145344&bottom=-0.6434564252899485&left=0.43725760190356294&equation=c%5Ez-abs(z-c%5E2)&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245&min_detail=26",
  "https://v8.zsnout.com/fractal-explorer?top=0.21212009464707934&right=2.26763443497962&bottom=-0.227424129916064&left=1.8280902104087948&equation=abs(z/c)/sin(z%5Ec)&theme=simple&size=4.148867313915856&spectrum=51.1765531437126&colorOffset=225.993637724551",
  "https://v8.zsnout.com/fractal-explorer?top=0.05949388349968565&right=0.5021770969113357&bottom=-0.5940501493611277&left=-0.15136693596091572&equation=c%5Ez-abs(z-c%5E2)&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245&min_detail=26",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E4%2Bc",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%29%5E2+%2B+c%23fx&theme=trig&top=0.08292770814632935&right=-1.7123146416175952&bottom=-0.007896417661361257&left=-1.8031387674252874&detail=50",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E3%2F%28z%23z%2B1%29%2Bc%23fx&theme=trig&top=2.1639143538876233&right=2.102318142319261&bottom=-2.1611863918746206&left=-2.222782606201538&alt_colors=&size=10&c=p&z=0",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%2Bz%2Bc&theme=gradient&top=0.8645449474590621&right=-0.631922068535263&bottom=0.8241830016660656&left=-0.6722840143282595",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%2B1%2Fc&theme=simple&top=2.6335142291434637&right=3.905972104838716&bottom=-2.762483770998577&left=-1.4900258953033023&z=0",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%2Bz%2B1%2Fc&theme=gradient&top=5.308551631439171&right=9.006237015050875&bottom=-6.335256136237424&left=-2.6375707526256664&z=0&split=",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2-z%2B1%2Fc&theme=gradient&top=3.259707855090571&right=3.5584339842351547&bottom=-4.408069634483651&left=-4.10934350533903&z=0&split=",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E3-z%5E2-z-c&theme=gradient&top=1.3423144520190586&right=0.7223451120418782&bottom=-1.2665684852994903&left=-1.8865378252766565&z=0&split=",
  "https://v8.zsnout.com/fractal-explorer?equation=%28z%5E3%2B1%29%2F%28cz%5E2%2B1%29&theme=gradient&top=9.36787760049994&right=8.975527957172643&bottom=-9.833892572203903&left=-10.226242215531114&z=0",
  "https://v8.zsnout.com/fractal-explorer?equation=z-%28zzz%2Bz*%28c-1%29-c%29%2F%283zz%2Bc-1%29&theme=simple&top=1.7723690031050279&right=0.4069383173804213&bottom=1.5363057365164592&left=0.17087505079185286&z=0",
  "https://v8.zsnout.com/fractal-explorer?equation=1%2F%28z%5E4%2Bc%2B1%29&theme=simple&top=1.0607944307486892&right=0.2624392147134408&bottom=-0.19828594489425327&left=-0.9966411609295017&z=p",

  "https://v8.zsnout.com/fractal-explorer?smoothness=50&theme=gradient&colorOffset=23.3841691616766&top=-0.4467133777204973&right=-0.6660147105978401&bottom=-0.47512649950362623&left=-0.6944278323809693",
  "https://v8.zsnout.com/fractal-explorer?equation=1/z%2B1/z%5E2%2B1/z%5E3%2B1/z%5E4%2Bc&z=p&top=1.4324178461698895&right=0.172850781011355&bottom=1.386301959058436&left=0.1267348938999014&theme=simple&size=3.9958832335329273&spectrum=35.1258420658683&colorOffset=241.361339820359&smoothness=66.6120883233533",
  "https://v8.zsnout.com/fractal-explorer?equation=1/z%2B1/z%5E2%2B1/z%5E3%2B1/z%5E4%2Bc&z=p&top=1.4082920354309258&right=0.15800887282231935&bottom=1.3886149922086692&left=0.13833182960006296&theme=gradient&size=3.9958832335329273&spectrum=35.1258420658683&colorOffset=86.3875374251497&smoothness=66.6120883233533",
  "https://v8.zsnout.com/fractal-explorer?top=0.6485207629676748&right=-0.38872729227271224&bottom=0.6445793822985508&left=-0.3926686729418361&detail=275",
  "https://v8.zsnout.com/fractal-explorer?equation=(z%5E3%2B1)/(izc%5E2%2B1)&top=1345.2735397710915&right=1242.8311426337686&bottom=-1256.5935426394678&left=-1359.035939776802",
  "https://v8.zsnout.com/fractal-explorer?equation=(z%5E3%2B1)/(-zc%5E2%2B1)&top=4.69136004956921&right=4.480313188482539&bottom=-3.872655305683909&left=-4.083702166770603",
  "https://v8.zsnout.com/fractal-explorer?equation=(z%5E3%2B1)/(izc%5E2%2B1)&top=10.221025983422937&right=8.929199130357018&bottom=-7.7443330906073236&left=-9.036159943673269",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E10%2B$(0.40068683656884396%2B0.7539857173315323i)&detail=318&top=0.9489899550602218&right=0.580746212360992&bottom=0.5853111875677176&left=0.21706744486847662",
  "https://v8.zsnout.com/fractal-explorer?equation=z-(z%5E3-1)/(3z%5E2)%2B$(-0.31968031968031996%2B-0.21378621378621387i)&top=1.8837607385784403&right=2.9933332186510206&bottom=-0.7046453646185724&left=0.4049271154540033",
  "https://v8.zsnout.com/fractal-explorer?top=0.43627619616614416&right=-0.33613931509690526&bottom=0.07338596800924185&left=-0.6990295432537584&equation=z%5E2%2B$(-0.6954222210000253%2B0.3693522198835498i)&theme=simple&size=1.093001497005988&detail=1000",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%2B$(0.30773913586413526%2B-0.02282092907092892i)&theme=trig&top=1.5&bottom=-1.5&left=-1.5&right=1.5",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%2B1/c%2Bc%2Bcc%2Bc%5E3&z=0&top=1.25&right=0.5&bottom=-1.25&left=-2",
  "https://v8.zsnout.com/fractal-explorer?equation=((7z%2B2)-exp(z*pi*i)(5z%2B2))/4&z=p&theme=trig&top=0.9028411281196939&right=0.8804338762162516&bottom=-0.9428792485004184&left=-0.9652865004038604&size=1000&plot_size=0.851796407185628&detail=100&repetition=3.04819399350649&repetitionSign=1&alt_colors=&colorOffset=172.84244011976",
  "https://v8.zsnout.com/fractal-explorer?equation=(z-($(-0.30867666568396235%2B-0.06060215212264164i)))%5E2%2Bc-($(-0.30867666568396235%2B-0.06060215212264164i))&theme=gradient&top=0.23715455204308833&right=-0.21182544998644628&bottom=0.22303726815524977&left=-0.22594273387428546&colorOffset=202.112649700599&spectrum=25.032747005988&repetition=5.60044642857143&smoothness=88.9642589820359",
  "https://v8.zsnout.com/fractal-explorer?equation=%28%287z%2B2%29-cos%28z*pi%29%285z%2B2%29%29%2F4&theme=trig&top=0.06329035871122704&right=-1.956834733148491&bottom=0.02926000167505563&left=-1.9908650901846623&size=10&colorOffset=51.686002994012",
  "https://v8.zsnout.com/fractal-explorer?equation=(z-m)%5E2%2Bc%2Bm",
]

export function Main() {
  return (
    <>
      <h1 class="text-center text-xl font-semibold text-z-heading transition">
        Fractal Gallery
      </h1>
      <p class="mb-6 text-center text-z transition">
        Click any fractal to open it in fullscreen.
        <br />
        Clicking also lets you interact with a fractal.
      </p>

      <div class="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-1">
        <For each={FRACTALS}>
          {(url) => (
            <a class="hover:opacity-70" href={url}>
              <Fractal
                class="aspect-square w-full touch-none rounded bg-white"
                url={url}
              />
            </a>
          )}
        </For>
      </div>
    </>
  )
}
