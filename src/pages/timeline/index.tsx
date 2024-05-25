import { For, createSignal } from "solid-js"
import { Temporal } from "temporal-polyfill"

export interface Event {
  name: string
  /** temporal plaindate */
  date: string
}

export function Main() {
  const [events, setEvents] = createSignal<readonly Event[]>([
    { name: "hi", date: new Temporal.PlainDate(1970, 1, 24).toString() },
    { name: "hi 2", date: new Temporal.PlainDate(1983, 2, 4).toString() },
  ])

  return (
    <div class="flex flex-1 flex-col gap-4 border-l border-z-text-heading">
      <For each={events()}>
        {(event) => (
          <div class="relative flex flex-col px-6">
            <div class="absolute -left-[0.5px] top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-z-text-heading" />
            <h2 class="text-2xl font-semibold text-z-heading">{event.name}</h2>
            <h2 class="text-sm text-z-subtitle">
              {Temporal.PlainDate.from(event.date).toLocaleString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </h2>
          </div>
        )}
      </For>
    </div>
  )
}
