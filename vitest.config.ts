import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
        coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        all: true,
        // exclude non-runtime and third-party/generated folders to make coverage focused on `src/`
        exclude: [
          'src/__tests__/**',
          'src/main.ts',
          'vite.config.ts',
          'vitest.config.ts',
          'src/aresnaltracker/vitest.config.ts',
          'dist/**',
          'docs/**',
          'scripts/**',
          'src/types/**',
          'eslint.config.ts',
          'playwright.config.ts',
          'env.d.ts',
          'e2e/**'
        ],
      }
    }
  }),
)