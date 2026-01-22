// Open Code adaptation helpers
// Normalize identifiers and export friendly interfaces for open code usage
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, '-')
}

export function ensureAscii(str: string): string {
  return str.replace(/[^\x00-\x7F]/g, '?')
}
