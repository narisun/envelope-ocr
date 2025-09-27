import type { EnvelopeRow } from './store'

function htmlEscape(s: string | undefined) {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatPlain(r: EnvelopeRow) {
  const parts = [
    new Date(r.scannedAt).toLocaleString(),
    r.name ?? '',
    r.code,
    r.street ?? '',
    r.city ?? '',
    r.state ?? '',
    r.zip ?? '',
    (r.confCode ?? 0).toFixed(2),
    (r.confAddr ?? 0).toFixed(2),
    r.addressRaw
  ]
  return parts.join('\t')
}

export function rowsToHTMLTable(rows: EnvelopeRow[]) {
  const headers = ['Scanned at','Name','Code','Street','City','State','ZIP','Conf(code)','Conf(addr)','Address raw']
  const headerHtml = headers.map(h => `<th>${h}</th>`).join('')
  const body = rows.map(r => `
    <tr>
      <td>${htmlEscape(new Date(r.scannedAt).toLocaleString())}</td>
      <td>${htmlEscape(r.name)}</td>
      <td>${htmlEscape(r.code)}</td>
      <td>${htmlEscape(r.street)}</td>
      <td>${htmlEscape(r.city)}</td>
      <td>${htmlEscape(r.state)}</td>
      <td>${htmlEscape(r.zip)}</td>
      <td>${htmlEscape((r.confCode ?? 0).toFixed(2))}</td>
      <td>${htmlEscape((r.confAddr ?? 0).toFixed(2))}</td>
      <td>${htmlEscape(r.addressRaw)}</td>
    </tr>`).join('')
  return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${body}</tbody></table>`
}

export async function copyRowsAsHTMLTable(rows: EnvelopeRow[]) {
  const html = rowsToHTMLTable(rows)
  const text = rows.map(formatPlain).join('\n')

  const clipboard = navigator.clipboard
  const ClipboardItemCtor = typeof window !== 'undefined' ? (window as any).ClipboardItem : undefined

  if (clipboard?.write && ClipboardItemCtor) {
    const item = new ClipboardItemCtor({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([text], { type: 'text/plain' })
    })
    await clipboard.write([item])
    return
  }
  if (clipboard?.writeText) {
    await clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}
