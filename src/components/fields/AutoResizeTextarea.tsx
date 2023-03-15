import type { JSX } from "solid-js/jsx-runtime"

const onResize: (() => void)[] = []

function onInput(this: HTMLTextAreaElement) {
  this.style.height = "0"

  this.style.height =
    this.offsetHeight - this.clientHeight + this.scrollHeight + "px"
}

export function AutoResizeTextarea(
  props: JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  const textarea = (
    <textarea
      style={{ "min-height": "calc(2.5rem + 2px)", height: 0 }}
      {...props}
    />
  )

  if (
    typeof HTMLTextAreaElement != "undefined" &&
    textarea instanceof HTMLTextAreaElement
  ) {
    onInput.call(textarea)
    textarea.classList.add("resize-none")
    textarea.addEventListener("input", onInput)
    onResize.push(onInput.bind(textarea))
  }

  return textarea
}

if (typeof window != "undefined") {
  window.addEventListener("resize", () => onResize.forEach((fn) => fn()), {
    passive: true,
  })
}
