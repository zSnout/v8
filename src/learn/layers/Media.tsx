import {
  faDownload,
  faMagnifyingGlass,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { createResource, createSignal, For } from "solid-js"
import type { Worker } from "../db"
import { Action } from "../el/BottomButtons"
import { defineLayer } from "../el/DefineLayer"
import { UploadButton } from "../el/upload"
import { FolderName, UserMedia } from "../lib/media"

const media = new UserMedia()

export default defineLayer({
  init(_: Worker) {
    const [folder, setFolder] = createSignal<FolderName>("/")
    const [entries, { refetch }] = createResource(folder, (folder) =>
      media.keys(folder),
    )
    return { folder, setFolder, entries, refetch }
  },
  load() {},
  render({ state: { entries, refetch } }) {
    return (
      <div class="flex h-[calc(100vh_-_7rem)] w-full flex-1 flex-col">
        <TopActions />
        <Grid />
      </div>
    )

    function TopActions() {
      return (
        <div class="mx-auto mb-4 grid w-full max-w-xl grid-cols-2 gap-1 sm:grid-cols-3">
          <UploadButton
            accept="*/*"
            multiple
            onUpload={async (files) => {
              await Promise.all(files.map((file) => media.upload(file).done))
              refetch()
            }}
          >
            {(trigger) => (
              <Action
                class="col-span-2 sm:col-auto"
                icon={faUpload}
                label="Upload Media"
                center
                onClick={trigger}
              />
            )}
          </UploadButton>
          <Action
            icon={faDownload}
            label="Export"
            center
            onClick={() => {
              throw new Error("Not implemented yet.") // FEAT: export media
            }}
          />
          <Action
            icon={faMagnifyingGlass}
            label="Usage"
            center
            onClick={() => {
              throw new Error("Not implemented yet.") // FEAT: check media usage
            }}
          />
        </div>
      )
    }

    function Grid() {
      return (
        <div class="flex flex-col items-start overflow-auto rounded-lg border border-z pb-8 text-sm">
          <table class="min-w-full">
            <thead>
              <tr>
                <th class="sticky top-0 cursor-pointer select-none border-x border-z bg-z-body px-1 first:border-l-0 last:border-r-0">
                  Key
                </th>

                <th class="sticky top-0 cursor-pointer select-none border-x border-z bg-z-body px-1 first:border-l-0 last:border-r-0">
                  Name
                </th>

                <th class="sticky top-0 cursor-pointer select-none border-x border-z bg-z-body px-1 first:border-l-0 last:border-r-0">
                  Size
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={entries()}>{(x) => <Entry name={x} />}</For>
            </tbody>
          </table>
        </div>
      )
    }

    function Entry(props: { name: string }) {
      const [file] = createResource(
        () => props.name,
        (name) => media.get(name),
      )

      return (
        <tr class="select-none border-z last:border-b odd:bg-[--z-table-row-alt]">
          <td class="whitespace-nowrap border-x border-z px-1 first:border-l-0 last:border-r-0">
            {props.name.slice(0, 8) + "..."}
          </td>
          <td class="whitespace-nowrap border-x border-z px-1 first:border-l-0 last:border-r-0">
            {file()?.name ?? "..."}
          </td>
          <td class="whitespace-nowrap border-x border-z px-1 text-right first:border-l-0 last:border-r-0">
            {(() => {
              const f = file()
              if (!f) {
                return "..."
              }
              for (const [label, size] of [
                ["KB", 100],
                ["MB", 100_000],
                ["GB", 100_000_000],
                ["TB", 100_000_000_000],
                ["PB", 100_000_000_000_000],
              ] as const) {
                const kb = Math.round(f.size / size) / 10
                if (kb < 10) {
                  return kb.toPrecision(1) + " " + label
                } else if (kb < 1000) {
                  return Math.round(f.size / size / 10) + " " + label
                }
              }
              return Math.round(f.size / 1_000_000_000_000_000) + " PB"
            })()}
          </td>
        </tr>
      )
    }
  },
  onReturn({ state }) {
    state.refetch()
    return "preserve-data"
  },
  onUndo({ state }) {
    state.refetch()
    return "preserve-data"
  },
})