import { JSX } from "solid-js"
import { Portal } from "solid-js/web"

export function ModalCancel(props: {
  children: JSX.Element
  onClick?: () => void
}) {
  return (
    <button
      class="z-field rounded-md text-sm text-z-heading shadow-none hover:bg-z-field-selected"
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}

export function ModalConfirm(props: {
  children: JSX.Element
  onClick?: () => void
}) {
  return (
    <button
      class="z-field rounded-md border-transparent bg-z-text-heading text-sm text-z-bg-body shadow-none hover:bg-z-text"
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

export function Modal(props: { children: JSX.Element; open: boolean }) {
  return (
    <Portal>
      <div
        class="group pointer-events-none fixed left-0 top-0 z-30 flex h-full w-full transform bg-black/0 px-6 py-8 transition open:pointer-events-auto open:bg-black/80"
        // @ts-expect-error
        attr:open={props.open ? true : undefined}
      >
        <div class="m-auto flex max-h-full w-full max-w-lg scale-95 flex-col overflow-y-auto rounded-lg bg-z-body px-6 py-6 opacity-0 shadow-lg transition group-open:scale-100 group-open:opacity-100">
          {props.children}
        </div>
      </div>
    </Portal>
  )

  // return (
  //   <div
  //     role="alertdialog"
  //     data-state="open"
  //     class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg"
  //     tabindex="-1"
  //     style="pointer-events: auto;"
  //   >
  //     <div class="flex flex-col space-y-2 text-center sm:text-left">
  //       <h2 id="radix-:r9q:" class="text-lg font-semibold">
  //         {props.title}
  //       </h2>
  //       <p id="radix-:r9r:" class="text-sm text-z-subtitle">
  //         {props.description}
  //       </p>
  //     </div>
  //     <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
  //       <button
  //         type="button"
  //         class="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground mt-2 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0"
  //       >
  //         Cancel
  //       </button>
  //       <button
  //         type="button"
  //         class="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  //       >
  //         Continue
  //       </button>
  //     </div>
  //   </div>
  // )
}
