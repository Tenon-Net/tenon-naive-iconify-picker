# tenon-naive-iconify-picker

[English](./README.md) · **简体中文**

> 面向 **Vue 3 + Naive UI** 的离线优先图标选择器,基于 [Iconify](https://iconify.design)。
> 可注册任意多个图标库(每个库一个 Tab),**零网络请求**离线浏览,可注入你自己的 SVG,选中结果就是一个字符串 —— 非常适合"给这个菜单选个图标"这类字段。

<p align="center">
  <img src="https://raw.githubusercontent.com/DotNet-MoYu/tenon-naive-iconify-picker/main/assets/picker-hero.png" alt="IconPicker 触发器" width="720">
</p>

<table>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/DotNet-MoYu/tenon-naive-iconify-picker/main/assets/picker-grid.png" alt="图标网格 — 亮色"></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/DotNet-MoYu/tenon-naive-iconify-picker/main/assets/picker-dark.png" alt="图标网格 — 暗色"></td>
  </tr>
  <tr>
    <td align="center"><b>亮色</b> — 每个注册的库是一个 Tab,离线渲染</td>
    <td align="center"><b>暗色</b> — 颜色跟随你的 Naive UI 主题</td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/DotNet-MoYu/tenon-naive-iconify-picker/main/assets/picker-tabs-ant.png" alt="Ant Design 库 Tab"></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/DotNet-MoYu/tenon-naive-iconify-picker/main/assets/picker-local.png" alt="本地 SVG Tab"></td>
  </tr>
  <tr>
    <td align="center"><b>切换图标库</b> — Lucide、Ant Design、Element Plus、Phosphor…</td>
    <td align="center"><b>本地 SVG</b> — 你自己项目的图标</td>
  </tr>
</table>

---

## 特性

- 🧭 **多图标库** —— 可注册任意多个图标库(Lucide、Ant Design、Element Plus、Phosphor…),每个库一个 Tab,用户从自己熟悉的库里选。
- 🔌 **离线** —— 注册的库从本地数据渲染,永远不会请求 `api.iconify.design`。
- 📦 **零配置** —— 开箱自带 [Lucide](https://lucide.dev)。导入即用,想要更多库再加。
- 🎨 **主题自适应** —— 边框、文字、悬停、主色、圆角全部通过 `useThemeVars()` 跟随宿主 Naive UI 主题(明 / 暗 / 自定义主色),无需接任何 CSS 变量。
- 🖼️ **本地 SVG** —— 注册你项目里的 SVG,以 `local:<名字>` 的形式选择。
- 🌐 **在线兜底** —— 输入任意 Iconify 名称(如 `mdi:home`),联网时在线加载。
- 🌍 **可国际化** —— 所有文案来自一个 `labels` prop。默认英文;传入你自己的翻译即可(见 [国际化](#国际化-i18n))。
- 🧩 **单字符串值** —— `v-model` 就是一个 `prefix:name`(或 `local:name`)字符串。直接存进数据库字段,任何地方用 `<OfflineIcon>` 渲染。

## 前置要求

这是一个**用在既有应用里的组件** —— 它不打包 Vue 和 Naive UI,需要你的应用以 peer 依赖提供:

| Peer 依赖 | 支持范围 |
| --- | --- |
| `vue` | `^3.3.0` |
| `naive-ui` | `^2.34.0` |
| `@iconify/vue` | `^4.0.0 \|\| ^5.0.0` |

仅限浏览器(用到 `navigator.onLine`、`v-html`、Iconify 的 `addCollection`)。SSR / Nuxt 下请放在仅客户端边界内渲染 —— 见 [SSR / Nuxt](#ssr--nuxt)。

## 安装

```bash
npm i tenon-naive-iconify-picker
# pnpm add tenon-naive-iconify-picker
# yarn add tenon-naive-iconify-picker
```

样式由组件**自动注入**,无需单独 import 任何 CSS。

## 快速开始

零配置:导入即用,内置的 **Lucide** 库已自动注册。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconPicker, OfflineIcon } from 'tenon-naive-iconify-picker'

const icon = ref('lucide:rocket')
</script>

<template>
  <!-- 必须在应用的 <n-config-provider> 内,主题才能解析 -->
  <IconPicker v-model="icon" />

  <!-- 任意位置渲染已存的值 —— 同样离线,也支持 local: -->
  <OfflineIcon :icon="icon" :size="18" />
</template>
```

`v-model` 保存的是单个字符串,如 `lucide:rocket` 或 `local:star`。整个契约就这一点。

## 图标库(Tab)

你注册的每个图标库都会成为选择器里的一个 **Tab**,用户可以在不同库之间切换 —— 一个熟悉、较小的库往往比一整个大集更好找。图标数据**不打包**进本组件:每个库在**你的**构建里是一个懒加载 chunk,只在第一次点开该 Tab 时加载,用多少付多少(Lucide ≈ 85 KB gz;Phosphor ≈ 946 KB gz)。

```bash
# 装你想要的库的数据包
npm i @iconify-json/ant-design @iconify-json/ep @iconify-json/ph
```

```ts
// main.ts
import { setupIconPicker, lucideCollection } from 'tenon-naive-iconify-picker'

setupIconPicker({
  collections: [
    lucideCollection, // 本包内置
    { prefix: 'ant-design', name: 'Ant Design',   loader: () => import('@iconify-json/ant-design/icons.json').then(m => m.default) },
    { prefix: 'ep',         name: 'Element Plus',  loader: () => import('@iconify-json/ep/icons.json').then(m => m.default) },
    { prefix: 'ph',         name: 'Phosphor',      loader: () => import('@iconify-json/ph/icons.json').then(m => m.default) },
  ],
})
```

保存的值带库前缀(`ant-design:home-outlined`、`lucide:rocket`),所以 `<OfflineIcon>` 总能正确渲染。你也可以用 `<IconPicker :collections>` prop 按实例传。到 [icon-sets.iconify.design](https://icon-sets.iconify.design) 浏览所有可用库;`prefix` 必须和库匹配。

## 配置

### `setupIconPicker(options)` —— 可选的一次性配置

在应用启动时调用一次,用来注册图标库、注入本地 SVG、或预热某个库。全部可选;不调用就只有内置的 Lucide。

| 选项 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `collections` | `IconCollection[]` | `defaultCollections`(Lucide) | 作为 Tab 显示的图标库,每个带懒加载 `loader`。 |
| `localIcons` | `Record<string, string>` | — | 本地 SVG。接受 `{ 名字: 原始SVG }` 或 `import.meta.glob` 的结果。 |
| `preloadPrefix` | `string` | 第一个库 | 启动时预热哪个库,让首次渲染即时呈现。 |

### `<IconPicker>` props

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | 保存的值:`prefix:name` 或 `local:name`。 |
| `collections` | `IconCollection[]` | 全局 / Lucide | 仅覆盖本实例的图标库。 |
| `localIcons` | `Record<string, string>` | — | `{ 名字: 原始SVG }` 或 `import.meta.glob` 结果。 |
| `labels` | `Partial<IconPickerLabels>` | 英文 | 你的翻译 —— 见 [国际化](#国际化-i18n)。 |
| `searchIcon` / `clearIcon` | `string` | `lucide:search` / `lucide:x` | 搜索/清除图标;请用已注册库里的名字。 |
| `fallbackIcon` | `string` | `''` | 空值时 `OfflineIcon` 的兜底图标。 |
| `clearable` | `boolean` | `true` | 是否显示清除(×)按钮。 |
| `cap` | `number` | `300` | 单页最多渲染多少个图标,超出提示"继续输入以缩小范围"。 |

### `<OfflineIcon>` props

独立的渲染器,用于展示已存的值 —— 表格、菜单、任何地方都行。

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `icon` | `string` | `''` | `prefix:name` 或 `local:name`。 |
| `size` | `number \| string` | `18` | 数字按 px 处理。 |
| `fallback` | `string` | `''` | `icon` 为空时渲染它。 |

## 国际化 (i18n)

组件内部**不含任何 i18n 框架**,也**不假设**你用什么。所有可见文案都来自一个 `labels` 对象 —— 默认英文(`defaultLabels`)。通过 `labels` prop 覆盖任意子集;没传的键回退到英文。

### 文案键

| 键 | 英文默认 |
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

> `more` 支持 `{n}` 占位,渲染时替换为被隐藏的图标数量。

### 静态覆盖

```vue
<IconPicker
  v-model="icon"
  :labels="{ placeholder: '选择一个图标', title: '图标' }"
/>
```

### 接入你自己的 i18n(以 vue-i18n 为例)

把 `t()` 出来的响应式翻译直接传进去:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconPicker } from 'tenon-naive-iconify-picker'

const { t } = useI18n()

// 切换语言时会重新计算。
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
  more: t('iconPicker.more', { n: '{n}' }), // 保留 {n} 占位,交给组件填充
}))
</script>

<template>
  <IconPicker v-model="icon" :labels="iconLabels" />
</template>
```

你的中文语言包大致长这样:

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

## 本地 SVG 图标

注册你自己的 SVG,让它们出现在 **Local SVG** Tab 下,并能以 `local:<名字>` 渲染。

**Vite**(推荐)—— 用 glob 把 SVG 目录读成原始字符串,文件名(去掉 `.svg`)就是图标名:

```ts
import { registerLocalIcons } from 'tenon-naive-iconify-picker'

registerLocalIcons(
  import.meta.glob('/src/assets/svg/*.svg', { query: '?raw', import: 'default', eager: true }),
)
// star.svg  ->  local:star
```

(`setupIconPicker({ localIcons })` 和 `<IconPicker :localIcons>` prop 效果相同。)

**非 Vite** 打包器 —— `import.meta.glob` 是 Vite 专属。用你工具链暴露原始文件内容的方式构造出 `{ 名字: 原始SVG }` 映射,再传给 `registerLocalIcons`。组件核心不依赖 Vite。

## "离线"是什么意思

注册的库作为懒加载 chunk 从**你应用自己的源**提供 —— 不会从 Iconify CDN 拉取任何东西。**Online** Tab 里输入的、你没有注册的那些库的图标,联网时从 Iconify API 加载(离线则不可用)。这是唯一的在线路径,且按图标逐个手动触发。

## SSR / Nuxt

选择器用到了仅浏览器的 API。SSR 下请仅在客户端渲染,例如 Nuxt 的 `<client-only>`,或用 `import.meta.client` 守卫的动态导入。

## 开发

```bash
npm install
npm run dev        # playground(Vite)—— 上面的截图就来自这里
npm run build      # dist/(ESM + d.ts,CSS 注入)
npm run typecheck  # vue-tsc
```

## 许可证

[MIT](./LICENSE)
