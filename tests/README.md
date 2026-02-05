# Tests

## Local

- Unit:
  - `npm run test:unit`
- Integration (requires a running app/server):
  - `API_BASE_URL=http://localhost:3000 npm run test:integration`
- E2E (requires UI server running at 3000 unless overridden):
  - `E2E_BASE_URL=http://localhost:3000 npm run test:e2e`

## CI

- `npm run test:ci`

## Notes

- Integration tests are intentionally configured to skip when `API_BASE_URL` is not set, so they won't fail in environments without a running server.
- Update endpoint paths if your stack differs (e.g., `/healthz` instead of `/api/health`).
