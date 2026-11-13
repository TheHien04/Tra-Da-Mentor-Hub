/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const devPort = Number(process.env.VITE_PORT || 5173)
const devApiTarget = process.env.VITE_DEV_API_TARGET || 'http://localhost:5000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: devPort,
    proxy: {
      '/api': { target: devApiTarget, changeOrigin: true },
      '/uploads': { target: devApiTarget, changeOrigin: true },
      '/socket.io': { target: devApiTarget, ws: true, changeOrigin: true },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: [
        'src/lib/analyticsCompute.ts',
        'src/lib/assetUrl.ts',
        'src/lib/zodForm.ts',
      ],
      thresholds: {
        lines: 85,
        functions: 80,
        branches: 55,
        statements: 85,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'locale-data': ['src/i18n/locales/en.json', 'src/i18n/locales/vi.json'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['react-icons', 'react-modal', 'react-toastify', 'react-tooltip'],
          'vendor-forms': ['zod'],
          'vendor-http': ['axios'],
          'vendor-realtime': ['socket.io-client'],
          'vendor-monitoring': ['@sentry/react'],
          'vendor-markdown': ['react-markdown'],
        },
      },
    },
  },
})
