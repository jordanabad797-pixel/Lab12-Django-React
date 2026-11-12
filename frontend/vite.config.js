import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The Django API authorizes exactly this origin in CORS_ALLOWED_ORIGINS,
// so the port is fixed (strictPort) instead of jumping to 5174 when busy.
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
