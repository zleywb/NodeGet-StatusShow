import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function loadColor(v) {
  if (!Number.isFinite(v)) return 'bg-muted-foreground/40'
  if (v >= 90) return 'bg-rose-500'
  if (v >= 75) return 'bg-amber-500'
  return 'bg-primary'
}
