import { createEventListener } from "@/components/create-event-listener"
import { createEffect, createMemo, createSignal, type JSX } from "solid-js"
import { Portal } from "solid-js/web"
import { randomId } from "../lib/id"
import { createElementSize, createRemSize, createScreenSize } from "../lib/size"

export function ContextMenu(props: {
  x: number
  y: number
  active: boolean
  children: JSX.Element
}) {
  const window = createScreenSize()
  let el!: HTMLDivElement
  const menu = createElementSize(() => el)
  const rem = createRemSize()
  const pos = createMemo(() => {
    const padding = rem() / 2
    const shouldBeOnLeftSide = props.x > window.width - (padding + menu.width)
    return {
      left:
        Math.max(
          padding,
          Math.min(
            window.width - padding - menu.width,
            shouldBeOnLeftSide ? props.x - menu.width : props.x,
          ),
        ) + "px",
      top:
        Math.max(
          padding,
          Math.min(window.height - padding - menu.height, props.y),
        ) + "px",
    }
  })

  const id = randomId().toString()
  createEffect(() => {
    if (props.active) {
      document.documentElement.classList.add("z-ctxmenu")
      document.documentElement.dataset.ctxmenu = id
    } else {
      if (document.documentElement.dataset.ctxmenu == id) {
        document.documentElement.classList.remove("z-ctxmenu")
        delete document.documentElement.dataset.ctxmenu
      }
    }
  })

  return (
    <div
      class="fixed z-[60] flex max-h-[calc(100dvh_-_1rem)] w-56 max-w-[calc(100dvw_-_1rem)] select-none flex-col overflow-y-auto rounded-lg border border-z bg-z-body p-1 opacity-0 shadow-lg"
      classList={{
        "opacity-100": props.active,
        transition: !props.active,
        "pointer-events-none": !props.active,
      }}
      style={pos()}
      ref={el!}
      inert={!props.active}
    >
      {props.children}
    </div>
  )
}

export function ContextMenuItem(props: { children: JSX.Element }) {
  return (
    <div class="rounded px-2 text-z hover:bg-z-body-selected">
      {props.children}
    </div>
  )
}

export function ContextMenuLine() {
  return <hr class="mx-1 my-1 border-0 border-t border-z" />
}

export function ContextMenuTrigger(props: { children: JSX.Element }) {
  const [x, setX] = createSignal(50)
  const [y, setY] = createSignal(50)
  const [active, setActive] = createSignal(false)

  if (typeof document != "undefined") {
    createEventListener(document, "contextmenu", (event) => {
      event.preventDefault()
      setX(event.screenX)
      setY(event.screenY)
      setActive(true)
    })

    createEventListener(document, "click", () => {
      setActive(false)
    })
  }

  return (
    <Portal>
      <ContextMenu x={x()} y={y()} active={active()}>
        {props.children}
      </ContextMenu>
    </Portal>
  )
}

// TODO: context menus everywherew
