import { MonotypeExpandableTree } from "@/components/Expandable"
import { ModalDescription, prompt } from "@/components/Modal"
import { unwrap } from "@/components/result"
import { NodeProps } from "@/components/tree"
import {
  faChartBar,
  faCode,
  faPlus,
  faSliders,
  faSync,
  faTableCellsLarge,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { createMemo, createSignal, getOwner, Show } from "solid-js"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { Icon, Icons } from "../el/IconButton"
import { useLayers } from "../el/Layers"
import { createExpr } from "../lib/expr"
import { App, AppDecks } from "../lib/state"
import { Deck } from "../lib/types"
import { CreateNote } from "./CreateNote"
import { Debug } from "./Debug"
import { Settings } from "./Settings"
import { Study } from "./Study"

function nope(): never {
  throw new Error("this page doesn't exist yet")
}

export function Home({ app }: { app: App }) {
  const [prefs, reloadPrefs] = createExpr(() => app.prefs.prefs)
  const [decks, reloadDecks] = createExpr(() => app.decks.tree(Date.now()))
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

  function TopActions() {
    return (
      <Icons>
        <Icon
          icon={faPlus}
          label="Add"
          layer={(pop) => (
            <CreateNote
              app={app}
              close={() => {
                reloadPrefs()
                reloadDecks()
                pop()
              }}
            />
          )}
        />
        <Icon icon={faTableCellsLarge} label="Browse" layer={nope} />
        <Icon icon={faChartBar} label="Stats" layer={nope} />
        <Icon
          icon={faSliders}
          label="Settings"
          layer={(pop) => (
            <Settings
              app={app}
              close={() => {
                reloadPrefs()
                reloadDecks()
                pop()
              }}
            />
          )}
        />
        <Icon icon={faSync} label="Sync" layer={nope} />
        <Show when={prefs().debug}>
          <Icon
            icon={faCode}
            label="Debug"
            layer={(pop) => (
              <Debug
                app={app}
                close={() => {
                  reloadPrefs()
                  reloadDecks()
                  pop()
                }}
              />
            )}
          />
        </Show>
      </Icons>
    )
  }

  function DeckList() {
    return (
      <div class="flex-1 rounded-lg bg-z-body-selected py-1">
        <div class="mb-1 grid grid-cols-[auto,4rem,4rem,4rem] items-baseline border-b border-z pb-1 pl-8 pr-4">
          <p>Deck</p>
          <p class="text-right text-sm text-z-subtitle">New</p>
          <p class="text-right text-sm text-z-subtitle">Learn</p>
          <p class="text-right text-sm text-z-subtitle">Due</p>
        </div>

        <MonotypeExpandableTree<Deck, Deck>
          z={10}
          shift
          tree={decks().tree}
          isExpanded={({ data }) => !data.collapsed}
          setExpanded={({ data }, expanded) => (data.collapsed = !expanded)}
          node={DeckEl}
          sort={([a], [b]) => AppDecks.compare(a, b)}
        />
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

            app.decks.byNameOrCreate(name, Date.now())
            reloadDecks()
          }}
        />
        <Action icon={faUpload} label="Import Deck" center onClick={nope} />
      </TwoBottomButtons>
    )
  }

  function DeckEl({ data, subtree }: NodeProps<Deck, Deck>) {
    const s = createMemo(() => {
      const n = now()
      const scheduler = unwrap(app.decks.scheduler(data, n))
      return {
        scheduler,
        new: scheduler.newCardsLeft(n),
        learning: scheduler.learning.length,
        review: scheduler.review.length,
      }
    })

    return (
      <button
        class={
          "grid flex-1 grid-cols-[auto,4rem,4rem,4rem] items-baseline rounded-lg pl-8 pr-4 text-left text-z-subtitle" +
          (subtree ? " -ml-6" : "")
        }
        onClick={() =>
          layers.push((close) => (
            <Study
              app={app}
              scheduler={s().scheduler}
              close={() => {
                reloadDecks()
                reloadPrefs()
                close()
              }}
            />
          ))
        }
      >
        <p class="text-z">{data.name.split("::").at(-1)}</p>
        <p
          class="text-right font-mono text-sm"
          classList={{
            "text-[--z-text-learn-new]": s().new != 0,
            "opacity-30": s().new == 0,
          }}
        >
          {s().new}
        </p>
        <p
          class="text-right font-mono text-sm"
          classList={{
            "text-[--z-text-learn-learning]": s().learning != 0,
            "opacity-30": s().learning == 0,
          }}
        >
          {s().learning}
        </p>
        <p
          class="text-right font-mono text-sm"
          classList={{
            "text-[--z-text-learn-review]": s().review != 0,
            "opacity-30": s().review == 0,
          }}
        >
          {s().review}
        </p>
      </button>
    )
  }
}
