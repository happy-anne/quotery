export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@vite-pwa/nuxt',
  ],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Quotery',
      short_name: 'Quotery',
      description: 'Collect the words that stay with you.',
      lang: 'ko',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#f5f2ef',
      theme_color: '#f5f2ef',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        // The artwork keeps the glyph well inside the centre, so the same
        // image survives Android's maskable crop without a separate asset.
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      // The app shell is precached; Supabase data is always fetched live.
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/auth\//],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.origin === self.location.origin && /\.(?:woff2?|png|svg|ico)$/.test(url.pathname),
          handler: 'CacheFirst',
          options: {
            cacheName: 'quotery-assets',
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
      suppressWarnings: true,
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    },
  },

  app: {
    head: {
      title: 'Quotery',
      link: [
        // With `ssr: false` the PWA module does not inject this into the static
        // shell, and without it the browser never offers to install the app.
        { rel: 'manifest', href: '/manifest.webmanifest' },
        // Desktop browsers use the .ico; mobile/PWA surfaces use the PNGs.
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png', sizes: '512x512' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
      ],
      meta: [
        { name: 'description', content: 'Collect the words that stay with you.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
        { name: 'theme-color', content: '#f5f2ef' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Quotery' },
      ],
    },
  },
})
