import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const isProduction = mode === 'production';
  const BASE_PATH_FOR_DEPLOY = env.VITE_APP_BASE_URL || (isProduction ? '/Concessionaria_Nunes/' : '/');


  return {
    plugins: [react()],
  base: BASE_PATH_FOR_DEPLOY,
    server: {
  port: 5173, //para localserver
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})