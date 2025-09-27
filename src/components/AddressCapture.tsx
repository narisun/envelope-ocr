import React, { useState } from 'react'
import CameraView from './CameraView'
import { ocrAddress } from '../lib/ocr'
import { parseUSAddress } from '../lib/address'

type Props = {
  onAddressDone: (payload: {
    name: string
    addressRaw: string
    street?: string
    city?: string
    state?: string
    zip?: string
    confAddr: number
  }) => void
}

function extractNameAndAddress(text: string): { name: string, address: string } {
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean)
  if (lines.length === 0) return { name: '', address: '' }
  let cityIdx = -1
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (/[,\s]+[A-Z]{2}[,\s]+\d{5}(-\d{4})?\b/.test(l)) { cityIdx = i; break }
  }
  let name = ''
  let addr = ''
  if (cityIdx >= 0) {
    const streetIdx = Math.max(0, cityIdx - 1)
    const candidateNameIdx = Math.max(0, cityIdx - 2)
    name = lines[candidateNameIdx] || ''
    addr = [lines[streetIdx], lines[cityIdx]].filter(Boolean).join('\n')
  } else {
    name = lines[0] || ''
    addr = lines.slice(1, 3).join('\n')
  }
  return { name, address: addr }
}

export default function AddressCapture({ onAddressDone }: Props) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [confAddr, setConfAddr] = useState(0)
  const [needsRetry, setNeedsRetry] = useState(false)

  async function handleCapture(b: Blob, _thumbUrl: string) {
    setBlob(b); setBusy(true)
    try {
      const a = await ocrAddress(b)
      const { name: n, address: addr } = extractNameAndAddress(a.text)
      setName(n); setAddress(addr); setConfAddr(a.confidence || 0)
      setNeedsRetry((a.confidence || 0) < 0.8)
    } finally {
      setBusy(false)
    }
  }

  function retryCapture() {
    setBlob(null)
    setName('')
    setAddress('')
    setConfAddr(0)
    setNeedsRetry(false)
  }

  function continueNext() {
    const parsed = parseUSAddress(address)
    onAddressDone({
      name: name.trim(),
      addressRaw: address.trim(),
      street: parsed.street,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      confAddr
    })
  }

  return (
    <div className="grid" style={{gap:16}}>
      <h2>Step 1: Capture Name & Address</h2>
      <CameraView onCapture={handleCapture} />
      {blob && (
        <div className="card grid" style={{gap:12}}>
          <div className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
            <strong>Review detected fields</strong>
            <span className="badge">{(confAddr*100|0)}% conf</span>
          </div>
          {needsRetry && (
            <p className="badge warn">Confidence is low. Please re-align the envelope and retry.</p>
          )}
          <label>Recipient Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Doe"/>
          <label>Address (2 lines: street on first, City ST ZIP on second)</label>
          <textarea rows={4} value={address} onChange={e=>setAddress(e.target.value)} placeholder={"123 Main St\nPrinceton, NJ 08540"} />
          <div className="row" style={{justifyContent:'space-between'}}>
            <button className="ghost" onClick={retryCapture} disabled={busy}>Retry capture</button>
            <button className="primary" onClick={continueNext} disabled={!name || !address || busy || needsRetry}>Use this address</button>
          </div>
        </div>
      )}
    </div>
  )
}