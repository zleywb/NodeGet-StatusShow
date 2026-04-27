import { Search } from './Search.jsx'
import { ViewToggle } from './ViewToggle.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'

export function Navbar({ siteName, logo, query, onQuery, view, onView }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-background/80 border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2.5">
          {logo && <img src={logo} alt="" className="w-6 h-6 rounded" />}
          <span className="font-semibold tracking-wide">{siteName}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Search value={query} onChange={onQuery} />
          <ViewToggle value={view} onChange={onView} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
