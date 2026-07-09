export { default as IconPicker } from './IconPicker.vue'
export { default as OfflineIcon } from './OfflineIcon.vue'
export {
  LOCAL_PREFIX,
  registerCollections,
  getCollections,
  isBundled,
  isRegistered,
  ensureCollection,
  loadIconNames,
  preloadIcons,
  registerLocalIcons,
  getLocalIconNames,
  localSvgRaw,
  lucideCollection,
  defaultCollections,
  setupIconPicker,
} from './icons'
export { defaultLabels } from './labels'
export type { IconCollection, IconSetMeta, IconPickerLabels, IconifyJSON, SetupOptions } from './types'
