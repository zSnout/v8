import { FormTitle } from "@/components/form"
import { supabase } from "@/components/supabase"
import { createResource, Show } from "solid-js"

export function Main() {
  const [user] = createResource(async () => {
    const user = await supabase.auth.getUser()
    if (user.error) {
      location.href = "/account/log-in"
      return
    } else {
      return user.data
    }
  })

  return (
    <div class="my-auto">
      <Show
        when={user()}
        keyed
        fallback={<FormTitle class="mb-8">My account</FormTitle>}
      >
        {(user) => (
          <>
            <FormTitle class="mb-1">
              {user.user.user_metadata.username}'s account
            </FormTitle>
            <p class="mb-8 text-center text-sm text-z-subtitle">
              {user.user.email}
            </p>
          </>
        )}
      </Show>

      <Show
        when={user()}
        keyed
        fallback={<p class="text-center">Fetching account information...</p>}
      >
        {(user) => (
          <div class="flex flex-col gap-2">
            <p>
              Joined on{" "}
              {new Date(user.user.created_at).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
              .
            </p>
            <Show
              when={user.user.email_confirmed_at}
              keyed
              fallback="Email is not verified. Please check your inbox for a verification email."
            >
              {(date) => (
                <p>
                  Verified on{" "}
                  {new Date(date).toLocaleDateString(undefined, {
                    dateStyle: "long",
                  })}
                  .
                </p>
              )}
            </Show>
          </div>
        )}
      </Show>

      <button
        class="z-field mt-12 w-full shadow-none"
        onClick={async () => {
          await supabase.auth.signOut()
          location.href = "/"
        }}
      >
        Sign Out
      </button>
    </div>
  )
}
