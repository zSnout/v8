import type { Awaitable } from "../el/Layers"
import { MEDIA_PREFIX, UserMedia } from "./media"

let media: UserMedia | undefined

self.addEventListener(
  "fetch" as any,
  (event: {
    respondWith(data: Awaitable<Response>): void
    request: Request
  }) => {
    const path = new URL(event.request.url).pathname
    if (path.startsWith(MEDIA_PREFIX)) {
      event.respondWith(
        (media ??= new UserMedia()).response(path.slice(MEDIA_PREFIX.length)),
      )
    }
  },
)
