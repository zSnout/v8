import { createEventListener } from "@/components/create-event-listener"
import { Fa } from "@/components/Fa"
import { Unmain } from "@/components/Prose"
import {
  faChevronRight,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import { search } from "fast-fuzzy"
import {
  createMemo,
  createResource,
  createSignal,
  For,
  JSX,
  Show,
} from "solid-js"
import { BlogCard } from "./cards/BlogCard"
import { CompactCard } from "./cards/CompactCard"
import { MegaCard } from "./cards/MegaCard"
import { SideCard } from "./cards/SideCard"
import { accountEntry, accountVerified, Page, pages } from "./pages"
import { SidePageSeparator } from "./SidePageSeparator"
import { MatchQuery, supabase } from "@/components/supabase"

const allPages = pages.slice()

const page1 = allPages.at(-1)!
const page2 = allPages.at(-2)!
const page3 = allPages.at(-3)!
const page4 = allPages.at(-4)!

function SectionHeader(props: { title: JSX.Element; allItems?: JSX.Element }) {
  return (
    <div class="mt-16 flex items-center border-b border-t-4 border-b-z border-t-z-text-heading py-2 transition dark:border-t-z-text-subtitle">
      <p class="text-xl font-bold text-z-heading transition">{props.title}</p>

      {props.allItems}
    </div>
  )
}

function BlogSection() {
  return (
    <>
      <SectionHeader
        title="Latest Posts"
        allItems={
          <AllItems label="All Posts" href="/blog" icon={faChevronRight} />
        }
      />

      <div class="mt-4 flex flex-col gap-8 sm:flex-row">
        <BlogCard class="flex" page={allPages[0]!} />
        <BlogCard class="flex" page={allPages[1]!} />
        <BlogCard class="hidden md:flex" page={allPages[2]!} />
        <BlogCard class="hidden lg:flex" page={allPages[3]!} />
      </div>
    </>
  )
}

function AccountSection() {
  const [user] = createResource(async () => await supabase.auth.getUser())

  return (
    <>
      <SectionHeader
        title={
          <MatchQuery
            result={user()}
            loading="My Account"
            error={() => "My Account"}
            ok={({ user }) => user.user_metadata.username + "'s Account"}
          />
        }
        allItems={
          <AllItems href="/account" label="Settings" icon={faChevronRight} />
        }
      />

      <div class="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Show
          when={user()?.data.user}
          fallback={
            <For each={accountEntry}>
              {(page) => <CompactCard page={page} />}
            </For>
          }
        >
          <For each={accountVerified}>
            {(page) => <CompactCard page={page} />}
          </For>
        </Show>
      </div>
    </>
  )
}

function AllItems(props: {
  label: string
  icon: IconDefinition
  href: string
}) {
  return (
    <a
      class="ml-auto flex items-center whitespace-pre text-z-link underline decoration-transparent transition hover:decoration-current"
      href={props.href}
    >
      {props.label}
      <Fa
        class="ml-2 h-3 w-3 icon-z-text-link"
        icon={props.icon}
        title={false}
      />
    </a>
  )
}

function AllPagesSection() {
  return (
    <>
      <SectionHeader title="All Pages" />

      <div class="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {pages
          .filter((x) => x.category != "blog")
          .sort((a, b) => (a.title < b.title ? -1 : 1))
          .map((page) => (
            <CompactCard page={page} />
          ))}
      </div>
    </>
  )
}

function UnsearchedView() {
  return (
    <>
      <div class="flex flex-col gap-12 lg:flex-row">
        <MegaCard {...page1} />

        <div class="flex flex-1 flex-col lg:basis-48">
          <SideCard {...page2} />
          <SidePageSeparator />
          <SideCard {...page3} />
          <SidePageSeparator />
          <SideCard {...page4} />
        </div>
      </div>

      <AccountSection />

      <BlogSection />

      <AllPagesSection />
    </>
  )
}

function SearchedView(props: { pages: readonly Page[] }) {
  return (
    <>
      <div
        class="flex flex-col gap-12 lg:flex-row"
        classList={{
          "flex-1": props.pages.length == 0,
          "h-full": props.pages.length == 0,
        }}
      >
        <Show
          fallback={
            <div class="m-auto flex flex-col gap-4 text-center">
              <p class="text-2xl font-bold text-z-heading">
                Looks like there aren't any results!
              </p>

              <p class="text-lg">Try adjusting your query.</p>
            </div>
          }
          when={props.pages[0]}
        >
          <MegaCard {...props.pages[0]!} />

          <div class="flex flex-1 flex-col lg:basis-48">
            <Show when={props.pages[1]}>
              <SideCard {...props.pages[1]!} />
            </Show>

            <Show when={props.pages[2]}>
              <SidePageSeparator />

              <SideCard {...props.pages[2]!} />
            </Show>

            <Show when={props.pages[3]}>
              <SidePageSeparator />

              <SideCard {...props.pages[3]!} />
            </Show>
          </div>
        </Show>
      </div>

      <Show when={props.pages.length > 4}>
        <SectionHeader title="More Results" />

        <div class="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {pages.slice(4).map((page) => (
            <CompactCard page={page} />
          ))}
        </div>
      </Show>
    </>
  )
}

export function Main() {
  const [query, setQuery] = createSignal("")

  const filtered = createMemo(() => [
    ...new Set([
      ...search(query(), allPages, {
        ignoreCase: true,
        ignoreSymbols: true,
        keySelector(page) {
          return page.title
        },
        normalizeWhitespace: true,
      }),
      ...search(query(), allPages, {
        ignoreCase: true,
        ignoreSymbols: true,
        keySelector(page) {
          return page.subtitle
        },
        normalizeWhitespace: true,
      }),
    ]),
  ])

  return (
    <>
      <div class="mx-auto mb-11 w-[30rem] max-w-full md:fixed md:left-1/2 md:top-2 md:z-[100] md:w-[20rem] md:-translate-x-1/2">
        <input
          class="z-field h-12 w-full border-transparent bg-z-body-selected text-center shadow-none md:h-8 md:px-3 md:py-0"
          placeholder="Search zSnout..."
          value={query()}
          onInput={(event) => setQuery(event.currentTarget.value)}
          ref={(field) => {
            console.log(field)

            createEventListener(document, "keydown", (event) => {
              if (
                event.altKey ||
                event.shiftKey ||
                document.activeElement == field
              ) {
                return
              }

              if (
                (event.key == "/" && !event.ctrlKey && !event.metaKey) ||
                (event.key == "k" && event.ctrlKey !== event.metaKey)
              ) {
                field.focus()
                event.preventDefault()
              }
            })
          }}
        />
      </div>

      <Show fallback={<UnsearchedView />} when={query()}>
        <SearchedView pages={filtered()} />
      </Show>
    </>
  )
}

export function Neohuomi() {
  return (
    <Unmain>
      <div class="grid grid-cols-2 gap-4">
        <For each={pages.filter((x) => x.categoryHref != "/blog").reverse()}>
          {(page) => (
            <div class="flex h-36 gap-2 rounded-xl bg-z-body-selected p-1 transition">
              <img class="rounded-lg" src={page.imageSrc} alt={page.imageAlt} />
              <div class="flex h-full flex-col gap-1">
                <h2 class="text-lg font-bold text-z-heading">{page.title}</h2>
                <p class="mt-auto line-clamp-4">{page.subtitle}</p>
              </div>
            </div>
          )}
        </For>
      </div>
    </Unmain>
  )
}
