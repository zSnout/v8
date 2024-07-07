import { createEventListener } from "@/components/create-event-listener"
import { error } from "@/components/result"
import data from "@/learn/data.json"
import { Error } from "@/learn/el/Error"
import { Layers, useLayers } from "@/learn/el/Layers"
import { createCollection } from "@/learn/lib/defaults"
import { App } from "@/learn/lib/state"
import { Home } from "@/learn/views/Home"
import { createSignal, JSX, onMount, Show } from "solid-js"

const app = new App(createCollection(Date.now()))
app.importJSON(data)

export function ErrorHandler(props: { children: JSX.Element }) {
  const [reason, setError] = createSignal<unknown>()

  createEventListener(window, "unhandledrejection", (event) => {
    setError(event.reason)
  })

  createEventListener(window, "error", (event) => {
    setError(event.error)
  })

  return (
    <>
      {props.children}

      <Show when={reason() != null}>
        <Error message={error(reason()).reason} onClose={() => setError()} />
      </Show>
    </>
  )
}

function SublinkHandler(): undefined {
  const layers = useLayers()

  onMount(() => {
    const el = document.getElementsByClassName("z-sublink")[0]

    if (el && el instanceof HTMLElement) {
      createEventListener(el, "click", (event) => {
        const closeLayer = document.querySelector(
          ".z-layer-active [data-z-layer-pop]",
        )
        if (closeLayer && closeLayer instanceof HTMLElement) {
          event.preventDefault()
          closeLayer.click()
        } else {
          event.preventDefault()
          layers.pop(0)
        }
      })
    }
  })
}

// TODO: "Create Notes" buttons doesn't work
export function Main() {
  return (
    <ErrorHandler>
      <Layers.Root>
        <SublinkHandler />
        <Home app={app} />
      </Layers.Root>
    </ErrorHandler>
  )
}
