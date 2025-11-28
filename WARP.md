# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands
- Install deps: `npm install` (CI: `npm ci`)
- Dev server (Turbopack): `npm run dev` → http://localhost:3000
- Build: `npm run build`
- Start (after build): `npm start`
- Lint: `npm run lint`
- Environment: set `NEXT_PUBLIC_BASEURL` (e.g., PowerShell: `$env:NEXT_PUBLIC_BASEURL = 'http://localhost:5000/api/v1'`)

## Architecture overview
- Framework: Next.js 15 (React 19) using the App Router in `app/`.
- Styling: Tailwind CSS v4 (configless). Global theme tokens and variants live in `app/globals.css`.
- Linting: ESLint 9 flat config extending `next/core-web-vitals` via `eslint.config.mjs`.
- Images: Remote patterns configured in `next.config.mjs` (localhost:5000, 127.0.0.1:5000, agritech.cybermatrixsolutions.com, stocksight.in).

### Routing and UI composition
- Route groups and segments under `app/`:
  - `(auth)`: `login`, `forgot-password`; group layout in `app/(auth)/layout.jsx`.
  - `admin`: dashboard, masters (crops, products, tutorials, schemes, users), crop sale requests, product order requests, media manager, support chat (dynamic route `app/admin/support-chat/[conversationId]/page.jsx`). Has `app/admin/layout.jsx`.
  - `farmer`: support chat pages.
  - Global: `app/layout.jsx`, `app/not-found.jsx`, `app/page.jsx`.
- Components are organized by domain in `components/` (e.g., `components/admin/*`, `components/auth/*`, `components/chat/*`, `components/ui/*`). UI primitives rely on Radix UI and Tailwind utilities; icons via `lucide-react`.

### Data layer and auth
- API client: `lib/axiosInstance.js` reads `NEXT_PUBLIC_BASEURL` (defaults to `http://localhost:5000/api/v1`). It attaches `Authorization: Bearer <token>` when cookie `agritech_token` exists, and centralizes error handling (toasts via `lib/toastUtils.js`, redirects to `/login` on 401, cookie cleanup).
- Chat API wrappers: `lib/chatApi.js` exposes conversation/message/support helpers (CRUD, status, media upload with multipart).
- Utilities: `lib/chatUtils.js` (timestamps, previews, unread counts, notifications), `lib/utils.js` (class merging, JSON helpers, file/date formatting), `lib/languages.js` (supported language codes), `lib/toastUtils.js` (Sonner-based toasts).
- Auth state: user and token stored in cookies (`agritech_user`, `agritech_token`) via `cookies-next`.
- Realtime: `socket.io-client` is included; chat components under `components/chat` and `components/admin/support-chat` provide UI for messaging.

## Testing
- No test runner or scripts are configured in `package.json`.

## Notes from README
- Local development: `npm run dev`, then open http://localhost:3000. See Next.js docs for framework details.
