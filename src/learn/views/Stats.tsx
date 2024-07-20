import { Unmain } from "@/components/Prose"
import {
  faMagnifyingGlassChart,
  faPenToSquare,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons"
import type { Worker } from "../db/worker"
import { Action } from "../el/BottomButtons"
import { DrawChartBar } from "../el/charts"
import { useLayers, type LayerOutput } from "../el/Layers"
import { Query } from "./Query"

export function Stats(worker: Worker, pop: () => void): LayerOutput {
  const layers = useLayers()

  return {
    el: (
      <div class="flex flex-col gap-4">
        <TopActions />

        <Unmain>
          <div class="flex px-6">
            <div class="mx-auto grid w-full max-w-[80rem] grid-cols-[repeat(auto-fill,minmax(min(24rem,100%),1fr))] gap-4">
              <Charts />
            </div>
          </div>
        </Unmain>
      </div>
    ),
    onForcePop: () => true,
    onReturn() {}, // TODO: rerun queries
  }

  function TopActions() {
    return (
      <div class="mx-auto grid w-full max-w-xl grid-cols-2 gap-1 xs:grid-cols-3">
        <Action
          class="col-span-2 xs:col-span-1"
          center
          icon={faRightFromBracket}
          label="Back"
          onClick={pop}
        />

        <Action
          class="col-span-2 xs:col-span-1"
          center
          icon={faMagnifyingGlassChart}
          label="Query"
          onClick={() => layers.push(Query, worker)}
        />

        <Action
          center
          icon={faPenToSquare}
          label="Rearrange"
          onClick={async () => {
            const file = await worker.post("export_sqlite")
            const url = URL.createObjectURL(file)
            const a = document.createElement("a")
            a.style.display = "none"
            document.body.append(a)
            a.href = url
            a.download = file.name
            a.click()
            a.remove()
          }}
        />
      </div>
    )
  }

  function Charts() {
    return (
      <>
        {DrawChartBar({
          type: "bar",
          data: [
            ["Jan", [23]],
            ["Feb", [45]],
            ["Mar", [12]],
            ["Apr", [30]],
            ["May", [50]],
            ["Jun", [5]],
          ],
          colors: [
            ["hsl(173 58% 39%)", "hsl(220 70% 50%)"],
            ["hsl(12 76% 61%)", "hsl(160 60% 45%)"],
            ["hsl(197 37% 24%)", "hsl(30 80% 55%)"],
            ["hsl(43 74% 66%)", "hsl(280 65% 60%)"],
            ["hsl(27 87% 67%)", "hsl(340 75% 55%)"],
          ],

          decimalPlaces: 4,
          dir: "lr",
          inlineLabels: false,
          labelsEach: 1,
          persistentValues: false,
          showTotal: false,
          space: true,
          stacked: false,
          zeroBaseline: true,
          spaceNumerically: true,
        })}
      </>
    )
  }
}
