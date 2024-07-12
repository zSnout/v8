import { createEventListener } from "@/components/create-event-listener"
import { error } from "@/components/result"
import { DB, open } from "@/learn/db"
import { Error } from "@/learn/el/Error"
import { Layers } from "@/learn/el/Layers"
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

const MainInner = createLoadingBase<void, DB>(
  () => open("learn:Main", Date.now()),
  (_, db) => Layers.Root(Home, db),
  "Opening database...",
)

export function Main() {
  onMount(() => {
    document.getElementById("needsjavascript")?.remove()
  })

  return <ErrorHandler>{MainInner().el}</ErrorHandler>
}
