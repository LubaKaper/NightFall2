import { defineConfig, Plugin } from 'vite';

const geojsonPlugin: Plugin = {
  name: 'geojson',
  transform(code, id) {
    if (id.endsWith('.geojson')) {
      return { code: `export default ${code}`, map: null };
    }
  },
};

export default defineConfig({
  plugins: [geojsonPlugin],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
