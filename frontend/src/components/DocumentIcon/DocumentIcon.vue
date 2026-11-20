<script setup>
import IconFileSpreadsheet from '@tabler/icons-vue/icons/IconFileSpreadsheet'
import IconFileText from '@tabler/icons-vue/icons/IconFileText'
import IconLayoutGrid from '@tabler/icons-vue/icons/IconLayoutGrid'

defineProps({ variant: { type: String, default: 'excel' } })

const icons = {
  brand: { component: IconLayoutGrid, size: 24 },
  excel: { component: IconFileSpreadsheet, size: 18 },
  heading: { component: IconFileSpreadsheet, size: 24 },
  word: { component: IconFileText, size: 24 },
}
</script>

<template>
  <component
    :is="icons[variant].component"
    :size="icons[variant].size"
    class="file-icon"
    :class="{ 'file-icon--word': variant === 'word' }"
    aria-hidden="true"
    focusable="false"
  />
</template>

<style scoped>
.file-icon {
  flex: none;
  color: #27704f;
}

.file-icon--word {
  color: #475e92;
}
</style>
