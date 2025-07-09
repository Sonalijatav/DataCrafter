
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
// })


export default defineConfig({
  base: './', // very important for routing on Vercel
  build: {
    outDir: 'dist'
  },
  plugins: [react()],
});
