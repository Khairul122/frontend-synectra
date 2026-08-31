import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
// Self-hosted fonts (di-bundle Vite ke /assets, cache 1 tahun)
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import './index.css'
import './i18n'
import App from './App.jsx'

function DeferredAnalytics() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => setMounted(true), { timeout: 3000 });
    } else {
      const timer = setTimeout(() => setMounted(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);
  return mounted ? <Analytics /> : null;
}

const _warn = console.warn.bind(console)
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('THREE.Clock') ||
     args[0].includes('ObjectMultiplex') ||
     args[0].includes('app-init-liveness') ||
     args[0].includes('background-liveness'))
  ) return
  _warn(...args)
}

const _error = console.error.bind(console)
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('ObjectMultiplex') ||
     args[0].includes('app-init-liveness') ||
     args[0].includes('background-liveness'))
  ) return
  _error(...args)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <DeferredAnalytics />
  </StrictMode>,
)
