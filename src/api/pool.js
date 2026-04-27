import { RpcClient } from './client.js'

export class BackendPool {
  constructor(tokens) {
    this.entries = tokens.map(t => ({
      name: t.name,
      client: new RpcClient(t.backend_url, t.token),
    }))
  }

  async fanout(method, ...args) {
    const settled = await Promise.allSettled(
      this.entries.map(e => method(e.client, ...args).then(rows => ({ source: e.name, rows }))),
    )
    const ok = []
    const errors = []
    settled.forEach((r, i) => {
      if (r.status === 'fulfilled') ok.push(r.value)
      else errors.push({ source: this.entries[i].name, error: r.reason })
    })
    return { ok, errors }
  }

  close() {
    for (const e of this.entries) e.client.close()
  }
}
