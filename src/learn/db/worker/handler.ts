import { error } from "@/components/result"
import type { ToScript, ToWorker } from "."
import * as messages from "./messages"

// message handler should be set up as early as possible
addEventListener("message", async ({ data }: { data: unknown }) => {
  if (typeof data != "object" || data == null || !("zTag" in data)) {
    return
  }

  if (data["zTag"] === 0) {
    const req = data as unknown as ToWorker
    try {
      const value = await (messages[req.type as keyof typeof messages] as any)(
        ...req.data,
      )
      const res: ToScript = { zTag: 0, id: req.id, ok: true, value }
      postMessage(res)
    } catch (value) {
      const res: ToScript = {
        zTag: 0,
        id: req.id,
        ok: false,
        value: error(value).reason,
      }
      postMessage(res)
    }
    return
  }
})
