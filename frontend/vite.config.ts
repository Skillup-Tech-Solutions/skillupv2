import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      jquery: 'jquery',
    },
  },

  build: {
    // Suppress chunk size warnings
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        // Hide readable file names - use only hashes
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      }
    }
  },

  // Optimize dev server performance
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@tanstack/react-query']
  }
})
