import { Badge } from './ui/badge.jsx'
import { Card } from './ui/card.jsx'
import { Progress } from './ui/progress.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.jsx'
import { StatusDot } from './StatusDot.jsx'
import { bytes, pct, relativeAge } from '../utils/format.js'
import { deriveUsage, displayName } from '../utils/derive.js'
import { cn, loadColor } from '../lib/utils.js'

export function NodeTable({ nodes, onOpen }) {
  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>名称</TableHead>
            <TableHead>地区</TableHead>
            <TableHead>来源</TableHead>
            <TableHead>CPU</TableHead>
            <TableHead>内存</TableHead>
            <TableHead>磁盘</TableHead>
            <TableHead>下行</TableHead>
            <TableHead>上行</TableHead>
            <TableHead>更新</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nodes.map(n => {
            const u = deriveUsage(n)
            return (
              <TableRow
                key={n.uuid}
                onClick={() => onOpen?.(n.uuid)}
                className={cn('cursor-pointer', !n.online && 'opacity-60')}
              >
                <TableCell>
                  <StatusDot online={n.online} />
                </TableCell>
                <TableCell className="font-medium">{displayName(n)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {n.meta?.region || n.meta?.country || '—'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{n.source}</Badge>
                </TableCell>
                <TableCell>
                  <CellBar value={u.cpu} />
                </TableCell>
                <TableCell>
                  <CellBar
                    value={u.mem}
                    hint={u.memTotal ? `${bytes(u.memUsed)} / ${bytes(u.memTotal)}` : null}
                  />
                </TableCell>
                <TableCell>
                  <CellBar
                    value={u.disk}
                    hint={u.diskTotal ? `${bytes(u.diskUsed)} / ${bytes(u.diskTotal)}` : null}
                  />
                </TableCell>
                <TableCell className="font-mono">{bytes(u.netIn || 0)}/s</TableCell>
                <TableCell className="font-mono">{bytes(u.netOut || 0)}/s</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {relativeAge(u.ts)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

function CellBar({ value, hint }) {
  return (
    <div className="flex items-center gap-2 min-w-[110px]" title={hint || ''}>
      <Progress value={value} indicatorClassName={loadColor(value)} className="flex-1 h-1.5" />
      <span className="font-mono text-xs w-12 text-right">{pct(value)}</span>
    </div>
  )
}
