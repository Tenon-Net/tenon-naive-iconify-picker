import { createApp } from 'vue'
import App from './App.vue'
import { defaultCollections, setupIconPicker } from '../src'

// 一次性配置:默认 Lucide;本地 SVG 用 Vite glob 从 playground/svg 注入。
setupIconPicker({
  collections: defaultCollections,
  localIcons: import.meta.glob('./svg/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>,
})

createApp(App).mount('#app')
