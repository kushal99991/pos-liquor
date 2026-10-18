import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),  tailwindcss()],
  resolve: {
    alias: [
      { find: 'config', replacement: '/src/config' },
      { find: 'pages', replacement: '/src/pages' },
      { find: 'components', replacement: '/src/components' },
      { find: 'utils', replacement: '/src/utils' },
      { find: 'hooks', replacement: '/src/hooks' },
      { find: 'contexts', replacement: '/src/contexts' },
      { find: 'assets', replacement: '/src/assets' },
      { find: 'routes', replacement: '/src/routes' },
      { find: 'services', replacement: '/src/services' },
      { find: 'store', replacement: '/src/store' },
      { find: 'theme', replacement: '/src/theme' },
      { find: 'constants', replacement: '/src/constants' },
      { find: 'api', replacement: '/src/api' },
      { find: 'mocks', replacement: '/src/mocks' },
    ],
  },
})
