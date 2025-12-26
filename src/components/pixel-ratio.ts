const dprSpecified =
  globalThis.location?.search.includes("dpr") ?
    +new URL(location.href).searchParams.get("dpr")!
  : null

export function DPR() {
  const dpr = dprSpecified ?? globalThis.devicePixelRatio ?? 1
  return isFinite(dpr) && 0.1 <= dpr && dpr <= 10 ? dpr : 1
}
