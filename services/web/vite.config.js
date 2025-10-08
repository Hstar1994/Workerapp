import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    // When true, Vite will exit if the port is already in use instead of
    // automatically picking the next available port (e.g., 8081/3001).
    // This prevents confusion about which port the dev server is running on.
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:8000',
      '/healthz': 'http://localhost:8000'
    }
  }
})
