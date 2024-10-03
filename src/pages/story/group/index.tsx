import { Fa } from "@/components/Fa"
import {
  alert,
  load,
  ModalDescription,
  prompt,
  textarea,
} from "@/components/Modal"
import { randomItem } from "@/components/random"
import {
  MatchQuery,
  pgok,
  psrc,
  QueryEmpty,
  queryError,
  QueryLoading,
  requireUser,
  supabase,
} from "@/components/supabase"
import { randomId } from "@/learn/lib/id"
import { timestampDist } from "@/pages/quiz/shared"
import {
  faBook,
  faCheck,
  faClock,
  faComment,
  faGem,
  faPlus,
  faTag,
  faUserPlus,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { createMemo, createResource, For, getOwner, Show } from "solid-js"

function nonNullEq<T>(x: T | null | undefined, y: T | null | undefined) {
  return x != null && y != null && x === y
}

export function Main() {
  const user = requireUser()

  const groupId = Number(new URL(location.href).searchParams.get("id"))

  if (!Number.isSafeInteger(groupId)) {
    location.href = "/story"
    return "Redirecting..."
  }

  const [stats, { refetch: refetchStats }] = createResource(
    async () =>
      await supabase
        .from("StoryMemberStatsUI")
        .select()
        .filter("group", "eq", groupId),
  )

  const [group, { refetch: refetchGroup }] = createResource(
    async () =>
      await supabase
        .from("StoryGroup")
        .select("name, manager")
        .match({ id: groupId })
        .single(),
  )

  const [myself, { refetch: refetchMyself }] = createResource(
    async () =>
      await supabase
        .from("StoryMemberStats")
        .select()
        .match({ group: groupId, user: (await user).id })
        .single(),
  )

  const [completeThreads] = createResource(
    async () =>
      await supabase
        .from("StoryThreadCompleteWithContent")
        .select()
        .eq("group", groupId),
  )

  const [incompleteStories, { refetch: refetchIncomplete }] = createResource(
    async () =>
      await supabase.rpc("get_incomplete_contribs", { group_id: groupId }),
  )

  const completed = createMemo(() => {
    const stories = completeThreads()
    if (!stories || stories.error) {
      return stories
    }
    const grouped = new Map<number, string[]>()
    let v: string[]
    for (const el of stories.data) {
      const contents =
        grouped.get(el.thread!) ?? (grouped.set(el.thread!, (v = [])), v)
      contents.push(el.content!)
    }
    return pgok(grouped, grouped.size)
  })

  const owner = getOwner()

  function computeIncomplete(stories: ReturnType<typeof incompleteStories>) {
    if (!stories || stories.error) {
      return stories
    }
    const grouped = new Map<number, { contrib: number; mine: boolean }[]>()
    let v: { contrib: number; mine: boolean }[]
    for (const el of stories.data) {
      const contents =
        grouped.get(el.thread!) ?? (grouped.set(el.thread!, (v = [])), v)
      contents.push({ contrib: el.contrib!, mine: el.is_mine! })
    }
    return pgok(grouped, grouped.size)
  }

  function withRecency(
    map: Map<number, { contrib: number; mine: boolean }[]>,
  ): Map<
    number,
    { contrib: number; mine: boolean }[] & {
      /**
       * Null means we have never commented on this story. `0` means the last
       * addition was ours, `1` means the 2nd-to-last addition was ours, and so
       * on.
       */
      recency: number | null
    }
  > {
    const ret = map as Map<
      number,
      { contrib: number; mine: boolean }[] & { recency: number | null }
    >

    for (const contribs of ret.values()) {
      const last = contribs.findLastIndex((x) => x.mine)
      if (last == -1) {
        contribs.recency = null
      } else {
        contribs.recency = contribs.length - last - 1
      }
    }

    return ret
  }

  function withAtLeast20<T extends { length: number }>(map: Map<number, T>) {
    const ret: typeof map = new Map()

    for (const [k, v] of map) {
      if (v.length >= 20) {
        ret.set(k, v)
      }
    }

    return ret
  }

  const incomplete = createMemo(() => computeIncomplete(incompleteStories()))

  const isManager = createMemo(() =>
    nonNullEq(user.resource()?.id, group()?.data?.manager),
  )

  function Td(props: {
    value: string | number | null | undefined
    icon: IconDefinition
    title: string
  }) {
    return (
      <td class="px-1 transition first:rounded-l last:rounded-r last:pr-2 group-odd:bg-[--z-table-row-alt]">
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
          <p class="text-center text-red-500">
            <MatchQuery
              result={incomplete()}
              loading="..."
              error={() => "ERROR"}
              ok={(map) => map.size}
            />
          </p>
        </div>
        <div class="flex h-full flex-1 items-center justify-center px-2 text-center text-xl font-light text-z-heading transition">
          <MatchQuery
            result={group()}
            loading={<QueryLoading message="[loading...]" />}
            error={queryError}
            ok={({ name }) => name}
          />
        </div>
        <div class="flex items-center gap-2">
          <Fa
            class="size-4 icon-[theme(colors.blue.500)]"
            icon={faGem}
            title="Gems"
          />
          <p class="text-center text-blue-500">
            <MatchQuery
              result={myself()}
              loading="..."
              error={() => "ERROR"}
              ok={({ gems }) => gems}
            />
          </p>
        </div>
      </div>

      <div class="mt-2 flex w-full border-y border-z py-4 transition">
        <div class="mx-auto grid w-full max-w-96 grid-cols-2 justify-center gap-2">
          <button
            class="z-field col-span-2 flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-3 py-2 text-lg shadow-none"
            onClick={btnAddToStory}
          >
            <Fa class="size-6" icon={faComment} title={false} />
            Add to a story
          </button>

          <button
            class="z-field flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-2 py-1 shadow-none"
            classList={{
              "opacity-30": !myself()?.data?.gems || myself()?.data?.gems! < 10,
            }}
            onClick={btnCreateStory}
          >
            <Fa class="size-4" icon={faPlus} title={false} />
            Create story
          </button>

          <button
            class="z-field flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-2 py-1 shadow-none"
            classList={{
              "opacity-30": !myself()?.data?.gems || myself()?.data?.gems! < 10,
            }}
            onClick={btnCompleteStory}
          >
            <Fa class="size-4" icon={faCheck} title={false} />
            Complete story
          </button>

          <Show when={isManager()}>
            <button
              class="z-field flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-2 py-1 shadow-none"
              onClick={btnAddMember}
            >
              <Fa class="size-4" icon={faUserPlus} title={false} />
              Add member
            </button>

            <button
              class="z-field flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-2 py-1 shadow-none"
              onClick={btnRenameStory}
            >
              <Fa class="size-4" icon={faTag} title={false} />
              Rename story
            </button>
          </Show>
        </div>
      </div>

      <div class="grid flex-1 grid-cols-[auto,18rem]">
        <div class="flex flex-col pb-2 pt-4">
          <div class="mx-auto mb-2 flex w-full max-w-96 flex-col gap-1">
            <h2 class="text-center font-semibold text-z-heading transition">
              Group Leaderboard
            </h2>
          </div>

          <MatchQuery
            result={stats()}
            loading={<QueryLoading message="Loading statistics..." />}
            error={queryError}
            ok={(stats) => (
              <table class="w-full">
                <thead>
                  <tr class="overflow-clip rounded font-semibold text-z-heading icon-z-text-heading">
                    <td class="px-1 pl-2 transition first:rounded-l last:rounded-r">
                      Username
                    </td>
                    <Td
                      icon={faComment}
                      title="Contributions"
                      value="Contribs"
                    />
                    <Td icon={faBook} title="Stories Created" value="Stories" />
                    <Td
                      icon={faClock}
                      title="Last Contribution"
                      value="Last Active"
                    />
                  </tr>
                </thead>
                <tbody>
                  <For
                    each={stats.sort(
                      ({ stat_last_contrib: a_ }, { stat_last_contrib: b_ }) =>
                        (b_ ? Date.parse(b_ + "Z") : 0) -
                        (a_ ? Date.parse(a_ + "Z") : 0),
                    )}
                  >
                    {({
                      username,
                      stat_contribs,
                      stat_last_contrib,
                      stat_threads_created,
                    }) => (
                      <tr class="group overflow-clip rounded">
                        <td class="px-1 pl-2 transition first:rounded-l last:rounded-r group-odd:bg-[--z-table-row-alt]">
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
                          title="Last Active"
                          value={(() => {
                            if (!stat_last_contrib) {
                              return null
                            }
                            const msg = timestampDist(
                              (Date.now() -
                                Date.parse(stat_last_contrib + "Z")) /
                                1000,
                            )
                            if (msg == "now") {
                              return "now"
                            } else {
                              return `${msg} ago`
                            }
                          })()}
                        />
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            )}
          />
        </div>

        <div class="flex h-full flex-col">
          <div class="mx-auto mb-2 mt-4 flex w-full max-w-96 flex-col gap-1">
            <h2 class="text-center font-semibold text-z-heading transition">
              Completed Stories
            </h2>
          </div>

          <ul class="flex h-full flex-col gap-2 border-z pl-2 transition">
            <MatchQuery
              result={completed()}
              loading={<QueryLoading message="Loading completed threads..." />}
              error={queryError}
              ok={(data) => (
                <For
                  each={[...data.entries()]}
                  fallback={
                    <QueryEmpty message="No stories complete yet. Start a story and add to it with your friends!" />
                  }
                >
                  {([, contents]) => (
                    <li class="flex flex-col">
                      <p>
                        <strong>{contents.length}</strong>{" "}
                        <span class="text-sm text-z-subtitle">contribs</span> •{" "}
                        <strong>
                          {contents
                            .map((x) => x.split(/\s+/g).length)
                            .reduce((a, b) => a + b, 0)}
                        </strong>{" "}
                        <span class="text-sm text-z-subtitle">words</span> •{" "}
                        <button
                          class="text-sm text-z-link underline underline-offset-2"
                          onClick={btnReadMore}
                        >
                          read more
                        </button>
                      </p>
                      <p class="line-clamp-4 pl-4">{contents.join(" ")}</p>
                    </li>
                  )}
                </For>
              )}
            ></MatchQuery>
          </ul>
        </div>
      </div>
    </div>
  )

  async function getMinRecency() {
    return 3
  }

  async function btnAddToStory() {
    const res = await load(
      owner,
      Promise.all([refetchIncomplete(), getMinRecency()]),
      () => <ModalDescription>Picking a story for you...</ModalDescription>,
      true,
    )
    if (!res) {
      return
    }
    const [result, minRecency] = res
    const incomplete = computeIncomplete(result ?? undefined)
    if (!incomplete) {
      await alertError(
        "Unable to find stories",
        "Something went very wrong. Please reload the page and try again.",
      )
      return
    }
    if (incomplete.error) {
      await alertError(
        "Error occurred while picking stories",
        incomplete.error.message,
      )
      return
    }
    const stories = withRecency(incomplete.data)
    if (!stories.size) {
      await alertError(
        "No stories exist",
        'There aren\'t any stories in this group! Try making one using the "Create story" button.',
      )
      return
    }
    const available = [...stories.entries()].filter(
      ([, { recency }]) => recency == null || recency >= minRecency,
    )
    const picked = randomItem(available)
    if (!picked) {
      await alertError(
        "No stories available",
        "You've contributed too recently to all of your group's currently active stories. Ask your friends to add to some stories, then try again.",
      )
      return
    }
    const threadId = picked[0]
    const resultLastContrib = await load(
      owner,
      supabase.rpc("get_last_contrib", { thread_id: threadId }).single(),
      () => "Fetching last contribution...",
    )
    if (resultLastContrib.error) {
      await alertError(
        "Unable to fetch last contribution",
        resultLastContrib.error.message,
      )
      return
    }
    const { content, id: contribId } = resultLastContrib.data
    const next = (
      await textarea({
        owner,
        title: "Add to a story",
        minlength: 40,
        get description() {
          return <ModalDescription>{content}</ModalDescription>
        },
      })
    )?.trim()
    if (!next) {
      return
    }
    const resultFinal = await load(
      owner,
      supabase.rpc("push_contrib", {
        last_contrib: contribId,
        my_content: next,
      }),
    )
    if (resultFinal.error) {
      await alert({
        owner,
        title: "Failed to add to story",
        get description() {
          return (
            <>
              <ModalDescription>{resultFinal.error.message}</ModalDescription>
              <ModalDescription>
                Since your contribution wasn't saved, you may want to copy it if
                it was important to you:
              </ModalDescription>
              <ModalDescription>{next}</ModalDescription>
            </>
          )
        },
      })
      return
    }
    refetchMyself()
    refetchStats()
  }

  async function btnCreateStory() {
    const me = await psrc(myself)
    if (me.error) {
      await alertError("You are not a member of this group", me.error.message)
      return
    }
    if (me.data.gems < 10) {
      await alert({
        owner,
        title: "You need 10 gems to create a story",
        get description() {
          return (
            <>
              <ModalDescription>
                You can earn gems by adding onto existing stories.
              </ModalDescription>

              <ModalDescription>
                If there aren't enough existing stories or you've written too
                recently on them to be able to earn gems, ask your friends to
                add onto them.
              </ModalDescription>
            </>
          )
        },
      })
      return
    }
    const content = await textarea({
      owner,
      title: "New story",
      get description() {
        return (
          <ModalDescription>
            Write the first sentence of this group's next thrilling tale!
          </ModalDescription>
        )
      },
      minlength: 40,
      cancelText: "Cancel",
      okText: "OK",
    })
    if (!content) {
      return
    }
    const result = await supabase.rpc("create_thread", {
      content_new: content,
      group_id: groupId,
      thread_id: randomId(),
    })
    if (result.error) {
      await alertError("Failed to create thread", result.error.message)
      return
    }
    refetchMyself()
    refetchIncomplete()
    refetchStats()
  }

  async function btnCompleteStory() {
    const me = await psrc(myself)
    if (me.error) {
      await alertError("You are not a member of this group", me.error.message)
      return
    }
    if (me.data.gems < 10) {
      await alert({
        owner,
        title: "You need 10 gems to complete a story",
        get description() {
          return (
            <>
              <ModalDescription>
                You can earn gems by adding onto existing stories.
              </ModalDescription>

              <ModalDescription>
                If there aren't enough existing stories or you've written too
                recently on them to be able to earn gems, ask your friends to
                add onto them.
              </ModalDescription>
            </>
          )
        },
      })
      return
    }
    const res = await load(
      owner,
      Promise.all([refetchIncomplete(), getMinRecency()]),
      () => <ModalDescription>Picking a story for you...</ModalDescription>,
      true,
    )
    if (!res) {
      return
    }
    const [result, minRecency] = res
    const incomplete = computeIncomplete(result ?? undefined)
    if (!incomplete) {
      await alertError(
        "Unable to find stories",
        "Something went very wrong. Please reload the page and try again.",
      )
      return
    }
    if (incomplete.error) {
      await alertError(
        "Error occurred while picking stories",
        incomplete.error.message,
      )
      return
    }
    const stories = withRecency(incomplete.data)
    if (!stories.size) {
      await alertError(
        "No stories exist",
        'There aren\'t any stories in this group! Try making one using the "Create story" button.',
      )
      return
    }
    if (stories.size < 2) {
      await alertError(
        "Not enough stories",
        "There must be at least two active stories before any of them can be completed.",
      )
      return
    }
    const storiesWithAtLeast20 = withAtLeast20(stories)
    if (!storiesWithAtLeast20.size) {
      await alertError(
        "Not enough contributions",
        "There aren't any stories with at least 20 contributions, and you need at least 20 contributions before a story can be completed.",
      )
      return
    }
    const available = [...storiesWithAtLeast20.entries()].filter(
      ([, { recency }]) => recency == null || recency >= minRecency,
    )
    const picked = randomItem(available)
    if (!picked) {
      await alertError(
        "No stories available",
        "You've contributed too recently to all of your group's active stories that have at least 20 contributions. Ask your friends to add to some stories, then try again.",
      )
      return
    }
    const threadId = picked[0]
    const resultLastContrib = await load(
      owner,
      supabase.rpc("get_last_contrib", { thread_id: threadId }).single(),
      () => "Fetching last contribution...",
    )
    if (resultLastContrib.error) {
      await alertError(
        "Unable to fetch last contribution",
        resultLastContrib.error.message,
      )
      return
    }
    const { content, id: contribId } = resultLastContrib.data
    const next = (
      await textarea({
        owner,
        title: "Complete a story",
        minlength: 40,
        get description() {
          return <ModalDescription>{content}</ModalDescription>
        },
      })
    )?.trim()
    if (!next) {
      return
    }
    const resultFinal = await load(
      owner,
      supabase.rpc("push_final_contrib", {
        last_contrib: contribId,
        my_content: next,
      }),
    )
    if (resultFinal.error) {
      await alert({
        owner,
        title: "Failed to complete story",
        get description() {
          return (
            <>
              <ModalDescription>{resultFinal.error.message}</ModalDescription>
              <ModalDescription>
                Since your contribution wasn't saved, you may want to copy it if
                it was important to you:
              </ModalDescription>
              <ModalDescription>{next}</ModalDescription>
            </>
          )
        },
      })
      return
    }
    refetchMyself()
    refetchStats()
  }

  async function btnAddMember() {
    const username = await prompt({
      owner,
      title: "Add new member",
      get description() {
        return (
          <ModalDescription>
            Enter the username of the member you want to add.
          </ModalDescription>
        )
      },
      cancelText: "Cancel",
      okText: "Add",
    })
    if (!username) {
      return
    }
    const user = await supabase
      .from("User")
      .select("id")
      .eq("username", username)
      .single()
    if (user.error) {
      await alertError("User does not exist", user.error.message)
      return
    }
    const result = await supabase
      .from("StoryMemberStats")
      .insert({ group: groupId, user: user.data.id })
    if (result.error) {
      await alertError("Failed to add user", result.error.message)
      return
    }
    refetchStats()
  }

  async function btnRenameStory() {
    const name = await prompt({
      owner,
      title: "Rename story",
      cancelText: "Cancel",
      okText: "Rename",
      minlength: 4,
    })
    if (!name) {
      return
    }
    const result = await supabase
      .from("StoryGroup")
      .update({ name })
      .eq("id", groupId)
      .single()
    if (result.error) {
      await alertError("Failed to rename group", result.error.message)
      return
    }
    refetchGroup()
  }

  async function btnReadMore() {
    await alertError(
      "This button doesn't do anything yet",
      "Try not pressing it until it's implemented properly.",
    )
  }

  async function alertError(title: string, description: string) {
    await alert({
      owner,
      title,
      get description() {
        return <ModalDescription>{description}</ModalDescription>
      },
    })
  }
}
