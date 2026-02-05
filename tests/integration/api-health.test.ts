import { describe, expect, it } from 'vitest';
import request from 'supertest';

/**
 * Integration tests for key endpoints.
 *
 * Configure API_BASE_URL to point at a running server during tests.
 * Example:
 *   API_BASE_URL=http://localhost:3000 npm run test:integration
 */

const baseUrl = process.env.API_BASE_URL;

describe('API integration: /api/health', () => {
  it('responds 200 and JSON with ok=true', async () => {
    if (!baseUrl) {
      // Skip when not configured.
      return;
    }

    const res = await request(baseUrl).get('/api/health');
    expect(res.status).toBe(200);

    // tolerate either { ok: true } or { status: 'ok' }
    const body = res.body ?? {};
    if (typeof body.ok !== 'undefined') {
      expect(body.ok).toBe(true);
    } else {
      expect(String(body.status).toLowerCase()).toBe('ok');
    }
  });
});

describe('API integration: basic route availability', () => {
  it('root route returns HTML (or redirects) as a sanity check', async () => {
    if (!baseUrl) return;

    const res = await request(baseUrl).get('/');
    expect([200, 301, 302, 307, 308]).toContain(res.status);

    if (res.status === 200) {
      expect(res.headers['content-type'] || '').toMatch(/text\/html|application\/xhtml\+xml/i);
    }
  });
});
