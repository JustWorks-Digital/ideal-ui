import type { IncomingMessage, ServerResponse } from 'node:http'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vitest/config'

function contactApi(): Plugin {
  function handle(req: IncomingMessage, res: ServerResponse, next: () => void) {
    if (req.method !== 'POST' || req.url?.split('?')[0] !== '/api/contact') {
      next()
      return
    }

    setTimeout(() => {
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/json')
      res.end('{}')
    }, 800)
  }

  return {
    name: 'contact-api',
    configureServer(server) {
      server.middlewares.use(handle)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contactApi()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
  },
})
