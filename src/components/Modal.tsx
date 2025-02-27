import {
  createMemo,
  createSignal,
  JSX,
  Owner,
  runWithOwner,
  Show,
  untrack,
} from "solid-js"
import { Portal } from "solid-js/web"
import { AutoResizeTextarea } from "./fields/AutoResizeTextarea"

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
      type="submit"
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

export function ModalParagraph(props: { children: JSX.Element }) {
  return <p class="mt-2 text-z">{props.children}</p>
}

export function ModalCode(props: { children: JSX.Element }) {
  return (
    <code class="rounded bg-z-body-selected px-1 text-z">{props.children}</code>
  )
}

export function ModalStrong(props: { children: JSX.Element }) {
  return <strong class="text-z underline">{props.children}</strong>
}

export function ModalField(props: {
  value?: string
  placeholder?: string
  onInput?: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent>
  onChange?: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event>
  autofocus?: boolean
  minlength?: number
}) {
  return (
    <input
      class="z-field mt-3 w-full shadow-none placeholder:opacity-50"
      type="text"
      value={props.value ?? []}
      placeholder={props.placeholder}
      onInput={props.onInput}
      onChange={props.onChange}
      autofocus={props.autofocus}
      minlength={props.minlength}
    />
  )
}

export function ModalTextarea(props: {
  value?: string
  placeholder?: string
  onInput?: JSX.InputEventHandlerUnion<HTMLTextAreaElement, InputEvent>
  onChange?: JSX.ChangeEventHandlerUnion<HTMLTextAreaElement, Event>
  autofocus?: boolean
  minlength?: number
}) {
  return (
    <AutoResizeTextarea
      class="z-field mt-3 min-h-24 w-full shadow-none placeholder:opacity-50"
      value={props.value ?? []}
      placeholder={props.placeholder}
      onInput={props.onInput}
      onChange={props.onChange}
      autofocus={props.autofocus}
      minlength={props.minlength}
    />
  )
}

export function ModalSelect(props: {
  children: JSX.Element
  value?: string
  onInput?: JSX.InputEventHandlerUnion<HTMLSelectElement, InputEvent>
  autofocus?: boolean
}) {
  return (
    <select
      class="z-field mt-3 w-full shadow-none placeholder:opacity-50"
      value={props.value ?? ""}
      onInput={props.onInput}
      autofocus={props.autofocus}
    >
      {props.children}
    </select>
  )
}

export function ModalDetails(props: {
  summary: JSX.Element
  children: JSX.Element
}) {
  return (
    <details class="mt-2">
      <summary class="text-sm text-z-subtitle">{props.summary}</summary>
      <div class="h-2 w-full" />
      {props.children}
    </details>
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
  onSubmit?: (ref: ModalRef) => void
  refPortal?: (ref: HTMLDivElement) => void
}) {
  const [open, setOpen] = createSignal(false)

  let ref!: ModalRef

  return (
    <Portal ref={props.refPortal}>
      <div class="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-30 m-0 flex h-screen w-screen bg-transparent from-z-bg-body to-z-bg-body transition [&:has(>[open])]:pointer-events-auto [&:has(>[open])]:bg-[--z-bg-modal]">
        <dialog
          class="group pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-30 m-0 flex h-screen w-screen bg-transparent p-4 transition open:pointer-events-auto [&:modal]:max-h-[100vh] [&:modal]:max-w-[100vw] [body:has(>*>*>&[open])]:overflow-hidden"
          ref={(el) => {
            setOpen(el.open)

            ref = {
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
                props.onClose?.("")
              },
            }

            props.ref?.(ref)
          }}
          onClose={(event) => {
            event.currentTarget.close()
            setOpen(false)
            props.onClose?.(event.currentTarget.returnValue)
          }}
          onCancel={(event) => {
            event.currentTarget.close()
            setOpen(false)
            props.onCancel?.()
            props.onClose?.("")
          }}
          inert={!open()}
        >
          <form
            class="m-auto max-h-full w-full max-w-lg scale-95 overflow-y-auto rounded-lg bg-z-body px-6 py-6 opacity-0 shadow-lg transition group-open:scale-100 group-open:opacity-100"
            onSubmit={(event) => {
              event.preventDefault()
              props.onSubmit?.(ref)
            }}
          >
            {props.children}
          </form>
        </dialog>
      </div>
    </Portal>
  )
}

export type CloseFn<T> = (value: T) => void

export function popup<T>(props: {
  owner: Owner | null
  children: (close: CloseFn<T>) => JSX.Element
  onCancel: Exclude<NoInfer<T>, Function> | ((close: CloseFn<T>) => void)
  onSubmit?: (close: CloseFn<T>) => void
}): Promise<T> {
  return new Promise((resolve) => {
    let modal: ModalRef
    let portal: HTMLDivElement

    runWithOwner(props.owner, () => {
      const inner = createMemo(() => props.children(close))

      // return isn't strictly necessary, but it makes syntax highlighting work,
      // so we keep it
      return (
        <Modal
          ref={(e) => (modal = e)}
          refPortal={(e) => (portal = e)}
          onSubmit={() => {
            props.onSubmit?.(close)
          }}
          onCancel={() => {
            if (typeof props.onCancel == "function") {
              ;(props.onCancel as (close: (value: T) => void) => void)(close)
            } else {
              close(props.onCancel)
            }
          }}
          onClose={() => {
            portal.ontransitionend = () => portal.remove()
          }}
        >
          {inner()}
        </Modal>
      )
    })

    setTimeout(() => modal!.showModal(), 1)

    function close(value: T) {
      resolve(value)
      modal.close("")
    }
  })
}

export function confirm(props: {
  owner: Owner | null
  title: JSX.Element
  description?: JSX.Element
  cancelText: string
  okText: string
}): Promise<boolean> {
  return popup({
    owner: props.owner,
    children(close) {
      return (
        <>
          <ModalTitle>{props.title}</ModalTitle>
          {props.description}
          <ModalButtons>
            <ModalCancel onClick={() => close(false)}>
              {props.cancelText}
            </ModalCancel>
            <ModalConfirm onClick={() => close(true)}>
              {props.okText}
            </ModalConfirm>
          </ModalButtons>
        </>
      )
    },
    onCancel: false,
  })
}

export function alert(props: {
  owner: Owner | null
  title: JSX.Element
  description?: JSX.Element
  okText?: string
}): Promise<void> {
  return popup<void>({
    owner: props.owner,
    children(close) {
      return (
        <>
          <ModalTitle>{props.title}</ModalTitle>
          {props.description}
          <ModalButtons>
            <ModalConfirm onClick={() => close()}>
              {props.okText || "OK"}
            </ModalConfirm>
          </ModalButtons>
        </>
      )
    },
    onSubmit(close) {
      close()
    },
    onCancel: undefined,
  })
}

export function prompt(props: {
  owner: Owner | null
  title: JSX.Element
  description?: JSX.Element
  cancelText?: string
  okText?: string
  value?: string
  minlength?: number
}): Promise<string | undefined> {
  let value = untrack(() => props.value)

  return popup({
    owner: props.owner,
    children(close) {
      return (
        <>
          <ModalTitle>{props.title}</ModalTitle>
          {props.description}
          <ModalField
            minlength={props.minlength}
            value={untrack(() => props.value)}
            onInput={(el) => (value = el.currentTarget.value)}
          />
          <ModalButtons>
            <ModalCancel onClick={() => close(undefined)}>
              {props.cancelText || "Cancel"}
            </ModalCancel>
            <ModalConfirm>{props.okText || "OK"}</ModalConfirm>
          </ModalButtons>
        </>
      )
    },
    onSubmit(close) {
      close(value)
    },
    onCancel: "",
  })
}

export function textarea(props: {
  owner: Owner | null
  title: JSX.Element
  description?: JSX.Element
  cancelText?: string
  okText?: string
  value?: string
  minlength?: number
}): Promise<string | undefined> {
  const [value, setValue] = createSignal(untrack(() => props.value ?? ""))

  return popup({
    owner: props.owner,
    children(close) {
      return (
        <>
          <ModalTitle>{props.title}</ModalTitle>
          {props.description}
          <ModalTextarea
            minlength={props.minlength}
            value={value()}
            onInput={(el) => setValue(el.currentTarget.value)}
          />
          <ModalButtons>
            <ModalCancel onClick={() => close(undefined)}>
              {props.cancelText || "Cancel"}
            </ModalCancel>
            <ModalConfirm>{props.okText || "OK"}</ModalConfirm>
          </ModalButtons>
        </>
      )
    },
    onSubmit(close) {
      close(value())
    },
    onCancel: "",
  })
}

export function loading(
  owner: Owner | null,
  message?: () => JSX.Element,
  /** If present, shows a cancel button. */
  onCancel?: () => void,
) {
  let close!: () => void

  popup<void>({
    owner,
    onCancel,
    children(c) {
      close = c
      return (
        <>
          <ModalTitle>Loading...</ModalTitle>
          {message?.()}
          <Show when={onCancel}>
            <ModalButtons>
              <ModalCancel
                onClick={() => {
                  c()
                  onCancel!()
                }}
              >
                Cancel
              </ModalCancel>
            </ModalButtons>
          </Show>
        </>
      )
    },
  })

  return close
}

export function load<T>(
  owner: Owner | null,
  value: T,
  message?: () => JSX.Element,
  cancelable?: false,
  delayBeforeShowing?: number,
): Promise<Awaited<T>>

export function load<T>(
  owner: Owner | null,
  value: T,
  message?: () => JSX.Element,
  cancelable?: boolean,
  delayBeforeShowing?: number,
): Promise<Awaited<T> | null>

export function load<T>(
  owner: Owner | null,
  value: T,
  message?: () => JSX.Element,
  cancelable?: boolean,
  delayBeforeShowing = 300,
) {
  return new Promise<Awaited<T> | null>(async (resolve) => {
    let done = false
    let close: (() => void) | undefined
    setTimeout(() => {
      if (done) return
      close = loading(
        owner,
        message,
        cancelable ?
          () => {
            resolve(null)
            done = true
          }
        : undefined,
      )
    }, delayBeforeShowing)
    const v = await value
    done = true
    close?.()
    resolve(v)
  })
}
