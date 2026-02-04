import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // alias @ fait référence au dossier src
    },
  },
  server: {
    proxy: {
      // Proxy API requests to Symfony backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, '/api'),
      },
      // Proxy EasyAdmin
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy Assets EasyAdmin
      '/bundles': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/assets': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/img': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/_assets': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

