import { ArrowDown, ArrowUp, Clock } from 'lucide-react'
import { Badge } from './ui/badge.jsx'
import { Card } from './ui/card.jsx'
import { Progress } from './ui/progress.jsx'
import { StatusDot } from './StatusDot.jsx'
import { bytes, pct, relativeAge, uptime } from '../utils/format.js'
import { deriveUsage, displayName, osLabel } from '../utils/derive.js'
import { cn, loadColor } from '../lib/utils.js'

export function NodeCard({ node, onOpen }) {
  const u = deriveUsage(node)
  const region = node.meta?.region || node.meta?.country
  const tags = Array.isArray(node.meta?.tags) ? node.meta.tags : []
  const os = osLabel(node)

  return (
    <Card
      onClick={() => onOpen?.(node.uuid)}
      className={cn(
        'p-4 cursor-pointer transition hover:border-primary/50 hover:shadow-md flex flex-col gap-3',
        !node.online && 'opacity-60',
      )}
    >
      <div className="flex items-center gap-2">
        <StatusDot online={node.online} />
        <span className="font-semibold flex-1 min-w-0 truncate" title={displayName(node)}>
          {displayName(node)}
        </span>
        {region && <span className="text-xs text-muted-foreground shrink-0">{region}</span>}
        <Badge variant="secondary" className="shrink-0 max-w-[8rem] truncate">
          {node.source}
        </Badge>
      </div>

      {os && <div className="font-mono text-xs text-muted-foreground">{os}</div>}

      <div className="flex flex-col gap-2.5">
        <Metric label="CPU" value={u.cpu} />
        <Metric
          label="内存"
          value={u.mem}
          sub={u.memTotal ? `${bytes(u.memUsed)} / ${bytes(u.memTotal)}` : null}
        />
        <Metric
          label="磁盘"
          value={u.disk}
          sub={u.diskTotal ? `${bytes(u.diskUsed)} / ${bytes(u.diskTotal)}` : null}
        />
      </div>

      <div className="pt-2.5 border-t border-dashed flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
        <Stat icon={ArrowDown}>{bytes(u.netIn || 0)}/s</Stat>
        <Stat icon={ArrowUp}>{bytes(u.netOut || 0)}/s</Stat>
        <Stat icon={Clock}>{uptime(u.uptime)}</Stat>
        <span className="ml-auto">{relativeAge(u.ts)}</span>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <Badge key={t} variant="outline" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}

function Stat({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {children}
    </span>
  )
}

function Metric({ label, value, sub }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{pct(value)}</span>
      </div>
      <Progress value={value} indicatorClassName={loadColor(value)} className="mt-1 h-1.5" />
      {sub && <div className="font-mono text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  )
}
