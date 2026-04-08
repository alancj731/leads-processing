import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { DropZone } from '../components/DropZone'
import { ColumnPicker } from '../components/ColumnPicker'
import { FranchisorInput } from '../components/FranchisorInput'
import { ResultsView } from '../components/ResultsView'
import { detectPhoneColumns } from '../lib/phoneDetector'
import { deduplicateLeads, type DedupResult } from '../lib/api'

export const Route = createFileRoute('/')({
  component: HomePage,
})

type AppState = 'upload' | 'configure' | 'processing' | 'results'

function HomePage() {
  const [state, setState] = useState<AppState>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [phoneCandidates, setPhoneCandidates] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [franchisor, setFranchisor] = useState('')
  const [result, setResult] = useState<DedupResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCsvParsed = (data: {
    headers: string[]
    rows: Record<string, string>[]
  }) => {
    setHeaders(data.headers)
    setRows(data.rows)
    const candidates = detectPhoneColumns(data.headers, data.rows)
    setPhoneCandidates(candidates)
    if (candidates.length === 1) {
      setSelectedColumn(candidates[0])
    }
    setState('configure')
  }

  const handleProcess = async () => {
    if (!selectedColumn || !franchisor.trim()) return
    setState('processing')
    setError(null)
    try {
      const res = await deduplicateLeads({
        franchisor: franchisor.trim(),
        phoneColumn: selectedColumn,
        rows,
      })
      setResult(res)
      setState('results')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setState('configure')
    }
  }

  const handleReset = () => {
    setState('upload')
    setHeaders([])
    setRows([])
    setPhoneCandidates([])
    setSelectedColumn(null)
    setFranchisor('')
    setResult(null)
    setError(null)
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Lead Deduplication
      </h1>

      {state === 'upload' && <DropZone onParsed={handleCsvParsed} />}

      {state === 'configure' && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            {rows.length} rows loaded from CSV
          </p>

          <ColumnPicker
            columns={phoneCandidates}
            allColumns={headers}
            rows={rows}
            selected={selectedColumn}
            onSelect={setSelectedColumn}
          />

          <FranchisorInput value={franchisor} onChange={setFranchisor} />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleProcess}
            disabled={!selectedColumn || !franchisor.trim()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Process
          </button>

          <button
            onClick={handleReset}
            className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Start over
          </button>
        </div>
      )}

      {state === 'processing' && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-4" />
          <p className="text-gray-600">Processing...</p>
        </div>
      )}

      {state === 'results' && result && (
        <ResultsView
          result={result}
          franchisor={franchisor}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
