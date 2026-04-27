import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'
import './styles/global.css'

// no StrictMode: WebSocket pool can't tolerate the dev double-mount cleanly
createRoot(document.getElementById('root')).render(<App />)
