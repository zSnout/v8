## Markers in the code

- `FIXME` – something which needs to be fixed, but which isn't urgent
- `FEAT` – where a new feature should be added, but which isn't urgent
- `TODO` – this needs fixing as soon as possible
- `CHECK` – this needs a label above assigned to it

## Extra type checking

Replace the `IDBPObjectStore.put` declaration with

```ts
interface IDBPObjectStore {
  put: Mode extends "readonly"
    ? undefined
    : StoreName extends "core" | "prefs"
    ? (
        value: StoreValue<DBTypes, StoreName>,
        key: StoreKey<DBTypes, StoreName> | IDBKeyRange,
      ) => Promise<StoreKey<DBTypes, StoreName>>
    : (
        value: StoreValue<DBTypes, StoreName>,
        key?: undefined,
      ) => Promise<StoreKey<DBTypes, StoreName>>
}
```

It is required to add keys to `core` and `prefs` when setting them, but will
fail at runtime if you add them to any other object store. Thus, it's helpful to
use this bit of TypeScript code to enforce that at compile time.
