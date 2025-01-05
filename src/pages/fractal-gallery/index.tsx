import { WebGLCoordinateCanvas } from "@/components/glsl/canvas/coordinate"
import {
  nodeToTree,
  textToGLSL,
  treeToGLSL,
} from "@/components/glsl/math/output"
import { Result, error, ok, unwrap } from "@/components/result"
import { parseLatex } from "@/mathquill/parse"
import { For } from "solid-js"
import { InnerTheme, Theme, innerThemeMap, themeMap } from "../fractal-explorer"
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

function toGlsl(eq: string): Result<string> {
  try {
    if (eq.startsWith("~~")) {
      const node = parseLatex(eq.slice(2))
      if (!node.ok) {
        return node
      }
      const tree = nodeToTree(node.value)
      return ok(treeToGLSL(tree))
    } else {
      return textToGLSL(eq)
    }
  } catch (err) {
    return error(err)
  }
}

function Canvas(props: {
  class: string

  equation: string
  z: string
  c: string

  effectOuterA: boolean
  effectOuterB: boolean
  effectOuterC: boolean
  effectInnerA: boolean
  effectInnerB: boolean

  detail: number
  fractalSize: number
  minDetail: number
  plotSize: number
  theme: Theme
  innerTheme: InnerTheme
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

  const eq = toGlsl(equationText)
  const zEq = toGlsl(zText)
  const cEq = toGlsl(cText)

  if (!(eq.ok && zEq.ok && cEq.ok)) {
    return
  }

  return (
    <canvas
      class={props.class}
      ref={(canvas) => {
        const render = () => {
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
              .replace(/FRAG_MODS;/g, "")
              .replace(/EQ_Z/g, zEq.value)
              .replace(/EQ_C/g, cEq.value)
              .replace(/EQ/g, eq.value),
          )

          gl.setUniform("u_theme", themeMap[props.theme].id)
          gl.setUniform("u_inner_theme", innerThemeMap[props.innerTheme].id)
          gl.setUniform("u_effect_outer_a", +props.effectOuterA)
          gl.setUniform("u_effect_outer_b", +props.effectOuterB)
          gl.setUniform("u_effect_outer_c", +props.effectOuterC)
          gl.setUniform("u_effect_inner_a", +props.effectInnerA)
          gl.setUniform("u_effect_inner_b", +props.effectInnerB)
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

          gl.draw()

          canvas.width = canvas.clientWidth * devicePixelRatio
          canvas.height = canvas.clientHeight * devicePixelRatio
          ctx.drawImage(glCanvas, 0, 0, canvas.width, canvas.height)
        }

        const observer = new IntersectionObserver(([entry]) => {
          if (entry!.isIntersecting) {
            render()
            observer.unobserve(canvas)
          }
        })

        observer.observe(canvas)
      }}
    />
  )
}

export function Fractal(props: { class: string; url: string }) {
  const url = new URL(
    props.url.startsWith("/") ? "https://zsnout.com" + props.url : props.url,
  )

  const equation = (url.searchParams.get("equation") ?? "z^2+c")!
  const z = (url.searchParams.get("z") ?? "p")!
  const c = (url.searchParams.get("c") ?? "p")!
  let effectSplit = !(
    url.searchParams.get("split") == "false" ||
    url.searchParams.get("split") == null
  )
  const effectAltColors = !(
    url.searchParams.get("alt_colors") == "false" ||
    url.searchParams.get("alt_colors") == null
  )
  function fallback(name: string, fallback: boolean) {
    const value = url.searchParams.get(name)
    if (value == "true") {
      return true
    }
    if (value == "false") {
      return false
    }
    return fallback
  }
  const effectOuterA = fallback("outer_a", effectSplit)
  const effectOuterB = fallback("outer_b", effectAltColors)
  const effectOuterC = url.searchParams.get("outer_c") == "true"
  const effectInnerA = fallback("inner_a", effectSplit)
  const effectInnerB = fallback("inner_b", effectAltColors)
  const detail = +(url.searchParams.get("detail") ?? 100)!
  const fractalSize = +(url.searchParams.get("size") ?? 2)!
  const minDetail = +(url.searchParams.get("min_detail") ?? 0)!
  let plotSize = +(url.searchParams.get("plot_size") ?? 1)!
  let theme = (url.searchParams.get("theme") ?? "simple")! as Theme
  let innerTheme = url.searchParams.get("inner_theme") as InnerTheme | "" | null
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

  if (
    // @ts-ignore rotation is no longer a valid theme value
    theme == "rotation"
  ) {
    theme = "plot"
    plotSize = 0
  }

  if (!innerTheme) {
    innerTheme =
      theme == "simple" || theme == "trig" ? "black"
      : theme == "none" ? "plot"
      : theme
  }

  if (effectSplit) {
    if (theme == "plot") {
      theme = "none"
      innerTheme = "plot"
    }
    effectSplit = false
  }

  return (
    <Canvas
      class={props.class}
      equation={equation}
      effectOuterA={effectOuterA}
      effectOuterB={effectOuterB}
      effectOuterC={effectOuterC}
      effectInnerA={effectInnerA}
      effectInnerB={effectInnerB}
      z={z}
      c={c}
      detail={detail}
      fractalSize={fractalSize}
      minDetail={minDetail}
      plotSize={plotSize}
      theme={theme}
      innerTheme={innerTheme}
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
  "/fractal-explorer?top=0.8234233154537663&right=0.018144838068416824&bottom=0.8181709391031092&left=0.01289246171775982",
  "/fractal-explorer?top=-0.2470825091046157&right=0.36080929376344084&bottom=-0.2485878043953133&left=0.3593039984727434&equation=z%5E2%20%2B%202z%5E3%20%2B%20c%5E3%20%2B%202c%5E2&theme=gradient&colorOffset=177.79378742515&repetition=5.95704405&spectrum=28.9951347305389",
  "/fractal-explorer?top=0.9036806541192504&right=-0.05550422341528134&bottom=0.8884295454781905&left=-0.07075533205633991&equation=z%5E2%20%2B%20c&theme=gradient&detail=440&split=",
  "/fractal-explorer?equation=abs(z)%5E2%2Bc%23fx&top=0.6124109336509034&right=-1.0364451711801372&bottom=0.550921590011006&left=-1.0979345148198165&theme=gradient&spectrum=19.7604790419162&colorOffset=161.322979041916",
  "/fractal-explorer?equation=z%5E2%2Bz%2Bc&theme=gradient&detail=100&limit=2&colorOffset=106.807634730539&grayscale=0&repetition=1&noise=0&separation=0&overcolor=0&minIter=0&top=-0.3236023916381393&right=-1.1000885603523771&bottom=-0.27943492320910235&left=-1.1442560287813464",
  "/fractal-explorer?equation=(z-($(-0.30867666568396235%2B-0.06060215212264164i)))%5E2%20%2B%20c-($(-0.30867666568396235%2B-0.06060215212264164i))&theme=gradient&top=-0.7699441130504783&right=-0.8768257407827537&bottom=-0.8143723831826022&left=-0.9212540109148785",
  "/fractal-explorer?equation=z%5E2%20%2B%20c/z&theme=gradient&top=0.2843393872612489&right=-0.019615425965304342&bottom=0.1421571308069384&left=-0.16179768241961748",
  "/fractal-explorer?top=1&right=1&bottom=-1&left=-1&equation=sinz%2Fc&theme=simple&size=4.148867313915856",
  "/fractal-explorer?equation=(z%5E3%2B1)/(cz%5E2%2B1)&theme=gradient&top=7.792474057796062&right=2.3399178077568275&bottom=4.5915624523383745&left=-0.8609937976993065&size=3.2208083832335355&detail=1000&colorOffset=155.580089820359&spectrum=25.3134356287425&smoothness=66.6986339820359",
  "/fractal-explorer?top=0.1049269514436077&right=-0.7465816870469891&bottom=0.10449756009721944&left=-0.7470110783933633&theme=simple&equation=z%5E2%20%2B%20c&detail=1000",
  "/fractal-explorer?top=0.06767421603310363&right=1.086954203292915&bottom=-0.001463895888047755&left=1.017816091374455&theme=simple&equation=(z%5E-c)/c&detail=1000&size=2.7185628742515036&smoothness=60.018244760479&colorOffset=195.729790419162&split=",
  "/fractal-explorer?top=0.8758411252606795&right=-0.13634717493221565&bottom=0.8161461353110555&left=-0.1960421648795152&theme=gradient&equation=z%5E3%2Bczzzzzz&detail=1000&size=1.996444610778444&split=&colorOffset=257.369011976048",
  "/fractal-explorer?top=0.3278641536530892&right=1.1074929103649902&bottom=0.3271605886362774&left=1.1067893453481683&equation=c%5Ez-sin(z-c%5E2)&theme=simple&size=10&colorOffset=242.868637724551&smoothness=60.090755988024&detail=106&repetition=6.15061891233766",
  "/fractal-explorer?top=-0.5745586518459166&right=0.42233872284171703&bottom=-0.60007643612824&left=0.3968209382553626&equation=c%5Ez-abs(z-c%5E2)%2Be%5Ei&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245&min_detail=26",
  "/fractal-explorer?equation=abs(z%5E2)%20%2B%20c%23fx&top=1.0716516053531586&right=-0.21665886128100298&bottom=-0.7992571001470665&left=-2.0875675667812286",
  "/fractal-explorer?top=-0.4428930452056955&right=0.43867499294143386&bottom=-0.5236118579786706&left=0.3579561801670489&equation=c%5Ez-abs(z-c%5E2)&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245",
  "/fractal-explorer?top=-0.5764779917594502&right=0.41918811564625363&bottom=-0.5966906289299476&left=0.3989754784754023&equation=c%5Ez-abs(z-c%5E2)&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245&min_detail=26",
  "/fractal-explorer?top=-0.64339537897206&right=0.43731864822145344&bottom=-0.6434564252899485&left=0.43725760190356294&equation=c%5Ez-abs(z-c%5E2)&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245&min_detail=26",
  "/fractal-explorer?top=0.21212009464707934&right=2.26763443497962&bottom=-0.227424129916064&left=1.8280902104087948&equation=abs(z/c)/sin(z%5Ec)&theme=simple&size=4.148867313915856&spectrum=51.1765531437126&colorOffset=225.993637724551",
  "/fractal-explorer?top=0.05949388349968565&right=0.5021770969113357&bottom=-0.5940501493611277&left=-0.15136693596091572&equation=c%5Ez-abs(z-c%5E2)&theme=simple&size=4.148867313915856&smoothness=75.0292383982036&spectrum=50.1567178143713&colorOffset=231.281811377245&min_detail=26",
  "/fractal-explorer?equation=z%5E4%2Bc",
  "/fractal-explorer?equation=abs%28z%29%5E2+%2B+c%23fx&theme=trig&top=0.08292770814632935&right=-1.7123146416175952&bottom=-0.007896417661361257&left=-1.8031387674252874&detail=50",
  "/fractal-explorer?equation=z%5E3%2F%28z%23z%2B1%29%2Bc%23fx&theme=trig&top=2.1639143538876233&right=2.102318142319261&bottom=-2.1611863918746206&left=-2.222782606201538&alt_colors=&size=10&c=p&z=0",
  "/fractal-explorer?equation=z%5E2%2Bz%2Bc&theme=gradient&top=0.8645449474590621&right=-0.631922068535263&bottom=0.8241830016660656&left=-0.6722840143282595",
  "/fractal-explorer?equation=z%5E2%2B1%2Fc&theme=simple&top=2.6335142291434637&right=3.905972104838716&bottom=-2.762483770998577&left=-1.4900258953033023&z=0",
  "/fractal-explorer?equation=z%5E2%2Bz%2B1%2Fc&theme=gradient&top=5.308551631439171&right=9.006237015050875&bottom=-6.335256136237424&left=-2.6375707526256664&z=0&split=",
  "/fractal-explorer?equation=z%5E2-z%2B1%2Fc&theme=gradient&top=3.259707855090571&right=3.5584339842351547&bottom=-4.408069634483651&left=-4.10934350533903&z=0&split=",
  "/fractal-explorer?equation=z%5E3-z%5E2-z-c&theme=gradient&top=1.3423144520190586&right=0.7223451120418782&bottom=-1.2665684852994903&left=-1.8865378252766565&z=0&split=",
  "/fractal-explorer?equation=%28z%5E3%2B1%29%2F%28cz%5E2%2B1%29&theme=gradient&top=9.36787760049994&right=8.975527957172643&bottom=-9.833892572203903&left=-10.226242215531114&z=0",
  "/fractal-explorer?equation=z-%28zzz%2Bz*%28c-1%29-c%29%2F%283zz%2Bc-1%29&theme=simple&top=1.7723690031050279&right=0.4069383173804213&bottom=1.5363057365164592&left=0.17087505079185286&z=0",
  "/fractal-explorer?equation=1%2F%28z%5E4%2Bc%2B1%29&theme=simple&top=1.0607944307486892&right=0.2624392147134408&bottom=-0.19828594489425327&left=-0.9966411609295017&z=p",
  "/fractal-explorer?smoothness=50&theme=gradient&colorOffset=23.3841691616766&top=-0.4467133777204973&right=-0.6660147105978401&bottom=-0.47512649950362623&left=-0.6944278323809693",
  "/fractal-explorer?equation=1/z%2B1/z%5E2%2B1/z%5E3%2B1/z%5E4%2Bc&z=p&top=1.4324178461698895&right=0.172850781011355&bottom=1.386301959058436&left=0.1267348938999014&theme=simple&size=3.9958832335329273&spectrum=35.1258420658683&colorOffset=241.361339820359&smoothness=66.6120883233533",
  "/fractal-explorer?equation=1/z%2B1/z%5E2%2B1/z%5E3%2B1/z%5E4%2Bc&z=p&top=1.4082920354309258&right=0.15800887282231935&bottom=1.3886149922086692&left=0.13833182960006296&theme=gradient&size=3.9958832335329273&spectrum=35.1258420658683&colorOffset=86.3875374251497&smoothness=66.6120883233533",
  "/fractal-explorer?top=0.6485207629676748&right=-0.38872729227271224&bottom=0.6445793822985508&left=-0.3926686729418361&detail=275",
  "/fractal-explorer?equation=(z%5E3%2B1)/(izc%5E2%2B1)&top=1345.2735397710915&right=1242.8311426337686&bottom=-1256.5935426394678&left=-1359.035939776802",
  "/fractal-explorer?equation=(z%5E3%2B1)/(-zc%5E2%2B1)&top=4.69136004956921&right=4.480313188482539&bottom=-3.872655305683909&left=-4.083702166770603",
  "/fractal-explorer?equation=(z%5E3%2B1)/(izc%5E2%2B1)&top=10.221025983422937&right=8.929199130357018&bottom=-7.7443330906073236&left=-9.036159943673269",
  "/fractal-explorer?equation=z%5E10%2B$(0.40068683656884396%2B0.7539857173315323i)&detail=318&top=0.9489899550602218&right=0.580746212360992&bottom=0.5853111875677176&left=0.21706744486847662",
  "/fractal-explorer?equation=z-(z%5E3-1)/(3z%5E2)%2B$(-0.31968031968031996%2B-0.21378621378621387i)&top=1.8837607385784403&right=2.9933332186510206&bottom=-0.7046453646185724&left=0.4049271154540033",
  "/fractal-explorer?top=0.43627619616614416&right=-0.33613931509690526&bottom=0.07338596800924185&left=-0.6990295432537584&equation=z%5E2%2B$(-0.6954222210000253%2B0.3693522198835498i)&theme=simple&size=1.093001497005988&detail=1000",
  "/fractal-explorer?equation=z%5E2%2B$(0.30773913586413526%2B-0.02282092907092892i)&theme=trig&top=1.5&bottom=-1.5&left=-1.5&right=1.5",
  "/fractal-explorer?equation=z%5E2%2B1/c%2Bc%2Bcc%2Bc%5E3&z=0&top=1.25&right=0.5&bottom=-1.25&left=-2",
  "/fractal-explorer?equation=((7z%2B2)-exp(z*pi*i)(5z%2B2))/4&z=p&theme=trig&top=0.9028411281196939&right=0.8804338762162516&bottom=-0.9428792485004184&left=-0.9652865004038604&size=1000&plot_size=0.851796407185628&detail=100&repetition=3.04819399350649&repetitionSign=1&alt_colors=&colorOffset=172.84244011976",
  "/fractal-explorer?equation=(z-($(-0.30867666568396235%2B-0.06060215212264164i)))%5E2%2Bc-($(-0.30867666568396235%2B-0.06060215212264164i))&theme=gradient&top=0.23715455204308833&right=-0.21182544998644628&bottom=0.22303726815524977&left=-0.22594273387428546&colorOffset=202.112649700599&spectrum=25.032747005988&repetition=5.60044642857143&smoothness=88.9642589820359",
  "/fractal-explorer?equation=%28%287z%2B2%29-cos%28z*pi%29%285z%2B2%29%29%2F4&theme=trig&top=0.06329035871122704&right=-1.956834733148491&bottom=0.02926000167505563&left=-1.9908650901846623&size=10&colorOffset=51.686002994012",
  "/fractal-explorer?equation=(z-m)%5E2%2Bc%2Bm",
  "/fractal-explorer?equation=%28%287z%2B2%29-cos%28z%2Bi%2Bpi%29%285z%2B2%29%29%2F4&theme=trig&top=0.48916276942690706&right=-1.0892247394074448&bottom=-2.2444296606597947&left=-3.8228171694941304&size=10&colorOffset=51.686002994012",
  "/fractal-explorer?theme=simple&top=0.8039897159537612&right=0.22871050379228042&bottom=0.7931233357655454&left=0.2178441236002001&equation=z%5E2%2Bz%2B1%2Fz%2B1%2Fzz%2Bc&size=10",
  "/fractal-explorer?theme=simple&top=0.22830851630590288&right=-1.1830040586957755&bottom=0.20786229763451175&left=-1.2034502773744384&equation=z%5E2%2Bz%2B1%2Fz%2B1%2Fzz%2Bz%5E-19%2Bc&size=10",
  "/fractal-explorer?equation=abs%28z%29%5E2+%2B+z%5Ec&theme=trig&top=2.056110204414094&right=2.96797405902789&bottom=1.9974273005302376&left=2.9092911551455547&detail=50",
  "/fractal-explorer?equation=abs%28z%29%5E2+%2B+zc&theme=trig&top=-0.03176609961933671&right=-0.9674560360182941&bottom=-0.031862356953567525&left=-0.967552293352525&detail=50",
  "/fractal-explorer?equation=abs%28z%29%5E2+%2B+zc%5E2&theme=trig&top=1.235113758268757&right=-0.27615931577638503&bottom=1.0874713012565238&left=-0.4238017727889359&detail=50",
  "/fractal-explorer?top=1&bottom=-1&left=-1&right=1&equation=z%5E2+%2B+%24%28-0.7548332464245562+-0.05134377873212426i%29&detail=1000&z=p&c=p&theme=simple&repetitionSign=1&colorOffset=227.349363772455",
  "/fractal-explorer?theme=trig&top=0.6192549969395025&right=-0.697512930493437&bottom=-0.5009534485676008&left=-1.8177213763989384&equation=z%5E2%2Bz%2B1%2Fz%2B1%2Fzz%2Bz%5E-19%2Bc&size=7.233158682634736&alt_colors=&colorOffset=293.308383233533&spectrum=6.39502245508982&smoothness=70.0435067365269&repetition=10",
  "/fractal-explorer?equation=z%5E%281%2Fc%29%2Bc&theme=simple&top=0.2625242798667542&right=0.07059226094994346&bottom=0.26008657876675123&left=0.06815455984975598&detail=50&slider=75.2718538851351&z=p&c=p&size=10000000000000000000",
  "/fractal-explorer?equation=sin(c/2z)%2Bc%2Bz%5E(10s)&theme=trig&top=-0.06210936446551568&right=-2.5367476087587577&bottom=-0.06285902225071029&left=-2.5374972665439564&detail=50",
  "/fractal-explorer?equation=-sin(c/z)%2Bc%2Bs&theme=trig&top=0.7157181989875658&right=0.8345650806091818&bottom=-0.7651901277071591&left=-0.6463432461032743&detail=60&spectrum=33.3083832335329&colorOffset=160.110404191617&z=p&c=p&slider=100&top=1&bottom=-1&left=-1&right=1",
  "/fractal-explorer?top=1.289089698342261&right=1.223826858898204&bottom=-1.2402356495646085&left=-1.3054984890086656&theme=simple&equation=z%5E2%2B$(0.33642683941372065%2B-0.38902029303725516i)&z=p&c=p",
  "/fractal-explorer?top=-0.3574505452126474&right=0.19007272446711118&bottom=-0.5908818943531389&left=-0.043358624673372786&theme=simple&equation=z%5E2%2B$(0.33642683941372065%2B-0.38902029303725516i)&z=p&c=p&detail=1000&spectrum=16.4670658682635&colorOffset=298.562874251497",
  "/fractal-explorer?top=-0.3616842948005324&right=0.14761699189853802&bottom=-0.3618403453618643&left=0.14746094133720447&theme=trig&equation=z%5E2%2B$(0.33642683941372065%2B-0.38902029303725516i)&z=p&c=p&detail=1000&smoothness=50&colorOffset=310.419161676647&spectrum=79.3413173652695&repetition=10&split=",
  "/fractal-explorer?top=-0.36174680092732175&right=0.1475654626848076&bottom=-0.3618082316166081&left=0.14750403199552067&theme=gradient&equation=z%5E2%2B$(0.33642683941372065%2B-0.38902029303725516i)&z=p&c=p&detail=1000&repetition=10&colorOffset=250.059880239521&alt_colors=&smoothness=50&spectrum=28.1437125748503&size=1.5089820359281438&split=",
  "/fractal-explorer?equation=z%5E2%2Bciter&top=0.20073111328399143&right=0.15245832228095077&bottom=-0.18912677407674686&left=-0.23739956507978804&theme=gradient&split=",
  "/fractal-explorer?top=0.011758642349522994&right=-1.7583249884126786&bottom=-0.011370112115659955&left=-1.7814537428777422&theme=plot&z=p%2Bpi&size=9.681137724550895&split=",
  "/fractal-explorer?top=0.3665934312399958&right=0.2814944640025434&bottom=-0.44477309204020826&left=-0.5298720592776343&theme=plot&z=p*pi&c=p3&size=1.2211826347305401",
  "/fractal-explorer?top=0.0037421570541271982&right=0.0948856121708615&bottom=0.0035431161899835005&left=0.09468657130671781&theme=plot&z=p*pi&c=p3&size=2.2440119760479043&colorOffset=282.445733532934&smoothness=66.6120883233533&spectrum=52.4279565868264",
  "/fractal-explorer?top=0.2077559320058&right=-0.17617072744929424&bottom=0.2072463402261016&left=-0.17668031922899174&theme=plot&z=p*pi&c=p3&split=",
  "/fractal-explorer?top=1.25&right=0.5&bottom=-1.25&left=-2&equation=z%5E(2%5E(5s))%2Bc&theme=simple&z=p&c=p&slider=18.2062922297297&size=10&colorOffset=204.150449101796&repetitionSign=1",
  "/fractal-explorer?top=22.413885501261827&right=26.858785023387497&bottom=-24.26027517056021&left=-19.81537563765906&equation=z%5E9999999t%2Bc&theme=simple&z=p&c=p",
  "/fractal-explorer?equation=cos%28z%2Fc%29i&theme=simple&top=1.1756311813023537&bottom=-1.1032355772269704&left=-1.254544329482924&right=1.024322429046247&z=p&c=p&colorOffset=184.319797904192&spectrum=30.3517964071856&slider=100",
  "/fractal-explorer?equation=i+%2B+z%5E%282sin%28t%2F4%29%2B3%29+-+c%5E13&theme=trig&top=1.1469299661584154&bottom=-1.1538337380185502&left=-1.1939561702946584&right=1.1068075338823076&z=p&c=p",
  "/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.5358480342831237&bottom=0.5293356466677533&left=0.8848479864370451&right=0.891360374052411&z=p&c=p&slider=100&detail=1000&repetition=1.61386465097403&colorOffset=82.9182260479042",
  "/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.5333434114838705&bottom=0.5321997524422072&left=0.8874952969643867&right=0.88863895600605&z=p&c=p&slider=100&detail=1000&repetition=1.33991984577922&colorOffset=167.756362275449&repetitionSign=1&spectrum=21.6364146706587",
  "/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.5322052219742478&bottom=0.5320418993293822&left=0.8861669895650042&right=0.8863303122098698&z=p&c=p&slider=100&detail=1000&repetition=1.33991984577922&colorOffset=349.600486526946&repetitionSign=1&spectrum=21.6364146706587",
  "/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.7629199794519161&bottom=0.7346429175275626&left=-0.11282539695767044&right=-0.08454833503331682&z=p&c=p&slider=29.5634501689189&detail=1000&repetition=1.33991984577922&colorOffset=349.600486526946&repetitionSign=1&spectrum=21.6364146706587",
  "/fractal-explorer?top=-0.08834138672896158&bottom=-0.24039033866367243&left=0.20376283589860458&right=0.355811787833314&equation=z%5E2+%2B+%24%28-0.7548332464245562+-0.05134377873212426i%29&z=p&c=p&theme=simple&repetitionSign=1&colorOffset=227.349363772455&repetition=0.1&detail=100000",
  "/fractal-explorer?top=0.6955242733455318&right=-0.3195432237372543&bottom=0.6954737409879272&left=-0.3195937560948614&equation=z%5E%282%5E%2810s%29%29%2Bc&theme=gradient&z=p&c=p&slider=8.59902871621622&size=10&repetitionSign=1&colorOffset=301.291167664671&repetition=0.1",
  "/fractal-explorer?top=0.23020221917126346&right=-0.06787791059214697&bottom=0.22986106466993741&left=-0.06821906509347302&theme=plot&z=p*pi&c=p3&size=1.2211826347305401&detail=542&colorOffset=71.2471931137725&smoothness=75.0011695359281",
  "/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=trig&top=0.10157257883243714&right=0.9359748859741761&bottom=0.062173227824393995&left=0.8965755349656634&detail=60&colorOffset=109.20752245509&z=p&c=p&slider=47.6694467905405",
  "/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=gradient&top=0.10157257883243714&right=0.9359748859741761&bottom=0.062173227824393995&left=0.8965755349656634&detail=121&colorOffset=94.3282185628743&z=p&c=p&slider=47.6694467905405&smoothness=50&size=2.0059880239520957&spectrum=62.7853667664671",
  "/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=gradient&top=0.22178850608214257&right=0.615155570172504&bottom=0.18837210610066207&left=0.5817391701906254&detail=121&colorOffset=94.3282185628743&z=p&c=p&slider=47.6694467905405&smoothness=50&size=2.0059880239520957&spectrum=62.7853667664671",
  "/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=gradient&top=0.21657578826644164&right=0.6142934664189279&bottom=0.2147035035462515&left=0.6124211816987184&detail=1000&colorOffset=225.12630988024&z=p&c=p&slider=47.6694467905405&smoothness=50&size=2.0059880239520957&spectrum=15.6647642215569",
  "/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=gradient&top=0.017655350949741914&right=0.44775867482027715&bottom=-0.017240714848940613&left=0.41286260902139443&detail=1000&colorOffset=49.8671407185629&z=p&c=p&slider=47.6694467905405&smoothness=73.9251964820359&size=2.0059880239520957",
  "/fractal-explorer?equation=-sin%28c%2Fz%29%2Bc%2Bs&theme=trig&top=0.08742468968569446&right=-0.318660493535491&bottom=0.015538927124259194&left=-0.39054625609733806&detail=215&colorOffset=49.8671407185629&z=p&c=p&slider=100&smoothness=73.9251964820359&size=2.0059880239520957",
  "/fractal-explorer?top=0.005752100400409863&right=-1.3987552072058742&bottom=0.0019426395601652765&left=-1.4025646680461192&equation=z%5E2+%2B+c&theme=gradient&detail=440&split=",
  "/fractal-explorer?top=0.02488261192815503&right=-1.6024398357837109&bottom=-0.027985338853550496&left=-1.6553077865654238&equation=z%5E2+%2B+c&theme=gradient&detail=440&split=",
  "/fractal-explorer?top=0.3431588428734021&bottom=0.3431210830134353&left=-0.1396026623657869&right=-0.13956490250582015&equation=z%5E2+%2B+%24%28-0.7548332464245562+-0.05134377873212426i%29&detail=1000&z=p&c=p&theme=simple&repetitionSign=1&colorOffset=227.349363772455",
  "/fractal-explorer?equation=(i%5Et)(-sin(c/z))+c+s(i%5Et)&theme=trig&top=2.446016940445998&right=2.93255230465265&bottom=-2.275874028903559&left=-1.7893386647534433&detail=60&spectrum=33.3083832335329&colorOffset=160.110404191617&z=p&c=p&slider=100",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=1.4283679092510073&right=0.46226501798466424&bottom=1.3170794419725327&left=0.35097655073384193&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=-0.6898984486765972&right=0.7191426889570944&bottom=-0.7039421946243561&left=0.7050989430128252&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=-0.6790490015762651&right=0.6656810822171566&bottom=-0.7051833214629506&left=0.639546762336966&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=1.4134156334978363&right=0.2584278357250379&bottom=1.3914962134457445&left=0.23650841567839406&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=0.6836822714292016&right=0.496584143527576&bottom=0.6418768492219785&left=0.4547787213304252&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=0.0031922513021186896&right=-1.8826118258722424&bottom=-0.00045882593263868606&left=-1.8862629031061204&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=trig&top=1.0702534475029157&right=0.7447232793224117&bottom=1.0325328712990376&left=0.7070027031276225&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=-0.6539982810169629&right=0.850251872159125&bottom=-1.2633715999595112&left=0.2408785533216244&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862&split=",
  "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=-0.6465338573486934&right=0.7760900030967297&bottom=-1.077125791903115&left=0.3454980686165361&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=-0.75516390863231&right=0.370401360715368&bottom=-0.8364310330259396&left=0.28913423633574786&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=1.6154129325263713&right=0.9311000745787965&bottom=1.6135179679015077&left=0.9292051099542602&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs(z)%5E-2%2Bc&theme=gradient&top=-0.7447401416289288&right=0.8025764692994463&bottom=-0.8494864281496168&left=0.6978301827968821&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  // "/fractal-explorer?equation=abs%28z%29%5E-2%2Bc&theme=trig&top=-0.6913160784717756&right=0.7021063425348611&bottom=-0.6920223553416536&left=0.7014000656651614&detail=1000&z=p&c=p&slider=100",
  "/fractal-explorer?equation=abs(z)%5E-2+%2B+c&theme=trig&top=1.7606134810557814&right=1.1341172675166238&bottom=-1.039697233394625&left=-1.6661934462396988&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862",
  "/fractal-explorer?top=2.9189051590977133&right=2.7188968818329133&bottom=-2.2366941903502875&left=-2.4367024649812166&equation=z%5E-2%2Bcm&theme=trig&colorOffset=131.497005988024&spectrum=60.4790419161677",
  "/fractal-explorer?top=6.198028345100726&right=4.346705649411149&bottom=-6.450353547734011&left=-8.301676239667305&equation=z%5E-2%2Bc%5Es&theme=trig&colorOffset=131.497005988024&spectrum=60.4790419161677&z=p&c=p&detail=100&slider=52.027027027027",
  "/fractal-explorer?equation=c-z2&top=1.25&right=0.5&bottom=-1.25&left=-2",
  "/fractal-explorer?equation=c-z2%5Ez&top=0.551787239759084&right=0.30124447655886055&bottom=-0.5231779976360627&left=-0.7737207608362865&theme=simple&alt_colors=&detail=1000",
  "/fractal-explorer?equation=(c-z2%5Ez)i%5E2&top=-1.8055429319624186&right=-0.8254217173125898&bottom=-1.8100846430397712&left=-0.8299634283899396&theme=simple&alt_colors=&detail=1000&size=10",
  "/fractal-explorer?top=-0.6030067561807897&right=0.07692689137378717&bottom=-0.609819741436197&left=0.07011390611839255&equation=z%5E2%5E%2Bc&theme=simple&detail=180&size=8.371257485029934&smoothness=50&spectrum=55.688622754491&colorOffset=258.682634730539",
  "/fractal-explorer?equation=abs%28z%29%5E-2%2Bc&theme=gradient&top=-0.6990492783058846&right=0.5723551818521021&bottom=-0.7083732400570337&left=0.5630312201025599&detail=50&z=p&c=p&slider=100&colorOffset=20.7400823353293",
  "/fractal-explorer?equation=z%5E2%2Bcpi&top=0.00008198164113673626&right=-0.5673484267630498&bottom=-0.00008356264624005792&left=-0.5675139710504264&theme=simple&z=p&c=p",
  "/fractal-explorer?equation=z%5E2+%2B+cpi&top=-0.0943283973710095&right=-0.22229453181121442&bottom=-0.09625659788481082&left=-0.22422273232502596&theme=simple&z=p&c=p",
  "/fractal-explorer?equation=z%5E2+%2B+cpi&top=-0.09420068125428478&right=-0.2221691610206719&bottom=-0.09637003214115043&left=-0.22433851190754872&theme=gradient&z=p&c=p&size=10&smoothness=50&colorOffset=360&spectrum=0",
  "/fractal-explorer?theme=simple&c=i*0.7&top=1.25&right=0.5&bottom=-1.25&left=-2",
  "/fractal-explorer?equation=abs%28z%5E-2%29%2Bc&theme=trig&top=-1.3495694332736896&right=-0.8408852161583587&bottom=-1.4349414796084008&left=-0.9262572624753473&detail=50&z=p&c=p&slider=100&colorOffset=239.946669161677&repetition=7.01103388798701&smoothness=66.6226141467066&spectrum=15.7840568862275",
  "/fractal-explorer?equation=abs%28z%5E-2%29%2B%28%28%28%28%24%280.45955320728340565+-1.5926714371272952i%29%29%29%29%29&theme=trig&top=21.02152977054059&right=21.49483259471731&bottom=-20.442921376334894&left=-19.969618552158174&detail=50&z=p&c=p&slider=100&colorOffset=239.946669161677&repetition=7.01103388798701&smoothness=66.6226141467066&spectrum=15.7840568862275",
  "/fractal-explorer?equation=abs%28z%5E-2%29%2B%28%28%28%28%28%28%24%280.28670116132914814+-1.1349374697360446i%29%29%29%29%29%29%29&theme=trig&top=407.46150200684053&right=-26.584018348626074&bottom=-41.28163042384202&left=-475.32715082599316&detail=32&z=p&c=p&slider=100&colorOffset=239.946669161677&repetition=7.01103388798701&smoothness=66.6226141467066&spectrum=15.7840568862275",
  "/fractal-explorer?equation=abs%28z%5E-2%29%2B%28%28%28%28%28%28%28%28%24%280.161583318242009+-1.312786560232837i%29%29%29%29%29%29%29%29%29&theme=trig&top=1386.6513611095565&right=1291.170356792124&bottom=-1408.363204540302&left=-1503.8442088572165&detail=50&z=p&c=p&slider=100&colorOffset=239.946669161677&repetition=7.01103388798701&smoothness=66.6226141467066&spectrum=15.7840568862275",
  "/fractal-explorer?equation=abs%28z%29%5E-2%2Bc&theme=gradient&top=1.8763306868071106&right=1.5665817704967244&bottom=-1.5319863948651884&left=-1.8417353105880294&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=294.360965568862&split=",
  "/fractal-explorer?equation=abs%28z%29%5E-2%2Bc&theme=gradient&top=-0.7784782142624549&right=0.27724153087657827&bottom=-0.841144542186764&left=0.21457520296305216&detail=50&spectrum=32.7236152694611&z=p&c=p&slider=100&colorOffset=223.416916167665",
  "/fractal-explorer?equation=abs(z%2Fs)%5E-2%2B(c%23(2%2Bi))s&theme=gradient&top=1.4974537915042647&right=0.6196529102015945&bottom=1.3954590250083043&left=0.5176581437231984&detail=50&z=p&c=p&slider=10.4993665540541&split=&repetition=10&repetitionSign=1&colorOffset=195.696107784431&smoothness=58.9258982035928",
  "/fractal-explorer?equation=abs(z%2Fs)%5E-2%2Bcs&theme=gradient&top=-0.7631311460747561&right=0.2764448249077027&bottom=-0.7969487970063558&left=0.24262717398192235&detail=50&spectrum=0&z=p&c=p&slider=100&colorOffset=220.351796407186&split=",
  "/fractal-explorer?equation=abs%28z%29%5E-10s+%2B+i&theme=trig&top=3.9581517917556632&right=4.008832105618816&bottom=-4.340485911979163&left=-4.289805516743907&spectrum=32.7236152694611&z=p&c=p&detail=60&colorOffset=312.238023952096&slider=10.8583192567568",
  "/fractal-explorer?equation=abs(z)%5E-2+%2B+2i&theme=trig&top=4.05441827114749&right=3.831526046680386&bottom=-4.132773944651591&left=-4.355666088864549&spectrum=32.7236152694611&z=p&c=p&detail=60&colorOffset=168.413173652695&slider=62.0038006756757",
  "/fractal-explorer?equation=z%5E-2+%2B+i&theme=trig&top=2.0809015127696493&right=2.065861345635903&bottom=-2.0321095091810046&left=-2.0471496647681082&z=p&c=p&detail=60&colorOffset=222.743263473054&slider=62.0038006756757",
  "/fractal-explorer?equation=z%5E-10s+%2B+1&theme=trig&top=0.9338834466198791&right=0.5184609066904455&bottom=0.8598104970932614&left=0.444387957371761&z=p&c=p&detail=60&colorOffset=222.743263473054&slider=100",
  "/fractal-explorer?equation=abs%28z%5E-2+%2B+c%29+-+i&theme=trig&top=3.0057975531147507&right=2.112713012386385&bottom=-2.04374496305115&left=-2.936829489810544&z=p&c=p&detail=60&colorOffset=91.5157185628743&slider=100&spectrum=60.2755426646707",
  "/fractal-explorer?equation=abs%28z%5E-1+%2B+c%29%2Fabs%28c%5E-2+-+z%29&theme=trig&top=0.0697925350064585&right=-0.8895391133501758&bottom=-0.009555098531528252&left=-0.9688867466687681&z=p&c=p&detail=60&colorOffset=91.5157185628743&slider=100&spectrum=60.2755426646707",
  "/fractal-explorer?equation=%28z+%2B+c%5E-2%29%2F%28z%5E2+%2B+c%29&theme=plot&top=1.5343713323119956&right=1.4216096913179268&bottom=-1.4554731665325324&left=-1.5682347991556982&z=p&c=p&detail=60&slider=100&spectrum=71.4820359281437&colorOffset=158.148390718563",
  "/fractal-explorer?equation=%28z%5E-2%2Bc%29%2F%28z%5E2+%2B+c%29&theme=trig&top=2.3606865381206026&right=0.24441305202340624&bottom=-2.4842350851435473&left=-4.600508557844956&z=p&c=p&detail=60&slider=100&colorOffset=206.407185628742&spectrum=71.8118450598802",
  "/fractal-explorer?equation=%28zi+%2B+c%5E-2i%29%2F%28z%5E2i+%2B+ci%29&theme=trig&top=1.9935753074710243&right=1.7497493271071982&bottom=-2.0548462116566695&left=-2.2986721808269572&z=p&c=p&detail=60&slider=100&colorOffset=92.997754491018&spectrum=71.8118450598802",
  "/fractal-explorer?equation=2%5E(z%5Eci)&theme=trig&top=11.14700757471605&right=1.7778785098315009&bottom=-3.2757430236326597&left=-12.64487204863989&z=p&c=p&detail=60&slider=100&colorOffset=92.997754491018&spectrum=71.8118450598802",
  "/fractal-explorer?equation=%28c%5E-2%29%2F%28z%5E2%2Bc%29&top=0.49517754039454864&right=0.9885129807417504&bottom=0.4943067531612384&left=0.9876421935084402&theme=gradient",
  "/fractal-explorer?equation=abs%28z%29%5E-1.04+%2B+%24%280.1s-0.9043467599729693+%2B+0.08625649698903404i%29&theme=trig&top=1.4216484502259792&right=0.7192704287947722&bottom=-1.446767735624903&left=-2.14914575705611&spectrum=32.7236152694611&z=p&c=p&detail=60&colorOffset=312.238023952096",
  "/fractal-explorer?equation=%28abs%28z%2Fs%29%5E-1.04+%2B+%24%28-0.9043467599729693+%2B+0.08625649698903404i%29%29s&theme=trig&top=1.4216484502259792&right=0.7192704287947722&bottom=-1.446767735624903&left=-2.14914575705611&spectrum=32.7236152694611&z=ps&c=p&detail=60&colorOffset=312.238023952096&slider=49.070945945946",
  "/fractal-explorer?equation=i%2Bz%5E3-c%5E%2814s%2B1%29&theme=trig&top=0.8664223957348419&bottom=0.8504242100734175&left=0.18368583591623333&right=0.19968402157765774&z=p&c=p&slider=71.3048986486487&detail=1000&repetition=1.33991984577922&colorOffset=360&repetitionSign=1&spectrum=21.6364146706587&alt_colors=",
  "/fractal-explorer?equation=abs%28z%29%5E-%282%2Bs%29+%2B+%24%280.02992872046249362+-0.7137669870740824i%29&theme=trig&top=7.129662090243389&right=5.987524941178652&bottom=-2.9800847040673&left=-4.122221853132038&spectrum=32.7236152694611&z=p&c=p&detail=60&colorOffset=312.238023952096&slider=91.039379222973&size=10",
  "/fractal-explorer?equation=z%5E2+%2B+c-3abs%28z%29cos%282%29&top=0.02059270667276229&right=-0.27820135714751204&bottom=0.0057759637098893715&left=-0.293018100109387&z=p&c=p&theme=trig&colorOffset=66.8263473053892&size=0.4311377245509",
  "/fractal-explorer?equation=z%5E2+%2B+c-3abs%28z%29cos%281%29&top=0.6916305434284395&right=1.1670466356891072&bottom=0.6231116382794207&left=1.0985277305474632&z=p&c=p&theme=trig&colorOffset=66.8263473053892&size=1.820359281437124",
  "/fractal-explorer?equation=z%5E2+%2B+c-3abs%28z%29cos%281%29&top=0.6825438287322306&right=1.3966057406035608&bottom=0.6440399285693114&left=1.3581018404447858&z=p&c=p&theme=trig&colorOffset=66.8263473053892&size=1.820359281437124",
  "/fractal-explorer?equation=z%5E2+%2B+c-3abs%28z%29cos%281%29&top=0.7083696083835711&right=1.3899878364749851&bottom=0.6952633533614956&left=1.3768815814543187&z=p&c=p&theme=trig&colorOffset=66.8263473053892&size=1.820359281437124",
  "/fractal-explorer?equation=z%5E2+%2B+c-3abs%28z%29cos%281%29&top=0.7046356840390762&right=1.3940031234536194&bottom=0.6990364174374675&left=1.3884038568526136&z=p&c=p&theme=trig&colorOffset=66.8263473053892&size=10&detail=1000",
  "/fractal-explorer?equation=z%5E-%282s%291cos2+%2B+abs%28ic%2F2%29tan%282%29&theme=trig&top=1.1862877438467028&right=1.1922661176636686&bottom=-1.537755716888529&left=-1.531777335424334&z=p&c=p&detail=1000&colorOffset=315.597866766467&slider=68.7658361486487&size=2.479041916167663",
  "/fractal-explorer?theme=trig&equation=abs%28z%5E23%2B1%29+%2B+cclog%28103%29sin%284%292z&top=0.00014765618598452967&right=0.4095519446311088&bottom=-0.00030647685423347787&left=0.40909781159089076",
  "/fractal-explorer?theme=trig&equation=abs%28z%5E23%2B1%29+%2B+cclog%28103%29sin%284%292z&top=-0.028427135793205393&right=0.3929664415859938&bottom=-0.02845937235099547&left=0.3929342050282064&colorOffset=243.592814371258&spectrum=0&smoothness=50&detail=1000",
  "/fractal-explorer?equation=zabs%28z%29%5E2+%2B+c&top=-0.07602588849559619&right=-0.49427640534500233&bottom=-0.07693620658647543&left=-0.49518672343585274&theme=gradient&split=&colorOffset=268.383233532934&spectrum=47.9041916167665",
  "/fractal-explorer?equation=zabs%28z%29%5E2+%2B+c&top=-0.038282094719489485&right=-0.4705710130499391&bottom=-0.03899215161041304&left=-0.47128106994083985&theme=gradient&split=&colorOffset=268.383233532934&spectrum=47.9041916167665",
  "/fractal-explorer?equation=zabs%28z%29%5E2+%2B+c&top=1.1059865724132558&right=0.3862092476166263&bottom=1.103351641434137&left=0.3835743166375796&theme=gradient&split=&colorOffset=268.383233532934&spectrum=47.9041916167665",
  "/fractal-explorer?equation=zabs%28z%29%5E2+%2B+c&top=0.04666262093428321&right=0.48193066861506034&bottom=0.03905829353818566&left=0.4743263412198233&theme=gradient&split=&colorOffset=268.383233532934&spectrum=47.9041916167665",
  "/fractal-explorer?top=0.17795141966766442&right=1.4699154369709697&bottom=0.17143662447178193&left=1.463400641775144&theme=gradient&equation=abs%28z%29%5E2+-+c&spectrum=62.5748502994012&colorOffset=54.9700598802395&smoothness=69.7604790419162&plot_size=10&detail=26&split=",
  "/fractal-explorer?equation=%7E%7E%5Cleft%7Cc%5Cright%7C-c-z%5E%7B2%7D-i%5E%7Bt%7D&theme=trig&top=1.4996054020750451&right=1.5&bottom=-1.5003945979249549&left=-1.5&detail=50&spectrum=32.7236152694611&z=p&c=p&colorOffset=219.290793413174&slider=49.9788851351351",
  "/fractal-explorer?equation=%7E%7E%5Cleft%28z%5E%7B-2%7D-i%5Cright%29i%5E%7B2.5%2B0.2%5Cleft%28%5Csin%5Cleft%281%2B5s%5Cright%29t%5Cright%29%7D&theme=trig&top=2.0949016471500226&right=2.1656390792028497&bottom=-2.0805818955872795&left=-2.0098444635344523&z=p&c=p&detail=60&colorOffset=219.080276946108",
  "/fractal-explorer?equation=%7E%7E%5Cleft%28%5Coperatorname%7Bunsign%7D%5Cleft%28z%5E%7B-2%7D-i%5Cright%29i%5Cright%29%5E%7B2.5%7D&theme=trig&top=-0.43472798568417903&right=0.6363510796347338&bottom=-0.43489059072541547&left=0.6361884745934969&z=p&c=p&detail=1000&colorOffset=357.844311377245&slider=62.0038006756757&size=10&spectrum=0",
  "/fractal-explorer?equation=%7E%7E%5Cleft%28%5Coperatorname%7Bunsign%7D%5Cleft%28z%5E%7B-2%7D-i%5Cright%29i%5Cright%29%5E%7B2.5%7D&theme=gradient&top=-0.43569972442003674&right=0.6410518375675749&bottom=-0.435909528796072&left=0.6408420331915379&z=p&c=p&detail=51&colorOffset=360&slider=62.0038006756757&size=10&alt_colors=&spectrum=0",
  "/fractal-explorer?top=-0.9549979363581674&right=-0.042175537063746896&bottom=-1.1951363860919444&left=-0.28231398677983743&equation=abs%28z-z%5E2%29+%2B+c&theme=gradient&size=10&split=",
  "/fractal-explorer?top=-1.056364195006944&right=-0.11758639636021792&bottom=-1.165548224112969&left=-0.2267704254582011&equation=abs%28z-z%5E2%29+%2B+c&theme=gradient&size=10&split=&detail=1000",
  "/fractal-explorer?top=-0.9491299439299168&right=-0.13183969228951045&bottom=-1.099640990028579&left=-0.28235073837709423&equation=%7E%7E%5Coperatorname%7Bunsign%7D%5Cleft%28z-z%5E%7B2%7D%5Cright%29%2Bc&theme=gradient&size=10&split=&detail=1000&spectrum=38.9221556886228&smoothness=63.9221556886228&colorOffset=206.946107784431",
  "/fractal-explorer?top=-0.9902424394818155&right=-0.2178020917944848&bottom=-1.0826697821582953&left=-0.31022943446413503&equation=abs%28z-z%5E2%29+%2B+c&theme=gradient&size=10&detail=55&spectrum=13.7724550898204&smoothness=63.9221556886228&colorOffset=251.137724550898&split=",
  "/fractal-explorer?top=-0.7149475672764496&right=-0.2515657787563698&bottom=-0.8686257206797308&left=-0.40524393214827537&equation=abs%28z-z%5E2%29+%2B+c%2B1&theme=gradient&size=10&detail=37&spectrum=13.7724550898204&smoothness=63.9221556886228&colorOffset=251.137724550898&split=&plot_size=1.4491017964071842",
  "/fractal-explorer?theme=none&equation=%7E%7Ez-%5Cfrac%7Bz%5E%7B3%7D%2Bz%5Cleft%28c-1%5Cright%29-c%7D%7B3z%5E%7B2%7D%2Bc-1%7D&inner_theme=blobs&top=2.2951172592412905&right=2.0297880548799303&bottom=-2.3469437348718283&left=-2.612272939233189&z=%7E%7E0&c=%7E%7Ep%5Codot%5Coperatorname%7Bfx%7D&repetitionSign=1&detail=98",
  "/fractal-explorer?top=0.6142580703517614&right=-0.5965780093026045&bottom=0.6134834930742413&left=-0.5973525865801246&theme=gradient&z=%7E%7Ep&c=%7E%7Ep&size=1.4120203087484517&equation=%7E%7Ez%5E%7B2%7D%2Bc&outer_c=false&inner_theme=blobs&inner_a=true&detail=358&outer_b=true&outer_a=false&inner_b=true&colorOffset=313.332709580838&smoothness=50",
  "/fractal-explorer?equation=%7E%7E%5Cleft%28%5Coperatorname%7Bunsign%7Dz%5Cright%29%5E%7B2%7D%2Bc%5Codot%5Coperatorname%7Bfx%7D&top=0.9270793425225151&right=-0.034734374790994726&bottom=0.9261424423595729&left=-0.03567127495393681&inner_theme=blobs&theme=black&outer_a=true&outer_b=true&repetition=1.0052359216489732&detail=37&spectrum=18.4693113772455&colorOffset=350.518338323353",
  "/fractal-explorer?top=0.945308355529488&right=1.5725626087613018&bottom=-0.9322555870149579&left=-0.3050013337834061&equation=%7E%7E%5Cleft%7Cz%5E%7B2%7Dc%5Cright%7C-z%5E%7B2%7D-c&theme=gradient&inner_theme=black&outer_a=false&outer_b=false&inner_a=false&outer_c=true",
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
            <div class="relative">
              <a class="hover:opacity-70" href={url}>
                <Fractal
                  class="aspect-square w-full touch-none rounded bg-white"
                  url={url}
                />
              </a>
              <a
                class="absolute bottom-2 right-2 hidden size-8 [:hover>&]:block"
                href={"/desmos" + url.slice("/fractal-explorer".length)}
              >
                <img class="aspect-square size-full" src="/desmos.png" />
              </a>
            </div>
          )}
        </For>
      </div>
    </>
  )
}
