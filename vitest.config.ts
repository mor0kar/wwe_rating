import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Nur unsere Unit-Tests in lib/ — verhindert, dass Vitest .next/ o.ä. scannt
    include: ['lib/**/*.test.ts'],
  },
})
