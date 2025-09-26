import type { EnvelopeRow } from './store'

export function cleanupOldRows(rows: EnvelopeRow[], hours: number): EnvelopeRow[] {
  const cutoff = Date.now() - hours * 3600_000
  return rows.filter(r => new Date(r.scannedAt).getTime() >= cutoff)
}
