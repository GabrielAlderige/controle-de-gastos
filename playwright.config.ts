import { defineConfig, devices } from '@playwright/test'

/**
 * Teste de INTERFACE (ponta a ponta): um navegador de verdade abre o site
 * construído (`npm run build` + `vite preview`) e clica como uma pessoa.
 */
export default defineConfig({
  testDir: './e2e',
  // na CI, um teste que deixou .only esquecido derruba a rodada
  forbidOnly: !!process.env.CI,
  // na CI, tenta de novo uma vez antes de dizer que falhou
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'computador', use: { ...devices['Desktop Chrome'] } },
    { name: 'celular', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
