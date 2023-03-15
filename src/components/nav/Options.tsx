import { faGear } from "@fortawesome/free-solid-svg-icons"
import { createSignal, untrack } from "solid-js"
import { Portal } from "solid-js/web"
import { createEventListener } from "../create-event-listener"
import { Fa } from "../Fa"
import { Modal } from "../Modal"

export function Options(props: { buttons?: any; children: any }) {
  const [open, setOpen] = createSignal(false)

  if (typeof document != "undefined") {
    createEventListener(document, "keydown", (event) => {
      if (event.ctrlKey || event.altKey || event.shiftKey) {
        return
      }

      if (event.metaKey && event.key == ",") {
        setOpen((open) => !open)
        event.stopImmediatePropagation()
        event.preventDefault()
      }

      if (!event.metaKey && event.key == "Escape" && untrack(open)) {
        setOpen(false)
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    })
  }

  return (
    <>
      <button
        class="group pointer-events-auto mr-1 rounded-full p-2 focus-visible:outline-none"
        onClick={() => setOpen((open) => !open)}
      >
        <div
          class="flex h-[1.375rem] w-[1.375rem] items-center justify-center rounded-full border border-z bg-z-field ring-z-focus transition group-focus-visible:border-z-focus group-focus-visible:outline-none group-focus-visible:ring"
          classList={{
            "rotate-60": open(),
          }}
        >
          <Fa class="h-3 w-3" icon={faGear} title="Settings" />
        </div>
      </button>

      <Modal
        buttons={props.buttons}
        onCancel={() => setOpen(false)}
        open={open()}
      >
        {props.children}
      </Modal>
    </>
  )
}

export function DynamicOptions(props: { buttons?: any; children: any }) {
  if (typeof document == "undefined") {
    return ""
  }

  const el = document.getElementById("nav-options")

  if (!el) {
    console.error(
      "Mounted <DynamicOptions> too early; could not find #nav-options.",
    )

    return ""
  }

  return (
    <Portal mount={el}>
      <Options buttons={props.buttons}>{props.children}</Options>
    </Portal>
  )
}
