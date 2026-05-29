export function getSafeLocalStorage() {
  if (typeof window === "undefined") return null
  const storage = window.localStorage
  if (!storage || typeof storage.getItem !== "function") return null
  return storage
}

export function safeGetItem(key: string): string | null {
  const storage = getSafeLocalStorage()
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function safeSetItem(key: string, value: string) {
  const storage = getSafeLocalStorage()
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch {
    // ignore
  }
}

export function safeRemoveItem(key: string) {
  const storage = getSafeLocalStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // ignore
  }
}
