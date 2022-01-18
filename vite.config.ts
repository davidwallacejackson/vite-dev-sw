import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Inspector from 'vite-plugin-inspect'
import devServiceWorkerPlugin from './plugin-dev-server-sw'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      devServiceWorkerPlugin(),
      vue(),
      Inspector({ enabled: true }),
  ]
})
