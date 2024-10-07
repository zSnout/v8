import { Fa } from "@/components/Fa"
import { FormTitle } from "@/components/form"
import {
  MatchQuery,
  queryError,
  QueryLoading,
  requireUser,
  supabase,
} from "@/components/supabase"
import {
  faBook,
  faExternalLink,
  faUserCheck,
  faUserPlus,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { createResource, Show, type JSX } from "solid-js"

export function Main() {
  const { resource: user } = requireUser()

  const [storyCount] = createResource(
    async () => await supabase.from("StoryMemberRaw").select(),
  )

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
              {user.user_metadata.username}'s account
            </FormTitle>
            <p class="mb-8 text-center text-sm text-z-subtitle">{user.email}</p>
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
            <Show
              when={user.email_confirmed_at}
              keyed
              fallback={
                <Card
                  icon={faUserPlus}
                  label="Joined as unverified on:"
                  value={new Date(user.created_at).toLocaleString(undefined, {
                    dateStyle: "long",
                  })}
                />
              }
            >
              {(date) => (
                <Card
                  icon={faUserCheck}
                  label="Verified on:"
                  value={new Date(date).toLocaleString(undefined, {
                    dateStyle: "long",
                  })}
                />
              )}
            </Show>

            <Card
              icon={faBook}
              label="Story groups"
              value={
                <MatchQuery
                  result={storyCount()}
                  error={queryError}
                  loading={<QueryLoading message="Loading count..." />}
                  ok={(rows) => "Collaborator on " + rows.length}
                />
              }
              href="/story"
            />
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

  function Card(props: {
    icon: IconDefinition
    label: string
    value: JSX.Element
    href?: string
  }) {
    return (
      <Show
        when={props.href}
        fallback={
          <div class="z-field relative flex flex-1 px-4 shadow-none">
            <div class="mx-auto grid max-w-full grid-cols-[1.5rem,1fr] items-center gap-x-4">
              <Fa
                icon={props.icon}
                class="row-span-2 block size-6"
                title={false}
              />
              <p class="text-sm text-z-subtitle">{props.label}</p>
              <p class="min-w-40">{props.value}</p>
            </div>
          </div>
        }
      >
        <a
          class="z-field relative flex flex-1 px-4 shadow-none"
          href={props.href}
        >
          <div class="mx-auto grid max-w-full grid-cols-[1.5rem,1fr] items-center gap-x-4">
            <Fa
              icon={props.icon}
              class="row-span-2 block size-6"
              title={false}
            />
            <p class="text-sm text-z-subtitle">{props.label}</p>
            <p class="min-w-40">{props.value}</p>
          </div>
          <Fa
            class="absolute right-2 top-2 size-4 icon-blue-500"
            icon={faExternalLink}
            title="Open Link"
          />
        </a>
      </Show>
    )
  }
}
