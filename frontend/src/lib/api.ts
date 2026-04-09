const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:6789'

export interface DedupResult {
  added: number
  duplicates: number
  invalid: number
  newRows: Record<string, string>[]
  duplicateRows: Record<string, string>[]
  invalidRows: Record<string, string>[]
}

export async function deduplicateLeads(payload: {
  franchisor: string
  phoneColumn: string
  rows: Record<string, string>[]
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
