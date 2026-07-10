# tenon-naive-iconify-picker

[English](./README.md) · [简体中文](./README.zh-CN.md) · **日本語**

> **Vue 3 + Naive UI** 向けのオフラインファーストなアイコンピッカー。[Iconify](https://iconify.design) を利用しています。
> 任意の数のアイコンライブラリを登録でき(各ライブラリが 1 つのタブになります)、**ネットワークリクエストゼロ**で閲覧し、独自の SVG を差し込み、選択結果を 1 つの文字列として保存できます —— 「このメニューにアイコンを 1 つ選ぶ」といったフィールドに最適です。

<p align="center">
  <img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-hero.png" alt="IconPicker トリガー" width="720">
</p>

<table>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-grid.png" alt="アイコングリッド — ライト"></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-dark.png" alt="アイコングリッド — ダーク"></td>
  </tr>
  <tr>
    <td align="center"><b>ライト</b> — 登録した各ライブラリが 1 つのタブになり、オフラインで描画されます</td>
    <td align="center"><b>ダーク</b> — 配色は Naive UI テーマに追従します</td>
  </tr>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-tabs-ant.png" alt="Ant Design ライブラリのタブ"></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/Tenon-Net/tenon-naive-iconify-picker/main/assets/picker-local.png" alt="ローカル SVG のタブ"></td>
  </tr>
  <tr>
    <td align="center"><b>ライブラリ切り替え</b> — Lucide、Ant Design、Element Plus、Phosphor…</td>
    <td align="center"><b>ローカル SVG</b> — あなたのプロジェクト独自のアイコン</td>
  </tr>
</table>

---

## 特徴

- 🧭 **複数ライブラリ** —— 任意の数のアイコンセット(Lucide、Ant Design、Element Plus、Phosphor…)を登録でき、各ライブラリが 1 つのタブになるので、ユーザーは慣れたライブラリから選べます。
- 🔌 **オフライン** —— 登録したライブラリはローカルデータから描画されます。`api.iconify.design` へのリクエストは一切発生しません。
- 📦 **ゼロコンフィグ** —— [Lucide](https://lucide.dev) を最初から同梱。import した瞬間から動作し、必要になったらライブラリを追加できます。
- 🎨 **テーマ追従** —— ボーダー・文字色・ホバー・プライマリカラー・角丸のすべてが `useThemeVars()` を通じてホストの Naive UI テーマ(ライト / ダーク / カスタムプライマリ)に追従します。CSS 変数を設定する必要はありません。
- 🖼️ **ローカル SVG** —— プロジェクト独自の SVG を登録し、`local:<name>` として選択できます。
- 🌐 **オンラインへのフォールバック** —— 任意の Iconify 名(例:`mdi:home`)を入力すると、接続時にオンラインで読み込みます。
- 🌍 **i18n 対応** —— すべての文言は `labels` prop から供給されます。デフォルトは英語で、独自の翻訳を渡せます(→ [国際化](#国際化-i18n))。
- 🧩 **単一文字列の値** —— `v-model` は 1 つの `prefix:name`(または `local:name`)文字列です。そのまま DB カラムに保存し、どこでも `<OfflineIcon>` で描画できます。

## 動作要件

これは**既存アプリに組み込むコンポーネント**であり、Vue や Naive UI は同梱しません。アプリ側が peer 依存として提供する必要があります:

| Peer 依存 | サポート範囲 |
| --- | --- |
| `vue` | `^3.3.0` |
| `naive-ui` | `^2.34.0` |
| `@iconify/vue` | `^4.0.0 \|\| ^5.0.0` |

ブラウザ専用です(`navigator.onLine`、`v-html`、Iconify の `addCollection` を使用します)。SSR / Nuxt ではクライアント限定の境界内で描画してください —— [SSR / Nuxt](#ssr--nuxt) を参照。

## インストール

```bash
npm i tenon-naive-iconify-picker
# pnpm add tenon-naive-iconify-picker
# yarn add tenon-naive-iconify-picker
```

スタイルはコンポーネントが**自動注入**します。別途 CSS を import する必要は**ありません**。

## クイックスタート

ゼロコンフィグ:import して使うだけ。同梱の **Lucide** ライブラリは自動登録済みです。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconPicker, OfflineIcon } from 'tenon-naive-iconify-picker'

const icon = ref('lucide:rocket')
</script>

<template>
  <!-- テーマを解決するため、アプリの <n-config-provider> の内側に置く必要があります -->
  <IconPicker v-model="icon" />

  <!-- 保存済みの値をどこでも描画 —— これもオフライン、local: にも対応 -->
  <OfflineIcon :icon="icon" :size="18" />
</template>
```

`v-model` が保持するのは `lucide:rocket` や `local:star` のような 1 つの文字列です。契約はこれだけです。

## アイコンライブラリ(タブ)

登録したアイコンセットはそれぞれピッカー内の **タブ** になり、ユーザーはライブラリ間を切り替えられます —— 慣れた小さめのライブラリのほうが、巨大なセット 1 つより探しやすいことがよくあります。アイコンデータは本コンポーネントには**バンドルされません**:各セットは**あなたの**ビルド内で遅延ロードされる chunk であり、そのタブを最初に開いたときにだけ読み込まれます。つまり使った分だけのコストで済みます(Lucide ≈ 85 KB gz、Phosphor ≈ 946 KB gz)。

```bash
# 使いたいライブラリのデータパッケージをインストール
npm i @iconify-json/ant-design @iconify-json/ep @iconify-json/ph
```

```ts
// main.ts
import { setupIconPicker, lucideCollection } from 'tenon-naive-iconify-picker'

setupIconPicker({
  collections: [
    lucideCollection, // 本パッケージに同梱
    { prefix: 'ant-design', name: 'Ant Design',   loader: () => import('@iconify-json/ant-design/icons.json').then(m => m.default) },
    { prefix: 'ep',         name: 'Element Plus',  loader: () => import('@iconify-json/ep/icons.json').then(m => m.default) },
    { prefix: 'ph',         name: 'Phosphor',      loader: () => import('@iconify-json/ph/icons.json').then(m => m.default) },
  ],
})
```

保存される値にはライブラリの接頭辞が付くため(`ant-design:home-outlined`、`lucide:rocket`)、`<OfflineIcon>` は常に描画方法が分かります。`<IconPicker :collections>` prop でインスタンスごとに `collections` を渡すこともできます。利用可能なセットは [icon-sets.iconify.design](https://icon-sets.iconify.design) で閲覧でき、`prefix` はそのセットと一致している必要があります。

## 設定

### `setupIconPicker(options)` —— 任意の 1 回限りのセットアップ

アプリ起動時に一度呼び出して、ライブラリの登録・ローカル SVG の注入・特定セットのプリロードを行います。すべて任意で、呼ばなければ同梱の Lucide ライブラリだけになります。

| オプション | 型 | デフォルト | 説明 |
| --- | --- | --- | --- |
| `collections` | `IconCollection[]` | `defaultCollections`(Lucide) | タブとして表示するアイコンライブラリ。それぞれに遅延 `loader` を持ちます。 |
| `localIcons` | `Record<string, string>` | — | ローカル SVG。`{ name: rawSvg }` または `import.meta.glob` の結果を受け付けます。 |
| `preloadPrefix` | `string` | 最初の collection | 起動時にどのライブラリを温めておくか。初回描画が即座になります。 |

### `<IconPicker>` props

| Prop | 型 | デフォルト | 備考 |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | 保存される値:`prefix:name` または `local:name`。 |
| `collections` | `IconCollection[]` | グローバル / Lucide | このインスタンスだけライブラリを上書き。 |
| `localIcons` | `Record<string, string>` | — | `{ name: rawSvg }` または `import.meta.glob` の結果。 |
| `labels` | `Partial<IconPickerLabels>` | 英語 | あなたの翻訳 —— [国際化](#国際化-i18n) を参照。 |
| `searchIcon` / `clearIcon` | `string` | `lucide:search` / `lucide:x` | UI 用アイコン。登録済みライブラリの名前を使ってください。 |
| `fallbackIcon` | `string` | `''` | 空値のときの `OfflineIcon` のフォールバック。 |
| `clearable` | `boolean` | `true` | クリア(×)ボタンを表示するか。 |
| `cap` | `number` | `300` | 「絞り込むために入力を続けて」ヒントを出す前に描画する最大アイコン数。 |

### `<OfflineIcon>` props

保存済みの値を描画する独立したレンダラー —— テーブル・メニューなど、どこでも使えます。

| Prop | 型 | デフォルト | 備考 |
| --- | --- | --- | --- |
| `icon` | `string` | `''` | `prefix:name` または `local:name`。 |
| `size` | `number \| string` | `18` | 数値は px として扱われます。 |
| `fallback` | `string` | `''` | `icon` が空のときに描画されます。 |

## 国際化 (i18n)

このコンポーネントは **i18n フレームワークを一切含まず**、あなたが何を使うかも**前提にしません**。表示されるすべての文言は `labels` オブジェクトから供給されます —— デフォルトは英語(`defaultLabels`)です。`labels` prop で任意の一部を上書きでき、指定しなかったキーは英語にフォールバックします。

### ラベルのキー

| キー | 英語デフォルト |
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

> `more` は `{n}` トークンに対応しており、描画時に隠れているアイコン数へ置き換えられます。

### 静的な上書き

```vue
<IconPicker
  v-model="icon"
  :labels="{ placeholder: 'アイコンを選択', title: 'アイコン' }"
/>
```

### 自前の i18n を組み込む(例:vue-i18n)

`t()` の返すリアクティブな翻訳をそのまま渡します:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconPicker } from 'tenon-naive-iconify-picker'

const { t } = useI18n()

// ロケールが変わると再計算されます。
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
  more: t('iconPicker.more', { n: '{n}' }), // {n} トークンはコンポーネントが埋めるので残す
}))
</script>

<template>
  <IconPicker v-model="icon" :labels="iconLabels" />
</template>
```

日本語のメッセージバンドルは例えば次のようになります:

```ts
iconPicker: {
  placeholder: 'アイコンを選択',
  title: 'アイコンを選択',
  search: 'アイコン名で検索…',
  local: 'ローカル SVG',
  online: 'オンライン',
  onlinePlaceholder: '任意の Iconify 名、例:mdi:home',
  use: '使用',
  offlineHint: 'オフライン — 同梱されていないオンラインアイコンはプレビューできません',
  loading: '読み込み中…',
  empty: '一致するアイコンがありません',
  more: '他 {n} 件 — 入力を続けて絞り込んでください',
}
```

## ローカル SVG アイコン

独自の SVG を登録すると、**Local SVG** タブから選択可能になり、`local:<name>` として描画できます。

**Vite**(推奨)—— SVG フォルダを raw 文字列として glob します。ファイル名(`.svg` を除いたもの)がアイコン名になります:

```ts
import { registerLocalIcons } from 'tenon-naive-iconify-picker'

registerLocalIcons(
  import.meta.glob('/src/assets/svg/*.svg', { query: '?raw', import: 'default', eager: true }),
)
// star.svg  ->  local:star
```

(`setupIconPicker({ localIcons })` と `<IconPicker :localIcons>` prop も同じ働きをします。)

**Vite 以外**のバンドラー —— `import.meta.glob` は Vite 固有です。お使いのツールチェーンが raw ファイル内容を公開する方法で `{ name: rawSvg }` マップを作り、`registerLocalIcons` に渡してください。コンポーネントのコアは Vite に依存しません。

## 「オフライン」の意味

登録したライブラリは**あなたのアプリ自身のオリジン**から遅延 chunk として配信されます —— Iconify CDN からは何も取得しません。**Online** タブに入力した、登録して*いない*ライブラリのアイコンは、接続時に Iconify API から読み込まれます(オフラインでは単に利用できません)。これが唯一のオンライン経路であり、アイコンごとのオプトインです。

## SSR / Nuxt

ピッカーはブラウザ専用の API を使います。SSR ではクライアント側でのみ描画してください。例えば Nuxt の `<client-only>` や、`import.meta.client` でガードした動的 import を使います。

## 開発

```bash
npm install
npm run dev        # playground(Vite)—— 上のスクリーンショットはここから
npm run build      # dist/(ESM + d.ts、CSS 注入)
npm run typecheck  # vue-tsc
```

## ライセンス

[MIT](./LICENSE)
