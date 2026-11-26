import type { Key, ReactNode } from "react"
import "../GlassCard.css"
import "./GlassTable.css"

export interface GlassTableColumn<Row> {
  key: string
  label: string
  render: (row: Row) => ReactNode
}

interface GlassTableProps<Row> {
  label: string
  columns: GlassTableColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row) => Key
  controls?: ReactNode
  footer?: ReactNode
  empty?: ReactNode
}

export function GlassTable<Row>({ label, columns, rows, rowKey, controls, footer, empty }: GlassTableProps<Row>) {
  return (
    <section className="glass dz-glass-container dz-glass-container--md audit-panel">
      <header className="audit-panel__header">{controls}</header>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The table scroll region needs a keyboard tab stop. */}
      <div className="audit-panel__body custom-scrollbar scrollbar-inline-start" tabIndex={rows.length ? 0 : undefined} role="region" aria-label={label}>
        {rows.length ? (
          <table className="audit-table" aria-label={label}>
            <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}</tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => <td key={column.key}>{column.render(row)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        ) : empty}
      </div>
      <footer className="audit-panel__footer">{footer}</footer>
    </section>
  )
}
