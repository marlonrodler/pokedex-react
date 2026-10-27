import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Publicado em https://marlonrodler.github.io/pokedex-react/
export default defineConfig({
  base: '/pokedex-react/',
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/setupTests.js'] },
});
