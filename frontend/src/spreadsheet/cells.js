export const rowCount = 40
export const columnCount = 16
export const worksheetName = 'Sheet1'

export function columnLabel(column) {
  return String.fromCharCode(64 + column)
}

export function address(row, column) {
  return `${columnLabel(column)}${row}`
}

export function formulaFor(raw) {
  return raw?.startsWith('=') ? raw.slice(1) : ''
}

export function literal(raw) {
  if (!raw) return null
  if (raw.startsWith("'")) return raw.slice(1)
  if (/^true$/i.test(raw)) return true
  if (/^false$/i.test(raw)) return false
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw) && Number.isFinite(Number(raw))) {
    return Number(raw)
  }
  return raw
}

export function workbookRows(cells) {
  return Array.from({ length: rowCount }, (_, row) =>
    Array.from({ length: columnCount }, (_, col) => {
      const raw = cells.get(address(row + 1, col + 1))
      const formula = formulaFor(raw)
      return formula ? { type: 'Formula', value: formula } : literal(raw)
    }),
  )
}
