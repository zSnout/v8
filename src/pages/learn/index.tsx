import { createEventListener } from "@/components/create-event-listener"
import { error } from "@/components/result"
import data from "@/learn/data.json"
import { Error } from "@/learn/el/Error"
import { Layers } from "@/learn/el/Layers"
import { createCollection } from "@/learn/lib/defaults"
import { App } from "@/learn/lib/state"
import { Home } from "@/learn/views/Home"
import { createSignal, JSX, Show } from "solid-js"

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

// TODO: "Create Notes" buttons doesn't work
export function Main() {
  return (
    <ErrorHandler>
      <Layers.Root>
        <Home app={app} />
      </Layers.Root>
    </ErrorHandler>
  )
}
