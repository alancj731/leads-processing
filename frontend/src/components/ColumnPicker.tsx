interface ColumnPickerProps {
  columns: string[]
  allColumns: string[]
  rows: Record<string, string>[]
  selected: string | null
  onSelect: (col: string) => void
}

export function ColumnPicker({
  columns,
  allColumns,
  rows,
  selected,
  onSelect,
}: ColumnPickerProps) {
  const showAll = columns.length === 0
  const displayColumns = showAll ? allColumns : columns

  const labelText = showAll
    ? 'No phone column detected — please select one'
    : columns.length === 1
      ? 'Detected phone column'
      : 'Multiple phone columns detected — choose one'

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">
        {labelText}
      </label>
      <div className="rounded-2xl bg-bg-secondary overflow-hidden divide-y divide-border-light">
        {displayColumns.map((col) => (
          <button
            key={col}
            type="button"
            onClick={() => onSelect(col)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ${
              selected === col
                ? 'bg-blue-light'
                : 'hover:bg-[#ededf0]'
            }`}
          >
            {/* Check circle */}
            <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors duration-150 ${
              selected === col
                ? 'border-blue bg-blue'
                : 'border-border'
            }`}>
              {selected === col && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className={`text-sm font-medium ${
                selected === col ? 'text-blue' : 'text-text-primary'
              }`}>
                {col}
              </span>
              <p className="text-xs text-text-tertiary mt-0.5 truncate">
                {rows
                  .slice(0, 3)
                  .map((r) => r[col])
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
