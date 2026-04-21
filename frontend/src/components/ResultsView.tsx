import { useState } from 'react'
import type { DedupResult } from '../lib/api'
import { downloadCsv } from '../lib/csvExport'

interface ResultsViewProps {
  result: DedupResult
  franchisor: string
  onReset: () => void
}

function RowTable({
  rows,
  label,
}: {
  rows: Record<string, string>[]
  label: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (rows.length === 0) return null
  const columns = Object.keys(rows[0])

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-sm text-blue font-medium hover:underline transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {expanded ? `Hide ${label}` : `Show ${label} (${rows.length})`}
      </button>
      {expanded && (
        <div className="mt-3 max-h-64 overflow-auto rounded-2xl bg-bg-secondary">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-bg-secondary">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left font-semibold text-text-tertiary border-b border-border-light"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-border-light/60 last:border-0">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2 text-text-secondary whitespace-nowrap">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export function ResultsView({ result, franchisor, onReset }: ResultsViewProps) {
  const handleDownload = () => {
    const date = new Date().toISOString().slice(0, 10)
    const safeName = franchisor.replace(/[^a-zA-Z0-9]/g, '_')
    downloadCsv(result.newRows, `${safeName}_deduped_${date}.csv`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-text-primary text-center">
        Results
      </h2>

      {/* Metric cards */}
      <div
        className={`grid gap-3 ${
          result.skipped > 0
            ? 'grid-cols-2 md:grid-cols-4'
            : 'grid-cols-3'
        }`}
      >
        <div className="bg-green-light rounded-2xl p-5 text-center animate-in delay-1">
          <p className="text-3xl font-bold text-green">{result.added}</p>
          <p className="text-xs font-medium text-text-tertiary mt-1">New leads</p>
        </div>
        <div className="bg-orange-light rounded-2xl p-5 text-center animate-in delay-2">
          <p className="text-3xl font-bold text-orange">{result.duplicates}</p>
          <p className="text-xs font-medium text-text-tertiary mt-1">Duplicates</p>
        </div>
        <div className="bg-red-light rounded-2xl p-5 text-center animate-in delay-3">
          <p className="text-3xl font-bold text-red">{result.invalid}</p>
          <p className="text-xs font-medium text-text-tertiary mt-1">Invalid</p>
        </div>
        {result.skipped > 0 && (
          <div className="bg-blue-light rounded-2xl p-5 text-center animate-in delay-4">
            <p className="text-3xl font-bold text-blue">{result.skipped}</p>
            <p className="text-xs font-medium text-text-tertiary mt-1">Over limit</p>
          </div>
        )}
      </div>

      {/* Detail tables */}
      <div className="space-y-3">
        <RowTable rows={result.duplicateRows} label="duplicate rows" />
        <RowTable rows={result.invalidRows} label="invalid phone rows" />
        <RowTable rows={result.skippedRows} label="over-limit rows" />
      </div>

      {/* Actions */}
      {result.newRows.length > 0 && (
        <button
          onClick={handleDownload}
          className="w-full py-3.5 px-6 bg-blue text-white text-base font-semibold rounded-[14px] transition-all duration-200 hover:bg-blue-hover active:scale-[0.98]"
        >
          Download Clean CSV ({result.newRows.length} rows)
        </button>
      )}

      <button
        onClick={onReset}
        className="w-full py-3 px-6 text-blue text-base font-medium rounded-[14px] transition-all duration-200 hover:bg-blue-light active:scale-[0.98]"
      >
        Upload Another File
      </button>
    </div>
  )
}
