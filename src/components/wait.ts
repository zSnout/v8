export function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function delay<T>(promise: Promise<T>, ms: number) {
  return (await Promise.all([promise, wait(ms)]))[0]
}
