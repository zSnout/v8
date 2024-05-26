import { For, createSignal } from "solid-js"
import { Temporal } from "temporal-polyfill"

export interface Event {
  title: string
  description: string
  /** temporal plaindate */
  date: string
}

const init = [
  {
    title: "Founding of the Xia Dynasty",
    description:
      "The Xia Dynasty is considered the first dynasty in traditional Chinese history.",
    date: {
      year: -2070,
      month: 1,
      day: 1,
    },
  },
  {
    title: "Establishment of the Qin Dynasty",
    description:
      "The Qin Dynasty, founded by Qin Shi Huang, unified China in 221 BC and established the first centralized imperial government.",
    date: {
      year: -221,
      month: 10,
      day: 1,
    },
  },
  {
    title: "Construction of the Great Wall Begins",
    description:
      "Construction of the Great Wall of China began under the rule of the first Emperor of China, Qin Shi Huang.",
    date: {
      year: -214,
      month: 1,
      day: 1,
    },
  },
  {
    title: "Battle of Red Cliffs",
    description:
      "The Battle of Red Cliffs was a decisive battle fought at the end of the Han dynasty, resulting in a victory for the southern warlords Sun Quan and Liu Bei over the northern warlord Cao Cao.",
    date: {
      year: 208,
      month: 12,
      day: 1,
    },
  },
  {
    title: "Establishment of the Tang Dynasty",
    description:
      "The Tang Dynasty was established by Emperor Gaozu in 618 AD and is considered one of China's golden ages.",
    date: {
      year: 618,
      month: 6,
      day: 18,
    },
  },
  {
    title: "An Lushan Rebellion",
    description:
      "The An Lushan Rebellion was a devastating rebellion against the Tang Dynasty, led by the general An Lushan.",
    date: {
      year: 755,
      month: 12,
      day: 16,
    },
  },
  {
    title: "Mongol Conquest of China",
    description:
      "The Mongol conquest of China resulted in the establishment of the Yuan Dynasty by Kublai Khan in 1271.",
    date: {
      year: 1271,
      month: 12,
      day: 18,
    },
  },
  {
    title: "Founding of the Ming Dynasty",
    description:
      "The Ming Dynasty was established by Zhu Yuanzhang, who became the Hongwu Emperor.",
    date: {
      year: 1368,
      month: 1,
      day: 23,
    },
  },
  {
    title: "Opium War Begins",
    description:
      "The First Opium War began between the Qing Dynasty of China and the British Empire, primarily over trade disputes and China's sovereignty.",
    date: {
      year: 1839,
      month: 6,
      day: 18,
    },
  },
  {
    title: "Founding of the People's Republic of China",
    description:
      "The People's Republic of China was officially established by Mao Zedong on October 1, 1949, after the victory of the Chinese Communist Party in the Chinese Civil War.",
    date: {
      year: 1949,
      month: 10,
      day: 1,
    },
  },
  {
    title: "Empress Wu Zetian's Reign",
    description:
      "Wu Zetian became the only female emperor of China, ruling during the Tang Dynasty.",
    date: {
      year: 690,
      month: 10,
      day: 16,
    },
  },
  {
    title: "Marco Polo Arrives in China",
    description:
      "Marco Polo, the Venetian explorer, arrived in China and documented his travels in the Yuan Dynasty under Kublai Khan.",
    date: {
      year: 1275,
      month: 1,
      day: 1,
    },
  },
  {
    title: "Nanjing Massacre",
    description:
      "The Nanjing Massacre was a period of mass murder and mass rape committed by Japanese troops against the residents of Nanjing during the Second Sino-Japanese War.",
    date: {
      year: 1937,
      month: 12,
      day: 13,
    },
  },
  {
    title: "Cultural Revolution Begins",
    description:
      "The Cultural Revolution was a sociopolitical movement in China launched by Mao Zedong to preserve Chinese Communism by purging remnants of capitalist and traditional elements from Chinese society.",
    date: {
      year: 1966,
      month: 5,
      day: 16,
    },
  },
  {
    title: "Deng Xiaoping's Economic Reforms",
    description:
      "Deng Xiaoping initiated a series of economic reforms that transformed China into a market economy, leading to rapid economic growth.",
    date: {
      year: 1978,
      month: 12,
      day: 18,
    },
  },
  {
    title: "Hong Kong Handover",
    description:
      "Hong Kong was handed over from the United Kingdom to China, becoming a Special Administrative Region.",
    date: {
      year: 1997,
      month: 7,
      day: 1,
    },
  },
]
  .map<Event>((x) => ({
    title: x.title,
    description: x.description,
    date: new Temporal.PlainDate(
      x.date.year,
      x.date.month,
      x.date.day,
    ).toString(),
  }))
  .sort((a, b) =>
    Temporal.PlainDate.compare(
      Temporal.PlainDate.from(a.date),
      Temporal.PlainDate.from(b.date),
    ),
  )

export function Main() {
  const [events] = createSignal<readonly Event[]>(init)

  return (
    <div class="flex flex-1 flex-col gap-4 border-l border-z-text-heading py-8">
      {/* <h1 class="text-center text-xl font-extralight text-z-heading">
        My Timeline
      </h1> */}

      <For each={events()}>
        {(event) => (
          <div class="relative flex flex-col px-6">
            <div class="absolute -left-[0.5px] top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-z-text-heading" />
            <h2 class="text-2xl font-semibold text-z-heading">{event.title}</h2>
            <h2 class="text-sm text-z-subtitle">
              {Temporal.PlainDate.from(event.date).toLocaleString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                era: "short",
              })}
            </h2>
          </div>
        )}
      </For>
    </div>
  )
}
