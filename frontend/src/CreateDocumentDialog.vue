<script setup>
import { computed, ref, watch } from 'vue'
import { NButton, NInput, NModal } from 'naive-ui'

const show = defineModel('show', { type: Boolean, required: true })
const emit = defineEmits(['create'])
const naming = ref(false)
const title = ref('')
const titleValid = computed(() => {
  const length = Array.from(title.value.trim()).length
  return length > 0 && length <= 120
})

watch(show, (visible) => {
  if (visible) naming.value = false
})

function nameSpreadsheet() {
  title.value = '未命名表格'
  naming.value = true
}

function create() {
  if (titleValid.value) emit('create', title.value.trim())
}
</script>

<template>
  <n-modal
    v-model:show="show"
    preset="card"
    :title="naming ? '新建 Excel 表格' : '新建文档'"
    class="create-modal"
  >
    <div v-if="!naming" class="type-options">
      <button type="button" class="type-option" @click="nameSpreadsheet">
        <span class="file-icon file-icon--heading" aria-hidden="true"></span>
        <span><strong>Excel 表格</strong><small>单元格和公式</small></span>
      </button>
      <button type="button" class="type-option" disabled>
        <span class="file-icon file-icon--word" aria-hidden="true"></span>
        <span><strong>Word 文档</strong><small>暂未开放</small></span>
      </button>
    </div>

    <form v-else class="create-form" @submit.prevent="create">
      <label for="document-title">表格名称</label>
      <n-input
        v-model:value="title"
        :input-props="{ id: 'document-title' }"
        autofocus
        @focus="$event.target.select()"
      />
      <p v-if="!titleValid" class="form-error">名称需要 1–120 个字符。</p>
      <div class="modal-actions">
        <n-button @click="naming = false">返回</n-button>
        <n-button type="primary" attr-type="submit" :disabled="!titleValid">创建表格</n-button>
      </div>
    </form>
  </n-modal>
</template>
