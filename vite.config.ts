import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    proxy: {
      // 当请求以 '/api' 开头时，将请求代理到目标服务器
      '/v1': {
        target: 'https://api.coze.cn/',
        changeOrigin: true,
        ws: false,
      },
    },
  },
})
