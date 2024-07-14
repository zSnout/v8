const cursorUpdate = IDBCursor.prototype.update
const objectStoreAdd = IDBObjectStore.prototype.add
const objectStorePut = IDBObjectStore.prototype.put

IDBCursor.prototype.update = function (value: unknown) {
  if (typeof value == "object" && value && "last_edited" in value) {
    value.last_edited = Date.now()
  }

  return cursorUpdate.call(this, value)
}

IDBObjectStore.prototype.add = function (value: unknown, key) {
  if (typeof value == "object" && value && "last_edited" in value) {
    value.last_edited = Date.now()
  }

  return objectStoreAdd.call(this, value, key)
}

IDBObjectStore.prototype.put = function (value: unknown, key) {
  if (typeof value == "object" && value && "last_edited" in value) {
    value.last_edited = Date.now()
  }

  return objectStorePut.call(this, value, key)
}
