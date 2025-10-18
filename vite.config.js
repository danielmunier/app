import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Importante para builds do Electron
  server: {
    port: 5173,
    strictPort: true, // não tenta outras portas se 5173 estiver ocupada
  },
})
