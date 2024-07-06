import { Fa } from "@/components/Fa"
import {
  faBook,
  faBug,
  faChartBar,
  faPlus,
  faSync,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { JSX } from "solid-js"
import { useLayers } from "../el/Layers"
import { App } from "../lib/state"
import { CreateNote } from "./CreateNote"
import { Debug } from "./Debug"

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

export function Home(props: { app: App }) {
  return (
    <div class="min-h-full flex-1">
      <div class="flex justify-center gap-2">
        <Icon
          icon={faPlus}
          label="Add"
          layer={(pop) => <CreateNote app={props.app} close={pop} />}
        />
        <Icon icon={faBook} label="Browse" layer={nope} />
        <Icon icon={faChartBar} label="Stats" layer={nope} />
        <Icon icon={faSync} label="Sync" layer={nope} />
        <Icon
          icon={faBug}
          label="Debug"
          layer={(pop) => <Debug app={props.app} close={pop} />}
        />
      </div>
    </div>
  )
}
