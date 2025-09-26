import type { EnvelopeRow } from './store'

function csvEscape(s: string | undefined) {
  if (!s) return ''
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

export function rowsToCSV(rows: EnvelopeRow[]) {
  const headers = ['scanned_at','code','street','city','state','zip','address_raw','conf_code','conf_addr']
  const lines = [headers.join(',')]
  for (const r of rows.slice().reverse()) {
    lines.push([
      r.scannedAt, r.code, r.street, r.city, r.state, r.zip, r.addressRaw,
      (r.confCode ?? 0).toFixed(2), (r.confAddr ?? 0).toFixed(2)
    ].map(csvEscape).join(','))
  }
  return lines.join('\n')
}

export async function shareOrDownloadCSV(csv: string, filename = 'envelopes.csv') {
  const file = new File([csv], filename, { type: 'text/csv' })
  // Try Web Share with files
  // @ts-ignore
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    // @ts-ignore
    await navigator.share({ files: [file], title: 'Daily Envelopes', text: 'Mapping table attached' })
    return
  }
  // Fallback: download
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
