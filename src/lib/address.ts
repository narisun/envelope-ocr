export type ParsedAddress = {
  street?: string
  city?: string
  state?: string
  zip?: string
}

const STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
])

export function parseUSAddress(addr: string): ParsedAddress {
  const lines = addr.split(/\n|\r|\r\n/).map(s => s.trim()).filter(Boolean)
  let street = lines[0] || ''
  let city = '', state = '', zip = ''

  // Find line that looks like "City, ST 12345" or "City ST 12345"
  for (const line of lines.slice(1)) {
    const m = line.match(/^(.*?)[,\s]+([A-Z]{2})[,\s]+(\d{5}(?:-\d{4})?)$/i)
    if (m) {
      city = m[1].trim()
      state = m[2].toUpperCase()
      zip = m[3]
      break
    }
  }

  // Fallbacks
  if (!zip) {
    const m = addr.match(/(\d{5}(?:-\d{4})?)/)
    if (m) zip = m[1]
  }
  if (!state) {
    const m = addr.toUpperCase().match(/\b([A-Z]{2})\b/)
    if (m && STATES.has(m[1])) state = m[1]
  }
  if (!city && state) {
    const idx = addr.toUpperCase().indexOf(state)
    if (idx > 0) {
      const before = addr.slice(0, idx).split(/\n|\r|,/).pop()?.trim() || ''
      city = before
    }
  }

  return { street, city, state, zip }
}
