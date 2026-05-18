import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css'
import './index.css' // Tailwind CSS & global styles
import './i18n/config' // Initialize i18n
import { initSentry } from './lib/sentry'

initSentry()
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { ConfirmProvider } from './context/ConfirmContext'
import { QueryProvider } from './providers/QueryProvider'
import { I18nSync } from './components/I18nSync'
import { AppToasts } from './components/AppToasts'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <ConfirmProvider>
          <I18nSync />
          <AppToasts />
          <App />
        </ConfirmProvider>
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
)
