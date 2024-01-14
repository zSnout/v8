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
  const BLOB_MIN_HEIGHT = 0
  const BLOB_MAX_HEIGHT = 1000
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
            canvas.height -
              y * (BLOB_MAX_HEIGHT - BLOB_MIN_HEIGHT) +
              BLOB_MIN_HEIGHT,
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
      const MOUSE_BOUND = 100
      screen.x = 0
      if (value < MOUSE_BOUND) {
        screen.x = 4 * (value - MOUSE_BOUND)
      } else if (value > canvas.width / 4 - MOUSE_BOUND) {
        screen.x = 4 * (value - canvas.width / 4 + MOUSE_BOUND)
      }
      console.log(value)
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

    checkCollision() {
      for (let [x, y, r] of blobs.blobs) {
        r += 10
        console.log(1)
        console.log(2)
        console.log(3)
        console.log(4)
        console.log(5)
        console.log(6)
        console.log(7)
        console.log(8)
        console.log(9)
        const offsetX = x - 4 * this.#x
        const offsetY = y - 4 * this.#y
        const direction = Math.atan2(offsetY, offsetX)

        if (Math.hypot(offsetX, offsetY) <= r) {
          this.#x = (x - r * Math.cos(direction)) / 4
          this.#y = (y - r * Math.sin(direction)) / 4
        }
      }
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
      const GRAVITY = ((((9.8 * 100) / 2.56) * 96) / 60 / 60) * 2

      if (this.#active) {
        mouse.x += this.#vx

        if (Math.abs(this.#vx) > 10) {
          this.#vx = 10 * Math.sign(this.#vx)
        }

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

    // Run collisions
    mouse.checkCollision()

    // Clear screen
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Move mouse to correct place
    svgEl.style.top = mouse.y + "px"
    svgEl.style.left = mouse.x - screen.x / 4 + "px"

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
    context.rect(
      -screen.x,
      canvas.height - GROUND_SIZE,
      canvas.width,
      GROUND_SIZE,
    )
    context.fill()

    context.fillStyle = "rgb(0 255 0)"
    for (const [x, y, r] of blobs.blobs) {
      context.beginPath()
      context.arc(x - screen.x, y, r, 0, 360)
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
