# tenon-naive-iconify-picker

Offline-first icon picker for **Vue 3 + Naive UI**, powered by [Iconify](https://iconify.design).

- 🔌 **Offline** — bundled icon sets render from local data, never hitting the Iconify CDN.
- 📦 **Zero-config** — ships with Lucide out of the box; add more sets when you want.
- 🎨 **Theme-aware** — colors follow the host's Naive UI theme (light / dark / primary) via `useThemeVars`.
- 🖼️ **Local SVGs** — inject your own project SVGs as `local:<name>`.
- 🌐 **Online escape hatch** — type any Iconify name (`mdi:home`) and it loads online when connected.
- 🧩 **One string value** — `v-model` is a single `prefix:name` (or `local:name`) string, ready for a DB field.

> Requires a host app already using Vue 3 and Naive UI. Peer deps: `vue@^3`, `naive-ui@^2`, `@iconify/vue@^4||^5`. Browser-only (guard behind a client-only boundary under SSR/Nuxt).

## Install

```bash
npm i tenon-naive-iconify-picker
```

## Quick start

```ts
// main.ts — optional one-shot config (works with zero config too; defaults to Lucide)
import { setupIconPicker, defaultCollections } from 'tenon-naive-iconify-picker'

setupIconPicker({
  // add more sets: install @iconify-json/<prefix>, then pass a loader
  collections: [
    ...defaultCollections, // Lucide (bundled)
    { prefix: 'ph', name: 'Phosphor', loader: () => import('@iconify-json/ph/icons.json').then(m => m.default) },
  ],
  // your own SVGs → selectable as `local:<filename>` (Vite example)
  localIcons: import.meta.glob('/src/assets/svg/*.svg', { query: '?raw', import: 'default', eager: true }),
})
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconPicker, OfflineIcon } from 'tenon-naive-iconify-picker'
const icon = ref('lucide:rocket')
</script>

<template>
  <!-- must be inside your app's <n-config-provider> -->
  <IconPicker v-model="icon" />
  <!-- render a stored value anywhere (also offline; also handles local:) -->
  <OfflineIcon :icon="icon" :size="18" />
</template>
```

CSS is injected automatically — no separate stylesheet import needed.

## `<IconPicker>` props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string` | `''` | stored value: `prefix:name` or `local:name` |
| `collections` | `IconCollection[]` | registered / Lucide | overrides global sets for this instance |
| `localIcons` | `Record<string,string>` | — | `{ name: rawSvg }` or `import.meta.glob` result |
| `labels` | `Partial<IconPickerLabels>` | English | wire your i18n; `more` supports a `{n}` token |
| `searchIcon` / `clearIcon` | `string` | `lucide:search` / `lucide:x` | chrome icons (use a bundled set) |
| `fallbackIcon` | `string` | `''` | `OfflineIcon` fallback for empty values |
| `clearable` | `boolean` | `true` | |
| `cap` | `number` | `300` | max icons rendered before "keep typing" hint |

## Adding icon sets

Each set is a lazily-loaded chunk in **your** build (e.g. Phosphor ≈ 4.4 MB raw / 946 KB gz, Lucide ≈ 85 KB gz). Only bundle what you need:

```ts
import { defaultCollections } from 'tenon-naive-iconify-picker'
// npm i @iconify-json/mdi
const collections = [
  ...defaultCollections,
  { prefix: 'mdi', name: 'Material Design', loader: () => import('@iconify-json/mdi/icons.json').then(m => m.default) },
]
```

Pass `collections` to `setupIconPicker(...)` (global) or to `<IconPicker :collections="...">` (per instance).

## What "offline" means

Bundled sets are served from **your app's own origin** as lazy chunks — no request ever goes to `api.iconify.design`. Icons typed in the **Online** tab from sets you did *not* bundle load from the Iconify API when connected (and are unavailable offline).

## Dev

```bash
npm run dev        # playground (Vite)
npm run build      # dist/ (ESM + d.ts, CSS injected)
npm run typecheck
```

## License

MIT
