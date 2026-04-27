import { useEffect, useMemo, useState } from 'react'
import { BackendPool } from '../api/pool.js'
import { dynamicSummaryMulti, kvGetMulti, listAgentUuids, staticDataMulti } from '../api/methods.js'
import { isOnline } from '../utils/status.js'

const STATIC_FIELDS = ['cpu', 'system']
const DYNAMIC_FIELDS = [
  'cpu_usage',
  'used_memory',
  'total_memory',
  'available_memory',
  'used_swap',
  'total_swap',
  'total_space',
  'available_space',
  'read_speed',
  'write_speed',
  'receive_speed',
  'transmit_speed',
  'total_received',
  'total_transmitted',
  'load_one',
  'load_five',
  'load_fifteen',
  'uptime',
  'boot_time',
  'process_count',
  'tcp_connections',
  'udp_connections',
]
const META_KEYS = ['name', 'region', 'country', 'tags', 'lat', 'lng', 'hidden']
const DYN_INTERVAL_MS = 2000
const HISTORY_LIMIT = 60

function sampleFrom(row) {
  const memTotal = row.total_memory || 0
  const diskTotal = row.total_space || 0
  return {
    t: row.timestamp,
    cpu: Number.isFinite(row.cpu_usage) ? row.cpu_usage : null,
    mem: memTotal ? (row.used_memory / memTotal) * 100 : null,
    disk:
      diskTotal && row.available_space != null
        ? ((diskTotal - row.available_space) / diskTotal) * 100
        : null,
    netIn: row.receive_speed ?? 0,
    netOut: row.transmit_speed ?? 0,
  }
}

export function useNodes(config) {
  const [agents, setAgents] = useState(new Map())
  const [live, setLive] = useState(new Map())
  const [history, setHistory] = useState(new Map())
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!config?.site_tokens?.length) {
      setLoading(false)
      return
    }
    const pool = new BackendPool(config.site_tokens)
    const sourceUuids = new Map()

    const bootstrap = async () => {
      const agentsRes = await pool.fanout(listAgentUuids)
      setErrors(prev => [...prev, ...agentsRes.errors])

      const seed = new Map()
      for (const { source, rows } of agentsRes.ok) {
        const uuids = rows || []
        sourceUuids.set(source, uuids)
        for (const uuid of uuids) seed.set(uuid, { uuid, source, meta: {}, static: {} })
      }
      setAgents(seed)
      setLoading(false)

      await Promise.all(
        pool.entries.map(async entry => {
          const uuids = sourceUuids.get(entry.name) || []
          if (!uuids.length) return

          const kvItems = uuids.flatMap(u => META_KEYS.map(k => ({ namespace: u, key: k })))
          const [meta, stat] = await Promise.allSettled([
            kvGetMulti(entry.client, kvItems),
            staticDataMulti(entry.client, uuids, STATIC_FIELDS),
          ])

          setAgents(prev => {
            const next = new Map(prev)
            if (meta.status === 'fulfilled' && Array.isArray(meta.value)) {
              // kv rows are { namespace, key, value }; chunked per uuid in request order
              for (let i = 0; i < uuids.length; i++) {
                const slice = meta.value.slice(i * META_KEYS.length, (i + 1) * META_KEYS.length)
                const m = {}
                META_KEYS.forEach((k, j) => {
                  const v = slice[j]?.value
                  if (v != null) m[k] = v
                })
                const cur = next.get(uuids[i]) || {
                  uuid: uuids[i],
                  source: entry.name,
                  meta: {},
                  static: {},
                }
                next.set(uuids[i], { ...cur, meta: m })
              }
            }
            if (stat.status === 'fulfilled' && Array.isArray(stat.value)) {
              for (const row of stat.value) {
                const cur = next.get(row.uuid) || {
                  uuid: row.uuid,
                  source: entry.name,
                  meta: {},
                  static: {},
                }
                next.set(row.uuid, { ...cur, static: row })
              }
            }
            return next
          })
        }),
      )

      tickDynamic()
    }

    const tickDynamic = async () => {
      const updates = []
      await Promise.allSettled(
        pool.entries.map(async entry => {
          const uuids = sourceUuids.get(entry.name) || []
          if (!uuids.length) return
          try {
            const rows = await dynamicSummaryMulti(entry.client, uuids, DYNAMIC_FIELDS)
            for (const row of rows || []) updates.push(row)
          } catch {}
        }),
      )
      if (!updates.length) return

      setLive(prev => {
        const next = new Map(prev)
        for (const row of updates) next.set(row.uuid, row)
        return next
      })
      setHistory(prev => {
        const next = new Map(prev)
        for (const row of updates) {
          const arr = next.get(row.uuid) || []
          const sample = sampleFrom(row)
          const dedup = arr.length && arr[arr.length - 1].t === sample.t ? arr : arr.concat(sample)
          next.set(row.uuid, dedup.slice(-HISTORY_LIMIT))
        }
        return next
      })
    }

    bootstrap().catch(e => {
      setErrors(prev => [...prev, { source: '*', error: e }])
      setLoading(false)
    })

    const onVisible = () => {
      if (document.visibilityState === 'visible') tickDynamic()
    }
    document.addEventListener('visibilitychange', onVisible)

    const dynTimer = setInterval(tickDynamic, DYN_INTERVAL_MS)
    // decay online flag even when no dynamic frames arrive
    const clockTimer = setInterval(() => setTick(t => t + 1), 5000)

    return () => {
      clearInterval(dynTimer)
      clearInterval(clockTimer)
      document.removeEventListener('visibilitychange', onVisible)
      pool.close()
    }
  }, [config])

  const nodes = useMemo(() => {
    const now = Date.now()
    const out = new Map()
    for (const [uuid, a] of agents) {
      const dyn = live.get(uuid) || null
      out.set(uuid, {
        ...a,
        dynamic: dyn,
        history: history.get(uuid) || [],
        online: isOnline(dyn?.timestamp, now),
      })
    }
    return out
  }, [agents, live, history, tick])

  return { nodes, errors, loading }
}
