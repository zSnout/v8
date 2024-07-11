import { createEventListener } from "@/components/create-event-listener"
import { error } from "@/components/result"
import { open } from "@/learn/db"
import { checkValidity } from "@/learn/db/init"
import { Error } from "@/learn/el/Error"
import { Layers, useLayers } from "@/learn/el/Layers"
import { createLoadingBase } from "@/learn/el/Loading"
import { Home } from "@/learn/views/Home"
import { createSignal, JSX, onMount, Show } from "solid-js"

function ErrorHandler(props: { children: JSX.Element }) {
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

const MainInner = createLoadingBase(
  async (_, setMessage) => {
    setMessage("Opening database...")
    const db = await open("learn:Main")

    setMessage("Checking validity...")
    await checkValidity(db, Date.now())

    setMessage("Done!")
    return db
  },
  (_, db) => (
    <Layers.Root>
      <SublinkHandler />
      <Home db={db} />
    </Layers.Root>
  ),
)

export function Main() {
  onMount(() => {
    document.getElementById("needsjavascript")?.remove()
  })

  return (
    <ErrorHandler>
      <MainInner />
    </ErrorHandler>
  )
}
