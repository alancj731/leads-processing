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
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        {expanded ? `Hide ${label}` : `Show ${label} (${rows.length})`}
      </button>
      {expanded && (
        <div className="mt-2 max-h-64 overflow-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 text-left font-medium text-gray-600 border-b"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1.5 text-gray-700">
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Results</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{result.added}</p>
          <p className="text-sm text-green-600">New leads added</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">
            {result.duplicates}
          </p>
          <p className="text-sm text-yellow-600">Duplicates skipped</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{result.invalid}</p>
          <p className="text-sm text-red-600">Invalid phones</p>
        </div>
      </div>

      <RowTable rows={result.duplicateRows} label="duplicate rows" />
      <RowTable rows={result.invalidRows} label="invalid phone rows" />

      {result.newRows.length > 0 && (
        <button
          onClick={handleDownload}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Download clean CSV ({result.newRows.length} rows)
        </button>
      )}
      <button
        onClick={onReset}
        className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Upload another file
      </button>
    </div>
  )
}
