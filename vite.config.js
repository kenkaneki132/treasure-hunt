import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',                 // works on https://kenkaneki132.github.io/treasure-hunt/ and locally
  plugins: [react()],
  build: { outDir: 'build' }, // keep CRA's output folder so `npm run deploy` (gh-pages -d build) still works
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
})
