import { Id } from "@thisbeyond/solid-dnd"
import { DB } from "."
import { Model } from "../lib/types"

export type ManagedModel =
  | { type: "clone"; name: string; cloned: Model }
  | { type: "delete"; id: Id }

export async function saveManagedModels(db: DB, models: Model[]) {}
