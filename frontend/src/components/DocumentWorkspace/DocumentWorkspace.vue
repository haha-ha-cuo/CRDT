<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { NButton, NLayout, NSpin } from 'naive-ui'
import * as Y from 'yjs'
import { workbookRows } from '../../spreadsheet/cells.js'
import { openWorkspace } from '../../storage/workspace.js'
import CreateDocumentDialog from '../CreateDocumentDialog/CreateDocumentDialog.vue'
import DocumentIcon from '../DocumentIcon/DocumentIcon.vue'
import DocumentSidebar from '../DocumentSidebar/DocumentSidebar.vue'

const SpreadsheetEditor = defineAsyncComponent(
  () => import('../SpreadsheetEditor/SpreadsheetEditor.vue'),
)

const documents = shallowRef([])
const activeId = ref(null)
const loading = ref(true)
const storageError = ref(false)
const sidebarCollapsed = ref(false)
const modalOpen = ref(false)
const exportError = ref('')
const exporting = ref(false)
const editor = ref(null)
const active = computed(() => documents.value.find((document) => document.id === activeId.value))
let workspace
let catalog

function choose(id) {
  editor.value?.save()
  activeId.value = id
  exportError.value = ''
  const url = new URL(window.location.href)
  url.searchParams.set('doc', id)
  window.history.replaceState(null, '', url)
}

function refresh() {
  documents.value = Array.from(catalog, ([id, entry]) => ({
    id,
    title: entry.get('title'),
    createdAt: entry.get('createdAt'),
    cells: entry.get('cells'),
  })).sort((a, b) => b.createdAt - a.createdAt)
}

onMounted(async () => {
  try {
    workspace = openWorkspace()
    catalog = workspace.doc.getMap('spreadsheets')
    catalog.observe(refresh)
    await workspace.ready
    refresh()

    const requested = new URL(window.location.href).searchParams.get('doc')
    const initial =
      documents.value.find((document) => document.id === requested) ?? documents.value[0]
    if (initial) choose(initial.id)
  } catch {
    storageError.value = true
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  catalog?.unobserve(refresh)
  workspace?.close()
})

function create(title) {
  if (!catalog) return

  const id = crypto.randomUUID()
  const entry = new Y.Map()
  entry.set('title', title)
  entry.set('createdAt', Date.now())
  entry.set('cells', new Y.Map())
  catalog.set(id, entry)
  choose(id)
  modalOpen.value = false
}

async function exportSpreadsheet() {
  const document = active.value
  if (!document || exporting.value) return

  editor.value?.save()
  exporting.value = true
  exportError.value = ''
  try {
    const rows = workbookRows(document.cells)
    const { default: writeExcelFile } = await import('write-excel-file/browser')
    const filename = document.title.replace(/[<>:"/\\|?*]/g, '_').replace(/[. ]+$/, '') || '表格'
    await writeExcelFile(rows).toFile(`${filename}.xlsx`)
  } catch {
    exportError.value = '导出失败，请重试。'
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <n-layout has-sider>
    <div class="workspace">
      <document-sidebar
        v-model:collapsed="sidebarCollapsed"
        :documents="documents"
        :active-id="activeId"
        :disabled="loading || storageError"
        @create="modalOpen = true"
        @select="choose"
      />

      <main class="main">
        <div v-if="loading" class="empty-view">
          <n-spin aria-label="加载工作区" />
        </div>
        <div v-else-if="storageError" class="empty-view" role="alert">
          <h1>无法打开本地工作区</h1>
          <p>请确认浏览器允许此站点保存数据，再刷新页面。</p>
        </div>
        <template v-else-if="active">
          <header class="topbar">
            <div class="document-heading">
              <document-icon variant="heading" />
              <div>
                <h1>{{ active.title }}</h1>
                <p>Excel 表格 · 浏览器本地存储</p>
              </div>
            </div>
            <n-button :loading="exporting" @click="exportSpreadsheet">导出 .xlsx</n-button>
          </header>
          <p v-if="exportError" class="error-banner" role="alert">
            {{ exportError }}
          </p>
          <spreadsheet-editor :key="active.id" ref="editor" :cells="active.cells" />
        </template>

        <section v-else class="empty-view">
          <document-icon class="empty-document-icon" />
          <h1>新建第一份文档</h1>
          <n-button type="primary" @click="modalOpen = true">新建文档</n-button>
        </section>
      </main>
    </div>
  </n-layout>

  <create-document-dialog v-model:show="modalOpen" @create="create" />
</template>

<style scoped>
.workspace {
  display: flex;
  width: 100%;
  min-height: 100vh;
}

.topbar,
.document-heading {
  display: flex;
  align-items: center;
}

.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.topbar {
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 4.6rem;
  padding: 0.75rem clamp(0.65rem, 3vw, 1.7rem);
  border-bottom: 1px solid #dce4df;
  background: #fff;
}
.document-heading {
  gap: 0.7rem;
  min-width: 0;
}
.document-heading h1 {
  margin: 0;
  font-size: 1.15rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.document-heading p {
  margin: 0.16rem 0 0;
  color: #596a60;
  font-size: 0.8125rem;
}
.topbar button {
  flex: none;
}

.empty-view {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.95rem;
  flex: 1;
  min-height: 55vh;
  padding: 1.5rem;
  text-align: center;
}
.empty-view h1 {
  margin: 0;
  font-size: 1.45rem;
}
.empty-view p {
  margin: 0;
  color: #53665b;
}
.empty-document-icon {
  width: 2.75rem;
  height: 2.75rem;
}

.error-banner {
  margin: 0;
  color: #9c2f39;
  font-size: 0.875rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #f0d5d9;
}

@media (max-width: 650px) {
  .workspace {
    flex-direction: column;
  }
}
</style>
