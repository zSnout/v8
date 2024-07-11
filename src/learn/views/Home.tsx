import { MonotypeExpandableTree } from "@/components/Expandable"
import { ModalDescription, prompt } from "@/components/Modal"
import { NodeProps, TreeOf } from "@/components/tree"
import {
  faChartBar,
  faPlus,
  faSliders,
  faSync,
  faTableCellsLarge,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { createResource, createSignal, getOwner, Show } from "solid-js"
import { DB } from "../db"
import { createDeck } from "../db/home/createDeck"
import { Buckets, DeckHomeInfo, listDecks } from "../db/home/listDecks"
import { setDeckExpanded } from "../db/home/setDeckExpanded"
import { getPrefs } from "../db/prefs/get"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { Icon, Icons } from "../el/IconButton"
import { useLayers } from "../el/Layers"
import { Id } from "../lib/id"
import { CreateNote } from "./CreateNote"
import { Settings } from "./Settings"
import { Study } from "./Study"

function nope(): never {
  throw new Error("this page doesn't exist yet")
}

export function Home({ db }: { db: DB }) {
  const [prefs, { refetch: reloadPrefs }] = createResource(() => getPrefs(db))
  const [decks, { refetch: reloadDecks }] = createResource(() =>
    listDecks(db, Date.now()),
  )
  const [now, setNow] = createSignal(Date.now())
  const owner = getOwner()
  const layers = useLayers()

  // TODO: add decks to icon list and put all of them in the navbar when any
  // layers are active

  return (
    <div class="flex min-h-full flex-1 flex-col gap-8">
      {TopActions()}
      {DeckList()}
      {BottomActions()}
    </div>
  )

  function reload() {
    reloadPrefs()
    reloadDecks()
  }

  function TopActions() {
    const layers = useLayers()

    return (
      <Icons>
        <Icon
          icon={faPlus}
          label="Add"
          onClick={() => layers.push(CreateNote, db, reload)}
        />
        <Icon icon={faTableCellsLarge} label="Browse" onClick={nope} />
        <Icon icon={faChartBar} label="Stats" onClick={nope} />
        <Icon
          icon={faSliders}
          label="Settings"
          onClick={() => layers.push(Settings, { db }, reload)}
        />
        <Icon icon={faSync} label="Sync" onClick={nope} />
        {/* TODO: <Show when={prefs()?.debug}>
          <Icon
            icon={faCode}
            label="Debug"
            onClick={() =>
              layers.push(
                Debug,
                { app: db },
                () => (reloadPrefs(), reloadDecks()),
              )
            }
          />
        </Show> */}
      </Icons>
    )
  }

  function DeckList() {
    function compare([a]: [string, unknown], [b]: [string, unknown]) {
      const al = a.toLowerCase()
      const bl = b.toLowerCase()

      if (al < bl) return -1
      if (al > bl) return 1
      if (a < b) return -1
      if (a > b) return 1
      return 0
    }

    return (
      <div class="mx-auto w-full max-w-xl flex-1 rounded-lg bg-z-body-selected px-1 py-1">
        <div class="mb-1 grid grid-cols-[auto,4rem,4rem,4rem] items-baseline border-b border-z pb-1 pl-8 pr-4">
          <p>Deck</p>
          <p class="text-right text-sm text-z-subtitle">New</p>
          <p class="text-right text-sm text-z-subtitle">Learn</p>
          <p class="text-right text-sm text-z-subtitle">Due</p>
        </div>

        <Show when={decks()} keyed>
          {(decks) => (
            <MonotypeExpandableTree<DeckHomeInfo | undefined, DeckHomeInfo>
              z={10}
              shift
              tree={decks.tree.tree}
              isExpanded={({ data }) => !data?.deck.collapsed}
              setExpanded={async ({ data, parent, key }, expanded) => {
                await setDeckExpanded(
                  db,
                  data?.deck.id ?? parent.map((x) => x + "::").join("") + key,
                  expanded,
                  Date.now(),
                )
              }}
              node={DeckEl}
              noGap
              sort={compare}
            />
          )}
        </Show>
      </div>
    )
  }

  function BottomActions() {
    return (
      <TwoBottomButtons>
        <Action
          icon={faPlus}
          label="Create Deck"
          center
          onClick={async () => {
            const name = await prompt({
              owner,
              title: "New deck name",
              description: (
                <ModalDescription>
                  Use :: in your deck name to create nested decks. For example,
                  Math::Geometry will create a deck called 'Geometry' inside the
                  deck called 'Math'.
                </ModalDescription>
              ),
            })

            if (!name) {
              return
            }

            await createDeck(db, name)
            reloadDecks()
          }}
        />
        <Action icon={faUpload} label="Import Deck" center onClick={nope} />
      </TwoBottomButtons>
    )
  }

  function DeckEl({ data, subtree, key }: NodeProps<DeckHomeInfo | undefined>) {
    let buckets: Buckets = [0, 0, 0]
    if (data) {
      buckets = data.self
      buckets[0] += data.sub[0]
      buckets[1] += data.sub[1]
      buckets[2] += data.sub[2]
    }

    return (
      <button
        class={
          "grid flex-1 grid-cols-[auto,4rem,4rem,4rem] items-baseline rounded-lg py-0.5 pl-8 pr-4 text-left text-z-subtitle dhover:bg-z-body" +
          (subtree ? " -ml-6" : "")
        }
        onClick={() => {
          const main = data?.deck.id

          const dids: Id[] = []
          if (main != null) dids.push(main)
          collectDeckIds(subtree)

          layers.push(Study, { db, main, dids }, reload)

          function collectDeckIds(
            subtree:
              | TreeOf<DeckHomeInfo | undefined, DeckHomeInfo | undefined>
              | undefined,
          ) {
            if (subtree == null) return

            for (const value of Object.values(subtree)) {
              if (value.data) {
                dids.push(value.data.deck.id)
              }

              if (value.subtree) {
                collectDeckIds(value.subtree)
              }
            }
          }
        }}
      >
        <p class="text-z">{key}</p>
        <p
          class="text-right font-mono text-sm"
          classList={{
            "text-[--z-text-learn-new]": buckets[0] != 0,
            "opacity-30": buckets[0] == 0,
          }}
        >
          {buckets[0]}
        </p>
        <p
          class="text-right font-mono text-sm"
          classList={{
            "text-[--z-text-learn-learning]": buckets[1] != 0,
            "opacity-30": buckets[1] == 0,
          }}
        >
          {buckets[1]}
        </p>
        <p
          class="text-right font-mono text-sm"
          classList={{
            "text-[--z-text-learn-review]": buckets[2] != 0,
            "opacity-30": buckets[2] == 0,
          }}
        >
          {buckets[2]}
        </p>
      </button>
    )
  }
}
