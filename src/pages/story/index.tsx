import { FormTitle } from "@/components/form"
import {
  MatchQuery,
  queryError,
  QueryLoading,
  supabase,
} from "@/components/supabase"
import { createResource, For } from "solid-js"

export function Main() {
  const [stories] = createResource(
    async () => await supabase.from("StoryGroup").select(),
  )

  return (
    <div class="my-auto">
      <FormTitle class="mb-8">My story groups</FormTitle>

      <MatchQuery
        result={stories()}
        loading={<QueryLoading message="Loading your stories..." />}
        error={queryError}
        ok={(data) => (
          <div class="flex flex-col gap-2">
            <For each={data}>
              {(row) => (
                <a
                  class="z-field block w-full shadow-none"
                  href={`/story/group?id=${row.id}`}
                >
                  {row.name}
                </a>
              )}
            </For>
          </div>
        )}
      />

      <p class="mt-8 text-center">
        You can also{" "}
        <a
          class="text-z-link underline underline-offset-2"
          href="/story/create"
        >
          create a new group
        </a>
        !
      </p>
    </div>
  )
}
