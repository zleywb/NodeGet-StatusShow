import { Client } from 'rpc-websockets'

const CONNECT_TIMEOUT_MS = 8000

export class RpcClient {
  constructor(url, token) {
    this.token = token
    this.client = new Client(url, {
      autoconnect: true,
      reconnect: true,
      reconnect_interval: 2000,
      max_reconnects: Number.POSITIVE_INFINITY,
    })

    this.opened = new Promise((resolve, reject) => {
      const onOpen = () => {
        cleanup()
        resolve()
      }
      const onError = e => {
        cleanup()
        reject(new Error(`无法连接 ${url}: ${e?.message || 'WebSocket error'}`))
      }
      const timer = setTimeout(() => {
        cleanup()
        reject(new Error(`连接 ${url} 超时`))
      }, CONNECT_TIMEOUT_MS)
      const cleanup = () => {
        clearTimeout(timer)
        this.client.off('open', onOpen)
        this.client.off('error', onError)
      }
      this.client.once('open', onOpen)
      this.client.once('error', onError)
    })
  }

  async call(method, params = {}, timeout = 10000) {
    await this.opened
    return this.client.call(method, { token: this.token, ...params }, timeout)
  }

  close() {
    this.client.close()
  }
}
