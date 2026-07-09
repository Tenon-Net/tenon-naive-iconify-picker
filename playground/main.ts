import { createApp } from 'vue'
import App from './App.vue'
import { lucideCollection, setupIconPicker } from '../src'
import type { IconifyJSON } from '../src'

// 演示「多图标库」:每个库一个 Tab,数据只在第一次点开该 Tab 时懒加载。
// 本地 SVG 用 Vite glob 从 playground/svg 注入。
setupIconPicker({
  collections: [
    lucideCollection, // 本包内置
    { prefix: 'ant-design', name: 'Ant Design', loader: () => import('@iconify-json/ant-design/icons.json').then((m) => m.default as IconifyJSON) },
    { prefix: 'ep', name: 'Element Plus', loader: () => import('@iconify-json/ep/icons.json').then((m) => m.default as IconifyJSON) },
    { prefix: 'ph', name: 'Phosphor', loader: () => import('@iconify-json/ph/icons.json').then((m) => m.default as IconifyJSON) },
  ],
  localIcons: import.meta.glob('./svg/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
})

createApp(App).mount('#app')
