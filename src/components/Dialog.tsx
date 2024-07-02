import { NormalizeContent } from "@/layouts/NormalizeContent"
import { faClose } from "@fortawesome/free-solid-svg-icons"
import type { JSX } from "solid-js/jsx-runtime"
import { Center } from "./Center"
import { draggable } from "./draggable"
import { Fa } from "./Fa"

export function DialogButton(props: {
  class?: string
  children: any
  onClick?: () => void
}) {
  return (
    <button
      class={
        "pointer-events-auto w-fit origin-top rounded-lg border border-transparent bg-z-field p-2 shadow-md ring-z-focus transition first:origin-top-left last:origin-top-right focus-visible:border-z-focus focus-visible:outline-none focus-visible:ring group-[.invisible]:scale-0 " +
        (props.class ?? "")
      }
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

export function Dialog(props: {
  buttons?: JSX.Element
  onCancel?: () => void
  children: JSX.Element
  open: boolean
}) {
  return (
    <NormalizeContent class="z-30">
      <Center isPopup>
        <div
          class="group transition-and-[visibility] pointer-events-none flex min-h-[min(20rem,100vh_-_5rem)] w-96 max-w-full flex-col gap-2 text-z"
          classList={{
            invisible: !props.open,
            "translate-y-8": !props.open,
            "opacity-0": !props.open,
            "opacity-100": props.open,
          }}
          onClick={(event) => event.stopPropagation()}
          ref={(div) => draggable(div)}
        >
          <div class="pointer-events-auto max-h-[calc(100vh_-_4rem)] flex-1 overflow-y-auto rounded-lg bg-z-field p-3 text-z shadow-md transition">
            {props.children}
          </div>

          <div class="flex gap-2">
            <DialogButton class="mr-auto" onClick={props.onCancel}>
              <Fa class="h-6 w-6" icon={faClose} title="Close" />
            </DialogButton>

            {props.buttons}
          </div>
        </div>
      </Center>
    </NormalizeContent>
  )
}
