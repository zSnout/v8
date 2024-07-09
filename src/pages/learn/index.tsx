import { createEventListener } from "@/components/create-event-listener"
import { error } from "@/components/result"
import data from "@/learn/data.json"
import { open } from "@/learn/db"
import { resetIfInvalid } from "@/learn/db/init"
import { Error } from "@/learn/el/Error"
import { Layers, useLayers } from "@/learn/el/Layers"
import { createCollection } from "@/learn/lib/defaults"
import { App } from "@/learn/lib/state"
import { Home } from "@/learn/views/Home"
import { createResource, createSignal, JSX, onMount, Show } from "solid-js"

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
        event.preventDefault()
        layers.forcePopAll()
      })
    }
  })

  if (!import.meta.env.DEV) {
    createEventListener(window, "beforeunload", (event) => {
      event.returnValue = true
      return false
    })
  }
}

export function Main() {
  const [db] = createResource(async () => {
    const db = await open("main:Main")
    await resetIfInvalid(db)
    return db
  })

  return (
    <ErrorHandler>
      <Layers.Root>
        <SublinkHandler />
        <Show when={db()} keyed fallback="loading...">
          {(db) => <Home db={db} />}
        </Show>
      </Layers.Root>
    </ErrorHandler>
  )
}
