import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css' // Tailwind CSS & global styles
import './i18n/config' // Initialize i18n
import { initSentry } from './lib/sentry'

initSentry()
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { I18nSync } from './components/I18nSync'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
    <I18nSync />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
    <App />
    </ThemeProvider>
  </StrictMode>,
)
