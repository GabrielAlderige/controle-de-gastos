/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // caminhos relativos: o mesmo build funciona na raiz (localhost) e em
  // https://usuario.github.io/controle-de-gastos/ (GitHub Pages)
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.*'],
      reporter: ['text', 'html'],
      // a CI falha se a cobertura cair abaixo disso
      thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
    },
  },
})
