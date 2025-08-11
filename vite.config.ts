import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // escuta em 0.0.0.0
    allowedHosts: ['31cde3ccf565.ngrok-free.app'],
    hmr: {
      host: '31cde3ccf565.ngrok-free.app',
      protocol: 'wss',
      clientPort: 443,
    },
  },
})
