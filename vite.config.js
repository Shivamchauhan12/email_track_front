import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: ["red-effective-seo-loans.trycloudflare.com"],
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/track': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
