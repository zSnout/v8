import { Fa } from "@/components/Fa"
import {
  ModalButtons,
  ModalCancel,
  ModalConfirm,
  ModalDescription,
  ModalDetails,
  ModalTitle,
  popup,
} from "@/components/Modal"
import {
  faArrowUpRightFromSquare,
  faDownload,
  faMagnifyingGlass,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import { createResource, For, Show } from "solid-js"
import type { Worker } from "../db"
import { Action } from "../el/BottomButtons"
import { defineLayer } from "../el/DefineLayer"
import { InlineLoading } from "../el/Loading"
import { Table, Td, Th, Tr } from "../el/Table"
import { UploadButton } from "../el/upload"
import { createExpr } from "../lib/expr"
import { displayFileSize } from "../lib/fileSize"
import { UserMedia, writeKey } from "../lib/media"

const media = new UserMedia()

export default defineLayer({
  init(_: Worker) {
    const [entries, { refetch }] = createResource(() => media.keys())
    return { entries, refetch }
  },
  load() {},
  render({ owner, props: worker, state: { entries, refetch } }) {
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
                label="Upload"
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
            onClick={() =>
              popup<void>({
                owner,
                onCancel: undefined,
                children(close) {
                  return <Usage close={close} />
                },
              })
            }
          />
        </div>
      )
    }

    function Grid() {
      return (
        <Table class="rounded-lg border border-z">
          <thead>
            <tr>
              <Th>Key</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Size</Th>
            </tr>
          </thead>
          <tbody>
            <For each={entries()}>{(x) => <Entry key={x} />}</For>
          </tbody>
        </Table>
      )
    }

    function Entry(props: { key: ArrayBuffer }) {
      const [file] = createResource(
        () => props.key,
        (name) => media.get(name),
      )

      return (
        <Tr>
          <Td class="w-[20ch] font-mono">{writeKey(props.key)}</Td>
          <Td>
            <div class="inline-flex items-center gap-1">
              <a href={"/learn/media/" + writeKey(props.key)} target="_new">
                <Fa
                  class="h-3 w-3 icon-z-text-link"
                  icon={faArrowUpRightFromSquare}
                  title="open file"
                />
              </a>
              <div>{file()?.name ?? "..."}</div>
            </div>
          </Td>
          <Td>{file()?.type}</Td>
          <Td>{displayFileSize(file()) ?? "..."}</Td>
        </Tr>
      )
    }

    function Usage(props: { close: () => void }) {
      const [unused] = createExpr(() => worker.post("media_analyze_unused"))
      const [missing] = createExpr(() => worker.post("media_analyze_missing"))

      return (
        <>
          <ModalTitle>Media usage</ModalTitle>

          <InlineLoading data={unused()}>
            {(unused) => (
              <Show
                when={unused.length}
                fallback={
                  <ModalDescription>All media files are used.</ModalDescription>
                }
              >
                <ModalDetails
                  summary={
                    <>
                      {unused.length}{" "}
                      {unused.length == 1 ?
                        "file is unused. It exists"
                      : "files are unused. They exist"}{" "}
                      in your media folder, but they don't show up on any cards.
                      Click to show which files are unused.
                    </>
                  }
                >
                  <Table class="max-h-96 rounded-lg border border-z">
                    <thead>
                      <tr>
                        <Th>Key</Th>
                        <Th>Name</Th>
                        <Th>Type</Th>
                        <Th>Size</Th>
                      </tr>
                    </thead>

                    <tbody>
                      <For each={unused}>
                        {(key) => {
                          const [file] = createResource(() => media.get(key))
                          return (
                            <Tr>
                              <Td>{writeKey(key)}</Td>
                              <Td>{file()?.name}</Td>
                              <Td>{file()?.type}</Td>
                              <Td>{displayFileSize(file()) ?? "..."}</Td>
                            </Tr>
                          )
                        }}
                      </For>
                    </tbody>
                  </Table>
                </ModalDetails>
              </Show>
            )}
          </InlineLoading>

          <InlineLoading data={missing()}>
            {(missing) => (
              <Show
                when={missing.length}
                fallback={
                  <ModalDescription>
                    No media files are missing.
                  </ModalDescription>
                }
              >
                <ModalDetails
                  summary={
                    <>
                      {missing.length}{" "}
                      {missing.length == 1 ?
                        "file is unused. It exists"
                      : "files are unused. They exist"}{" "}
                      in your media folder, but they don't show up on any cards.
                      Click to show which files are unused.
                    </>
                  }
                >
                  <Table class="max-h-96 rounded-lg border border-z">
                    <thead>
                      <tr>
                        <Th>Key</Th>
                      </tr>
                    </thead>

                    <tbody>
                      <For each={missing}>
                        {(key) => {
                          return (
                            <Tr>
                              <Td>{key}</Td>
                            </Tr>
                          )
                        }}
                      </For>
                    </tbody>
                  </Table>
                </ModalDetails>
              </Show>
            )}
          </InlineLoading>

          <ModalButtons>
            <ModalCancel
              onClick={async () => {
                const [result] = createResource(async () => {
                  await worker.post("media_delete_unused")
                  refetch()
                })

                props.close()

                popup<void>({
                  owner,
                  children(close) {
                    return (
                      <>
                        <ModalTitle>Purging unused media</ModalTitle>
                        <ModalDescription>
                          {result.state == "ready" ?
                            "Unused media successfully removed!"
                          : "Removing..."}
                        </ModalDescription>
                        <ModalButtons>
                          <ModalCancel onClick={close}>Close</ModalCancel>
                        </ModalButtons>
                      </>
                    )
                  },
                  onCancel: undefined,
                })
              }}
            >
              Delete Unused
            </ModalCancel>

            <ModalConfirm onClick={props.close}>Close</ModalConfirm>
          </ModalButtons>
        </>
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
