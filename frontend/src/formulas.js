import FormulaParser from 'fast-formula-parser'
import {
  address,
  columnCount,
  formulaFor,
  literal,
  rowCount,
  worksheetName,
} from './spreadsheet.js'

const { FormulaError } = FormulaParser

export function calculate(cells) {
  const results = new Map()
  const resolving = new Set()
  const parsers = []

  function verifySheet(sheet) {
    if (sheet && sheet.toLowerCase() !== worksheetName.toLowerCase()) throw FormulaError.REF
  }

  function cellValue({ row, col, sheet }) {
    verifySheet(sheet)
    if (row < 1 || row > rowCount || col < 1 || col > columnCount) return null
    const key = address(row, col)
    if (results.has(key)) return results.get(key)

    const raw = cells.get(key)
    if (!raw) return null
    const formula = formulaFor(raw)
    if (!formula) {
      const value = literal(raw)
      results.set(key, value)
      return value
    }

    if (resolving.has(key) || resolving.size >= 32) throw FormulaError.REF
    const depth = resolving.size
    resolving.add(key)
    try {
      // Each active formula needs its own parser while resolving cell references.
      parsers[depth] ??= new FormulaParser({
        onCell: cellValue,
        onRange: rangeValues,
      })
      const value = parsers[depth].parse(formula, {
        row,
        col,
        sheet: worksheetName,
      })
      results.set(key, value)
      return value
    } catch (error) {
      const cause = error?.details instanceof FormulaError ? error.details : error
      const value = cause instanceof FormulaError ? cause : FormulaError.VALUE
      results.set(key, value)
      return value
    } finally {
      resolving.delete(key)
    }
  }

  function rangeValues({ from, to, sheet }) {
    verifySheet(sheet)
    const values = []
    for (let row = from.row; row <= Math.min(to.row, rowCount); row++) {
      const valuesInRow = []
      for (let col = from.col; col <= Math.min(to.col, columnCount); col++) {
        valuesInRow.push(cellValue({ row, col, sheet }))
      }
      if (valuesInRow.length) values.push(valuesInRow)
    }
    return values
  }

  for (const key of cells.keys()) {
    const col = key.charCodeAt(0) - 64
    const row = Number(key.slice(1))
    cellValue({ row, col })
  }
  return results
}

export function display(value) {
  if (value instanceof FormulaError) return value.error
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  return value ?? ''
}
