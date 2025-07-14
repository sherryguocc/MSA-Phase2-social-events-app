import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore - Ignore if @tailwindcss/vite is not available on this system
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: mode === 'production' 
          ? 'https://sociallink-backend-ujwt.onrender.com/' 
          : 'http://localhost:5256',
        changeOrigin: true,
        secure: false
      }
    }
  }
}))
