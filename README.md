# PharmaCare PK Ecosystem

Phase 1 foundation for an offline-first pharmacy management platform.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The app creates an IndexedDB database named `pharmacare-pk`, seeds a small development catalog on first run, and remains usable when the browser is offline.

## Foundation included

- Strict TypeScript + Vite + React
- Versioned Dexie/IndexedDB schema
- Product, batch, customer, sales, movement, user, audit, and sync queue types
- SHA-256 password hashing foundation (the seeded development password is `change-me`; change it before production)
- Product validation/search service
- PWA manifest and cache-first service worker
- Responsive professional shell with online/offline indicator
- Initial role/permission service

## Important production note

This is the Phase 1 foundation, not the complete commercial product. Before production use, add server-backed authentication, encrypted backup, formal migrations, real transaction workflows, permission enforcement at every command, tests, and a PostgreSQL sync backend. Do not use the seeded account in production.

## Planned build targets

The shared web architecture can later be wrapped with Electron for Windows/macOS/Linux and Capacitor/React Native for Android/iOS. The business services and database contracts are intentionally kept separate from the UI.
