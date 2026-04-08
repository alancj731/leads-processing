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
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
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
      <div className="text-gray-500">
        <p className="text-lg font-medium">Drop a CSV file here</p>
        <p className="text-sm mt-1">or click to browse</p>
      </div>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  )
}
