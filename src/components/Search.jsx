import { Search as SearchIcon } from 'lucide-react'
import { Input } from './ui/input.jsx'

export function Search({ value, onChange }) {
  return (
    <div className="relative w-56">
      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="搜索节点…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  )
}
