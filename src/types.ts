import type { addCollection } from '@iconify/vue'

/** Iconify 图标集 JSON(与 @iconify/vue addCollection 入参同型)。 */
export type IconifyJSON = Parameters<typeof addCollection>[0]

/** 图标集元数据(选择器 Tab 显示用)。 */
export interface IconSetMeta {
  /** iconify 集前缀,如 'lucide' / 'ph' / 'mdi'。 */
  prefix: string
  /** Tab 显示名。 */
  name: string
}

/** 可离线注册的图标集:元数据 + 懒加载 loader。 */
export interface IconCollection extends IconSetMeta {
  /** 返回该集的 IconifyJSON,通常 `() => import('@iconify-json/<prefix>/icons.json').then(m => m.default)`。 */
  loader: () => Promise<IconifyJSON>
}

/** 选择器全部文案(可通过 labels prop 部分覆盖)。 */
export interface IconPickerLabels {
  /** 触发器占位。 */
  placeholder: string
  /** 弹窗标题。 */
  title: string
  /** 搜索框占位。 */
  search: string
  /** 本地 SVG Tab 名。 */
  local: string
  /** 在线 Tab 名。 */
  online: string
  /** 在线自由输入占位。 */
  onlinePlaceholder: string
  /** 在线「使用」按钮。 */
  use: string
  /** 离线时在线 Tab 提示。 */
  offlineHint: string
  /** 加载中。 */
  loading: string
  /** 无匹配。 */
  empty: string
  /** 截断提示,须含 `{n}` 占位(渲染时替换为剩余数)。 */
  more: string
}

/** setupIconPicker 一次性配置。 */
export interface SetupOptions {
  /** 内置离线图标集;省略则用 defaultCollections(仅 Lucide)。 */
  collections?: IconCollection[]
  /** 本地 SVG 映射:`{ 名字: 原始SVG }` 或 import.meta.glob 的 `{ 路径: 原始SVG }`。 */
  localIcons?: Record<string, string>
  /** 启动预热的集前缀,省略则预热第一套。 */
  preloadPrefix?: string
}
