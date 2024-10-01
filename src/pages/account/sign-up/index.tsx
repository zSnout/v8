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
        const username = String(data.get("username") ?? "")
        const email = String(data.get("email") ?? "")
        const password = String(data.get("password") ?? "")
        if (!(username && email && password)) {
          await wait(300)
          setProcessing(false)
          setMessage("Invalid data entered. Please try again.")
        }
        const resp = await delay(
          supabase.auth.signUp({
            email,
            password,
            options: { data: { username } },
          }),
          300,
        )
        if (resp.error) {
          setProcessing(false)
          setMessage(resp.error.message)
          return
        }
        setProcessing(false)
        setMessage("Check your email for a confirmation message!")
      }}
    >
      <h1 class="mb-8 text-center text-lg font-semibold text-z-heading">
        Sign up for zSnout
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
        <p class="mb-1 text-z-subtitle">Username</p>
        <input
          class="z-field w-full shadow-none"
          type="text"
          autocomplete="username"
          name="username"
          required
          minlength="4"
          maxlength="32"
        />
      </label>

      <label class="mt-6 block">
        <p class="mb-1 text-z-subtitle">
          Password (8+ chars; use letters and numbers)
        </p>
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
        {processing() ? "Processing..." : "Sign Up"}
      </button>

      <Show when={message()}>
        <p class="mt-8 text-center">{message()}</p>
      </Show>
    </form>
  )
}
