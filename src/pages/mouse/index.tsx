import { defaultMouse } from "@/components/cursors"
import { JSX, Signal, createSignal, onMount } from "solid-js"

interface Events {
  lock(x: number, y: number): void
  unlock(): void
  key(key: string): void
}

async function run(
  container: HTMLDivElement,
  svgEl: HTMLDivElement,
  svg: SVGSVGElement,
  [, setLabel]: Signal<JSX.Element>,
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
): Promise<Events> {
  // Constants
  const LINE_COUNT = 4
  const INITIAL_SPACE = 4
  const SPACE_BETWEEN_LINES = 80
  const BLOB_COUNT = 20
  const BLOB_MIN_SIZE = 64
  const BLOB_MAX_SIZE = 128
  const GROUND_SIZE = 600

  const blobs = new (class Blobs {
    #data = Array(BLOB_COUNT)
      .fill(0)
      .map(() => [Math.random(), Math.random(), Math.random()] as const)

    get blobs() {
      return this.#data.map(
        ([x, y, r]) =>
          [
            x * canvas.width,
            canvas.height - y * GROUND_SIZE,
            r * (BLOB_MAX_SIZE - BLOB_MIN_SIZE) + BLOB_MIN_SIZE,
          ] as const,
      )
    }
  })()

  const mouse = new (class Mouse {
    #x = 0
    #y = 0

    get x() {
      return this.#x
    }

    set x(value) {
      // const width = +(svg.getAttribute("width") || 0)
      // this.#x = Math.max(0, Math.min(value, canvas.width / 4 - width))
      this.#x = value
      screen.x = value + canvas.width / 2
    }

    get y() {
      return this.#y
    }

    set y(value) {
      const height = +(svg.getAttribute("height") || 0)
      this.#y = Math.max(
        0,
        Math.min(value, (canvas.height - GROUND_SIZE) / 4 - height),
      )
    }

    isOnGround() {
      const height = +(svg.getAttribute("height") || 0)
      return this.#y >= (canvas.height - GROUND_SIZE) / 4 - height
    }
  })()

  const gravity = new (class Gravity {
    #active = true
    #vx = 0
    #vy = 0

    get active() {
      return this.#active
    }

    get vx() {
      return this.#vx
    }

    set vx(value) {
      if (this.#active) {
        if (Math.abs(value) > 10) {
          value = 10 * Math.sign(value)
        }
        this.#vx = value
      }
    }

    get vy() {
      return this.#vy
    }

    set vy(value) {
      if (this.#active) {
        this.#vy = value
      }
    }

    start() {
      this.#active = true
    }

    stop() {
      // this.#active = false
      // this.#vy = 0
      // this.#vx = 0
    }

    exec(deltaTime: number) {
      const GRAVITY = (((9.8 * 100) / 2.56) * 96) / 60 / 60

      if (this.#active) {
        mouse.x += this.#vx

        const startVelocity = this.#vy
        this.#vy += GRAVITY * deltaTime

        const endVelocity = this.#vy
        mouse.y += ((startVelocity + endVelocity) / 2) * (deltaTime / 60)

        console.log(startVelocity, endVelocity)

        if (mouse.isOnGround()) {
          this.#vx = this.#vx - 0.05 * this.#vx * deltaTime
          this.#vy = -0.3 * this.#vy
        }
      }
    }
  })()

  const screen = { x: 0 }

  function resize(width: number, height: number) {
    canvas.width = width
    canvas.height = height
    container.style.width = canvas.style.width = width / 4 + "px"
    container.style.height = canvas.style.height = height / 4 + "px"
  }

  resize(4800, 3200)

  function draw(lastTime: number) {
    // Frame information
    const now = Date.now()
    const deltaTime = (60 * (now - lastTime)) / 1000
    requestAnimationFrame(() => draw(now))

    // Run gravity
    gravity.exec(deltaTime)

    // Run force field
    for (const [side, measure] of [
      // ["x", "width"],
      ["y", "height"],
    ] as const) {
      if (mouse[side] < 80) {
        mouse[side] += 4 * deltaTime
      }

      if (mouse[side] < 60) {
        mouse[side] += 3 * deltaTime
      }

      if (mouse[side] < 40) {
        mouse[side] += 2 * deltaTime
      }

      if (mouse[side] > canvas[measure] / 4 - 80) {
        mouse[side] -= 4 * deltaTime
      }

      if (mouse[side] > canvas[measure] / 4 - 60) {
        mouse[side] -= 3 * deltaTime
      }

      if (mouse[side] > canvas[measure] / 4 - 40) {
        mouse[side] -= 2 * deltaTime
      }
    }

    // Clear screen
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Move mouse to correct place
    svgEl.style.top = mouse.y + "px"
    svgEl.style.left = mouse.x + "px"

    // Draw force field
    context.fillStyle = "transparent"
    context.lineWidth = 4
    for (let index = 0; index < LINE_COUNT; index++) {
      const MAX = INITIAL_SPACE + (LINE_COUNT - 1) * SPACE_BETWEEN_LINES + 64

      const TIME = ((Date.now() / 1000) * 64) % SPACE_BETWEEN_LINES
      const position = INITIAL_SPACE + index * SPACE_BETWEEN_LINES + TIME
      const rounding = MAX - position + 64
      const opacity =
        index == 0 ? TIME / 64 : index == LINE_COUNT - 1 ? 1 - TIME / 64 : 1

      context.strokeStyle = `rgba(${255 * (1 - opacity)} ${
        255 * (1 - opacity)
      } ${255 * (1 - opacity)})`

      context.beginPath()
      context.roundRect(
        position,
        position,
        canvas.width - 2 * position,
        canvas.height - 2 * position,
        rounding,
      )
      context.stroke()
    }

    // Draw ground
    context.fillStyle = "rgb(0 128 0)"
    context.beginPath()
    context.rect(0, canvas.height - GROUND_SIZE, canvas.width, GROUND_SIZE)
    context.fill()

    context.fillStyle = "rgb(0 255 0)"
    for (const [x, y, r] of blobs.blobs) {
      context.beginPath()
      context.arc(x, y, r, 0, 360)
      context.fill()
    }
  }

  let lastMouseTime = Date.now()
  function onMouseMove(event: MouseEvent) {
    let deltaTime = ((Date.now() - lastMouseTime) / 1000) * 60
    if (deltaTime > 1) {
      deltaTime = 1
    }
    lastMouseTime = Date.now()

    if (gravity.active) {
      gravity.vx = event.movementX / deltaTime
      gravity.vy = (event.movementY / deltaTime) * 30
    } else {
      mouse.x += event.movementX
      mouse.y += event.movementY
    }
  }

  svgEl.innerHTML = defaultMouse
  svg = svgEl.children[0]! as SVGSVGElement

  draw(Date.now())

  let listening = false

  return {
    lock(x_, y_) {
      setLabel("Your mouse is now locked in this box.")

      mouse.x = x_
      mouse.y = y_

      svgEl.style.display = "block"

      if (!listening) {
        listening = true
        document.addEventListener("mousemove", onMouseMove)
      }
    },

    unlock() {
      svgEl.style.display = "none"
      listening = false
      document.removeEventListener("mousemove", onMouseMove)
    },

    key(key) {
      switch (key) {
        case "g":
          gravity.start()
          break

        case "G":
          gravity.stop()
          break
      }
    },
  }
}

export function Main() {
  let canvas: HTMLCanvasElement
  let container: HTMLDivElement
  let svg: SVGSVGElement
  let svgEl: HTMLDivElement
  let clickToStart: HTMLParagraphElement
  let events: Events | undefined
  let x = 0
  let y = 0
  let locked = false

  const [label, setLabel] = createSignal<JSX.Element>("")

  onMount(() => {
    locked = !!document.pointerLockElement

    document.addEventListener("pointerlockchange", () => {
      if (document.pointerLockElement) {
        clickToStart.style.display = "none"
        events?.lock(x, y)
        locked = true
      } else {
        setLabel("")
        clickToStart.style.display = "block"
        events?.unlock()
        locked = false
      }
    })

    document.addEventListener("keydown", (event) => {
      if (locked) {
        events?.key(event.key)
      }
    })
  })

  return (
    <div class="relative m-auto flex" ref={(self) => (container = self)}>
      <p
        class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        ref={(self) => (clickToStart = self)}
      >
        Click canvas to begin the game.
      </p>

      <p class="pointer-events-none absolute left-1/2 top-[100px] -translate-x-1/2">
        {label()}
      </p>

      <div class="absolute z-[100]" ref={(self) => (svgEl = self)}>
        <svg ref={(self) => (svg = self)} />
      </div>

      <canvas
        ref={async (canvas2) => {
          canvas = canvas2
          events = await run(
            container,
            svgEl,
            svg,
            [label, setLabel],
            canvas2,
            canvas2.getContext("2d")!,
          )
          events.unlock()
        }}
        onPointerDown={(event) => {
          if (!locked) {
            x = event.offsetX
            y = event.offsetY
            canvas.requestPointerLock()
          }
        }}
      />
    </div>
  )
}
