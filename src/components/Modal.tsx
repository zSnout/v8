import { createSignal, JSX } from "solid-js"
import { Portal } from "solid-js/web"

export function ModalCancel(props: {
  children: JSX.Element
  onClick?: () => void
  autofocus?: boolean
}) {
  return (
    <button
      class="z-field rounded-md text-sm text-z-heading shadow-none hover:bg-z-field-selected"
      onClick={props.onClick}
      autofocus={props.autofocus}
    >
      {props.children}
    </button>
  )
}

export function ModalConfirm(props: {
  children: JSX.Element
  onClick?: () => void
  autofocus?: boolean
}) {
  return (
    <button
      class="z-field rounded-md border-transparent bg-z-text-heading text-sm text-z-bg-body shadow-none hover:bg-z-text focus:border-z-focus"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

export function ModalButtons(props: { children: JSX.Element }) {
  return <div class="mt-4 flex justify-end gap-2">{props.children}</div>
}

export function ModalTitle(props: { children: JSX.Element }) {
  return <h1 class="text-lg font-semibold text-z-heading">{props.children}</h1>
}

export function ModalDescription(props: { children: JSX.Element }) {
  return <p class="mt-2 text-sm text-z-subtitle">{props.children}</p>
}

export function ModalField(props: {}) {
  return <input class="z-field mt-3 shadow-none" type="text" />
}

export interface ModalRef {
  showModal(): void
  close(value?: string): void
  cancel(): void
}

export function Modal(props: {
  children: JSX.Element
  ref?: (ref: ModalRef) => void
  onCancel?: () => void
  onClose?: (value: string) => void
}) {
  const [open, setOpen] = createSignal(false)

  return (
    <Portal>
      <div class="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-30 m-0 flex h-screen w-screen bg-black/0 transition [&:has(>[open])]:pointer-events-auto [&:has(>[open])]:bg-black/75">
        <dialog
          class="group pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-30 m-0 flex h-screen w-screen bg-transparent transition open:pointer-events-auto [&:modal]:max-h-[100vh] [&:modal]:max-w-[100vw] [body:has(>*>*>&[open])]:overflow-hidden"
          ref={(el) => {
            setOpen(el.open)

            props.ref?.({
              showModal() {
                el.showModal()
                setOpen(true)
              },
              close(value) {
                el.close(value)
                setOpen(false)
              },
              cancel() {
                el.close()
                setOpen(false)
                props.onCancel?.()
              },
            })
          }}
          onClose={(event) => {
            setOpen(false)
            props.onClose?.(event.currentTarget.returnValue)
          }}
          onCancel={() => props.onCancel?.()}
          inert={!open()}
        >
          <div class="m-auto flex max-h-full w-full max-w-lg scale-95 flex-col overflow-y-auto rounded-lg bg-z-body px-6 py-6 opacity-0 shadow-lg transition group-open:scale-100 group-open:opacity-100">
            {props.children}
          </div>
        </dialog>
      </div>
    </Portal>
  )
}
