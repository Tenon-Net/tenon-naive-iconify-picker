<script setup lang="ts">
// 离线优先图标选择器(Vue3 + Naive UI)。值契约单串 `prefix:name` / `local:name`。
// 解耦:文案走 labels prop(英文默认)、主题走 useThemeVars(跟随消费方 Naive 主题)、
// 图标集/本地SVG 走注入(collections / localIcons 或 setupIconPicker)。
import { computed, ref, watch } from 'vue'
import { NButton, NEmpty, NInput, NModal, NScrollbar, NTab, NTabs, useThemeVars } from 'naive-ui'
import OfflineIcon from './OfflineIcon.vue'
import {
  LOCAL_PREFIX,
  getCollections,
  getLocalIconNames,
  loadIconNames,
  registerCollections,
  registerLocalIcons,
} from './icons'
import { defaultLabels } from './labels'
import type { IconCollection, IconPickerLabels, IconSetMeta } from './types'

const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{
  /** 覆盖全局图标集(含 loader);传了则本组件注册它。省略用已注册的(默认 Lucide)。 */
  collections?: IconCollection[]
  /** 本地 SVG 映射,`{名字:原始SVG}` 或 import.meta.glob 结果。 */
  localIcons?: Record<string, string>
  /** 文案覆盖(接自己的 i18n)。 */
  labels?: Partial<IconPickerLabels>
  clearable?: boolean
  /** 搜索框图标(默认 lucide:search)。 */
  searchIcon?: string
  /** 清除图标(默认 lucide:x)。 */
  clearIcon?: string
  /** OfflineIcon 空值兜底。 */
  fallbackIcon?: string
  /** 单页可见上限,超出提示继续输入(默认 300)。 */
  cap?: number
}>(), {
  clearable: true,
  searchIcon: 'lucide:search',
  clearIcon: 'lucide:x',
  fallbackIcon: '',
  cap: 300,
})

// 传入即注册到全局(loader 才可用于渲染/懒加载)
if (props.collections) registerCollections(props.collections)
if (props.localIcons) registerLocalIcons(props.localIcons)

const L = computed<IconPickerLabels>(() => ({ ...defaultLabels, ...props.labels }))

// 主题:映射 Naive 主题色 → 组件局部 CSS 变量(跟随明/暗/主色)。绑定在触发器与弹窗体两处(弹窗 teleport 到 body)。
const theme = useThemeVars()
const themeStyle = computed(() => ({
  '--nip-border': theme.value.borderColor,
  '--nip-bg': theme.value.cardColor,
  '--nip-text-1': theme.value.textColor1,
  '--nip-text-2': theme.value.textColor2,
  '--nip-text-3': theme.value.textColor3,
  '--nip-hover': theme.value.hoverColor,
  '--nip-primary': theme.value.primaryColor,
  '--nip-radius': theme.value.borderRadius,
  '--nip-fs-sm': theme.value.fontSizeSmall,
}))

const metas = computed<IconSetMeta[]>(() => props.collections ?? getCollections())

const LOCAL_TAB = '__local__'
const ONLINE_TAB = '__online__'

const active = ref(metas.value[0]?.prefix ?? ONLINE_TAB)
const show = ref(false)
const keyword = ref('')
const names = ref<string[]>([])
const loading = ref(false)
const onlineInput = ref('')
const isOnline = ref(true)
const cache: Record<string, string[]> = {}

const placeholderText = computed(() => props.labels?.placeholder ?? defaultLabels.placeholder)

const sourceNames = computed(() => (active.value === LOCAL_TAB ? getLocalIconNames() : names.value))
const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return k ? sourceNames.value.filter((n) => n.toLowerCase().includes(k)) : sourceNames.value
})
const visibleNames = computed(() => filtered.value.slice(0, props.cap))
const overflow = computed(() => filtered.value.length - visibleNames.value.length)
const moreText = computed(() => L.value.more.replace('{n}', String(overflow.value)))

function iconId(name: string): string {
  return active.value === LOCAL_TAB ? `${LOCAL_PREFIX}:${name}` : `${active.value}:${name}`
}

async function loadTab() {
  const prefix = active.value
  if (prefix === LOCAL_TAB || prefix === ONLINE_TAB) {
    loading.value = false
    return
  }
  if (cache[prefix]) {
    names.value = cache[prefix]
    return
  }
  loading.value = true
  try {
    const list = await loadIconNames(prefix)
    cache[prefix] = list
    if (active.value === prefix) names.value = list
  } finally {
    if (active.value === prefix) loading.value = false
  }
}

watch(active, () => {
  keyword.value = ''
  loadTab()
})
watch(show, (v) => {
  if (v) {
    keyword.value = ''
    onlineInput.value = ''
    isOnline.value = navigator.onLine
    loadTab()
  }
})

function pick(name: string) {
  model.value = iconId(name)
  show.value = false
}
function pickOnline() {
  const v = onlineInput.value.trim()
  if (v) {
    model.value = v
    show.value = false
  }
}
function clear() {
  model.value = ''
}
</script>

<template>
  <div class="tnip">
    <div class="tnip-trigger" :class="{ empty: !model }" :style="themeStyle" @click="show = true">
      <OfflineIcon v-if="model" :icon="model" :size="18" :fallback="fallbackIcon" />
      <span class="tnip-val">{{ model || placeholderText }}</span>
      <span v-if="clearable && model" class="tnip-clear" @click.stop="clear">
        <OfflineIcon :icon="clearIcon" :size="13" />
      </span>
    </div>

    <n-modal
      v-model:show="show"
      preset="card"
      :title="L.title"
      class="tnip-modal"
      :style="{ width: '600px', maxWidth: '94vw' }"
      :bordered="false"
    >
      <div class="tnip-body" :style="themeStyle">
        <div class="tnip-search">
          <n-input v-model:value="keyword" :placeholder="L.search" clearable>
            <template #prefix><OfflineIcon :icon="searchIcon" :size="16" /></template>
          </n-input>
        </div>

        <n-tabs :value="active" type="line" size="small" @update:value="(v: string) => (active = v)">
          <n-tab v-for="m in metas" :key="m.prefix" :name="m.prefix" :tab="m.name" />
          <n-tab :name="LOCAL_TAB" :tab="L.local" />
          <n-tab :name="ONLINE_TAB" :tab="L.online" />
        </n-tabs>

        <n-scrollbar class="tnip-scroll">
          <!-- 在线自由输入 -->
          <div v-if="active === ONLINE_TAB" class="tnip-online">
            <n-input v-model:value="onlineInput" :placeholder="L.onlinePlaceholder" @keyup.enter="pickOnline">
              <template #suffix>
                <OfflineIcon v-if="onlineInput.trim()" :icon="onlineInput.trim()" :size="20" />
              </template>
            </n-input>
            <n-button type="primary" :disabled="!onlineInput.trim()" @click="pickOnline">{{ L.use }}</n-button>
            <p v-if="!isOnline" class="tnip-hint">{{ L.offlineHint }}</p>
          </div>

          <!-- 图标网格 -->
          <div v-else-if="loading" class="tnip-state">{{ L.loading }}</div>
          <n-empty v-else-if="!visibleNames.length" class="tnip-state" :description="L.empty" />
          <template v-else>
            <div class="tnip-grid">
              <button
                v-for="name in visibleNames"
                :key="name"
                type="button"
                class="tnip-cell"
                :class="{ sel: model === iconId(name) }"
                :title="iconId(name)"
                @click="pick(name)"
              >
                <OfflineIcon :icon="iconId(name)" :size="22" />
                <span class="tnip-name">{{ name }}</span>
              </button>
            </div>
            <p v-if="overflow > 0" class="tnip-more">{{ moreText }}</p>
          </template>
        </n-scrollbar>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
.tnip-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--nip-border);
  border-radius: var(--nip-radius);
  background: var(--nip-bg);
  color: var(--nip-text-1);
  cursor: pointer;
  transition: border-color 0.2s;
}
.tnip-trigger:hover {
  border-color: var(--nip-primary);
}
.tnip-trigger.empty .tnip-val {
  color: var(--nip-text-3);
}
.tnip-val {
  flex: 1;
  min-width: 0;
  font-size: var(--nip-fs-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tnip-clear {
  display: inline-flex;
  color: var(--nip-text-3);
}
.tnip-clear:hover {
  color: var(--nip-text-1);
}

.tnip-search {
  margin-bottom: 8px;
}
.tnip-scroll {
  max-height: 46vh;
}
.tnip-state {
  padding: 40px 0;
  text-align: center;
  color: var(--nip-text-3);
}
.tnip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
  padding: 8px 4px;
}
.tnip-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border: 1px solid transparent;
  border-radius: var(--nip-radius);
  background: transparent;
  color: var(--nip-text-2);
  cursor: pointer;
  transition: all 0.15s;
}
.tnip-cell:hover {
  background: var(--nip-hover);
  color: var(--nip-text-1);
}
.tnip-cell.sel {
  background: color-mix(in srgb, var(--nip-primary) 12%, transparent);
  border-color: var(--nip-primary);
  color: var(--nip-primary);
}
.tnip-name {
  max-width: 100%;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tnip-more {
  padding: 4px 0 8px;
  text-align: center;
  font-size: var(--nip-fs-sm);
  color: var(--nip-text-3);
}
.tnip-online {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px 4px;
}
.tnip-hint {
  width: 100%;
  margin: 0;
  font-size: var(--nip-fs-sm);
  color: var(--nip-text-3);
}
</style>
