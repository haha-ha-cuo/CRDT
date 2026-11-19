<script setup>
import { NButton } from 'naive-ui'
import DocumentIcon from '../DocumentIcon/DocumentIcon.vue'

defineProps({
  documents: { type: Array, required: true },
  activeId: { type: String, default: null },
  disabled: Boolean,
})
const emit = defineEmits(['create', 'select'])
</script>

<template>
  <aside class="sidebar" aria-label="文档导航">
    <div class="brand">
      <document-icon variant="brand" />
      <span>协作文档</span>
    </div>

    <div class="sidebar-heading">
      <h2>我的文档</h2>
      <n-button size="small" secondary type="primary" :disabled="disabled" @click="emit('create')">
        ＋ 新建
      </n-button>
    </div>

    <nav v-if="documents.length" class="document-list" aria-label="文档">
      <button
        v-for="document in documents"
        :key="document.id"
        class="document-link"
        :aria-current="activeId === document.id ? 'page' : undefined"
        @click="emit('select', document.id)"
      >
        <document-icon />
        <span class="document-name">{{ document.title }}</span>
      </button>
    </nav>
    <p v-else-if="!disabled" class="list-empty">还没有文档</p>
  </aside>
</template>

<style scoped>
.sidebar {
  background: #f8faf9;
  border-right: 1px solid #dce4df;
  padding: 1.35rem 0.9rem;
}

.brand,
.sidebar-heading,
.document-link {
  display: flex;
  align-items: center;
}

.brand {
  gap: 0.65rem;
  padding: 0 0.4rem;
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 2.3rem;
}

.sidebar-heading {
  justify-content: space-between;
  padding: 0 0.4rem;
  margin-bottom: 0.75rem;
}
.sidebar-heading h2 {
  margin: 0;
  font-size: 0.893rem;
  color: #52645a;
}
.document-list {
  display: grid;
  gap: 0.25rem;
}

.document-link {
  min-width: 0;
  width: 100%;
  gap: 0.55rem;
  padding: 0.42rem 0.55rem;
  text-align: left;
  border: 0;
  border-radius: 0.5rem;
  color: #36443c;
  background: transparent;
  font-size: 0.91rem;
  cursor: pointer;
}
.document-link:hover,
.document-link:focus-visible {
  background: #edf3ee;
}
.document-link[aria-current] {
  color: #1b593d;
  background: #e9f3eb;
  font-weight: 650;
}
.document-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list-empty {
  padding: 0 0.4rem;
  font-size: 0.875rem;
  color: #596a60;
}

@media (max-width: 650px) {
  .sidebar {
    border-right: 0;
    border-bottom: 1px solid #dce4df;
    padding: 0.85rem 0.65rem;
  }
  .brand {
    margin-bottom: 0.65rem;
  }
  .document-list {
    display: flex;
    overflow-x: auto;
  }
  .document-link {
    flex: 0 0 auto;
    width: auto;
    max-width: 12rem;
  }
}
</style>
