# tenon-naive-iconify-picker

**English** · [简体中文](./README.zh-CN.md)

> Offline-first icon picker for **Vue 3 + Naive UI**, powered by [Iconify](https://iconify.design).
> Register any number of icon libraries (each becomes a tab), browse them with **zero network calls**, drop in your own SVGs, and store the choice as a single string — perfect for a "pick an icon for this menu" field.

<p align="center">
  <img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-hero.png" alt="IconPicker trigger" width="720">
</p>

<table>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-grid.png" alt="Icon grid — light"></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-dark.png" alt="Icon grid — dark"></td>
  </tr>
  <tr>
    <td align="center"><b>Light</b> — each registered library is a tab, rendered offline</td>
    <td align="center"><b>Dark</b> — colors follow your Naive UI theme</td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-tabs-ant.png" alt="Ant Design library tab"></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-local.png" alt="Local SVG tab"></td>
  </tr>
  <tr>
    <td align="center"><b>Switch libraries</b> — Lucide, Ant Design, Element Plus, Phosphor…</td>
    <td align="center"><b>Local SVGs</b> — your own project icons</td>
  </tr>
</table>

---

## Features

- 🧭 **Multiple libraries** — register any number of icon sets (Lucide, Ant Design, Element Plus, Phosphor…); each becomes a tab, so users pick from a library they know.
- 🔌 **Offline** — registered libraries render from local data. No request ever goes to `api.iconify.design`.
- 📦 **Zero-config** — ships with [Lucide](https://lucide.dev) out of the box. Works the moment you import it; add more libraries when you want them.
- 🎨 **Theme-aware** — border, text, hover, primary color and radius all follow the host's Naive UI theme (light / dark / custom primary) via `useThemeVars()`. No CSS variables to wire up.
- 🖼️ **Local SVGs** — register your own project SVGs and pick them as `local:<name>`.
- 🌐 **Online escape hatch** — type any Iconify name (e.g. `mdi:home`) and it loads online when connected.
- 🌍 **i18n-ready** — every piece of text comes from a `labels` prop. English by default; pass your own translations (see [Internationalization](#internationalization-i18n)).
- 🧩 **One string value** — `v-model` is a single `prefix:name` (or `local:name`) string. Store it straight in a DB column and render it anywhere with `<OfflineIcon>`.

## Requirements

This is a **component for an existing app** — it does not bundle Vue or Naive UI. Your app must already provide them as peers:

| Peer dependency | Supported range |
| --- | --- |
| `vue` | `^3.3.0` |
| `naive-ui` | `^2.34.0` |
| `@iconify/vue` | `^4.0.0 \|\| ^5.0.0` |

Browser-only (it uses `navigator.onLine`, `v-html`, and Iconify's `addCollection`). Under SSR / Nuxt, render it behind a client-only boundary — see [SSR / Nuxt](#ssr--nuxt).

## Install

```bash
npm i tenon-naive-iconify-picker
# pnpm add tenon-naive-iconify-picker
# yarn add tenon-naive-iconify-picker
```

CSS is injected automatically by the component — there is **no** separate stylesheet to import.

## Quick start

Zero config: import and use. The bundled **Lucide** library is registered for you.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconPicker, OfflineIcon } from 'tenon-naive-iconify-picker'

const icon = ref('lucide:rocket')
</script>

<template>
  <!-- Must live inside your app's <n-config-provider> so the theme resolves -->
  <IconPicker v-model="icon" />

  <!-- Render a stored value anywhere — also offline, also handles local: -->
  <OfflineIcon :icon="icon" :size="18" />
</template>
```

`v-model` holds a single string such as `lucide:rocket` or `local:star`. That's the whole contract.

## Icon libraries (tabs)

Each icon set you register becomes its own **tab** in the picker, so users switch between libraries — and a familiar, smaller library is often easier to browse than one giant set. Icon data is **not** bundled into this component: each set is a lazily-loaded chunk in **your** build, loaded only when its tab is first opened, so you only pay for what you use (Lucide ≈ 85 KB gz; Phosphor ≈ 946 KB gz).

```bash
# install the data packages for the libraries you want
npm i @iconify-json/ant-design @iconify-json/ep @iconify-json/ph
```

```ts
// main.ts
import { setupIconPicker, lucideCollection } from 'tenon-naive-iconify-picker'

setupIconPicker({
  collections: [
    lucideCollection, // bundled with this package
    { prefix: 'ant-design', name: 'Ant Design',   loader: () => import('@iconify-json/ant-design/icons.json').then(m => m.default) },
    { prefix: 'ep',         name: 'Element Plus',  loader: () => import('@iconify-json/ep/icons.json').then(m => m.default) },
    { prefix: 'ph',         name: 'Phosphor',      loader: () => import('@iconify-json/ph/icons.json').then(m => m.default) },
  ],
})
```

The stored value is prefixed by the library (`ant-design:home-outlined`, `lucide:rocket`), so `<OfflineIcon>` always knows how to render it. You can also pass `collections` per-instance via the `<IconPicker :collections>` prop. Browse available sets at [icon-sets.iconify.design](https://icon-sets.iconify.design); the `prefix` must match the set.

## Configuration

### `setupIconPicker(options)` — optional one-shot setup

Call once at app start to register your libraries, inject local SVGs, or preload a set. Everything is optional; skipping it leaves you with the bundled Lucide library.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `collections` | `IconCollection[]` | `defaultCollections` (Lucide) | The icon libraries shown as tabs. Each has a lazy `loader`. |
| `localIcons` | `Record<string, string>` | — | Local SVGs. Accepts `{ name: rawSvg }` or an `import.meta.glob` result. |
| `preloadPrefix` | `string` | first collection | Which library to warm up on start so the first render is instant. |

### `<IconPicker>` props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | The stored value: `prefix:name` or `local:name`. |
| `collections` | `IconCollection[]` | global / Lucide | Override the libraries for this instance only. |
| `localIcons` | `Record<string, string>` | — | `{ name: rawSvg }` or an `import.meta.glob` result. |
| `labels` | `Partial<IconPickerLabels>` | English | Your translations — see [Internationalization](#internationalization-i18n). |
| `searchIcon` / `clearIcon` | `string` | `lucide:search` / `lucide:x` | Chrome icons; use names from a registered library. |
| `fallbackIcon` | `string` | `''` | `OfflineIcon` fallback for empty values. |
| `clearable` | `boolean` | `true` | Show the clear (×) button. |
| `cap` | `number` | `300` | Max icons rendered before a "keep typing to narrow" hint. |

### `<OfflineIcon>` props

A standalone renderer for a stored value — use it in tables, menus, anywhere.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `icon` | `string` | `''` | `prefix:name` or `local:name`. |
| `size` | `number \| string` | `18` | A number is treated as px. |
| `fallback` | `string` | `''` | Rendered when `icon` is empty. |

## Internationalization (i18n)

The component contains **no i18n framework** and makes **no assumption** about yours. All visible text comes from a `labels` object — English by default (`defaultLabels`). Override any subset via the `labels` prop; unspecified keys fall back to English.

### The label keys

| Key | English default |
| --- | --- |
| `placeholder` | `Select icon` |
| `title` | `Select icon` |
| `search` | `Search icon name…` |
| `local` | `Local SVG` |
| `online` | `Online` |
| `onlinePlaceholder` | `Any Iconify name, e.g. mdi:home` |
| `use` | `Use` |
| `offlineHint` | `Offline — online icons that are not bundled cannot be previewed` |
| `loading` | `Loading…` |
| `empty` | `No matching icon` |
| `more` | `{n} more — keep typing to narrow` |

> `more` supports a `{n}` token, replaced at render time with the number of hidden icons.

### Static override

```vue
<IconPicker
  v-model="icon"
  :labels="{ placeholder: 'Choose an icon', title: 'Icons' }"
/>
```

### Wiring your own i18n (example: vue-i18n)

Pass reactive translations straight from your `t()`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconPicker } from 'tenon-naive-iconify-picker'

const { t } = useI18n()

// Recomputes when the locale changes.
const iconLabels = computed(() => ({
  placeholder: t('iconPicker.placeholder'),
  title: t('iconPicker.title'),
  search: t('iconPicker.search'),
  local: t('iconPicker.local'),
  online: t('iconPicker.online'),
  onlinePlaceholder: t('iconPicker.onlinePlaceholder'),
  use: t('iconPicker.use'),
  offlineHint: t('iconPicker.offlineHint'),
  loading: t('iconPicker.loading'),
  empty: t('iconPicker.empty'),
  more: t('iconPicker.more', { n: '{n}' }), // keep the {n} token for the component to fill
}))
</script>

<template>
  <IconPicker v-model="icon" :labels="iconLabels" />
</template>
```

Your Chinese message bundle might look like:

```ts
iconPicker: {
  placeholder: '选择图标',
  title: '选择图标',
  search: '搜索图标名称…',
  local: '本地 SVG',
  online: '在线',
  onlinePlaceholder: '任意 Iconify 名称,如 mdi:home',
  use: '使用',
  offlineHint: '离线 — 未内置的在线图标无法预览',
  loading: '加载中…',
  empty: '没有匹配的图标',
  more: '还有 {n} 个 — 继续输入以缩小范围',
}
```

## Local SVG icons

Register your own SVGs to make them selectable under the **Local SVG** tab and renderable as `local:<name>`.

**Vite** (recommended) — glob your SVG folder as raw strings; the file name (without `.svg`) becomes the icon name:

```ts
import { registerLocalIcons } from 'tenon-naive-iconify-picker'

registerLocalIcons(
  import.meta.glob('/src/assets/svg/*.svg', { query: '?raw', import: 'default', eager: true }),
)
// star.svg  ->  local:star
```

(`setupIconPicker({ localIcons })` and the `<IconPicker :localIcons>` prop do the same thing.)

**Non-Vite** bundlers — `import.meta.glob` is Vite-specific. Build the `{ name: rawSvg }` map however your toolchain exposes raw file contents, then pass it to `registerLocalIcons`. The component core does not depend on Vite.

## What "offline" means

Registered libraries are served from **your app's own origin** as lazy chunks — nothing is fetched from the Iconify CDN. Icons typed into the **Online** tab from libraries you did *not* register load from the Iconify API when connected (and are simply unavailable offline). That's the only online path, and it's opt-in per icon.

## SSR / Nuxt

The picker touches browser-only APIs. Under SSR, render it client-side only, e.g. Nuxt's `<client-only>` or a dynamic import guarded by `import.meta.client`.

## Development

```bash
npm install
npm run dev        # playground (Vite) — the screenshots above come from here
npm run build      # dist/ (ESM + d.ts, CSS injected)
npm run typecheck  # vue-tsc
```

## License

[MIT](./LICENSE)
