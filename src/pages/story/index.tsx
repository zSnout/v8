import { FormTitle } from "@/components/form"
import { alert, ModalDescription, prompt } from "@/components/Modal"
import {
  MatchQuery,
  queryError,
  QueryLoading,
  requireUser,
  supabase,
} from "@/components/supabase"
import { randomId } from "@/learn/lib/id"
import { createResource, For, getOwner } from "solid-js"

export function Main() {
  requireUser()

  const [stories] = createResource(
    async () => await supabase.from("StoryGroup").select(),
  )

  const owner = getOwner()

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
        <button
          class="text-z-link underline underline-offset-2"
          onClick={btnCreateGroup}
        >
          create a new group
        </button>
        !
      </p>
    </div>
  )

  async function btnCreateGroup() {
    const name = (
      await prompt({
        owner,
        title: "New group name",
        get description() {
          return (
            <ModalDescription>
              Enter the title for your new group. It should be at least 4
              characters long.
            </ModalDescription>
          )
        },
        minlength: 4,
      })
    )?.trim()
    if (!name) {
      return
    }

    const groupId = randomId()
    const result = await supabase.rpc("create_story", {
      name,
      group_id: groupId,
    })
    if (result.error) {
      await alert({
        owner,
        title: "Failed to create group",
        get description() {
          return <ModalDescription>{result.error.message}</ModalDescription>
        },
      })
      return
    }

    location.href = `/story/group?id=${groupId}`
  }
}
