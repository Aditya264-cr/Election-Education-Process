import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-framer': ['framer-motion'],
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          'document-viewer': ['./src/components/DesignSystem/Organisms/DocumentViewer.jsx'],
        }
      }
    }
  },
  json: {
    stringify: true, // Efficient parsing for large JSON
  },
});
