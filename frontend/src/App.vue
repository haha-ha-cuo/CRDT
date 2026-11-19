<script setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { NButton, NConfigProvider, NSpin, zhCN } from 'naive-ui'
import * as Y from 'yjs'
import CreateDocumentDialog from './CreateDocumentDialog.vue'
import { openWorkspace } from './collaboration'
import { workbookRows } from './spreadsheet'

const SpreadsheetEditor = defineAsyncComponent(() => import('./SpreadsheetEditor.vue'))

const theme = {
  common: {
    primaryColor: '#24704d',
    primaryColorHover: '#31865d',
    primaryColorPressed: '#1b583c',
    primaryColorSuppl: '#31865d',
    borderRadius: '8px',
  },
}

const documents = shallowRef([])
const activeId = ref(null)
const loading = ref(true)
const storageError = ref(false)
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
  <n-config-provider :locale="zhCN" :theme-overrides="theme">
    <div class="workspace">
      <aside class="sidebar" aria-label="文档导航">
        <div class="brand">
          <span class="file-icon file-icon--brand" aria-hidden="true"></span>
          <span>协作文档</span>
        </div>

        <div class="sidebar-heading">
          <h2>我的文档</h2>
          <n-button
            size="small"
            secondary
            type="primary"
            :disabled="loading || storageError"
            @click="modalOpen = true"
          >
            ＋ 新建
          </n-button>
        </div>

        <nav v-if="documents.length" class="document-list" aria-label="文档">
          <button
            v-for="document in documents"
            :key="document.id"
            class="document-link"
            :aria-current="activeId === document.id ? 'page' : undefined"
            @click="choose(document.id)"
          >
            <span class="file-icon file-icon--excel" aria-hidden="true"></span>
            <span class="document-name">{{ document.title }}</span>
          </button>
        </nav>
        <p v-else-if="!loading && !storageError" class="list-empty">还没有文档</p>
      </aside>

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
              <span class="file-icon file-icon--heading" aria-hidden="true"></span>
              <div>
                <h1>{{ active.title }}</h1>
                <p>Excel 表格 · 浏览器本地存储</p>
              </div>
            </div>
            <n-button secondary :loading="exporting" @click="exportSpreadsheet"
              >导出 .xlsx</n-button
            >
          </header>
          <p v-if="exportError" class="error-banner" role="alert">
            {{ exportError }}
          </p>
          <spreadsheet-editor :key="active.id" ref="editor" :cells="active.cells" />
        </template>

        <section v-else class="empty-view">
          <div class="empty-icon" aria-hidden="true">
            <span class="file-icon file-icon--excel"></span>
          </div>
          <h1>新建第一份文档</h1>
          <n-button type="primary" @click="modalOpen = true">新建文档</n-button>
        </section>
      </main>
    </div>

    <create-document-dialog v-model:show="modalOpen" @create="create" />
  </n-config-provider>
</template>
