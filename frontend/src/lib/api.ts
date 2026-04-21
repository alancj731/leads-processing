const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:6789'

export interface DedupResult {
  added: number
  duplicates: number
  invalid: number
  skipped: number
  newRows: Record<string, string>[]
  duplicateRows: Record<string, string>[]
  invalidRows: Record<string, string>[]
  skippedRows: Record<string, string>[]
}

export interface Account {
  id: string
  name: string
  franchisor: string
}

export async function deduplicateLeads(payload: {
  franchisor: string
  accountId: string | null
  phoneColumn: string
  rows: Record<string, string>[]
  limit: number | null
}): Promise<DedupResult> {
  const res = await fetch(`${API_BASE}/leads/deduplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`)
  }
  return res.json()
}

export async function listAccounts(franchisor: string): Promise<Account[]> {
  const res = await fetch(
    `${API_BASE}/accounts?franchisor=${encodeURIComponent(franchisor)}`,
  )
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  return res.json()
}

export async function createAccount(payload: {
  name: string
  franchisor: string
}): Promise<Account> {
  const res = await fetch(`${API_BASE}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  return res.json()
}
