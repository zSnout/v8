import { NormalizeContent } from "@/layouts/NormalizeContent"
import { ErrorBoundary as SolidErrorBoundary, JSX } from "solid-js"
import { Center } from "./Center"

export function Error(props: { reason: unknown; status?: number }) {
  return (
    <NormalizeContent>
      <Center>
        <div class="flex flex-1 flex-col">
          <div class="flex items-center">
            <p class="border-standard mr-8 border-r py-4 pr-8 text-5xl font-extralight">
              {props.status || "Error"}
            </p>

            <span class="sr-only">|</span>

            <p class="max-w-sm whitespace-pre-wrap py-4">
              {props.reason instanceof globalThis.Error ?
                props.reason.message
              : String(props.reason)}
            </p>
          </div>

          <a
            class="z-field mx-auto mt-6 w-48 max-w-full flex-1 whitespace-pre text-center"
            href=""
          >
            Reload
          </a>
        </div>
      </Center>
    </NormalizeContent>
  )
}

export function ErrorBoundary(props: { children: () => JSX.Element }) {
  const Inner = props.children

  return (
    <SolidErrorBoundary fallback={(error) => <Error reason={error} />}>
      <Inner />
    </SolidErrorBoundary>
  )
}
