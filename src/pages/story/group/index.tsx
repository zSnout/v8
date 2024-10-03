import { Fa } from "@/components/Fa"
import {
  MatchQuery,
  queryError,
  QueryLoading,
  supabase,
} from "@/components/supabase"
import {
  faBook,
  faCheck,
  faClock,
  faComment,
  faGem,
  faPlus,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { createResource, createSignal, For, Show } from "solid-js"

export interface StoryCompleted {
  readonly content: string
  readonly contribs: number
}

export function Main() {
  const groupId = new URL(location.href).searchParams.get("id")

  const [gems] = createSignal(23)
  const [activeCount] = createSignal(7)

  const [completed] = createSignal<readonly StoryCompleted[]>(
    (import.meta.env.PUBLIC_STORIES_COMPLETED as string)
      .split("\n")
      .map((content) => ({
        content,
        contribs: content.split(".").length,
      })),
  )

  const [stats] = createResource(
    async () =>
      await supabase
        .from("StoryMemberStatsUI")
        .select()
        .filter("group", "eq", groupId),
  )

  function Td(props: {
    value: string | number | null | undefined
    icon: IconDefinition
    title: string
  }) {
    return (
      <td class="px-1 first:rounded-l last:rounded-r last:pr-2 group-odd:bg-[--z-table-row-alt]">
        <Show when={props.value}>
          <div class="flex items-center gap-2">
            <Fa icon={props.icon} class="inline size-4" title={props.title} />
            {props.value}
          </div>
        </Show>
      </td>
    )
  }

  return (
    <div class="flex flex-1 flex-col">
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-2">
          <Fa
            class="size-4 icon-[theme(colors.red.500)]"
            icon={faBook}
            title="Active Stories"
          />
          <p class="text-center text-red-500">{activeCount()}</p>
        </div>
        <div class="flex h-full flex-1 items-center justify-center px-2 text-center text-xl font-light text-z-heading">
          Story Title
        </div>
        <div class="flex items-center gap-2">
          <Fa
            class="size-4 icon-[theme(colors.blue.500)]"
            icon={faGem}
            title="Gems"
          />
          <p class="text-center text-blue-500">{gems()}</p>
        </div>
      </div>

      <div class="mt-2 flex w-full border-y border-z py-4">
        <div class="mx-auto grid w-full max-w-96 grid-cols-2 justify-center gap-2">
          <button class="z-field col-span-2 flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-3 py-2 text-lg shadow-none">
            <Fa class="size-6" icon={faComment} title={false} />
            Add to a story
          </button>

          <button class="z-field flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-2 py-1 shadow-none">
            <Fa class="size-4" icon={faPlus} title={false} />
            Create story
          </button>

          <button class="z-field flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-2 py-1 shadow-none">
            <Fa class="size-4" icon={faCheck} title={false} />
            Complete story
          </button>
        </div>
      </div>

      <div class="grid flex-1 grid-cols-[auto,18rem]">
        <div class="flex flex-col pb-2 pr-6 pt-4">
          <div class="mx-auto mb-4 flex w-full max-w-96 flex-col gap-1">
            <h2 class="text-center font-bold text-z-heading">Statistics</h2>

            <p>
              The table below shows each person added to this group, along with
              1) how many contributions they've made, 2) how many stories
              they've started, and 3) the last time they wrote.
              {/* , and 4) how many contributions they <em>could</em> make. */}
            </p>
          </div>

          <MatchQuery
            result={stats()}
            loading={<QueryLoading message="Loading statistics..." />}
            error={queryError}
            ok={(stats) => (
              <table class="w-full">
                <tbody>
                  <For each={stats}>
                    {({
                      created_at,
                      gems,
                      username,
                      stat_contribs,
                      stat_last_contrib,
                      stat_threads_created,
                      stat_unique_thread_contribs,
                    }) => (
                      <tr class="group overflow-clip rounded">
                        <td class="px-1 pl-2 first:rounded-l last:rounded-r group-odd:bg-[--z-table-row-alt]">
                          {username}
                        </td>
                        <Td
                          icon={faComment}
                          title="Contributions"
                          value={stat_contribs!}
                        />
                        <Td
                          icon={faBook}
                          title="Threads Created"
                          value={stat_threads_created!}
                        />
                        <Td
                          icon={faClock}
                          title="Last Contribution"
                          value={stat_last_contrib!}
                        />
                        {/* <Td
                          icon={faCalendarXmark}
                          title="Possible Contributions"
                          value={possible}
                        /> */}
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            )}
          />
        </div>

        <ul class="flex flex-col gap-2 border-l border-z pl-2 pt-2">
          <For each={completed()}>
            {({ content, contribs }) => (
              <li class="flex flex-col">
                <p>
                  <strong>{contribs}</strong>{" "}
                  <span class="text-sm text-z-subtitle">contribs</span> •{" "}
                  <strong>{content.split(/\s+/g).length}</strong>{" "}
                  <span class="text-sm text-z-subtitle">words</span> •{" "}
                  <button class="text-sm text-z-link underline underline-offset-2">
                    read more
                  </button>
                </p>
                <p class="line-clamp-4 pl-4">{content}</p>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  )
}
