import { Form, FormAlternative, FormField } from "@/components/form"
import { supabase } from "@/components/supabase"
import { delay, wait } from "@/components/wait"

export function Main() {
  return (
    <Form
      title="Log in to zSnout"
      submit="Log In (Passwordless)"
      footer={
        <FormAlternative>
          Or{" "}
          <a href="/log-in" class="text-z-link underline underline-offset-2">
            log in using a password
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
        if (!email) {
          await wait(300)
          return "Invalid data entered. Please try again."
        }
        const resp = await delay(
          supabase.auth.signInWithOtp({
            email,
            options: {
              shouldCreateUser: false,
              emailRedirectTo: new URL("/account", location.href).href,
            },
          }),
          300,
        )
        if (resp.error) {
          console.error(resp.error)
          return resp.error.message
        }
        return "Check your email for a magic link."
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
        </>
      )}
    </Form>
  )
}
