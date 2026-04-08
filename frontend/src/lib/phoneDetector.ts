function looksLikePhone(val: string): boolean {
  const digits = val.replace(/[\s\-().\+]/g, '')
  return /^\d{10,11}$/.test(digits)
}

export function detectPhoneColumns(
  headers: string[],
  rows: Record<string, string>[],
): string[] {
  const sampleSize = Math.min(rows.length, 20)
  if (sampleSize === 0) return []

  const candidates: string[] = []

  for (const header of headers) {
    let phoneCount = 0
    for (let i = 0; i < sampleSize; i++) {
      const val = rows[i][header]?.trim() ?? ''
      if (val && looksLikePhone(val)) phoneCount++
    }
    if (phoneCount / sampleSize > 0.6) {
      candidates.push(header)
    }
  }

  return candidates
}
