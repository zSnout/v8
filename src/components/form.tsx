import { children, createSignal, Show, type JSX } from "solid-js"
import { clsx } from "./clsx"
import { error } from "./result"

export function FormTitle(props: { children: JSX.Element; class?: string }) {
  return (
    <h1
      class={clsx(
        "text-center text-lg font-semibold text-z-heading",
        props.class,
      )}
    >
      {props.children}
    </h1>
  )
}

export function FormField(props: {
  label: JSX.Element
  children: JSX.Element
}) {
  return (
    <label class="block">
      <div class="mb-1 text-z-subtitle">{props.label}</div>
      {props.children}
    </label>
  )
}

export function FormFieldGroup(props: { children: JSX.Element }) {
  return <div class="flex flex-col gap-6">{props.children}</div>
}

export function FormSubmit(props: {
  processing?: boolean | string
  message: string
}) {
  return (
    <button
      class="z-field mt-12 w-full shadow-none"
      type="submit"
      disabled={!!props.processing}
    >
      {typeof props.processing == "string" ?
        props.processing
      : props.processing ?
        "Processing..."
      : "Log In"}
    </button>
  )
}

export function A(props: {
  class?: string
  href: string
  children: JSX.Element
}) {
  return (
    <a
      href={props.href}
      class={clsx("text-z-link underline underline-offset-2", props.class)}
    >
      {props.children}
    </a>
  )
}

export function FormAlternative(props: { children: JSX.Element }) {
  return <p class="mt-8 text-center">{props.children}</p>
}

export interface FormInfo {
  processing: boolean
  message?: string | undefined
  data(): FormData
}

export function Form(props: {
  /** Form title */
  title?: JSX.Element
  /** Form fields */
  children(info: FormInfo): JSX.Element
  /** Header between title and fields */
  header?: JSX.Element
  /** Footer below the submit button and message */
  footer?: JSX.Element
  /** Default message on submit button */
  submit: string
  /** Runs on submit */
  onSubmit(info: FormInfo): string | Promise<string>
}) {
  const [processing, setProcessing] = createSignal(false)
  const [message, setMessage] = createSignal<string>()
  let el: HTMLFormElement

  const info: FormInfo = {
    get processing() {
      return processing()
    },
    set processing(v) {
      setProcessing(v)
    },
    get message() {
      return message()
    },
    set message(v) {
      setMessage(v)
    },
    data() {
      return new FormData(el)
    },
  }

  const header = children(() => props.header)

  return (
    <form
      class="my-auto"
      ref={el!}
      onSubmit={async (event) => {
        event.preventDefault()
        setProcessing(true)
        setMessage()
        try {
          const message = await props.onSubmit(info)
          setProcessing(false)
          setMessage(message)
        } catch (err) {
          setProcessing(false)
          setMessage(error(err).reason)
        }
      }}
    >
      <Show when={props.title}>
        <FormTitle class={header() ? "mb-1" : "mb-8"}>{props.title}</FormTitle>
        {header()}
        <Show when={header()}>
          <div class="mb-8" />
        </Show>
      </Show>

      <FormFieldGroup>{props.children(info)}</FormFieldGroup>

      <button
        class="z-field mt-12 w-full shadow-none"
        type="submit"
        disabled={processing()}
      >
        {processing() ? "Processing..." : props.submit}
      </button>
      <Show when={message()}>
        <p class="mt-2 text-center">{message()}</p>
      </Show>

      {props.footer}
    </form>
  )
}
