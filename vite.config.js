import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import fs from 'fs';
// import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js'
  },
  server: {
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'cert', 'cert.key')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'cert', 'cert.crt')),
    // },
    port: 5001, // Port fixe
    strictPort: true // Bloquer si occupé
    // host: '192.168.56.1',
    // proxy: {
    //   '/api': {
    //     target: 'https://77.37.122.205:5000',
    //     changeOrigin: true,
    //   },
    // },
  },
})
