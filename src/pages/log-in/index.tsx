import { Form, FormAlternative, FormField } from "@/components/form"
import { supabase } from "@/components/supabase"
import { delay, wait } from "@/components/wait"

export function Main() {
  return (
    <Form
      title="Log in to zSnout"
      submit="Log In"
      footer={
        <FormAlternative>
          Or{" "}
          <a
            href="/log-in/passwordless"
            class="text-z-link underline underline-offset-2"
          >
            log in without a password
          </a>
          .
          <br />
          Or{" "}
          <a href="/sign-up" class="text-z-link underline underline-offset-2">
            sign up for a new account
          </a>
          .
        </FormAlternative>
      }
      onSubmit={async (info) => {
        const data = info.data()
        const email = String(data.get("email") ?? "")
        const password = String(data.get("password") ?? "")
        if (!(email && password)) {
          await wait(300)
          return "Invalid data entered. Please try again."
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
          return resp.error.message
        }
        location.href = "/account"
        return "Redirecting you to account management..."
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

          <FormField label="Password">
            <input
              class="z-field w-full shadow-none"
              type="password"
              autocomplete="password"
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
