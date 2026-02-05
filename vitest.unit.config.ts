import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 70,
      functions: 70,
      branches: 60,
      statements: 70,
      exclude: ['tests/**', '**/*.d.ts']
    }
  }
});
