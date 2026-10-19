import { fileURLToPath, URL } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { quasar } from '@quasar/vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'

function localTwitchAuthApi(): Plugin {
  const handlers: Record<string, string> = {
    '/api/auth/twitch': '/api/auth/twitch.ts',
    '/api/auth/callback': '/api/auth/callback.ts',
    '/api/auth/session': '/api/auth/session.ts',
    '/api/auth/logout': '/api/auth/logout.ts',
    '/api/collection/sync': '/api/collection/sync.ts',
    '/api/extension/collection': '/api/extension/collection.ts',
  }

  return {
    name: 'local-twitch-auth-api',
    apply: 'serve',
    config(_config, { mode }) {
      const localEnv = loadEnv(mode, process.cwd(), '')
      for (const key of [
        'TWITCH_CLIENT_ID',
        'TWITCH_CLIENT_SECRET',
        'TWITCH_REDIRECT_URI',
        'SESSION_SECRET',
        'TWITCH_EXTENSION_CLIENT_ID',
        'TWITCH_EXTENSION_SECRET',
        'TWITCH_EXTENSION_ORIGIN',
        'BLOB_STORE_ID',
        'VERCEL_OIDC_TOKEN',
        'BLOB_READ_WRITE_TOKEN',
      ]) {
        if (!process.env[key] && localEnv[key]) process.env[key] = localEnv[key]
      }
    },
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
        const handlerPath = handlers[pathname]
        if (!handlerPath) return next()

        void (async () => {
          try {
            const route = await server.ssrLoadModule(handlerPath) as {
              default: (request: IncomingMessage, response: ServerResponse) => void | Promise<void>
            }
            await route.default(request, response)
          } catch (error) {
            const cause = error instanceof Error ? error : new Error(String(error))
            server.config.logger.error('Local Twitch auth handler failed', { error: cause })
            response.statusCode = 500
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
            response.end(JSON.stringify({ error: 'Authentication endpoint failed' }))
          }
        })()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    localTwitchAuthApi(),
    vue({
      template: {
        transformAssetUrls: {
          includeAbsolute: false,
        },
      },
    }),
    vueJsx(),
    // Quasar Vite plugin - enables Quasar components and styles
    quasar({ sassVariables: 'src/quasar-variables.sass' }),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Arsenal Tracker',
        short_name: 'Arsenal',
        description: 'Track Warframe collection progress locally',
        theme_color: '#111318',
        background_color: '#0b0b0b',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/auth\//,
            handler: 'NetworkOnly'
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
