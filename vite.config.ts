import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'Envelope OCR',
        short_name: 'Envelope OCR',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b0b0f',
        theme_color: '#0b0b0f',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: '/',
        runtimeCaching: [
          {
            urlPattern: ({url}) => url.origin.includes('cdn.jsdelivr.net'),
            handler: 'CacheFirst',
            options: { cacheName: 'cdn-cache', expiration: { maxEntries: 20, maxAgeSeconds: 7 * 24 * 3600 } }
          },
          {
            urlPattern: ({url}) => url.origin.includes('tessdata.projectnaptha.com'),
            handler: 'CacheFirst',
            options: { cacheName: 'tessdata-cache', expiration: { maxEntries: 10, maxAgeSeconds: 30 * 24 * 3600 } }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
})
