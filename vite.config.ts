import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
      target: 'http://223.72.199.234:3000/', // 目标接口的域名
      changeOrigin: true, // 是否允许跨域
      rewrite: (path) => path.replace(/^\/api/, ''),
      // configure: (proxy, options) => {
      //   proxy.on('proxyReq', (proxyReq) => {
      //     console.log('代理请求触发:', proxyReq.path);
      //   });
      //   console.log('代理配置:', options);
      // },
      },
    }
  },
  //设置路径别名
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})
