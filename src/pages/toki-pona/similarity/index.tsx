import { onMount } from "solid-js"

function Statistic(props: { name: string; value: string }) {
  return (
    <>
      <div>{props.name}</div>
      <div>{props.value}</div>
    </>
  )
}

export function Main() {
  onMount(() => document.getElementById("wile-js")?.remove())

  return (
    <div class="flex h-full gap-8 font-sp-sans text-2xl/6">
      <div class="min-h-full w-full bg-red-500"></div>

      <div class="flex h-full w-96 flex-col gap-4">
        <div class="w-full rounded-lg border border-z py-1 text-center text-z transition">
          sina pana e sona{" "}
          <span class="rounded-md bg-z-body-selected px-2 font-sans text-z transition">
            23
          </span>
        </div>

        <div class="flex w-full flex-1 flex-col rounded-lg border border-z">
          hi
        </div>
      </div>
    </div>
  )
}
