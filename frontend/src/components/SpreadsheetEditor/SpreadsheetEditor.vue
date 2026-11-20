<script setup>
import IconMathFunction from '@tabler/icons-vue/icons/IconMathFunction'
import { computed, nextTick, onBeforeUnmount, ref, shallowRef } from 'vue'
import * as Y from 'yjs'
import { calculate, display } from '../../spreadsheet/formulas.js'
import {
  address,
  columnCount,
  columnLabel,
  rowCount,
  worksheetName,
} from '../../spreadsheet/cells.js'

const props = defineProps({ cells: { type: Object, required: true } })
const sheet = ref(null)
const snapshot = shallowRef(new Map(props.cells))
const active = ref({ row: 1, col: 1 })
const cellDraft = ref(null)
const formulaDraft = ref(null)
const editOrigin = Symbol('spreadsheet edit')
const undo = new Y.UndoManager(props.cells, {
  trackedOrigins: new Set([editOrigin]),
})

const activeAddress = computed(() => address(active.value.row, active.value.col))
const raw = computed(() => snapshot.value.get(activeAddress.value) ?? '')
const values = computed(() => calculate(snapshot.value))

function refresh() {
  snapshot.value = new Map(props.cells)
}
props.cells.observe(refresh)
onBeforeUnmount(() => {
  save()
  props.cells.unobserve(refresh)
  undo.destroy()
})

function write(row, col, value) {
  const key = address(row, col)
  if ((props.cells.get(key) ?? '') === value) return
  props.cells.doc.transact(() => {
    if (value === '') props.cells.delete(key)
    else props.cells.set(key, value)
  }, editOrigin)
}

function save() {
  const value = cellDraft.value ?? formulaDraft.value
  cellDraft.value = null
  formulaDraft.value = null
  if (value !== null) write(active.value.row, active.value.col, value)
}
defineExpose({ save })

function focusCell(row = active.value.row, col = active.value.col) {
  active.value = { row, col }
  nextTick(() => sheet.value?.querySelector(`[data-address="${address(row, col)}"]`)?.focus())
}

function select(row, col) {
  if (row === active.value.row && col === active.value.col) return
  save()
  active.value = { row, col }
}

function move(row, col) {
  if (row < 1 || row > rowCount || col < 1 || col > columnCount) return false
  focusCell(row, col)
  return true
}

async function edit(seed = raw.value) {
  cellDraft.value = seed
  await nextTick()
  const input = sheet.value?.querySelector('.cell-editor')
  input?.focus()
  input?.setSelectionRange(seed.length, seed.length)
}

function editKeys(event) {
  if (event.isComposing) return
  const { row, col } = active.value
  if (event.key === 'Escape') {
    event.preventDefault()
    cellDraft.value = null
    formulaDraft.value = null
    focusCell()
  } else if (event.key === 'Enter' || event.key === 'Tab') {
    save()
    if (event.key === 'Enter') {
      event.preventDefault()
      if (!move(row + (event.shiftKey ? -1 : 1), col)) focusCell()
    } else if (move(row, col + (event.shiftKey ? -1 : 1))) {
      event.preventDefault()
    }
  }
}

function cellKeys(event) {
  if (event.isComposing) return
  const { row, col } = active.value
  if (event.metaKey || event.ctrlKey) {
    if (event.key.toLowerCase() === 'z' || event.key.toLowerCase() === 'y') {
      event.preventDefault()
      if (event.shiftKey || event.key.toLowerCase() === 'y') undo.redo()
      else undo.undo()
    }
    return
  }
  if (event.altKey) return

  const moves = {
    ArrowUp: [row - 1, col],
    ArrowDown: [row + 1, col],
    ArrowLeft: [row, col - 1],
    ArrowRight: [row, col + 1],
    Tab: [row, col + (event.shiftKey ? -1 : 1)],
  }
  if (Object.hasOwn(moves, event.key)) {
    if (move(...moves[event.key])) event.preventDefault()
    return
  }
  if (event.key === 'Enter' || event.key === 'F2') {
    event.preventDefault()
    edit()
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    write(row, col, '')
  } else if (event.key.length === 1) {
    event.preventDefault()
    edit(event.key)
  }
}

function paste(event) {
  const text = event.clipboardData.getData('text/plain')
  if (!text) return
  event.preventDefault()
  const { row, col } = active.value
  const records = text.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n')
  props.cells.doc.transact(() => {
    records.slice(0, rowCount - row + 1).forEach((record, rowOffset) => {
      record
        .split('\t')
        .slice(0, columnCount - col + 1)
        .forEach((value, colOffset) => {
          write(row + rowOffset, col + colOffset, value)
        })
    })
  }, editOrigin)
}

function copy(event) {
  if (!event.clipboardData) return
  event.preventDefault()
  event.clipboardData.setData('text/plain', String(display(values.value.get(activeAddress.value))))
}
</script>

<template>
  <div class="spreadsheet">
    <div class="formula-bar">
      <span class="cell-address" aria-label="所选单元格">{{ activeAddress }}</span>
      <label for="cell-formula" class="formula-label" title="公式或值">
        <icon-math-function :size="18" aria-hidden="true" focusable="false" />
      </label>
      <input
        id="cell-formula"
        type="text"
        autocomplete="off"
        spellcheck="false"
        aria-label="公式或值"
        placeholder="输入值或公式，例如 =SUM(A1:A3)"
        :value="formulaDraft ?? raw"
        @input="formulaDraft = $event.target.value"
        @keydown="editKeys"
        @blur="save"
      />
    </div>
    <div ref="sheet" class="grid-scroll">
      <table class="grid" aria-label="Excel 工作表">
        <thead>
          <tr>
            <td></td>
            <th
              v-for="col in columnCount"
              :key="col"
              scope="col"
              :class="{ highlighted: active.col === col }"
            >
              {{ columnLabel(col) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rowCount" :key="row">
            <th scope="row" :class="{ highlighted: active.row === row }">
              {{ row }}
            </th>
            <td
              v-for="col in columnCount"
              :key="col"
              :class="{ selected: active.row === row && active.col === col }"
            >
              <input
                v-if="cellDraft !== null && active.row === row && active.col === col"
                v-model="cellDraft"
                class="cell-editor"
                type="text"
                :aria-label="`编辑 ${address(row, col)}`"
                autocomplete="off"
                spellcheck="false"
                @keydown="editKeys"
                @blur="save"
              />
              <button
                v-else
                type="button"
                class="cell-button"
                :class="{
                  numeric: typeof values.get(address(row, col)) === 'number',
                }"
                :data-address="address(row, col)"
                :aria-label="
                  `${address(row, col)} ${display(values.get(address(row, col)))}`.trim()
                "
                :tabindex="active.row === row && active.col === col ? 0 : -1"
                @focus="select(row, col)"
                @click="select(row, col)"
                @dblclick="edit()"
                @keydown="cellKeys"
                @paste="paste"
                @copy="copy"
              >
                {{ display(values.get(address(row, col))) }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="sheet-tabs">
      <span>{{ worksheetName }}</span>
    </div>
  </div>
</template>

<style scoped src="./SpreadsheetEditor.css"></style>
