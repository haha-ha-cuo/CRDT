<script setup>
import IconFileSpreadsheet from '@tabler/icons-vue/icons/IconFileSpreadsheet'
import IconLayoutSidebarLeftCollapse from '@tabler/icons-vue/icons/IconLayoutSidebarLeftCollapse'
import IconLayoutSidebarLeftExpand from '@tabler/icons-vue/icons/IconLayoutSidebarLeftExpand'
import IconPlus from '@tabler/icons-vue/icons/IconPlus'
import { NButton, NLayoutSider, NMenu } from 'naive-ui'
import { computed, h, onMounted, onUnmounted, ref } from 'vue'
import DocumentIcon from '../DocumentIcon/DocumentIcon.vue'

const collapsed = defineModel('collapsed', { type: Boolean, required: true })
const props = defineProps({
  documents: { type: Array, required: true },
  activeId: { type: String, default: null },
  disabled: Boolean,
})
const emit = defineEmits(['create', 'select'])

const collapsedWidth = 64
const narrowScreen = window.matchMedia('(max-width: 650px)')
const narrow = ref(narrowScreen.matches)
const toggleLabel = computed(() => (collapsed.value ? '展开侧栏' : '收起侧栏'))
const options = computed(() => props.documents.map(({ id, title }) => ({ key: id, label: title })))
const menuTheme = {
  itemColorHover: '#fff',
  itemColorActive: '#fff',
  itemColorActiveHover: '#fff',
  itemColorActiveCollapsed: '#fff',
  itemTextColorHover: '#24704d',
}

function updateScreen(event) {
  narrow.value = event.matches
}

onMounted(() => narrowScreen.addEventListener('change', updateScreen))
onUnmounted(() => narrowScreen.removeEventListener('change', updateScreen))

function renderDocumentIcon() {
  return h(IconFileSpreadsheet, { size: 18, 'aria-hidden': 'true', focusable: 'false' })
}

function menuItemProps({ key, label }) {
  return {
    tabindex: 0,
    'aria-label': label,
    'aria-current': props.activeId === key ? 'page' : undefined,
    onKeydown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        emit('select', key)
      }
    },
  }
}
</script>

<template>
  <n-layout-sider
    class="sidebar"
    :class="{ 'sidebar--collapsed': collapsed }"
    aria-label="文档导航"
    :width="narrow ? '100%' : 240"
    :collapsed-width="collapsedWidth"
    :collapsed="collapsed && !narrow"
    collapse-mode="width"
  >
    <div class="sidebar-top">
      <div class="brand">
        <document-icon variant="brand" />
        <span>协作文档</span>
      </div>

      <n-button
        class="sidebar-toggle"
        text
        :aria-label="toggleLabel"
        :title="toggleLabel"
        :aria-expanded="!collapsed"
        aria-controls="sidebar-documents"
        @click="collapsed = !collapsed"
      >
        <template #icon>
          <component
            :is="collapsed ? IconLayoutSidebarLeftExpand : IconLayoutSidebarLeftCollapse"
            :size="20"
            aria-hidden="true"
            focusable="false"
          />
        </template>
      </n-button>
    </div>

    <div v-show="!narrow || !collapsed" id="sidebar-documents">
      <div class="sidebar-heading">
        <h2 v-if="!collapsed">我的文档</h2>
        <n-button
          size="small"
          type="primary"
          ghost
          aria-label="新建"
          :title="collapsed ? '新建' : undefined"
          :disabled="disabled"
          @click="emit('create')"
        >
          <template #icon>
            <icon-plus :size="16" aria-hidden="true" focusable="false" />
          </template>
          <template v-if="!collapsed" #default>新建</template>
        </n-button>
      </div>

      <nav v-if="options.length" class="document-list" aria-label="文档">
        <n-menu
          :mode="narrow ? 'horizontal' : 'vertical'"
          :collapsed="collapsed"
          :collapsed-width="collapsedWidth"
          :icon-size="18"
          :collapsed-icon-size="18"
          :indent="20"
          :options="options"
          :value="activeId"
          :node-props="menuItemProps"
          :render-icon="renderDocumentIcon"
          :theme-overrides="menuTheme"
          @update:value="emit('select', $event)"
        />
      </nav>
      <p v-else-if="!disabled && !collapsed" class="list-empty">还没有文档</p>
    </div>
  </n-layout-sider>
</template>

<style scoped>
.sidebar {
  border-right: 1px solid #dce4df;
}

.sidebar-top,
.brand,
.sidebar-heading {
  display: flex;
  align-items: center;
}

.sidebar-top {
  justify-content: space-between;
  gap: 0.5rem;
  padding: 1.35rem 0.9rem 0;
  margin-bottom: 2.3rem;
}

.sidebar--collapsed .sidebar-top {
  justify-content: center;
  padding-inline: 0;
  margin-bottom: 1.15rem;
}

.brand {
  gap: 0.65rem;
  padding-left: 0.4rem;
  font-size: 1.1rem;
  font-weight: 700;
}

.sidebar--collapsed .brand {
  display: none;
}

.sidebar-toggle {
  flex: none;
  width: 2rem;
  height: 2rem;
}

.sidebar-toggle:focus-visible,
.document-list :deep([role='menuitem']:focus-visible) {
  outline: 2px solid #24704d;
  outline-offset: -2px;
}

.sidebar-heading {
  justify-content: space-between;
  padding: 0 1.3rem;
  margin-bottom: 0.75rem;
}

.sidebar--collapsed .sidebar-heading {
  justify-content: center;
  padding-inline: 0;
}

.sidebar-heading h2 {
  margin: 0;
  font-size: 0.893rem;
  color: #52645a;
}

.document-list :deep([aria-current='page']) {
  font-weight: 650;
}

.list-empty {
  padding: 0 1.3rem;
  font-size: 0.875rem;
  color: #596a60;
}

@media (max-width: 650px) {
  .sidebar {
    border-right: 0;
    border-bottom: 1px solid #dce4df;
  }
  .sidebar-top,
  .sidebar--collapsed .sidebar-top {
    justify-content: space-between;
    padding: 0.85rem 0.65rem 0;
    margin-bottom: 0.65rem;
  }
  .sidebar--collapsed .brand {
    display: flex;
  }
  .sidebar-heading,
  .list-empty {
    padding-inline: 1.05rem;
  }
  .document-list {
    overflow-x: auto;
  }
}
</style>
