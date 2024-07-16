import type { Ty } from "./db"
import type { Id } from "./lib/id"

export type Primitive = number | string | boolean | null | undefined

export type Filter<T> = {
  [K in keyof T as T[K] extends Primitive | IDBValidKey | unknown[]
    ? K
    : never]?: T[K] extends infer U
    ?
        | (U extends Primitive
            ? U | IDBKeyRange
            : U extends IDBValidKey
            ? IDBKeyRange
            : never)
        | (U extends unknown[] ? { length?: number | IDBKeyRange } : never)
    : never
}

export type WhereKey<T extends { indexes: unknown; value: unknown }> =
  | keyof T["indexes"]
  | (T["value"] extends { id: Id } ? "id" : never)

export type WhereValue<
  T extends { indexes: unknown; value: unknown },
  K extends WhereKey<T>,
> = keyof T["indexes"] | (T["value"] extends { id: Id } ? "id" : never)

export class Tx {
  #tx: IDBTransaction

  constructor(tx: IDBTransaction) {
    this.#tx = tx
  }

  decks = {
    where<T extends Filter<Ty["decks"]["value"]>>(filter: T) {},
  }
}

export class TxDecks {
  where?: Filter<Ty["decks"]["value"]>
}

declare const tx: Tx
