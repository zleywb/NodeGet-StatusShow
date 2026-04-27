export function deriveUsage(node) {
  const d = node.dynamic || {}
  const memUsed = d.used_memory ?? 0
  const memTotal = d.total_memory ?? 0
  const diskTotal = d.total_space ?? 0
  const diskUsed = diskTotal && d.available_space != null ? diskTotal - d.available_space : 0
  return {
    cpu: d.cpu_usage,
    mem: memTotal ? (memUsed / memTotal) * 100 : undefined,
    memUsed,
    memTotal,
    disk: diskTotal ? (diskUsed / diskTotal) * 100 : undefined,
    diskUsed,
    diskTotal,
    netIn: d.receive_speed,
    netOut: d.transmit_speed,
    uptime: d.uptime,
    ts: d.timestamp,
  }
}

export function displayName(node) {
  return node.meta?.name || node.static?.system?.system_host_name || node.uuid.slice(0, 8)
}

export function osLabel(node) {
  const s = node.static?.system
  if (!s) return ''
  return [s.system_name, s.system_os_version].filter(Boolean).join(' ')
}
