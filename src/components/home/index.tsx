import { createEventListener } from "@/components/create-event-listener"
import { Fa } from "@/components/Fa"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { search } from "fast-fuzzy"
import { createMemo, createSignal, JSX, Show } from "solid-js"
import { BlogCard } from "./BlogCard"
import { CompactCard } from "./CompactCard"
import { LatestBlogArticle } from "./LatestBlogArticle"
import { MegaCard } from "./MegaCard"
import { type Page, pages } from "./pages"
import { SideCard } from "./SideCard"
import { SidePageSeparator } from "./SidePageSeparator"

const allPages = pages.slice()

const page1 = allPages.at(-1)!
const page2 = allPages.at(-2)!
const page3 = allPages.at(-3)!

function SectionHeader(props: { title: string; allItems?: JSX.Element }) {
  return (
    <div class="mt-16 flex items-center border-b border-t-4 border-b-z border-t-z-text-heading py-2 transition">
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
          <a
            class="ml-auto flex items-center whitespace-pre text-z-link underline decoration-transparent transition hover:decoration-current"
            href="/blog"
          >
            All Posts
            <Fa
              class="ml-2 h-3 w-3 icon-z-text-link"
              icon={faChevronRight}
              title="Right arrow"
            />
          </a>
        }
      />

      <div class="mt-4 flex flex-col gap-8 sm:flex-row">
        <BlogCard class="flex" page={allPages[1]!} />
        <BlogCard class="flex" page={allPages[2]!} />
        <BlogCard class="hidden md:flex" page={allPages[3]!} />
        <BlogCard class="hidden lg:flex" page={allPages[4]!} />
      </div>
    </>
  )
}

function AllPagesSection() {
  return (
    <>
      <SectionHeader title="All Pages" />

      <div class="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {pages
          .filter((x) => x.category != "blog")
          .slice(0, -3)
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
        <LatestBlogArticle />

        <div class="flex flex-col">
          <SideCard {...page1} />
          <SidePageSeparator />
          <SideCard {...page2} />
          <SidePageSeparator />
          <SideCard {...page3} />
        </div>
      </div>

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
        </Show>

        <div class="flex flex-col">
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
