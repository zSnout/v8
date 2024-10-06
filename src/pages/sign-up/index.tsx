import { Form, FormField } from "@/components/form"
import { supabase } from "@/components/supabase"
import { delay, wait } from "@/components/wait"

export function Main() {
  return (
    <Form
      title="Sign up for zSnout"
      submit="Sign Up"
      header={
        <p class="text-center text-sm text-z-subtitle">
          By signing up, you agree to our{" "}
          <a
            href="/blog/privacy"
            class="text-z-link underline underline-offset-2"
          >
            privacy policy
          </a>
          .
        </p>
      }
      footer={
        <p class="mt-8 text-center">
          Or{" "}
          <a href="/log-in" class="text-z-link underline underline-offset-2">
            log in to an existing account
          </a>
          .
        </p>
      }
      onSubmit={async (info) => {
        const data = info.data()
        const username = String(data.get("username") ?? "")
        const email = String(data.get("email") ?? "")
        const password = String(data.get("password") ?? "")
        if (!(username && email && password)) {
          await wait(300)
          return "Invalid data entered. Please try again."
        }
        const resp = await delay(
          supabase.auth.signUp({
            email,
            password,
            options: {
              data: { username },
              emailRedirectTo: new URL("/account", location.href).href,
            },
          }),
          300,
        )
        if (resp.error) {
          console.error(resp.error)
          return resp.error.message == "Database error saving new user" ?
              "That username is taken; try another"
            : resp.error.message
        }
        if (resp.data.user?.confirmed_at == null) {
          return "Check your email for a confirmation message!"
        } else {
          location.href = "/account"
          return "Redirecting you to account management..."
        }
      }}
    >
      {() => (
        <>
          <FormField label="Email Address">
            <input
              class="z-field w-full shadow-none"
              type="email"
              autocomplete="email"
              name="email"
              required
            />
          </FormField>

          <FormField label="Username">
            <input
              class="z-field w-full shadow-none"
              type="text"
              autocomplete="username"
              name="username"
              required
              minlength="4"
              maxlength="32"
              pattern="^[A-Za-z][A-Za-z0-9_]{3,31}$"
            />
          </FormField>

          <FormField label="Password (8+ chars; use letters and numbers)">
            <input
              class="z-field w-full shadow-none"
              type="password"
              autocomplete="new-password"
              name="password"
              required
              pattern=".*[A-Za-z].*[0-9].*|.*[0-9].*[A-Za-z].*"
              minlength="8"
            />
          </FormField>
        </>
      )}
    </Form>
  )
}
