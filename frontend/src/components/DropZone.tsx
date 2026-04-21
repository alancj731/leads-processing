import { useCallback, useRef, useState } from 'react'
import Papa from 'papaparse'

interface ParsedCsv {
  headers: string[]
  rows: Record<string, string>[]
}

interface DropZoneProps {
  onParsed: (data: ParsedCsv) => void
}

export function DropZone({ onParsed }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (!results.meta.fields || results.meta.fields.length === 0) {
            setError('CSV has no columns')
            return
          }
          if (results.data.length === 0) {
            setError('CSV has no data rows')
            return
          }
          onParsed({
            headers: results.meta.fields,
            rows: results.data,
          })
        },
        error: () => {
          setError('Failed to parse CSV')
        },
      })
    },
    [onParsed],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`rounded-2xl p-14 text-center cursor-pointer transition-all duration-300 ${
        isDragging
          ? 'bg-blue-light scale-[1.01]'
          : 'apple-card-flat hover:bg-[#ededf0]'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      <div className="mb-4">
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl transition-colors duration-300 ${
          isDragging ? 'bg-blue' : 'bg-[#e2e2e7]'
        }`}>
          <svg
            className={`w-7 h-7 transition-colors duration-300 ${
              isDragging ? 'text-white' : 'text-text-secondary'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>
      </div>

      <p className="text-base font-semibold text-text-primary">
        Drop a CSV file here
      </p>
      <p className="text-sm text-text-tertiary mt-1">
        or click to browse
      </p>

      {error && (
        <p className="text-sm text-red mt-4 font-medium">{error}</p>
      )}
    </div>
  )
}
