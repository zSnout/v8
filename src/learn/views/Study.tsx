import { Fa } from "@/components/Fa"
import {
  Modal,
  ModalButtons,
  ModalCancel,
  ModalConfirm,
  ModalDescription,
  ModalRef,
  ModalTitle,
} from "@/components/Modal"
import { notNull, prayTruthy } from "@/components/pray"
import { unwrap } from "@/components/result"
import {
  ContentCard,
  ContentIcon,
  Full,
  Response,
  ResponseGray,
  ResponsesGrid,
  Shortcut as DisplayShortcut,
} from "@/pages/quiz/layout"
import { timestampDist } from "@/pages/quiz/shared"
import {
  faBackward,
  faBook,
  faBrain,
  faCalendar,
  faClock,
  faCopy,
  faEarListen,
  faEyeSlash,
  faFlag,
  faForward,
  faInfoCircle,
  faMarker,
  faMicrophone,
  faPause,
  faPen,
  faPersonDigging,
  faPlay,
  faRightFromBracket,
  faSliders,
  faSpinner,
  faSync,
  faTags,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import {
  batch,
  createMemo,
  createResource,
  createSignal,
  For,
  getOwner,
  JSX,
  Owner,
  runWithOwner,
  Show,
} from "solid-js"
import { Grade, Rating } from "ts-fsrs"
import { DB } from "../db"
import { createPrefsStore } from "../db/prefs/store"
import { Reason } from "../db/reason"
import { gather } from "../db/study/gather"
import { putCard, putNote } from "../db/study/merge"
import { checkBucket, saveForget, saveReview, select } from "../db/study/select"
import { createLoading } from "../el/Loading"
import * as Flags from "../lib/flags"
import { Id } from "../lib/id"
import * as Template from "../lib/template"
import { AnyCard, Note } from "../lib/types"
import type { Shortcut } from "../lib/shortcuts"

// TODO: keyboard shortcuts should have `keydown` listeners
// TODO: adjust shortcuts for mac/windows
// FEAT: improve screen for when no cards are left

export const Study = createLoading(
  async (
    { db, main, dids }: { db: DB; main: Id | undefined; dids: Id[] },
    setMessage,
  ) => {
    setMessage("Gathering cards...")
    const [prefs, setPrefs, ready] = createPrefsStore(db)
    const [info] = await Promise.all([
      gather(db, main, dids, Date.now()),
      ready,
    ])
    return { info, prefs, setPrefs }
  },
  ({ db, main, dids }, { info, prefs, setPrefs }, pop) => {
    const owner = getOwner()
    const [answerShown, setAnswerShown] = createSignal(false)

    const [getData, { mutate, refetch }] = createResource(async () => {
      const now = Date.now()
      setAnswerShown(false)
      return { data: await select(db, main, dids, now, info), shownAt: now }
    })

    function notifyOfDataUpdate() {
      mutate((x) => (x ? { ...x } : undefined))
    }

    const tmpl = createMemo(() => {
      const data = getData()?.data
      if (!data) {
        return { qhtml: "", ahtml: "", css: "", source: [] }
      }

      const c = data.card

      const fields = Template.fieldRecord(data.model.fields, data.note.fields)

      const tmpl = notNull(
        data.model.tmpls[c.tid],
        "Card must be linked to a template which exists.",
      )

      const qc = unwrap(Template.parse(tmpl.qfmt))
      const ac = unwrap(Template.parse(tmpl.afmt))
      const qhtml = Template.generate(qc, fields, { FrontSide: undefined })
      const ahtml = Template.generate(ac, fields, { FrontSide: qhtml })

      return { qhtml, ahtml, css: data.model.css, source: [data.deck.name] }
    })

    const [now, setNow] = createSignal(Date.now())
    setInterval(() => setNow(Date.now()), 30_000)

    return {
      el: (
        <div class="flex min-h-full w-full flex-1 flex-col">
          <Full
            layer
            responses={Responses()}
            content={Content()}
            sidebar={Sidebar()}
            sidebarState={prefs.sidebar_state}
            onSidebarState={(state) =>
              setPrefs("Toggle sidebar")("sidebar_state", state)
            }
          />
        </div>
      ),
      onForcePop() {
        return true
      },
    }

    async function updateCurrentCard(
      reason: Reason,
      data: (card: AnyCard) => Partial<AnyCard>,
    ) {
      const selectInfo = getData()?.data
      if (selectInfo == null) {
        return
      }

      const { card } = selectInfo
      const merged = data(card)
      Object.assign(card, merged)
      const now = Date.now()
      await putCard(db, card, reason, now)
      checkBucket(card, selectInfo, info, now)
      notifyOfDataUpdate()
    }

    async function updateCurrentNote(
      reason: Reason,
      data: (card: Note) => Partial<Note>,
    ) {
      const info = getData()
      if (!info) {
        return
      }

      if (!info.data) {
        return
      }

      const { note } = info.data
      const merged = data(note)
      Object.assign(note, merged)
      const now = Date.now()
      await putNote(db, note, reason, now)
      notifyOfDataUpdate()
    }

    function Content() {
      return (
        <Show fallback={<Loading />} when={getData()}>
          <Show fallback={<NullCard />} when={getData()?.data}>
            <ContentCard
              fullFront
              source={prefs.show_deck_name && tmpl().source}
              front={
                <Template.Render
                  html={tmpl()[answerShown() ? "ahtml" : "qhtml"]}
                  css={tmpl().css}
                  class="flex-1"
                  theme="auto"
                />
              }
            />
          </Show>
        </Show>
      )
    }

    function Responses() {
      return (
        <Show
          fallback={
            <ResponseGray onClick={pop}>
              Exit Session
              <DisplayShortcut key="0" />
            </ResponseGray>
          }
          when={getData()?.data}
        >
          <Show
            fallback={
              <ResponseGray onClick={() => setAnswerShown(true)}>
                Reveal Answer
                <DisplayShortcut key="0" />
              </ResponseGray>
            }
            when={answerShown()}
          >
            <ResponsesGrid class="grid-cols-4">
              <Button
                class="bg-red-300 text-red-900"
                rating={Rating.Again}
                label="Again"
                shortcut={{ key: "1" }}
              />

              <Button
                class="bg-[#ffcc91] text-yellow-900"
                rating={Rating.Hard}
                label="Hard"
                shortcut={{ key: "2" }}
              />

              <Button
                class="bg-green-300 text-green-900"
                rating={Rating.Good}
                label="Good"
                shortcut={{ key: "3" }}
              />

              <Button
                class="bg-blue-300 text-blue-900"
                rating={Rating.Easy}
                label="Easy"
                shortcut={{ key: "4" }}
              />
            </ResponsesGrid>
          </Show>
        </Show>
      )
    }

    async function answer(grade: Grade) {
      const { data: c, shownAt } = notNull(
        getData(),
        "Cannot answer before a card has been drawn.",
      )
      prayTruthy(c, "Cannot answer a `null` card.")
      const now = Date.now()
      await saveReview(db, c, info, now, now - shownAt, grade)
      batch(() => {
        refetch()
        setAnswerShown(false)
      })
    }

    async function answerForget() {
      const { data: c, shownAt } = notNull(
        getData(),
        "Cannot forget before a card has been drawn.",
      )
      prayTruthy(c, "Cannot answer a `null` card.")
      const now = Date.now()
      const resetCount = await selectForgetMode(owner)
      if (resetCount == null) return
      await saveForget(db, c, info, now, now - shownAt, resetCount)
      batch(() => {
        refetch()
        setAnswerShown(false)
      })
    }

    function Button(props: {
      class: string
      rating: Grade
      shortcut: Shortcut
      label: string
    }) {
      return (
        <Response class={props.class} onClick={() => answer(props.rating)}>
          {props.label}
          <br />
          {(() => {
            const r = getData()?.data?.repeatInfo
            if (!r) {
              return "<null>"
            }

            const item = r[props.rating]
            return timestampDist((item.card.due - item.log.review) / 1000)
          })()}
          <DisplayShortcut key={props.shortcut} />
        </Response>
      )
    }

    function QuickAction(props: {
      icon: IconDefinition
      label: string
      onClick?: () => void
      shortcut?: string
      disabled?: boolean
    }) {
      const { shortcut = "" } = props
      const mods = shortcut.match(/[⇧⌘⌥⌫]/g)?.join("") ?? ""
      const keys = shortcut.match(/[^⇧⌘⌥⌫]/g)?.join("") ?? ""

      return (
        <button
          class="z-field mx-[calc(-0.5rem_-_1px)] flex items-center gap-2 border-transparent bg-transparent px-2 py-0.5 text-z shadow-none transition hover:enabled:bg-z-body-selected"
          onClick={props.onClick}
          disabled={props.disabled || !props.onClick}
        >
          <Fa class="h-4 w-4" icon={props.icon} title={false} />
          <span class="flex-1 text-left">{props.label}</span>
          <span class="text-right text-sm text-z-subtitle">
            {mods}
            <span class="font-mono">{keys}</span>
          </span>
        </button>
      )
    }

    function QuickActionLine() {
      return <hr class="my-2 border-z" />
    }

    function FlagsSelector() {
      return (
        <div class="mb-1 flex gap-2">
          <For each={Flags.ALL_FLAGS}>
            {(flag) => {
              const checked = createMemo(() => {
                const c = getData()?.data?.card
                if (!c) {
                  return false
                }
                return Flags.has(c.flags, flag)
              })

              return (
                <button
                  class={`flex aspect-square flex-1 items-center justify-center rounded-lg border border-current ${flag.text} ${flag.bg} z-field p-0 shadow-none`}
                  classList={{ "opacity-30": !checked() }}
                  role="checkbox"
                  aria-checked={checked()}
                  aria-label={flag.color + " flag"}
                  onClick={() => {
                    updateCurrentCard(`Toggle ${flag.color} flag`, (card) => ({
                      flags: Flags.has(card.flags, flag)
                        ? 0
                        : 1 << flag.valueOf(),
                    }))
                  }}
                >
                  <Show when={checked()}>
                    <Fa
                      class="h-4 w-4 icon-current"
                      icon={faFlag}
                      title={false}
                    />
                  </Show>
                </button>
              )
            }}
          </For>
        </div>
      )
    }

    // function MarksSelector() {
    //   return (
    //     <div class="mb-1 flex gap-2">
    //       <For each={Flags.ALL_MARKS}>
    //         {(mark) => {
    //           const checked = createMemo(() => {
    //             const c = getData()?.data?.note
    //             if (!c) {
    //               return false
    //             }
    //             return Flags.has(c.marks, mark)
    //           })

    //           return (
    //             <button
    //               class={`z-field flex aspect-square flex-1 items-center justify-center rounded-lg border p-0 shadow-none`}
    //               classList={{
    //                 "opacity-30": !checked(),
    //                 "bg-z-body-selected": checked(),
    //                 // "border-transparent": checked(),
    //               }}
    //               role="checkbox"
    //               aria-checked={checked()}
    //               aria-label={mark.shape + " mark"}
    //               onClick={() =>
    //                 updateCurrentNote(`Toggle ${mark.shape} mark`, (note) => ({
    //                   marks: Flags.toggle(note.marks, mark),
    //                 }))
    //               }
    //             >
    //               <Fa
    //                 class="h-4 w-4 icon-current"
    //                 icon={checked() ? mark.fill : mark.outline}
    //                 title={false}
    //               />
    //             </button>
    //           )
    //         }}
    //       </For>
    //     </div>
    //   )
    // }

    function Sidebar() {
      return (
        <div class="flex w-full flex-1 flex-col">
          <h1 class="pb-0.5 text-center">Quick Actions</h1>
          <QuickActionLine />
          <QuickAction
            icon={faRightFromBracket}
            label="Exit Session"
            shortcut="Esc"
            onClick={pop}
          />
          <QuickAction icon={faSync} label="Sync" shortcut="Y" />
          <QuickActionLine />
          <QuickAction icon={faSliders} label="Deck Options" shortcut="O" />
          <QuickAction
            icon={faBook}
            label="Toggle Deck Name"
            shortcut="N"
            onClick={() =>
              setPrefs("Toggle deck name visibility")(
                "show_deck_name",
                (v) => !v,
              )
            }
          />
          <QuickAction
            icon={faClock}
            label="Toggle Per-Card Timer"
            shortcut="C"
          />
          <QuickAction icon={faForward} label="Auto Advance" shortcut="⇧A" />
          <QuickActionLine />
          <Show when={prefs.show_flags_in_sidebar}>
            <FlagsSelector />
          </Show>
          <QuickAction
            icon={faFlag}
            label={prefs.show_flags_in_sidebar ? "Hide Flags" : "Show Flags"}
            onClick={() =>
              setPrefs("Toggle flag visibility in sidebar")(
                "show_flags_in_sidebar",
                (x) => !x,
              )
            }
          />
          <QuickAction
            icon={faPersonDigging}
            label="Bury Card"
            shortcut="-"
            onClick={async () => {
              await updateCurrentCard("Bury card", () => ({ queue: 1 }))
              batch(() => {
                refetch()
                setAnswerShown(false)
              })
            }}
            disabled={!getData()?.data?.card}
          />
          <QuickAction
            icon={faBrain}
            label="Forget Card..."
            shortcut="⌥⌘N"
            onClick={answerForget}
            disabled={!getData()?.data?.card}
          />
          <QuickAction
            icon={faCalendar}
            label="Set Due Date..."
            shortcut="⇧⌘D"
          />
          <QuickAction
            icon={faEyeSlash}
            label="Suspend Card"
            shortcut="@"
            onClick={async () => {
              await updateCurrentCard("Suspend card", () => ({ queue: 2 }))
              batch(() => {
                refetch()
                setAnswerShown(false)
              })
            }}
            disabled={!getData()?.data?.card}
          />
          <QuickAction icon={faInfoCircle} label="Card Info" shortcut="I" />
          <QuickAction
            icon={faInfoCircle}
            label="Previous Card Info"
            shortcut="⌥⌘I"
          />
          <QuickActionLine />
          {/* <Show when={prefs.show_marks_in_sidebar}> */}
          {/* <MarksSelector /> */}
          {/* </Show> */}
          {/* <QuickAction
          icon={faBookmark}
          label="Toggle Marks in Sidebar"
          shortcut="M"
          onClick={() => setPrefs("show_marks_in_sidebar", (x) => !x)}
        /> */}
          <QuickAction
            icon={faMarker}
            label={getData()?.data?.note.marks ? "Unmark Note" : "Mark Note"}
            disabled={!getData()?.data?.card}
            onClick={() =>
              updateCurrentNote("Toggle whether note is marked", (note) => ({
                marks: note.marks ? 0 : 1,
              }))
            }
            shortcut="M"
          />
          <QuickAction
            icon={faPersonDigging}
            label="Bury Note"
            shortcut="="
            // TODO: onClick={() => {
            //   const c = getData().card
            //   if (!c) {
            //     return
            //   }
            //   const all = app.cards.byNid[c.card.nid]
            //   if (!all) {
            //     return
            //   }
            //   for (const card of all) {
            //     // don't bury suspended cards
            //     if (card.queue == 0) {
            //       card.queue = 1
            //     }
            //   }
            //   refetch()
            // }}
            // disabled={!getData().card}
          />
          <QuickAction
            icon={faEyeSlash}
            label="Suspend Note"
            shortcut="!"
            // TODO: onClick={() => {
            //   const c = getData().card
            //   if (!c) {
            //     return
            //   }
            //   const all = app.cards.byNid[c.card.nid]
            //   if (!all) {
            //     return
            //   }
            //   for (const card of all) {
            //     card.queue = 2
            //   }
            //   refetch()
            // }}
            // disabled={!getData().card}
          />
          <QuickAction icon={faCopy} label="Create Copy..." shortcut="⌥⌘E" />
          <QuickAction icon={faTrash} label="Delete Note" shortcut="⌘⌫" />
          <QuickAction icon={faPen} label="Edit Note" shortcut="E" />
          <QuickAction icon={faTags} label="Edit Tags" shortcut="T" />
          <QuickActionLine />
          {/* play audio should change to replay audio sometimes */}
          <QuickAction icon={faPlay} label="Play Audio" shortcut="R" />
          <QuickAction icon={faPause} label="Pause Audio" shortcut="5" />
          <QuickAction icon={faBackward} label="Audio -5s" shortcut="6" />
          <QuickAction icon={faForward} label="Audio +5s" shortcut="7" />
          <QuickAction
            icon={faMicrophone}
            label="Record Own Voice"
            shortcut="⇧V"
          />
          <QuickAction
            icon={faEarListen}
            label="Replay Own Voice"
            shortcut="V"
          />
        </div>
      )
    }

    function NullCard() {
      return (
        <div class="flex w-full flex-1 flex-col items-center justify-center gap-8">
          <p class="text-8xl">🎉</p>
          <h1 class="text-center text-xl font-semibold text-z-heading">
            Congratulations! You have finished this deck for now.
          </h1>
          <div class="mx-auto flex w-full max-w-md flex-col gap-2">
            <Show when={info.cards.b0.length}>
              <NullMoreNewAvailable />
            </Show>
            <Show when={info.cards.b1.length}>
              <NullMoreLearningAvailable />
            </Show>
            <Show when={info.cards.b2.length}>
              <NullMoreReviewBacklogAvailable />
            </Show>
            <p>
              If you wish to study outside of the regular schedule, you can use
              the{" "}
              <InlineButton
                onClick={() => {
                  // FEAT:
                  throw new Error("this doesn't do anything yet")
                }}
              >
                custom study
              </InlineButton>{" "}
              feature.
            </p>
          </div>
        </div>
      )
    }

    function Loading() {
      return (
        <ContentIcon icon={faSpinner} title="Loading">
          Preparing deck...
        </ContentIcon>
      )
    }

    function NullMoreNewAvailable() {
      return (
        <p>
          There are more new cards available, but the daily limit has been
          reached. You may{" "}
          <InlineButton
            onClick={() => {
              // FEAT:
              throw new Error("this doesn't do anything")
            }}
          >
            increase today's limit
          </InlineButton>{" "}
          if you wish, but beware that adding too many new cards will make your
          daily reviews in the near future skyrocket.
        </p>
      )
    }

    function NullMoreLearningAvailable() {
      const earliest = info.cards.b1.length
        ? info.cards.b1.reduce((a, b) => (a.due < b.due ? a : b))
        : undefined

      return (
        <p>
          There are still some learning cards left, but they aren't due for{" "}
          {earliest
            ? timestampDist((earliest.due - now()) / 1000)
            : "<unknown time>"}
          .
        </p>
      )
    }

    function NullMoreReviewBacklogAvailable() {
      return (
        <p>
          There are more review cards due today, but the daily limit has been
          reached. You may{" "}
          <InlineButton
            onClick={() => {
              // FEAT:
              throw new Error("this doesn't do anything")
            }}
          >
            increase today's limit
          </InlineButton>{" "}
          if you wish, which can help if you have a large backlog.
        </p>
      )
    }

    function InlineButton(props: {
      children: JSX.Element
      onClick: () => void
    }) {
      return (
        <button
          class="whitespace-normal text-z-link underline underline-offset-2"
          classList={{ "bg-red-500": !props.onClick }}
          onClick={props.onClick}
        >
          {props.children}
        </button>
      )
    }
  },
)

async function selectForgetMode(owner: Owner | null) {
  return await new Promise<null | boolean>((resolve) => {
    let modal: ModalRef
    let portal: HTMLDivElement

    runWithOwner(owner, () => (
      <Modal
        ref={(e) => (modal = e)}
        refPortal={(e) => (portal = e)}
        onClose={(value) => {
          resolve(value == "false" ? false : value == "true" ? true : null)
          portal.ontransitionend = () => portal.remove()
        }}
      >
        <ModalTitle>Reset review and lapse counts?</ModalTitle>
        <ModalDescription>
          By the way, forgetting a card means that it will be treated as a new
          card.
        </ModalDescription>
        <ModalButtons>
          <ModalCancel onClick={() => modal.close("null")}>Cancel</ModalCancel>
          <ModalCancel onClick={() => modal.close("false")}>
            Yes, reset
          </ModalCancel>
          <ModalConfirm onClick={() => modal.close("true")}>
            No, keep them
          </ModalConfirm>
        </ModalButtons>
      </Modal>
    ))

    setTimeout(() => modal!.showModal(), 1)
  })
}
