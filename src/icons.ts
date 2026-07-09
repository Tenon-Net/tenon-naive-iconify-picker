// 框架无关核心:离线图标集注册 + 本地 SVG 注册 + 懒加载。不依赖 Vue/Naive,便于将来其它 UI 版本复用。
// 已注册的集由 @iconify/vue <Icon> 从本地数据渲染(不请求外部 CDN);未注册前缀交在线兜底。
import { addCollection } from '@iconify/vue'
import type { IconCollection, IconSetMeta, IconifyJSON, SetupOptions } from './types'

/** 本地自定义 SVG 前缀,值格式 `local:<名字>`。 */
export const LOCAL_PREFIX = 'local'

// ── 图标集注册表 ──────────────────────────────────────────────
let collections: IconCollection[] = []
const loaderByPrefix = new Map<string, () => Promise<IconifyJSON>>()
const dataCache: Record<string, IconifyJSON> = {}
const registered = new Set<string>()

/** 设置可用图标集(覆盖式)。IconPicker 传了 collections prop 时也会调用它。 */
export function registerCollections(list: IconCollection[]): void {
  collections = list.slice()
  loaderByPrefix.clear()
  for (const c of list) loaderByPrefix.set(c.prefix, c.loader)
}

/** 当前图标集元数据列表(供选择器 Tab)。 */
export function getCollections(): IconSetMeta[] {
  return collections.map(({ prefix, name }) => ({ prefix, name }))
}

/** 该前缀是否为内置集(决定渲染前是否需等注册,避免命中外部 CDN)。 */
export function isBundled(prefix: string): boolean {
  return loaderByPrefix.has(prefix)
}

/** 该前缀是否已完成离线注册。 */
export function isRegistered(prefix: string): boolean {
  return registered.has(prefix)
}

/** 内置前缀:懒加载 + addCollection(幂等),返回 JSON;非内置:返回 null(交在线兜底)。 */
export async function ensureCollection(prefix: string): Promise<IconifyJSON | null> {
  if (dataCache[prefix]) return dataCache[prefix]
  const loader = loaderByPrefix.get(prefix)
  if (!loader) return null
  const data = await loader().catch(() => null)
  if (!data) return null
  if (!registered.has(prefix)) {
    addCollection(data)
    registered.add(prefix)
  }
  dataCache[prefix] = data
  return data
}

/** 懒加载并返回排序后的图标名(供 IconPicker 列名)。 */
export async function loadIconNames(prefix: string): Promise<string[]> {
  const data = await ensureCollection(prefix)
  return data ? Object.keys(data.icons ?? {}).sort() : []
}

/** 预热某集(默认第一套),让首屏 <Icon> 从本地渲染而非命中 CDN。 */
export async function preloadIcons(prefix?: string): Promise<void> {
  const p = prefix ?? collections[0]?.prefix
  if (p) await ensureCollection(p)
}

// ── 本地 SVG 注册表 ───────────────────────────────────────────
let localMap: Record<string, string> = {}

/** 注册本地 SVG。入参可为 `{ 名字: 原始SVG }`,或 import.meta.glob 的 `{ '/x/y.svg': 原始SVG }`(自动取文件名)。 */
export function registerLocalIcons(map: Record<string, string>): void {
  const out: Record<string, string> = {}
  for (const [key, raw] of Object.entries(map)) {
    if (typeof raw !== 'string') continue
    const name = key.includes('/') ? (key.split('/').pop()?.replace(/\.svg$/, '') ?? '') : key
    if (name) out[name] = raw
  }
  localMap = out
}

/** 本地 SVG 名列表(不含 `local:` 前缀)。 */
export function getLocalIconNames(): string[] {
  return Object.keys(localMap).sort()
}

/** 取本地 SVG 原始字符串(未命中返回 undefined)。 */
export function localSvgRaw(name: string): string | undefined {
  return localMap[name]
}

// ── 内置默认集(Lucide)+ 一次性配置 ──────────────────────────
/** 内置默认图标集:Lucide(库的普通依赖,懒加载 chunk ~85KB gz)。 */
export const lucideCollection: IconCollection = {
  prefix: 'lucide',
  name: 'Lucide',
  loader: () => import('@iconify-json/lucide/icons.json').then((m) => m.default as IconifyJSON),
}

/** 零配置默认集合(仅 Lucide);消费方可 `[...defaultCollections, 自己的集]`。 */
export const defaultCollections: IconCollection[] = [lucideCollection]

/** 一次性配置(全部可选)。消费方在 app 入口调一次即可;不调也能用默认 Lucide。 */
export function setupIconPicker(opts: SetupOptions = {}): void {
  registerCollections(opts.collections ?? defaultCollections)
  if (opts.localIcons) registerLocalIcons(opts.localIcons)
  void preloadIcons(opts.preloadPrefix)
}

// 模块加载即注册默认集,保证「未调 setupIconPicker 也能用」的零配置体验。
registerCollections(defaultCollections)
