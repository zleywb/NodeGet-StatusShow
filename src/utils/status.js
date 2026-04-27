export const OFFLINE_AFTER_MS = 30_000

export function isOnline(timestamp, now = Date.now()) {
  return typeof timestamp === 'number' && now - timestamp < OFFLINE_AFTER_MS
}
