<script setup lang="ts">
import { ref } from 'vue'
import { NCard, NConfigProvider, NSpace, NSwitch, darkTheme } from 'naive-ui'
import { IconPicker, OfflineIcon } from '../src'

const a = ref('lucide:rocket')
const b = ref('')
const dark = ref(false)
</script>

<template>
  <n-config-provider :theme="dark ? darkTheme : null">
    <div class="wrap">
      <n-card :title="'tenon-naive-iconify-picker · playground'">
        <n-space vertical size="large">
          <n-space align="center">Dark <n-switch v-model:value="dark" /></n-space>

          <div>
            <IconPicker v-model="a" />
            <p>value: <code>{{ a }}</code> → <OfflineIcon :icon="a" :size="24" /></p>
          </div>

          <div>
            <IconPicker v-model="b" :labels="{ placeholder: 'No icon selected' }" />
            <p>value: <code>{{ b || '(empty)' }}</code></p>
          </div>
        </n-space>
      </n-card>
    </div>
  </n-config-provider>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
.wrap {
  max-width: 620px;
  margin: 40px auto;
  padding: 0 16px;
}
</style>
