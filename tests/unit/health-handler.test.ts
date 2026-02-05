import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// Unit-level contract test for a typical health payload.
// If your project exports a handler/serializer, update this test to import it.

describe('health payload schema', () => {
  const HealthSchema = z.object({
    ok: z.boolean(),
    timestamp: z.number().optional()
  });

  it('accepts a minimal health response', () => {
    const parsed = HealthSchema.parse({ ok: true });
    expect(parsed.ok).toBe(true);
  });

  it('rejects invalid health response', () => {
    expect(() => HealthSchema.parse({ ok: 'true' })).toThrow();
  });
});
