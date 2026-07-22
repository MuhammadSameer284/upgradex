import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // To exclude unnecessary polyfills, we can specify what to include or keep default
      include: ['events', 'util', 'stream', 'process', 'global'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
})
