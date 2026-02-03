import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // CRITICAL FIX: This makes Solana work in the browser
    global: 'window',
  },
  server: {
    host: '127.0.0.1', // Forces a real IP so the terminal link works
    port: 5173,
    allowedHosts: true
  }
})