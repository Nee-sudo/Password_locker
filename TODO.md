# PWA Improvements for Play Store Quality & Native Feel

**Status:** In Progress

## Approved Plan Implementation Steps:

### Phase 1: PWA Foundation (Manifest + Service Worker)
- [x] **1.1** Create `public/manifest.json` (standalone PWA config, icons, theme)
- [x] **1.2** Create `public/sw.js` (cache CDNs/assets, offline fallback, intercept external links)
- [x] **1.3** Update `server.js` to serve manifest/sw with correct MIME types
- [ ] **1.4** Test: Chrome DevTools → Application → Manifest/Service Workers

**Current Step:** Phase 2 - Adding splash to vault page.

### Phase 2: Loading & Error Screens (Both Pages)
- [x] **2.1** Add splash screen + loading bar to `public/index.html` (React vault)
- [x] **2.2** Add splash screen + loading bar to `Productivity/index.html` (graph)
- [x] **2.3** Add no-internet screen + offline handling (fetch intercepts, cached data)
- [ ] **2.4** Test: Network throttling → offline mode

### Phase 3: Native Behavior (Nav, Refresh, Responsiveness)
- [ ] **3.1** Both HTMLs: History API for back nav (no refresh), SW registration, manifest link, pull-to-refresh
- [ ] **3.2** Fix responsiveness: Chart canvas scroll, touch targets, viewport meta
- [ ] **3.3** Intercept external links (no new tabs)
- [ ] **3.4** Update this TODO.md

### Phase 4: Final Testing & Completion
- [ ] **4.1** Restart server: `npm start`
- [ ] **4.2** Lighthouse audit (PWA score), mobile emu tests (back nav, refresh, offline)
- [ ] **4.3** `attempt_completion`

**Current Step:** 1.1 - Creating manifest.json next.

