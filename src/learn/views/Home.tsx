import { createEventListener } from "@/components/create-event-listener"
import { MonotypeExpandableTree } from "@/components/Expandable"
import { ModalDescription, prompt } from "@/components/Modal"
import { NodeProps, TreeOf } from "@/components/tree"
import {
  faChartBar,
  faPlus,
  faShareFromSquare,
  faSliders,
  faSync,
  faTableCellsLarge,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { createSignal, getOwner, onMount } from "solid-js"
import { DB } from "../db"
import { createDeck } from "../db/home/createDeck"
import { Buckets, DeckHomeInfo, listDecks } from "../db/home/listDecks"
import { setDeckExpanded } from "../db/home/setDeckExpanded"
import { Action, BottomButtons } from "../el/BottomButtons"
import { useLayers } from "../el/Layers"
import { createLoadingBase } from "../el/Loading"
import { Id } from "../lib/id"
import { Browse } from "./Browse"
import { CreateNote } from "./CreateNote"
import { Settings } from "./Settings"
import { Study } from "./Study"
import {
  ContextMenuItem,
  ContextMenuLine,
  ContextMenuTrigger,
} from "../el/ContextMenu"

function nope(): never {
  throw new Error("this page doesn't exist yet")
}

function SublinkHandler(): undefined {
  const layers = useLayers()

  onMount(() => {
    const el = document.getElementsByClassName("z-sublink")[0]

    if (el && el instanceof HTMLElement) {
      createEventListener(el, "click", (event) => {
        event.preventDefault()
        layers.forcePopAll()
      })
    }
  })
}

export const Home = createLoadingBase(
  async (db: DB) => {
    const [decks, setDecks] = createSignal(await listDecks(db, Date.now()))
    return [
      decks,
      async () => setDecks(await listDecks(db, Date.now())),
    ] as const
  },
  (db, [decks, reloadDecks]) => {
    const owner = getOwner()
    const layers = useLayers()

    // TODO: add decks to icon list and put all of them in the navbar when any
    // layers are active

    return (
      <div class="flex min-h-full flex-1 flex-col gap-4">
        <ContextMenuTrigger>
          <ContextMenuItem>hello</ContextMenuItem>
          <ContextMenuItem>world</ContextMenuItem>
          <ContextMenuItem>goodbye</ContextMenuItem>
          <ContextMenuItem>other</ContextMenuItem>
          <ContextMenuLine />
          <ContextMenuItem>people</ContextMenuItem>
          <ContextMenuItem>of</ContextMenuItem>
          <ContextMenuItem>this</ContextMenuItem>
          <ContextMenuItem>strange</ContextMenuItem>
          <ContextMenuItem>dimension</ContextMenuItem>
        </ContextMenuTrigger>
        <SublinkHandler />
        <TopActions />
        <DeckList />
        <BottomActions />
      </div>
    )

    function TopActions() {
      const layers = useLayers()

      return (
        <div class="mx-auto grid w-full max-w-xl grid-cols-2 justify-center gap-1 xs:grid-cols-3 sm:grid-cols-5">
          <Action
            class="col-span-2 xs:col-span-1 xs:row-span-2 sm:row-span-1"
            center
            icon={faPlus}
            label="Add"
            onClick={() => layers.push(CreateNote, db)}
          />
          <Action
            center
            icon={faTableCellsLarge}
            label="Browse"
            onClick={() => layers.push(Browse, db)}
          />
          <Action center icon={faChartBar} label="Stats" onClick={nope} />
          <Action
            center
            icon={faSliders}
            label="Settings"
            onClick={() => layers.push(Settings, db)}
          />
          <Action center icon={faSync} label="Sync" onClick={nope} />
        </div>
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
          <div class="mb-1 grid grid-cols-[auto,3rem,3rem] items-baseline border-b border-z pb-1 pl-8 pr-4 xs:grid-cols-[auto,3rem,3rem,3rem] sm:grid-cols-[auto,4rem,4rem,4rem]">
            <p>Deck</p>
            <p class="text-right text-sm text-z-subtitle">New</p>
            <p class="hidden text-right text-sm text-z-subtitle xs:block">
              Learn
            </p>
            <p class="text-right text-sm text-z-subtitle">Due</p>
          </div>

          <MonotypeExpandableTree<DeckHomeInfo | undefined, DeckHomeInfo>
            z={10}
            shift
            tree={decks().tree.tree}
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
        </div>
      )
    }

    function BottomActions() {
      return (
        <BottomButtons class="grid w-full max-w-xl grid-cols-2 gap-1 sm:grid-cols-3">
          <Action
            class="col-span-2 sm:col-auto"
            icon={faPlus}
            label="Create Deck"
            center
            onClick={async () => {
              const name = await prompt({
                owner,
                title: "New deck name",
                description: (
                  <ModalDescription>
                    Use :: in your deck name to create nested decks. For
                    example, Math::Geometry will create a deck called 'Geometry'
                    inside the deck called 'Math'.
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
          <Action
            icon={faShareFromSquare}
            label="Shared"
            center
            onClick={nope}
          />
          <Action icon={faUpload} label="Import" center onClick={nope} />
        </BottomButtons>
      )
    }

    function DeckEl({
      data,
      subtree,
      key,
    }: NodeProps<DeckHomeInfo | undefined>) {
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
            "grid flex-1 grid-cols-[auto,3rem,3rem] items-baseline rounded-lg py-0.5 pl-8 pr-4 text-left text-z-subtitle xs:grid-cols-[auto,3rem,3rem,3rem] dhover:bg-z-body sm:grid-cols-[auto,4rem,4rem,4rem]" +
            (subtree ? " -ml-6" : "")
          }
          onClick={() => {
            const main = data?.deck.id

            const dids: Id[] = []
            if (main != null) dids.push(main)
            collectDeckIds(subtree)

            layers.push(Study, { db, main, dids })

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
            class="block text-right font-mono text-sm xs:hidden"
            classList={{
              "text-[--z-text-learn-review]": buckets[1] + buckets[2] != 0,
              "opacity-30": buckets[1] + buckets[2] == 0,
            }}
          >
            {buckets[1] + buckets[2]}
          </p>
          <p
            class="hidden text-right font-mono text-sm xs:block"
            classList={{
              "text-[--z-text-learn-learning]": buckets[1] != 0,
              "opacity-30": buckets[1] == 0,
            }}
          >
            {buckets[1]}
          </p>
          <p
            class="hidden text-right font-mono text-sm xs:block"
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
  },
)
