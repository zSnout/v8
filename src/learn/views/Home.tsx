import { MonotypeExpandableTree } from "@/components/Expandable"
import { Fa } from "@/components/Fa"
import { ModalDescription, prompt } from "@/components/Modal"
import {
  faChartBar,
  faCode,
  faPlus,
  faSliders,
  faSync,
  faTableCellsLarge,
  faUpload,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { getOwner, JSX, Show } from "solid-js"
import { Action, TwoBottomButtons } from "../el/BottomButtons"
import { useLayers } from "../el/Layers"
import { createExpr } from "../lib/expr"
import { App, AppDecks } from "../lib/state"
import { Deck } from "../lib/types"
import { CreateNote } from "./CreateNote"
import { Debug } from "./Debug"
import { Settings } from "./Settings"

function Icon(props: {
  icon: IconDefinition
  label: string
  layer: (pop: () => void) => JSX.Element
}) {
  const layers = useLayers()

  return (
    <button
      class="flex w-[4.25rem] flex-col items-center gap-1 rounded-lg bg-z-body-selected px-2 pb-1 pt-2 text-center"
      onClick={() => layers.push(props.layer)}
    >
      <Fa class="size-8" icon={props.icon} title={false} />

      <p class="text-sm text-z-subtitle">{props.label}</p>
    </button>
  )
}

function nope(): never {
  throw new Error("this page doesn't exist yet")
}

export function Home({ app }: { app: App }) {
  const [prefs, reloadPrefs] = createExpr(() => app.prefs.prefs)
  const [decks, reloadDecks] = createExpr(() => app.decks.tree(Date.now()))
  const owner = getOwner()

  // TODO: add decks to icon list and put all of them in the navbar when any
  // layers are active

  return (
    <div class="flex min-h-full flex-1 flex-col gap-8">
      <div class="flex justify-center gap-2">
        <Icon
          icon={faPlus}
          label="Add"
          layer={(pop) => <CreateNote app={app} close={pop} />}
        />
        <Icon icon={faTableCellsLarge} label="Browse" layer={nope} />
        <Icon icon={faChartBar} label="Stats" layer={nope} />
        <Icon
          icon={faSliders}
          label="Settings"
          layer={(pop) => (
            <Settings
              initial={app.prefs.prefs}
              save={(prefs) => {
                app.prefs.set(prefs)
                reloadPrefs()
              }}
              close={pop}
            />
          )}
        />
        <Icon icon={faSync} label="Sync" layer={nope} />
        <Show when={prefs().debug}>
          <Icon
            icon={faCode}
            label="Debug"
            layer={(pop) => <Debug app={app} close={pop} />}
          />
        </Show>
      </div>

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
          node={({ data, subtree }) => (
            <div
              class={
                "grid flex-1 grid-cols-[auto,4rem,4rem,4rem] items-baseline rounded-lg pl-8 pr-4" +
                (subtree ? " -ml-6" : "")
              }
            >
              <p>{data.name.split("::").at(-1)}</p>
              <p class="text-right font-mono text-sm text-z-subtitle">23</p>
              <p class="text-right font-mono text-sm text-z-subtitle">45</p>
              <p class="text-right font-mono text-sm text-z-subtitle">789</p>
            </div>
          )}
          sort={([a], [b]) => AppDecks.compare(a, b)}
        />
      </div>

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
    </div>
  )
}