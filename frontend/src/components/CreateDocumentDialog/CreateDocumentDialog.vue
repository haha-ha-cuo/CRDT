<script setup>
import { computed, ref, watch } from 'vue'
import { NButton, NInput, NModal } from 'naive-ui'
import DocumentIcon from '../DocumentIcon/DocumentIcon.vue'

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
        <document-icon variant="heading" />
        <span><strong>Excel 表格</strong><small>单元格和公式</small></span>
      </button>
      <button type="button" class="type-option" disabled>
        <document-icon variant="word" />
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

<style scoped>
:global(.create-modal) {
  width: min(31rem, calc(100vw - 2rem));
}
.type-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
}
.type-option {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 7.2rem;
  padding: 0.75rem;
  text-align: left;
  background: #fff;
  border: 1px solid #dce4df;
  border-radius: 0.55rem;
  color: #24312a;
  cursor: pointer;
}
.type-option:not(:disabled):hover,
.type-option:not(:disabled):focus-visible {
  border-color: #24704d;
}
.type-option:disabled {
  color: #687278;
  cursor: default;
}
.type-option small {
  display: block;
  margin-top: 0.14rem;
  font-size: 0.82rem;
}
.create-form {
  display: grid;
  gap: 0.58rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.7rem;
}
.form-error {
  margin: 0;
  color: #9c2f39;
  font-size: 0.875rem;
}
</style>
