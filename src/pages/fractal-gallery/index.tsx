import { WebGLCoordinateCanvas } from "@/components/glsl/canvas/coordinate"
import { textToGLSL } from "@/components/glsl/math/output"
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
  effectAltColors: boolean
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
          gl.setUniform("u_effect_alt_colors", +props.effectAltColors)
          gl.setUniform("u_detail", props.detail)
          gl.setUniform("u_detail_min", props.minDetail)
          gl.setUniform("u_fractal_size", props.fractalSize ** 2)
          gl.setUniform("u_plot_size", props.plotSize)
          gl.setUniform("u_slider", props.slider / 100, 0)

          gl.setUniform("u_color_offset", props.colorOffset / 360)
          gl.setUniform("u_color_spectrum", props.spectrum / 100)
          gl.setUniform("u_color_smoothness", 1 - props.smoothness / 100)
          gl.setUniform(
            "u_color_repetition",
            props.repetition * props.repetitionSign,
          )

          // if (zEq.value.includes("u_mouse")) {
          //   trackMouse(gl)
          // }

          // if (
          //   zEq.value.includes("u_time") ||
          //   cEq.value.includes("u_time") ||
          //   eq.value.includes("u_time")
          // ) {
          //   trackTime(gl)
          // }

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

  const equation = (url.searchParams.get("equation") ?? "z^2+c")!
  const z = (url.searchParams.get("z") ?? "p")!
  const c = (url.searchParams.get("c") ?? "p")!
  const effectSplit = (url.searchParams.get("split") ?? null) != null
  const effectAltColors = (url.searchParams.get("alt_colors") ?? null) != null
  const detail = +(url.searchParams.get("detail") ?? 100)!
  const fractalSize = +(url.searchParams.get("size") ?? 2)!
  const minDetail = +(url.searchParams.get("min_detail") ?? 0)!
  const plotSize = +(url.searchParams.get("plot_size") ?? 1)!
  const theme = (url.searchParams.get("theme") ?? "simple")! as Theme
  const slider = +(url.searchParams.get("slider") ?? 0)!
  const top = +(url.searchParams.get("top") ?? 1.25)!
  const left = +(url.searchParams.get("left") ?? -2)!
  const bottom = +(url.searchParams.get("bottom") ?? -1.25)!
  const right = +(url.searchParams.get("right") ?? 0.5)!
  const colorOffset = +(url.searchParams.get("colorOffset") ?? 0)!
  const spectrum = +(url.searchParams.get("spectrum") ?? 100)!
  const smoothness = +(url.searchParams.get("smoothness") ?? 100)!
  const repetition = +(url.searchParams.get("repetition") ?? 1)!
  const repetitionSign = +(url.searchParams.get("repetitionSign") ?? -1)!

  return (
    <Canvas
      class={props.class}
      equation={equation}
      z={z}
      c={c}
      effectSplit={effectSplit}
      effectAltColors={effectAltColors}
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
  "https://v8.zsnout.com/fractal-explorer?equation=%28%287z%2B2%29-cos%28z%2Bi%2Bpi%29%285z%2B2%29%29%2F4&theme=trig&top=0.48916276942690706&right=-1.0892247394074448&bottom=-2.2444296606597947&left=-3.8228171694941304&size=10&colorOffset=51.686002994012",
  "https://v8.zsnout.com/fractal-explorer?theme=simple&top=0.8039897159537612&right=0.22871050379228042&bottom=0.7931233357655454&left=0.2178441236002001&equation=z%5E2%2Bz%2B1%2Fz%2B1%2Fzz%2Bc&size=10",
  "https://v8.zsnout.com/fractal-explorer?theme=simple&top=0.22830851630590288&right=-1.1830040586957755&bottom=0.20786229763451175&left=-1.2034502773744384&equation=z%5E2%2Bz%2B1%2Fz%2B1%2Fzz%2Bz%5E-19%2Bc&size=10",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%29%5E2+%2B+z%5Ec&theme=trig&top=2.056110204414094&right=2.96797405902789&bottom=1.9974273005302376&left=2.9092911551455547&detail=50",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%29%5E2+%2B+zc&theme=trig&top=-0.03176609961933671&right=-0.9674560360182941&bottom=-0.031862356953567525&left=-0.967552293352525&detail=50",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%29%5E2+%2B+zc%5E2&theme=trig&top=1.235113758268757&right=-0.27615931577638503&bottom=1.0874713012565238&left=-0.4238017727889359&detail=50",
  "https://v8.zsnout.com/fractal-explorer?top=1&bottom=-1&left=-1&right=1&equation=z%5E2+%2B+%24%28-0.7548332464245562+-0.05134377873212426i%29&detail=1000&z=p&c=p&theme=simple&repetitionSign=1&colorOffset=227.349363772455",
  "https://v8.zsnout.com/fractal-explorer?theme=trig&top=0.6192549969395025&right=-0.697512930493437&bottom=-0.5009534485676008&left=-1.8177213763989384&equation=z%5E2%2Bz%2B1%2Fz%2B1%2Fzz%2Bz%5E-19%2Bc&size=7.233158682634736&alt_colors=&colorOffset=293.308383233533&spectrum=6.39502245508982&smoothness=70.0435067365269&repetition=10",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E%281%2Fc%29%2Bc&theme=simple&top=0.2625242798667542&right=0.07059226094994346&bottom=0.26008657876675123&left=0.06815455984975598&detail=50&slider=75.2718538851351&z=p&c=p&size=10000000000000000000",
  "https://v8.zsnout.com/fractal-explorer?equation=sin(c/2z)%2Bc%2Bz%5E(10s)&theme=trig&top=-0.06210936446551568&right=-2.5367476087587577&bottom=-0.06285902225071029&left=-2.5374972665439564&detail=50",
  "https://v8.zsnout.com/fractal-explorer?equation=-sin(c/z)%2Bc%2Bs&theme=trig&top=0.7157181989875658&right=0.8345650806091818&bottom=-0.7651901277071591&left=-0.6463432461032743&detail=60&spectrum=33.3083832335329&colorOffset=160.110404191617&z=p&c=p&slider=100&top=1&bottom=-1&left=-1&right=1",
  "https://v8.zsnout.com/fractal-explorer?top=1.289089698342261&right=1.223826858898204&bottom=-1.2402356495646085&left=-1.3054984890086656&theme=simple&equation=z%5E2%2B$(0.33642683941372065%2B-0.38902029303725516i)&z=p&c=p",
  "https://v8.zsnout.com/fractal-explorer?top=-0.3574505452126474&right=0.19007272446711118&bottom=-0.5908818943531389&left=-0.043358624673372786&theme=simple&equation=z%5E2%2B$(0.33642683941372065%2B-0.38902029303725516i)&z=p&c=p&detail=1000&spectrum=16.4670658682635&colorOffset=298.562874251497",
  "https://v8.zsnout.com/fractal-explorer?top=-0.3616842948005324&right=0.14761699189853802&bottom=-0.3618403453618643&left=0.14746094133720447&theme=trig&equation=z%5E2%2B$(0.33642683941372065%2B-0.38902029303725516i)&z=p&c=p&detail=1000&smoothness=50&colorOffset=310.419161676647&spectrum=79.3413173652695&repetition=10&split=",
  "https://v8.zsnout.com/fractal-explorer?top=-0.36174680092732175&right=0.1475654626848076&bottom=-0.3618082316166081&left=0.14750403199552067&theme=gradient&equation=z%5E2%2B$(0.33642683941372065%2B-0.38902029303725516i)&z=p&c=p&detail=1000&repetition=10&colorOffset=250.059880239521&alt_colors=&smoothness=50&spectrum=28.1437125748503&size=1.5089820359281438&split=",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%2Bciter&top=0.20073111328399143&right=0.15245832228095077&bottom=-0.18912677407674686&left=-0.23739956507978804&theme=gradient&split=",
  "https://v8.zsnout.com/fractal-explorer?top=0.011758642349522994&right=-1.7583249884126786&bottom=-0.011370112115659955&left=-1.7814537428777422&theme=plot&z=p%2Bpi&size=9.681137724550895&split=",
  "https://v8.zsnout.com/fractal-explorer?top=0.3665934312399958&right=0.2814944640025434&bottom=-0.44477309204020826&left=-0.5298720592776343&theme=plot&z=p*pi&c=p3&size=1.2211826347305401",
  "https://v8.zsnout.com/fractal-explorer?top=0.0037421570541271982&right=0.0948856121708615&bottom=0.0035431161899835005&left=0.09468657130671781&theme=plot&z=p*pi&c=p3&size=2.2440119760479043&colorOffset=282.445733532934&smoothness=66.6120883233533&spectrum=52.4279565868264",
  "https://v8.zsnout.com/fractal-explorer?top=0.2077559320058&right=-0.17617072744929424&bottom=0.2072463402261016&left=-0.17668031922899174&theme=plot&z=p*pi&c=p3&split=",
  "https://v8.zsnout.com/fractal-explorer?top=1.25&right=0.5&bottom=-1.25&left=-2&equation=z%5E(2%5E(5s))%2Bc&theme=simple&z=p&c=p&slider=18.2062922297297&size=10&colorOffset=204.150449101796&repetitionSign=1",
  "https://v8.zsnout.com/fractal-explorer?top=22.413885501261827&right=26.858785023387497&bottom=-24.26027517056021&left=-19.81537563765906&equation=z%5E9999999t%2Bc&theme=simple&z=p&c=p",
  "https://v8.zsnout.com/fractal-explorer?equation=cos%28z%2Fc%29i&theme=simple&top=1.1756311813023537&bottom=-1.1032355772269704&left=-1.254544329482924&right=1.024322429046247&z=p&c=p&colorOffset=184.319797904192&spectrum=30.3517964071856&slider=100",
  "https://v8.zsnout.com/fractal-explorer?equation=i+%2B+z%5E%282sin%28t%2F4%29%2B3%29+-+c%5E13&theme=trig&top=1.1469299661584154&bottom=-1.1538337380185502&left=-1.1939561702946584&right=1.1068075338823076&z=p&c=p",
  "https://v8.zsnout.com/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.5358480342831237&bottom=0.5293356466677533&left=0.8848479864370451&right=0.891360374052411&z=p&c=p&slider=100&detail=1000&repetition=1.61386465097403&colorOffset=82.9182260479042",
  "https://v8.zsnout.com/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.5333434114838705&bottom=0.5321997524422072&left=0.8874952969643867&right=0.88863895600605&z=p&c=p&slider=100&detail=1000&repetition=1.33991984577922&colorOffset=167.756362275449&repetitionSign=1&spectrum=21.6364146706587",
  "https://v8.zsnout.com/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.5322052219742478&bottom=0.5320418993293822&left=0.8861669895650042&right=0.8863303122098698&z=p&c=p&slider=100&detail=1000&repetition=1.33991984577922&colorOffset=349.600486526946&repetitionSign=1&spectrum=21.6364146706587",
  "https://v8.zsnout.com/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.7629199794519161&bottom=0.7346429175275626&left=-0.11282539695767044&right=-0.08454833503331682&z=p&c=p&slider=29.5634501689189&detail=1000&repetition=1.33991984577922&colorOffset=349.600486526946&repetitionSign=1&spectrum=21.6364146706587",
  "https://v8.zsnout.com/fractal-explorer?top=-0.08834138672896158&bottom=-0.24039033866367243&left=0.20376283589860458&right=0.355811787833314&equation=z%5E2+%2B+%24%28-0.7548332464245562+-0.05134377873212426i%29&z=p&c=p&theme=simple&repetitionSign=1&colorOffset=227.349363772455&repetition=0.1&detail=100000",
  "https://v8.zsnout.com/fractal-explorer?top=0.6955242733455318&right=-0.3195432237372543&bottom=0.6954737409879272&left=-0.3195937560948614&equation=z%5E%282%5E%2810s%29%29%2Bc&theme=gradient&z=p&c=p&slider=8.59902871621622&size=10&repetitionSign=1&colorOffset=301.291167664671&repetition=0.1",
  "https://v8.zsnout.com/fractal-explorer?top=0.23020221917126346&right=-0.06787791059214697&bottom=0.22986106466993741&left=-0.06821906509347302&theme=plot&z=p*pi&c=p3&size=1.2211826347305401&detail=542&colorOffset=71.2471931137725&smoothness=75.0011695359281",
  "https://v8.zsnout.com/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=trig&top=0.10157257883243714&right=0.9359748859741761&bottom=0.062173227824393995&left=0.8965755349656634&detail=60&colorOffset=109.20752245509&z=p&c=p&slider=47.6694467905405",
  "https://v8.zsnout.com/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=gradient&top=0.10157257883243714&right=0.9359748859741761&bottom=0.062173227824393995&left=0.8965755349656634&detail=121&colorOffset=94.3282185628743&z=p&c=p&slider=47.6694467905405&smoothness=50&size=2.0059880239520957&spectrum=62.7853667664671",
  "https://v8.zsnout.com/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=gradient&top=0.22178850608214257&right=0.615155570172504&bottom=0.18837210610066207&left=0.5817391701906254&detail=121&colorOffset=94.3282185628743&z=p&c=p&slider=47.6694467905405&smoothness=50&size=2.0059880239520957&spectrum=62.7853667664671",
  "https://v8.zsnout.com/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=gradient&top=0.21657578826644164&right=0.6142934664189279&bottom=0.2147035035462515&left=0.6124211816987184&detail=1000&colorOffset=225.12630988024&z=p&c=p&slider=47.6694467905405&smoothness=50&size=2.0059880239520957&spectrum=15.6647642215569",
  "https://v8.zsnout.com/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=gradient&top=0.017655350949741914&right=0.44775867482027715&bottom=-0.017240714848940613&left=0.41286260902139443&detail=1000&colorOffset=49.8671407185629&z=p&c=p&slider=47.6694467905405&smoothness=73.9251964820359&size=2.0059880239520957",
  "https://v8.zsnout.com/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=trig&top=0.08742468968569446&right=-0.318660493535491&bottom=0.015538927124259194&left=-0.39054625609733806&detail=215&colorOffset=49.8671407185629&z=p&c=p&slider=100&smoothness=73.9251964820359&size=2.0059880239520957",
  "https://v8.zsnout.com/fractal-explorer?top=0.005752100400409863&right=-1.3987552072058742&bottom=0.0019426395601652765&left=-1.4025646680461192&equation=z%5E2+%2B+c&theme=gradient&detail=440&split=",
  "https://v8.zsnout.com/fractal-explorer?top=0.02488261192815503&right=-1.6024398357837109&bottom=-0.027985338853550496&left=-1.6553077865654238&equation=z%5E2+%2B+c&theme=gradient&detail=440&split=",
  "https://v8.zsnout.com/fractal-explorer?top=0.3431588428734021&bottom=0.3431210830134353&left=-0.1396026623657869&right=-0.13956490250582015&equation=z%5E2+%2B+%24%28-0.7548332464245562+-0.05134377873212426i%29&detail=1000&z=p&c=p&theme=simple&repetitionSign=1&colorOffset=227.349363772455",
  "https://v8.zsnout.com/fractal-explorer?equation=(i%5Et)(-sin(c/z))+c+s(i%5Et)&theme=trig&top=2.446016940445998&right=2.93255230465265&bottom=-2.275874028903559&left=-1.7893386647534433&detail=60&spectrum=33.3083832335329&colorOffset=160.110404191617&z=p&c=p&slider=100",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=1.4283679092510073&right=0.46226501798466424&bottom=1.3170794419725327&left=0.35097655073384193&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=-0.6898984486765972&right=0.7191426889570944&bottom=-0.7039421946243561&left=0.7050989430128252&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=-0.6790490015762651&right=0.6656810822171566&bottom=-0.7051833214629506&left=0.639546762336966&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=1.4134156334978363&right=0.2584278357250379&bottom=1.3914962134457445&left=0.23650841567839406&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=0.6836822714292016&right=0.496584143527576&bottom=0.6418768492219785&left=0.4547787213304252&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=0.0031922513021186896&right=-1.8826118258722424&bottom=-0.00045882593263868606&left=-1.8862629031061204&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=1.0702534475029157&right=0.7447232793224117&bottom=1.0325328712990376&left=0.7070027031276225&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=-0.6539982810169629&right=0.850251872159125&bottom=-1.2633715999595112&left=0.2408785533216244&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862&split=",
  "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=-0.6465338573486934&right=0.7760900030967297&bottom=-1.077125791903115&left=0.3454980686165361&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=-0.75516390863231&right=0.370401360715368&bottom=-0.8364310330259396&left=0.28913423633574786&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=1.6154129325263713&right=0.9311000745787965&bottom=1.6135179679015077&left=0.9292051099542602&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "https://v8.zsnout.com/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=-0.7447401416289288&right=0.8025764692994463&bottom=-0.8494864281496168&left=0.6978301827968821&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%29%5E-2%2Bc&theme=trig&top=-0.6913160784717756&right=0.7021063425348611&bottom=-0.6920223553416536&left=0.7014000656651614&detail=1000&z=p&c=p&slider=100",
  "https://v8.zsnout.com/fractal-explorer?top=2.9189051590977133&right=2.7188968818329133&bottom=-2.2366941903502875&left=-2.4367024649812166&equation=z%5E-2%2Bcm&theme=trig&colorOffset=131.497005988024&spectrum=60.4790419161677",
  "https://v8.zsnout.com/fractal-explorer?top=6.198028345100726&right=4.346705649411149&bottom=-6.450353547734011&left=-8.301676239667305&equation=z%5E-2%2Bc%5Es&theme=trig&colorOffset=131.497005988024&spectrum=60.4790419161677&z=p&c=p&detail=1000&slider=52.027027027027",
  "https://v8.zsnout.com/fractal-explorer?equation=c-z2&top=1.25&right=0.5&bottom=-1.25&left=-2",
  "https://v8.zsnout.com/fractal-explorer?equation=c-z2%5Ez&top=0.551787239759084&right=0.30124447655886055&bottom=-0.5231779976360627&left=-0.7737207608362865&theme=simple&alt_colors=&detail=1000",
  "https://v8.zsnout.com/fractal-explorer?equation=(c-z2%5Ez)i%5E2&top=-1.8055429319624186&right=-0.8254217173125898&bottom=-1.8100846430397712&left=-0.8299634283899396&theme=simple&alt_colors=&detail=1000&size=10",
  "https://v8.zsnout.com/fractal-explorer?top=-0.6030067561807897&right=0.07692689137378717&bottom=-0.609819741436197&left=0.07011390611839255&equation=z%5E2%5E%2Bc&theme=simple&detail=180&size=8.371257485029934&smoothness=50&spectrum=55.688622754491&colorOffset=258.682634730539",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%29%5E-2%2Bc&theme=gradient&top=-0.6990492783058846&right=0.5723551818521021&bottom=-0.7083732400570337&left=0.5630312201025599&detail=50&z=p&c=p&slider=100&colorOffset=20.7400823353293",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2%2Bcpi&top=0.00008198164113673626&right=-0.5673484267630498&bottom=-0.00008356264624005792&left=-0.5675139710504264&theme=simple&z=p&c=p",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2+%2B+cpi&top=-0.0943283973710095&right=-0.22229453181121442&bottom=-0.09625659788481082&left=-0.22422273232502596&theme=simple&z=p&c=p",
  "https://v8.zsnout.com/fractal-explorer?equation=z%5E2+%2B+cpi&top=-0.09420068125428478&right=-0.2221691610206719&bottom=-0.09637003214115043&left=-0.22433851190754872&theme=gradient&z=p&c=p&size=10&smoothness=50&colorOffset=360&spectrum=0",
  "https://v8.zsnout.com/fractal-explorer?theme=simple&c=i*0.7&top=1.25&right=0.5&bottom=-1.25&left=-2",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%5E-2%29%2Bc&theme=trig&top=-1.3495694332736896&right=-0.8408852161583587&bottom=-1.4349414796084008&left=-0.9262572624753473&detail=50&z=p&c=p&slider=100&colorOffset=239.946669161677&repetition=7.01103388798701&smoothness=66.6226141467066&spectrum=15.7840568862275",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%5E-2%29%2B%28%28%28%28%24%280.45955320728340565+-1.5926714371272952i%29%29%29%29%29&theme=trig&top=21.02152977054059&right=21.49483259471731&bottom=-20.442921376334894&left=-19.969618552158174&detail=50&z=p&c=p&slider=100&colorOffset=239.946669161677&repetition=7.01103388798701&smoothness=66.6226141467066&spectrum=15.7840568862275",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%5E-2%29%2B%28%28%28%28%28%28%24%280.28670116132914814+-1.1349374697360446i%29%29%29%29%29%29%29&theme=trig&top=407.46150200684053&right=-26.584018348626074&bottom=-41.28163042384202&left=-475.32715082599316&detail=32&z=p&c=p&slider=100&colorOffset=239.946669161677&repetition=7.01103388798701&smoothness=66.6226141467066&spectrum=15.7840568862275",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%5E-2%29%2B%28%28%28%28%28%28%28%28%24%280.161583318242009+-1.312786560232837i%29%29%29%29%29%29%29%29%29&theme=trig&top=1386.6513611095565&right=1291.170356792124&bottom=-1408.363204540302&left=-1503.8442088572165&detail=50&z=p&c=p&slider=100&colorOffset=239.946669161677&repetition=7.01103388798701&smoothness=66.6226141467066&spectrum=15.7840568862275",
  "https://v8.zsnout.com/fractal-explorer?equation=abs%28z%29%5E-2%2Bc&theme=gradient&top=1.8763306868071106&right=1.5665817704967244&bottom=-1.5319863948651884&left=-1.8417353105880294&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862&split=",
]

export function Main() {
  return (
    <>
      <h1 class="text-center text-xl font-semibold text-z-heading transition">
        Fractal Gallery
      </h1>

      <p class="mb-6 text-center text-z transition">
        There are currently {FRACTALS.length} fractals listed.
        <br />
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
