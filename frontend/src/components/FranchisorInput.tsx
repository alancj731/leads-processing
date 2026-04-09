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
        className="block text-sm font-medium text-text-secondary mb-2"
      >
        Franchisor
      </label>
      <select
        id="franchisor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-bg-secondary border-none rounded-2xl text-sm font-medium text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue focus:bg-white pr-10"
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
