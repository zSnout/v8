import { Fa } from "@/components/Fa"
import { Checkbox } from "@/components/fields/CheckboxGroup"
import {
  alert,
  load,
  ModalButtons,
  ModalConfirm,
  ModalDescription,
  ModalParagraph,
  popup,
  prompt,
  textarea,
} from "@/components/Modal"
import { randomItem } from "@/components/random"
import {
  MatchQuery,
  pgmap,
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
import { faCommentDots, faLightbulb } from "@fortawesome/free-regular-svg-icons"
import {
  faBook,
  faBookDead,
  faCheck,
  faClock,
  faComment,
  faComments,
  faGem,
  faPlus,
  faTag,
  faUserPlus,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import type { PostgrestSingleResponse } from "@supabase/supabase-js"
import { createChart, type UTCTimestamp } from "lightweight-charts"
import {
  children,
  createMemo,
  createResource,
  For,
  getOwner,
  Show,
  type JSX,
} from "solid-js"
import { createStore } from "solid-js/store"

const GAP = 60 * 60

export function Main() {
  const user = requireUser()

  const groupId = Number(new URL(location.href).searchParams.get("id"))

  if (!Number.isSafeInteger(groupId)) {
    location.href = "/story"
    return "Redirecting..."
  }

  const [shown, setShown] = createStore({
    stat_contribs: true,
    stat_unique_thread_contribs: false,
    stat_threads_created: true,
    stat_threads_completed: false,
    stat_last_contrib: true,
    blocked_on: true,
    theoretical_contribs: false,
  })

  const [stats, { refetch: refetchStats, mutate: mutateStats }] =
    createResource(async () =>
      pgmap(await supabase.rpc("full_stats", { group_id: groupId }), (data) =>
        data.sort(({ stat_contribs: a }, { stat_contribs: b }) => b - a),
      ),
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

  const [completeThreads, { refetch: refetchComplete }] = createResource(
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

  const incomplete = createMemo(() => computeIncomplete(incompleteStories()))

  const isManager = createMemo(() =>
    nonNullEq(user.resource()?.id, group()?.data?.manager),
  )

  const [canComplete] = createResource(
    () => [myself(), incompleteStories()],
    () => btnCompleteStory(true),
  )

  const [times] = createResource(
    async () => await supabase.rpc("contrib_timestamps", { group_id: groupId }),
  )

  return (
    <div class="flex flex-1 flex-col">
      <Header />

      <div class="mt-2 flex w-full border-y border-z py-4 transition">
        <Actions />
      </div>

      <div class="flex flex-1 flex-col md:grid md:grid-cols-[calc(100%_-_18rem),18rem]">
        <div class="flex flex-col pb-2 pt-4">
          <StatsTitle />
          <StatsData />
          <StatsCheckboxes />
        </div>

        <div class="flex h-full flex-col">
          <CompletedTitle />
          <CompletedUl />
          <Chart />
        </div>
      </div>
    </div>
  )

  function Chart() {
    return (
      <MatchQuery
        result={times()}
        loading={<QueryLoading message="Loading chart..." />}
        error={queryError}
        ok={(data) => (
          <div
            class="aspect-square w-full [&_[title='Charting_by_TradingView']]:opacity-30"
            ref={(el) => {
              const chart = createChart(el, {
                autoSize: true,
                timeScale: { timeVisible: true },
              })

              const series = chart.addLineSeries({
                priceFormat: { type: "volume" },
              })
              const offset = new Date().getTimezoneOffset() * 60
              const tx = data.map((x) => x.created_at - offset)
              const now = Math.floor((Date.now() / 1000 - offset) / GAP) * GAP
              series.setData(constructData(tx, now))

              setTimeout(() => chart.timeScale().fitContent(), 10)
              setTimeout(() => chart.timeScale().fitContent(), 100)
            }}
          />
        )}
      />
    )
  }

  function Td(props: {
    value: JSX.Element
    icon: IconDefinition
    title: string
  }) {
    return (
      <td class="px-1 transition first:rounded-l last:rounded-r last:pr-2 group-odd:bg-[--z-table-row-alt]">
        <TdInner {...props} />
      </td>
    )
  }

  function Th(props: {
    value: JSX.Element
    icon: IconDefinition
    title: string
    onClick: () => void
  }) {
    return (
      <th class="group/th p-0 font-semibold text-z-heading transition icon-z-text-heading first:rounded-l last:rounded-r group-odd:bg-[--z-table-row-alt]">
        <button class="w-full px-1 group-last/th:pr-2" onClick={props.onClick}>
          <TdInner {...props} />
        </button>
      </th>
    )
  }

  function TdAsLabel(props: {
    value: JSX.Element
    icon: IconDefinition
    title: string
  }) {
    return (
      <div class="px-1 text-z-heading transition icon-z-text-heading first:rounded-l last:rounded-r last:pr-2 group-odd:bg-[--z-table-row-alt]">
        <TdInner {...props} />
      </div>
    )
  }

  function TdInner(props: {
    value: JSX.Element
    icon: IconDefinition
    title: string
  }) {
    const value = children(() => props.value)

    return (
      <Show when={value()}>
        <div class="flex items-center gap-2">
          <Fa icon={props.icon} class="inline size-4" title={props.title} />
          <span>{value()}</span>
        </div>
      </Show>
    )
  }

  function Header() {
    return (
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
    )
  }

  function Actions() {
    return (
      <div class="mx-auto grid w-full max-w-96 grid-cols-2 justify-center gap-2">
        <button
          class="z-field col-span-2 flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-3 py-2 text-lg shadow-none"
          onClick={btnAddToStory}
          classList={{
            "opacity-30":
              stats()?.data?.find(
                (x) =>
                  x.username === user.resource[0]()?.user_metadata.username,
              )?.blocked_on === (incomplete()?.data?.size ?? 0),
          }}
        >
          <Fa class="size-6" icon={faComment} title={false} />
          Add to a story
        </button>

        <button
          class="z-field flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-2 py-1 shadow-none"
          classList={{
            "opacity-30": !myself()?.data?.gems || myself()?.data?.gems! < 8,
          }}
          onClick={btnCreateStory}
        >
          <Fa class="size-4" icon={faPlus} title={false} />
          Create story
        </button>

        <button
          class="z-field flex items-center justify-center gap-2 rounded-lg border-transparent bg-z-body-selected px-2 py-1 shadow-none"
          classList={{
            "opacity-30":
              !myself()?.data?.gems ||
              myself()?.data?.gems! < 12 ||
              canComplete() === false,
          }}
          onClick={() => btnCompleteStory(false)}
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
    )
  }

  function CompletedUl() {
    return (
      <ul class="flex h-full flex-col gap-2 border-z pl-2 transition">
        <CompletedItems />
      </ul>
    )
  }

  function CompletedTitle() {
    return (
      <div class="mx-auto mb-2 mt-4 flex w-full max-w-96 flex-col gap-1">
        <h2 class="text-center font-semibold text-z-heading transition">
          Completed Stories
        </h2>
      </div>
    )
  }

  function CompletedItems() {
    return (
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
            {([, contentsRaw]) => {
              const contribs = contentsRaw.length
              const words = contentsRaw
                .map((x) => x.split(/\s+/g).length)
                .reduce((a, b) => a + b, 0)
              const contents = contentsRaw.join(" ")
              const data = { contribs, words, contents }
              return (
                <li class="flex flex-col">
                  <p>
                    <strong>{contribs}</strong>{" "}
                    <span class="text-sm text-z-subtitle">contribs</span> •{" "}
                    <strong>{words}</strong>{" "}
                    <span class="text-sm text-z-subtitle">words</span> •{" "}
                    <button
                      class="text-sm text-z-link underline underline-offset-2"
                      onClick={[btnReadMore, data]}
                    >
                      read more
                    </button>
                  </p>
                  <p class="line-clamp-4 pl-4">{contents}</p>
                </li>
              )
            }}
          </For>
        )}
      />
    )
  }

  function StatsTitle() {
    return (
      <div class="mx-auto mb-2 flex w-full max-w-96 flex-col gap-1">
        <h2 class="text-center font-semibold text-z-heading transition">
          Group Leaderboard
        </h2>
      </div>
    )
  }

  function StatsData() {
    return (
      <MatchQuery
        result={stats()}
        loading={<QueryLoading message="Loading statistics..." />}
        error={queryError}
        ok={StatsDataOk}
      />
    )
  }

  function StatsDataOk(
    stats: {
      gems: number
      stat_contribs: number
      stat_last_contrib: string
      stat_threads_completed: number
      stat_threads_created: number
      stat_unique_thread_contribs: number
      username: string
      blocked_on: number
    }[],
  ): JSX.Element {
    return (
      <div class="-mx-6 w-screen overflow-x-auto whitespace-nowrap px-6 pb-4 md:mx-0 md:w-full md:px-0">
        <table class="w-full">
          <thead>
            <StatsDataOkHead />
          </thead>
          <tbody>
            <For each={stats}>{StatsDataOkRow}</For>
          </tbody>
        </table>
      </div>
    )
  }

  function StatsDataOkRow({
    username,
    stat_contribs,
    stat_last_contrib,
    stat_threads_created,
    stat_threads_completed,
    stat_unique_thread_contribs,
    blocked_on,
    gems,
  }: {
    username: string
    stat_contribs: number
    stat_unique_thread_contribs: number
    stat_threads_created: number
    stat_threads_completed: number
    stat_last_contrib: string
    blocked_on: number
    gems: number
  }): JSX.Element {
    return (
      <tr class="group overflow-clip rounded">
        <td class="px-1 pl-2 transition first:rounded-l last:rounded-r group-odd:bg-[--z-table-row-alt]">
          {username}
        </td>
        <Show when={shown.stat_contribs}>
          <Td icon={faComment} title="Contributions" value={stat_contribs} />
        </Show>
        <Show when={shown.stat_unique_thread_contribs}>
          <Td
            icon={faComments}
            title="Part of X threads"
            value={stat_unique_thread_contribs}
          />
        </Show>
        <Show when={shown.stat_threads_created}>
          <Td
            icon={faBook}
            title="Threads Created"
            value={stat_threads_created}
          />
        </Show>
        <Show when={shown.stat_threads_completed}>
          <Td
            icon={faBookDead}
            title="Threads Completed"
            value={stat_threads_completed}
          />
        </Show>
        <Show when={shown.stat_last_contrib}>
          <Td
            icon={faClock}
            title="Last Seen"
            value={(() => {
              if (!stat_last_contrib) {
                return null
              }
              const msg = timestampDist(
                (Date.now() - Date.parse(stat_last_contrib + "Z")) / 1000,
              )
              if (msg == "now") {
                return "now"
              } else {
                return (
                  <>
                    {msg}
                    <span class="hidden md:inline"> ago</span>
                  </>
                )
              }
            })()}
          />
        </Show>
        <Show when={shown.blocked_on}>
          <Td
            icon={faCommentDots}
            title="Blocked Contributions"
            value={
              <MatchQuery
                result={incomplete()}
                loading="..."
                error={() => "ERROR"}
                ok={(map) => map.size - blocked_on + Math.floor(gems / 8)}
              />
            }
          />
        </Show>
        <Show when={shown.theoretical_contribs}>
          <Td
            icon={faLightbulb}
            title="Theoretical Contributions"
            value={
              <MatchQuery
                result={incomplete()}
                loading="..."
                error={() => "ERROR"}
                ok={(map) =>
                  map.size - blocked_on + Math.floor(gems / 8) + stat_contribs
                }
              />
            }
          />
        </Show>
      </tr>
    )
  }

  function StatsDataOkHead() {
    return (
      <tr class="overflow-clip rounded text-z-heading icon-z-text-heading">
        <th class="p-0 font-semibold transition first:rounded-l last:rounded-r">
          <button
            class="px-1 pl-2"
            onClick={() => {
              mutateStats((stats) =>
                pgmap(stats, (data) =>
                  data
                    .slice()
                    .sort(({ username: a }, { username: b }) =>
                      a < b ? -1 : 1,
                    ),
                ),
              )
            }}
          >
            Username
          </button>
        </th>
        <Show when={shown.stat_contribs}>
          <Th
            icon={faComment}
            title="Contributions"
            value="Contribs"
            onClick={() => {
              mutateStats((stats) =>
                pgmap(stats, (data) =>
                  data
                    .slice()
                    .sort(
                      ({ stat_contribs: a }, { stat_contribs: b }) => b - a,
                    ),
                ),
              )
            }}
          />
        </Show>
        <Show when={shown.stat_unique_thread_contribs}>
          <Th
            icon={faComments}
            title="Threads Written On"
            value="Stories"
            onClick={() => {
              mutateStats((stats) =>
                pgmap(stats, (data) =>
                  data
                    .slice()
                    .sort(
                      (
                        { stat_unique_thread_contribs: a },
                        { stat_unique_thread_contribs: b },
                      ) => b - a,
                    ),
                ),
              )
            }}
          />
        </Show>
        <Show when={shown.stat_threads_created}>
          <Th
            icon={faBook}
            title="Stories Created"
            value="Started"
            onClick={() => {
              mutateStats((stats) =>
                pgmap(stats, (data) =>
                  data
                    .slice()
                    .sort(
                      (
                        { stat_threads_created: a },
                        { stat_threads_created: b },
                      ) => b - a,
                    ),
                ),
              )
            }}
          />
        </Show>
        <Show when={shown.stat_threads_completed}>
          <Th
            icon={faBookDead}
            title="Stories Completed"
            value="Finished"
            onClick={() => {
              mutateStats((stats) =>
                pgmap(stats, (data) =>
                  data
                    .slice()
                    .sort(
                      (
                        { stat_threads_completed: a },
                        { stat_threads_completed: b },
                      ) => b - a,
                    ),
                ),
              )
            }}
          />
        </Show>
        <Show when={shown.stat_last_contrib}>
          <Th
            icon={faClock}
            title="Last Contribution"
            value="Last"
            onClick={() => {
              mutateStats((stats) => {
                if (!stats || stats.error) {
                  return stats
                }
                return {
                  ...stats,
                  data: stats.data
                    .slice()
                    .sort(
                      ({ stat_last_contrib: a_ }, { stat_last_contrib: b_ }) =>
                        (b_ ? Date.parse(b_ + "Z") : 0) -
                        (a_ ? Date.parse(a_ + "Z") : 0),
                    ),
                }
              })
            }}
          />
        </Show>
        <Show when={shown.blocked_on}>
          <Th
            icon={faCommentDots}
            title="Possible Contributions"
            value="Possible"
            onClick={() => {
              mutateStats((stats) => {
                if (!stats || stats.error) {
                  return stats
                }
                return {
                  ...stats,
                  data: stats.data
                    .slice()
                    .sort(
                      (a, b) =>
                        Math.floor(b.gems / 8) -
                        b.blocked_on -
                        (Math.floor(a.gems / 8) - a.blocked_on),
                    ),
                }
              })
            }}
          />
        </Show>
        <Show when={shown.theoretical_contribs}>
          <Th
            icon={faLightbulb}
            title="Theoretical Contributions"
            value="Theoretical"
            onClick={() => {
              mutateStats((stats) => {
                if (!stats || stats.error) {
                  return stats
                }
                return {
                  ...stats,
                  data: stats.data
                    .slice()
                    .sort(
                      (a, b) =>
                        Math.floor(b.gems / 8) -
                        b.blocked_on +
                        b.stat_contribs -
                        (Math.floor(a.gems / 8) -
                          a.blocked_on +
                          a.stat_contribs),
                    ),
                }
              })
            }}
          />
        </Show>
      </tr>
    )
  }

  function StatsCheckboxes() {
    return (
      <div class="grid grid-cols-[auto,auto] gap-x-4 border-t border-z py-2">
        <label class="flex gap-2">
          <Checkbox
            checked={shown.stat_contribs}
            onInput={(x) => setShown("stat_contribs", x)}
          />
          <TdAsLabel icon={faComment} title="Contributions" value="Contribs" />
        </label>
        <p>is the number of contributions somebody has made.</p>

        <label class="flex gap-2">
          <Checkbox
            checked={shown.stat_unique_thread_contribs}
            onInput={(x) => setShown("stat_unique_thread_contribs", x)}
          />
          <TdAsLabel
            icon={faComments}
            title="Threads Written On"
            value="Stories"
          />
        </label>
        <p>is the number of stories somebody has participated in.</p>

        <label class="flex gap-2">
          <Checkbox
            checked={shown.stat_threads_created}
            onInput={(x) => setShown("stat_threads_created", x)}
          />
          <TdAsLabel icon={faBook} title="Stories Created" value="Started" />
        </label>
        <p>is the number of stories somebody has created.</p>

        <label class="flex gap-2">
          <Checkbox
            checked={shown.stat_threads_completed}
            onInput={(x) => setShown("stat_threads_completed", x)}
          />
          <TdAsLabel
            icon={faBookDead}
            title="Stories Completed"
            value="Finished"
          />
        </label>
        <p>is the number of stories somebody has completed.</p>

        <label class="flex gap-2">
          <Checkbox
            checked={shown.stat_last_contrib}
            onInput={(x) => setShown("stat_last_contrib", x)}
          />
          <TdAsLabel icon={faClock} title="Last Contribution" value="Last" />
        </label>
        <p>is how long ago somebody's last contribution was.</p>

        <label class="flex gap-2">
          <Checkbox
            checked={shown.blocked_on}
            onInput={(x) => setShown("blocked_on", x)}
          />
          <TdAsLabel
            icon={faCommentDots}
            title="Possible Contributions"
            value="Possible"
          />
        </label>
        <p>
          is how many contributions somebody <em>could</em> make when they next
          log in.
        </p>

        <label class="flex gap-2">
          <Checkbox
            checked={shown.theoretical_contribs}
            onInput={(x) => setShown("theoretical_contribs", x)}
          />
          <TdAsLabel
            icon={faLightbulb}
            title="Theoretical Contributions"
            value="Theoretical"
          />
        </label>
        <p>is “contributions now” plus “possible contributions”.</p>
      </div>
    )
  }

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
      () => <ModalDescription>Fetching last contribution...</ModalDescription>,
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
        title: "Write the next sentence",
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
    if (me.data.gems < 8) {
      await alert({
        owner,
        title: "You need 8 gems to create a story",
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

  async function btnCompleteStory(silent: boolean): Promise<boolean | "err"> {
    const me = await psrc(myself)
    if (me.error) {
      if (!silent)
        await alertError("You are not a member of this group", me.error.message)
      return false
    }
    if (me.data.gems < 12) {
      if (!silent)
        await alert({
          owner,
          title: "You need 12 gems to complete a story",
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
      return false
    }
    const promise = Promise.all([refetchIncomplete(), getMinRecency()])
    const res =
      silent ?
        await promise
      : await load(
          owner,
          promise,
          () => <ModalDescription>Picking a story for you...</ModalDescription>,
          true,
        )
    if (!res) {
      return false
    }
    const [result, minRecency] = res
    const incomplete = computeIncomplete(result ?? undefined)
    if (!incomplete) {
      if (!silent)
        await alertError(
          "Unable to find stories",
          "Something went very wrong. Please reload the page and try again.",
        )
      return "err"
    }
    if (incomplete.error) {
      if (!silent)
        await alertError(
          "Error occurred while picking stories",
          incomplete.error.message,
        )
      return "err"
    }
    const stories = withRecency(incomplete.data)
    if (!stories.size) {
      if (!silent)
        await alertError(
          "No stories exist",
          'There aren\'t any stories in this group! Try making one using the "Create story" button.',
        )
      return false
    }
    if (stories.size < 2) {
      if (!silent)
        await alertError(
          "Not enough stories",
          "There must be at least two active stories before any of them can be completed.",
        )
      return false
    }
    const storiesWithAtLeast20 = withAtLeast20(stories)
    if (!storiesWithAtLeast20.size) {
      if (!silent)
        await alertError(
          "Not enough contributions",
          "There aren't any stories with at least 20 contributions, and you need at least 20 contributions before a story can be completed.",
        )
      return false
    }
    const available = [...storiesWithAtLeast20.entries()].filter(
      ([, { recency }]) => recency == null || recency >= minRecency,
    )
    const picked = randomItem(available)
    if (!picked) {
      if (!silent)
        await alertError(
          "No stories available",
          "You've contributed too recently to all of your group's active stories that have at least 20 contributions. Ask your friends to add to some stories, then try again.",
        )
      return false
    }
    if (silent) {
      return true
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
      return false
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
      return false
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
      return false
    }
    refetchMyself()
    refetchStats()
    refetchComplete()
    return true
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

  async function btnReadMore({
    contribs,
    contents,
    words,
  }: {
    contribs: number
    words: number
    contents: string
  }) {
    await popup<void>({
      owner,
      onCancel: undefined,
      children(close) {
        return (
          <>
            <p class="mb-4 text-center text-z">
              <strong>{contribs}</strong>{" "}
              <span class="text-sm text-z-subtitle">contribs</span> •{" "}
              <strong>{words}</strong>{" "}
              <span class="text-sm text-z-subtitle">words</span>
            </p>
            <ModalParagraph>{contents}</ModalParagraph>
            <ModalButtons>
              <ModalConfirm onClick={() => close()}>OK</ModalConfirm>
            </ModalButtons>
          </>
        )
      },
    })
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

function nonNullEq<T>(x: T | null | undefined, y: T | null | undefined) {
  return x != null && y != null && x === y
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

function computeIncomplete(
  stories:
    | PostgrestSingleResponse<
        {
          contrib: number
          thread: number
          is_mine: boolean
        }[]
      >
    | undefined,
) {
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

function constructData(
  times: number[],
  max?: number,
  gap = GAP,
): { time: UTCTimestamp; value: number }[] {
  times.sort((a, b) => a - b)

  const min = times[0]
  max ??= times[times.length - 1]

  if (min == null || max == null) {
    return []
  }

  let total = 0
  const output: {
    time: UTCTimestamp
    value: number
  }[] = []

  let pos = 0
  for (let i = Math.floor(min / gap) * gap; i <= max + gap; i += gap) {
    while (pos < times.length && times[pos]! <= i) {
      total += 1
      pos += 1
    }
    output.push({ time: i as UTCTimestamp, value: total })
  }

  return output
}
