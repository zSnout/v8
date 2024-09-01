import { createSignal, For, onMount } from "solid-js"

export function Main() {
  onMount(() => document.querySelector(".q8s7")?.remove())

  const [source, setSource] = createSignal("")

  return (
    <div>
      <textarea
        class="z-field min-h-20 w-full whitespace-pre-wrap border-transparent bg-z-body-selected shadow-none"
        onInput={(e) => setSource(e.currentTarget.value)}
        value={source()}
        placeholder="Enter words or unglossables here..."
      />

      <div>
        <For
          each={source()
            .split(/\s+/g)
            .filter((x) => x.trim())}
        >
          {(word) => {
            return (
              <div>
                <div>{word}</div>
              </div>
            )
          }}
        </For>
      </div>
    </div>
  )
}
