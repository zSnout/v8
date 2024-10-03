export function randomItem<T>(data: readonly T[]): T | undefined {
  return data[Math.floor(Math.random() * data.length)]
}
