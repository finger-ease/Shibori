import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/Shibori/',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/ },
            {
              name: 'react-three',
              test: /[\\/]node_modules[\\/]@react-three[\\/]/,
            },
          ],
        },
      },
    },
  },
})
