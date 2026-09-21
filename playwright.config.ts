import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3000',
    locale: 'es-ES',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm --filter @mauriciodmo/framekit build && pnpm --filter studio build && pnpm --filter studio start',
    url: 'http://localhost:3000/login',
    env: {
      FRAMEKIT_HOST: 'localhost',
      HOSTNAME: 'localhost',
      FRAMEKIT_ADMIN_USERNAME: 'admin',
      FRAMEKIT_ADMIN_PASSWORD: 'framekit-e2e-password',
      FRAMEKIT_AUTH_ENABLED: 'true',
      FRAMEKIT_DATABASE_PATH: ':memory:',
      PORT: '3000',
      NEXT_TELEMETRY_DISABLED: '1',
    },
    reuseExistingServer: false,
    timeout: 240_000,
  },
})
