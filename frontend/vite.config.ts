import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['/src/assets/logos/GCC.png'],
      manifest: {
        name: 'WMSU GCC',
        short_name: 'GCC',
        description: 'WMSU Guidance and Counseling Center',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/src/assets/logos/GCC.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/src/assets/logos/GCC.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
