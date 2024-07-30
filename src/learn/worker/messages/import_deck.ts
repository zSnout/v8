import { UserMedia } from "@/learn/lib/media"
import type { PackagedDeck } from "@/learn/lib/types"
import { readwrite } from ".."
import { unpackage } from "../lib/unpackage"

const userMedia = new UserMedia()

export async function import_packaged_deck({
  data,
  media,
  meta,
}: PackagedDeck) {
  const tx = readwrite("Import deck package")
  try {
    if (meta.media && media) {
      await userMedia.import(meta.media, media)
    }

    tx.commit()
  } finally {
    tx.dispose()
  }
}

export async function import_deck(file: File) {
  const data = await unpackage(file)
  return import_packaged_deck(data)
}
