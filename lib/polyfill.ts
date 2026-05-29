// Bun provides a broken localStorage polyfill in some environments
// This ensures we have a safe localStorage or none at all
if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
  const ls = (globalThis as Record<string, unknown>).localStorage
  if (
    !ls ||
    typeof (ls as { getItem?: unknown }).getItem !== "function" ||
    typeof (ls as { setItem?: unknown }).setItem !== "function"
  ) {
    try {
      // @ts-expect-error polyfill
      globalThis.localStorage = undefined
    } catch {
      // ignore
    }
  }
}
