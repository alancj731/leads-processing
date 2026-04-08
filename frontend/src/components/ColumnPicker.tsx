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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {showAll
          ? 'No phone column detected — please select one:'
          : columns.length === 1
            ? 'Detected phone column:'
            : 'Multiple phone columns detected — choose one:'}
      </label>
      <div className="space-y-2">
        {displayColumns.map((col) => (
          <label
            key={col}
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selected === col
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="phoneColumn"
              value={col}
              checked={selected === col}
              onChange={() => onSelect(col)}
              className="mt-1"
            />
            <div>
              <span className="font-medium">{col}</span>
              <p className="text-xs text-gray-500 mt-1">
                {rows
                  .slice(0, 3)
                  .map((r) => r[col])
                  .join(', ')}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
