import { createSignal, JSX, Owner, runWithOwner, untrack } from "solid-js"
import { Portal } from "solid-js/web"

export function ModalCancel(props: {
  children: JSX.Element
  onClick?: () => void
  autofocus?: boolean
}) {
  return (
    <button
      class="z-field rounded-md bg-transparent text-sm text-z shadow-none hover:bg-z-field-selected hover:border-transparent"
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
      // class="z-field rounded-md border-transparent bg-z-text-heading text-sm text-z-bg-body shadow-none hover:bg-z-text"
      // TODO: the hover style on light mode is too dark
      class="z-field rounded-md border-transparent bg-z-body-selected text-sm text-z shadow-none dark:hover:bg-z-field-selected hover:bg-z-text hover:text-z-bg-body dark:hover:border-transparent dark:hover:text-z"
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

export function ModalField(props: {
  value?: string
  placeholder?: string
  onInput?: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent>
  onChange?: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event>
  autofocus?: boolean
}) {
  return (
    <input
      class="z-field mt-3 w-full shadow-none placeholder:opacity-50"
      type="text"
      value={props.value ?? []}
      placeholder={props.placeholder}
      onInput={props.onInput}
      onChange={props.onChange}
      autofocus
    />
  )
}

export interface ModalRef {
  showModal(): void
  close(value: string): void
  cancel(): void
}

export function Modal(props: {
  children: JSX.Element
  ref?: (ref: ModalRef) => void
  onCancel?: () => void
  onClose?: (value: string) => void
  refPortal?: (ref: HTMLDivElement) => void
}) {
  const [open, setOpen] = createSignal(false)

  return (
    <Portal ref={props.refPortal}>
      <div class="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-30 m-0 flex h-screen w-screen bg-transparent from-z-bg-body to-z-bg-body transition [&:has(>[open])]:pointer-events-auto [&:has(>[open])]:bg-[--z-bg-modal]">
        <dialog
          class="group pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-30 m-0 flex h-screen w-screen bg-transparent transition open:pointer-events-auto [&:modal]:max-h-[100vh] [&:modal]:max-w-[100vw] [body:has(>*>*>&[open])]:overflow-hidden"
          ref={(el) => {
            setOpen(el.open)

            props.ref?.({
              showModal() {
                el.showModal()
                setOpen(true)
                const autofocused = el.querySelector("[autofocus]")
                if (
                  autofocused &&
                  (autofocused instanceof HTMLElement ||
                    autofocused instanceof SVGElement)
                ) {
                  autofocused.focus()
                }
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
          <div class="m-auto max-h-full w-full max-w-lg scale-95 overflow-y-auto rounded-lg bg-z-body px-6 py-6 opacity-0 shadow-lg transition group-open:scale-100 group-open:opacity-100">
            {props.children}
          </div>
        </dialog>
      </div>
    </Portal>
  )
}

export function confirm(props: {
  owner: Owner | null
  title: JSX.Element
  description?: JSX.Element
  cancelText: string
  okText: string
}): Promise<boolean> {
  return new Promise((resolve) => {
    let modal: ModalRef
    let portal: HTMLDivElement

    runWithOwner(props.owner, () => (
      <Modal
        ref={(e) => (modal = e)}
        refPortal={(e) => (portal = e)}
        onCancel={() => resolve(false)}
        onClose={(value) => {
          resolve(value == "true")
          portal.ontransitionend = () => portal.remove()
        }}
      >
        <ModalTitle>{props.title}</ModalTitle>
        {props.description}
        <ModalButtons>
          {/* TODO: get rid of these defaults once we're sure nobody relies on them */}
          <ModalCancel onClick={() => modal.cancel()}>
            {props.cancelText || "Cancel"}
          </ModalCancel>
          <ModalConfirm onClick={() => modal.close("true")}>
            {props.okText || "OK"}
          </ModalConfirm>
        </ModalButtons>
      </Modal>
    ))

    setTimeout(() => modal!.showModal(), 1)
  })
}

export function alert(props: {
  owner: Owner | null
  title: JSX.Element
  description?: JSX.Element
  okText?: string
}): Promise<void> {
  return new Promise((resolve) => {
    let modal: ModalRef
    let portal: HTMLDivElement

    runWithOwner(props.owner, () => (
      <Modal
        ref={(e) => (modal = e)}
        refPortal={(e) => (portal = e)}
        onClose={() => {
          resolve()
          portal.ontransitionend = () => portal.remove()
        }}
      >
        <ModalTitle>{props.title}</ModalTitle>
        {props.description}
        <ModalButtons>
          <ModalConfirm onClick={() => modal.close("")}>
            {props.okText || "OK"}
          </ModalConfirm>
        </ModalButtons>
      </Modal>
    ))

    setTimeout(() => modal!.showModal(), 1)
  })
}

export function prompt(props: {
  owner: Owner | null
  title: JSX.Element
  description?: JSX.Element
  cancelText?: string
  okText?: string
  value?: string
}): Promise<string | undefined> {
  return new Promise((resolve) => {
    let modal: ModalRef
    let portal: HTMLDivElement
    let value: string

    runWithOwner(props.owner, () => (
      <Modal
        ref={(e) => (modal = e)}
        refPortal={(e) => (portal = e)}
        onCancel={() => resolve(undefined)}
        onClose={(value) => {
          resolve(value)
          portal.ontransitionend = () => portal.remove()
        }}
      >
        <ModalTitle>{props.title}</ModalTitle>
        {props.description}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            modal.close(value)
          }}
        >
          <ModalField
            value={untrack(() => props.value)}
            onInput={(el) => (value = el.currentTarget.value)}
          />
        </form>
        <ModalButtons>
          <ModalCancel onClick={() => modal.cancel()}>
            {props.cancelText || "Cancel"}
          </ModalCancel>
          <ModalConfirm onClick={() => modal.close(value)}>
            {props.okText || "OK"}
          </ModalConfirm>
        </ModalButtons>
      </Modal>
    ))

    setTimeout(() => modal!.showModal(), 1)
  })
}
