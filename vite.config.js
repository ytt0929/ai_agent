import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { frontmanPlugin } from '@frontman-ai/vite';

export default defineConfig({
  plugins: [
    frontmanPlugin({ host: 'api.frontman.sh' }),vue()],
  server: {
    host: '127.0.0.1',
    port: 5200,
  },
})
