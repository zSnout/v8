import { createSignal, For, onMount } from "solid-js"

export function Main() {
  onMount(() => document.querySelector(".q8s7")?.remove())

  // let nextId = 1
  // const [ids, setIds] = createSignal<readonly number[]>([0])
  // const [words, setWords] = createStore<Record<number, string>>({ 0: "" })
  const [source, setSource] = createSignal("")

  return (
    // <div class="flex flex-wrap gap-2">
    //   <For each={ids()}>
    //     {(id, index) => {
    //       return <input type="text" onInput={(event) => {

    //       }} />
    //     }}
    //   </For>
    // </div>
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

  // function WordInput() {}

  // function Word(id: number, index: () => number) {
  //   const [word, setWord] = createSignal("")

  //   return (
  //     <div class="rounded-lg bg-z-body-selected">
  //       <input
  //         class="z-field-focusable w-full rounded-t-lg border-b border-transparent border-b-z bg-transparent px-2 py-1"
  //         type="text"
  //         value={word()}
  //         onInput={(e) => setWord(e.currentTarget.value)}
  //       />

  //       <div class="px-2 py-1">hello</div>
  //     </div>
  //   )
  // }
}
