import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { DropZone } from '../components/DropZone'
import { ColumnPicker } from '../components/ColumnPicker'
import { FranchisorInput } from '../components/FranchisorInput'
import { AccountPicker } from '../components/AccountPicker'
import { ResultsView } from '../components/ResultsView'
import { detectPhoneColumns } from '../lib/phoneDetector'
import {
  deduplicateLeads,
  listAccounts,
  createAccount,
  type Account,
  type DedupResult,
} from '../lib/api'

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
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState<string | null>(null)
  const [result, setResult] = useState<DedupResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAccountId(null)
    setAccounts([])
    if (!franchisor) return
    let cancelled = false
    listAccounts(franchisor)
      .then((list) => {
        if (!cancelled) setAccounts(list)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Failed to load accounts',
          )
        }
      })
    return () => {
      cancelled = true
    }
  }, [franchisor])

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

  const handleCreateAccount = async (name: string) => {
    const created = await createAccount({ name, franchisor })
    setAccounts((prev) =>
      prev.some((a) => a.id === created.id)
        ? prev
        : [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
    )
    setAccountId(created.id)
  }

  const handleProcess = async () => {
    if (!selectedColumn || !franchisor.trim()) return
    setState('processing')
    setError(null)
    try {
      const res = await deduplicateLeads({
        franchisor: franchisor.trim(),
        accountId,
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
    setAccounts([])
    setAccountId(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
      {/* Header */}
      <div className="text-center mb-12 animate-in">
        <h1 className="text-[40px] font-semibold tracking-tight text-text-primary leading-tight">
          Lead Dedup
        </h1>
        <p className="text-lg text-text-tertiary mt-2 font-light">
          Upload. Deduplicate. Download.
        </p>
      </div>

      {/* Upload */}
      {state === 'upload' && (
        <div className="animate-in delay-1">
          <DropZone onParsed={handleCsvParsed} />
        </div>
      )}

      {/* Configure */}
      {state === 'configure' && (
        <div className="space-y-6 animate-in delay-1">
          <div className="apple-card-flat px-5 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green" />
            <p className="text-sm text-text-secondary">
              <span className="font-semibold text-text-primary">{rows.length} rows</span> loaded
              <span className="mx-1.5 text-border">·</span>
              <span className="font-semibold text-text-primary">{headers.length} columns</span> detected
            </p>
          </div>

          <ColumnPicker
            columns={phoneCandidates}
            allColumns={headers}
            rows={rows}
            selected={selectedColumn}
            onSelect={(col) => setSelectedColumn(col || null)}
          />

          <FranchisorInput value={franchisor} onChange={setFranchisor} />

          <AccountPicker
            franchisor={franchisor}
            accounts={accounts}
            selected={accountId}
            onSelect={setAccountId}
            onCreate={handleCreateAccount}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleProcess}
            disabled={!selectedColumn || !franchisor.trim()}
            className="w-full py-3.5 px-6 bg-blue text-white text-base font-semibold rounded-[14px] transition-all duration-200 hover:bg-blue-hover active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            Process
          </button>

          <button
            onClick={handleReset}
            className="w-full py-3 px-6 text-blue text-base font-medium rounded-[14px] transition-all duration-200 hover:bg-blue-light active:scale-[0.98]"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Processing */}
      {state === 'processing' && (
        <div className="text-center py-20 animate-in delay-1">
          <div className="apple-spinner mx-auto mb-5" />
          <p className="text-lg font-medium text-text-primary">
            Processing
          </p>
          <p className="text-sm text-text-tertiary mt-1">
            Deduplicating {rows.length} records...
          </p>
        </div>
      )}

      {/* Results */}
      {state === 'results' && result && (
        <div className="animate-in delay-1">
          <ResultsView
            result={result}
            franchisor={franchisor}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  )
}
