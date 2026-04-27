import { cn } from '../lib/utils.js'

export function StatusDot({ online, className }) {
  return (
    <span
      title={online ? '在线' : '离线'}
      className={cn(
        'inline-block w-2 h-2 rounded-full shrink-0',
        online ? 'bg-emerald-500 ring-2 ring-emerald-500/25' : 'bg-muted-foreground/40',
        className,
      )}
    />
  )
}
