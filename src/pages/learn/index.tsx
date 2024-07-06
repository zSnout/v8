import { createEventListener } from "@/components/create-event-listener"
import { error, unwrap } from "@/components/result"
import { Error } from "@/learn/el/Error"
import { Home } from "@/learn/views/Home"
import { createSignal, JSX, Show } from "solid-js"
import { Layers } from "../../learn/el/Layers"
import { createCollection } from "../../learn/lib/defaults"
import { App } from "../../learn/lib/state"

const app = new App(createCollection(Date.now()))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nope")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nuh uh")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Default::nuh uh::72")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Definitely not real")))
unwrap(app.decks.push(app.decks.create(Date.now(), "Wow::23")))
unwrap(app.decks.push(app.decks.create(Date.now(), "45")))

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
