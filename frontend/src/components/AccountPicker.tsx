import { useState } from 'react'
import type { Account } from '../lib/api'

interface AccountPickerProps {
  franchisor: string
  accounts: Account[]
  selected: string | null
  onSelect: (id: string | null) => void
  onCreate: (name: string) => Promise<void>
}

const CREATE_OPTION = '__create__'

export function AccountPicker({
  franchisor,
  accounts,
  selected,
  onSelect,
  onCreate,
}: AccountPickerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!franchisor) return null

  const selectValue = isCreating ? CREATE_OPTION : (selected ?? '')

  const handleChange = (value: string) => {
    setError(null)
    if (value === CREATE_OPTION) {
      setIsCreating(true)
      return
    }
    setIsCreating(false)
    setNewName('')
    onSelect(value === '' ? null : value)
  }

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    setError(null)
    try {
      await onCreate(name)
      setIsCreating(false)
      setNewName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create account')
    } finally {
      setBusy(false)
    }
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewName('')
    setError(null)
  }

  return (
    <div>
      <label
        htmlFor="account"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Account{' '}
        <span className="font-normal text-gray-500">
          (optional — leave blank to dedupe across the whole franchisor)
        </span>
      </label>
      <select
        id="account"
        value={selectValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">— No account —</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
        <option value={CREATE_OPTION}>+ New account…</option>
      </select>

      {isCreating && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New account name"
            autoFocus
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') handleCancelCreate()
            }}
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={busy || !newName.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create'}
          </button>
          <button
            type="button"
            onClick={handleCancelCreate}
            disabled={busy}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </div>
  )
}
