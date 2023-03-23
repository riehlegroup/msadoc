import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';
import react from '@vitejs/plugin-react';

/*
  The base public path.
  This is especially needed when serving the application from a subfolder.

  The path is controlled by the env variable "VITE_ROUTER_BASE".
  Please note that .env files have no effect here because the Vite config gets evaluated earlier.
  Thus, you need to specify the env variable in advance.
*/
let base = '/';
if (process.env.VITE_ROUTER_BASE !== undefined) {
  base = `/${process.env.VITE_ROUTER_BASE}/`;
}

export default defineConfig({
  base: base,
  build: {
    outDir: './build',
  },
  server: {
    port: 3001,
    strictPort: true,
  },
  plugins: [react()],
  css: {
    postcss: {
      plugins: [autoprefixer({})],
    },
  },
});
