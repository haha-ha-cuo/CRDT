<script setup>
import { NConfigProvider, zhCN } from 'naive-ui'
import DocumentWorkspace from './components/DocumentWorkspace/DocumentWorkspace.vue'

const theme = {
  common: {
    primaryColor: '#24704d',
    primaryColorHover: '#31865d',
    primaryColorPressed: '#1b583c',
    primaryColorSuppl: '#31865d',
    borderRadius: '8px',
  },
}
</script>

<template>
  <n-config-provider :locale="zhCN" :theme-overrides="theme">
    <document-workspace />
  </n-config-provider>
</template>
