import { createEventListener } from "@/components/create-event-listener"
import { Fa } from "@/components/Fa"
import { MatchQuery, supabase } from "@/components/supabase"
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

const allPages = pages.slice()

const page1 = allPages.at(-1)!
const page2 = allPages.at(-2)!
const page3 = allPages.at(-3)!
const page4 = allPages.at(-4)!

function SectionHeader(props: { title: JSX.Element; children?: JSX.Element }) {
  return (
    <div class="mt-16 flex items-center border-t-4 border-t-z-text-heading pt-2 transition dark:border-t-z-text-subtitle">
      <p class="text-xl font-bold text-z-heading transition">{props.title}</p>

      {props.children}
    </div>
  )
}

function BlogSection() {
  return (
    <>
      <SectionHeader title="Latest Posts">
        <AllItems label="All Posts" href="/blog" icon={faChevronRight} />
      </SectionHeader>

      <div class="mt-2 flex flex-col gap-x-4 gap-y-8 sm:flex-row">
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
      >
        <AllItems href="/account" label="Settings" icon={faChevronRight} />
      </SectionHeader>

      <div class="mt-2 grid grid-cols-1 gap-x-4 gap-y-8 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

      <div class="mt-2 grid grid-cols-1 gap-x-4 gap-y-8 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
      <Show
        when={props.pages.length == 0}
        fallback={
          <div class="grid grid-cols-1 gap-x-4 gap-y-8 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <For each={props.pages}>
              {(page) => <CompactCard page={page} />}
            </For>
          </div>
        }
      >
        <div class="m-auto flex flex-col gap-4 text-center">
          <p class="text-2xl font-bold text-z-heading">
            Looks like there aren't any results!
          </p>

          <p class="text-lg">Try adjusting your query.</p>
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
