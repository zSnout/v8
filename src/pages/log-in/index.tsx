import { supabase } from "@/components/supabase"
import { delay, wait } from "@/components/wait"
import { createSignal, Show } from "solid-js"

export function Main() {
  const [processing, setProcessing] = createSignal(false)
  const [message, setMessage] = createSignal<string>()
  return (
    <form
      class="my-auto"
      onSubmit={async (event) => {
        event.preventDefault()
        setProcessing(true)
        setMessage()
        const data = new FormData(event.currentTarget)
        const email = String(data.get("email") ?? "")
        const password = String(data.get("password") ?? "")
        if (!(email && password)) {
          await wait(300)
          setProcessing(false)
          setMessage("Invalid data entered. Please try again.")
        }
        const resp = await delay(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          300,
        )
        if (resp.error) {
          console.error(resp.error)
          setProcessing(false)
          setMessage(resp.error.message)
          return
        }
        setProcessing(false)
        setMessage("Redirecting you to account management...")
        location.href = "/account"
      }}
    >
      <h1 class="mb-8 text-center text-lg font-semibold text-z-heading">
        Log in to zSnout
      </h1>

      <label class="block">
        <p class="mb-1 text-z-subtitle">Email Address</p>
        <input
          class="z-field w-full shadow-none"
          type="email"
          autocomplete="email"
          name="email"
          required
        />
      </label>

      <label class="mt-6 block">
        <p class="mb-1 text-z-subtitle">Password</p>
        <input
          class="z-field w-full shadow-none"
          type="password"
          autocomplete="new-password"
          name="password"
          required
          pattern=".*[A-Za-z].*[0-9].*|.*[0-9].*[A-Za-z].*"
          minlength="8"
        />
      </label>

      <button
        class="z-field mt-12 w-full shadow-none"
        type="submit"
        disabled={processing()}
      >
        {processing() ? "Processing..." : "Log In"}
      </button>

      <Show when={message()}>
        <p class="mt-8 text-center">{message()}</p>
      </Show>
    </form>
  )
}
