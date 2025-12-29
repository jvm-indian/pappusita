import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useBackend = env.VITE_USE_BACKEND === 'true'
  return {
    plugins: [react()],
    server: {
      proxy: useBackend
        ? {
            '/api': {
              target: 'http://localhost:7071',
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
  }
})
