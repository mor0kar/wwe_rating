---
name: project-bottom-nav
description: BottomNav component exists at app/components/BottomNav.tsx — layout and routing conventions for the tab bar
metadata:
  type: project
---

`app/components/BottomNav.tsx` is a `'use client'` component included in `app/layout.tsx`.

- 5 tabs: Shows (`/shows`), Stats (`/stats`), Neu (`/shows/add`), Kalender (`/upcoming`), Settings (`/settings`)
- Hidden on `/login` via `usePathname()` check
- The "Neu" tab is a floating circle button (`-mt-5`, `w-14 h-14 bg-zinc-100 text-zinc-950 rounded-full`) elevated above the bar
- Active tab: `text-zinc-50`, inactive: `text-zinc-600`
- Nav bar background: `bg-zinc-950 border-t border-zinc-800`
- Uses `isActive(href)` helper that also matches sub-paths — but `/shows/add` is NOT marked active when on `/shows`
- Safe-area: `pb-[env(safe-area-inset-bottom)]` on the nav element

**Why:** App is mobile-first PWA; native-feeling tab bar replaces old header links.

**How to apply:** When adding new top-level routes, add a tab here. All pages need `pb-24` on their outermost container so content clears the nav.
