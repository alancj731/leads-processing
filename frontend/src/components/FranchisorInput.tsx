const FRANCHISORS = ['CertaPro', 'FCI'] as const

interface FranchisorInputProps {
  value: string
  onChange: (val: string) => void
}

export function FranchisorInput({ value, onChange }: FranchisorInputProps) {
  return (
    <div>
      <label
        htmlFor="franchisor"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Franchisor
      </label>
      <select
        id="franchisor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select a franchisor...</option>
        {FRANCHISORS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
    </div>
  )
}
