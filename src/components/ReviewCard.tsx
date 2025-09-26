import React, { useEffect, useState } from 'react'
import { ocrCode, ocrAddress } from '../lib/ocr'
import { parseUSAddress } from '../lib/address'

type Props = {
  blob: Blob
  thumbDataUrl: string
  onSave: (row: {
    code: string
    addressRaw: string
    street?: string
    city?: string
    state?: string
    zip?: string
    confCode: number
    confAddr: number
  }) => void
}

export default function ReviewCard({ blob, thumbDataUrl, onSave }: Props) {
  const [code, setCode] = useState('')
  const [address, setAddress] = useState('')
  const [confCode, setConfCode] = useState(0)
  const [confAddr, setConfAddr] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ;(async () => {
      setBusy(true)
      try {
        const [c, a] = await Promise.all([ocrCode(blob), ocrAddress(blob)])
        setCode(c.text)
        setConfCode(c.confidence || 0)
        setAddress(a.text)
        setConfAddr(a.confidence || 0)
      } finally {
        setBusy(false)
      }
    })()
  }, [blob])

  function reOcrCode() {
    setBusy(true)
    ocrCode(blob).then(c => { setCode(c.text); setConfCode(c.confidence || 0) }).finally(() => setBusy(false))
  }
  function reOcrAddr() {
    setBusy(true)
    ocrAddress(blob).then(a => { setAddress(a.text); setConfAddr(a.confidence || 0) }).finally(() => setBusy(false))
  }

  function save() {
    const parsed = parseUSAddress(address)
    onSave({
      code: code.toUpperCase().replace(/\s+/g, ''),
      addressRaw: address,
      street: parsed.street,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      confCode,
      confAddr
    })
  }

  const badge = (v:number) => v >= 0.9 ? 'ok' : v >= 0.75 ? 'warn' : 'err'

  return (
    <div className="grid" style={{gap:16}}>
      <div className="row" style={{gap:16, alignItems:'flex-start'}}>
        {thumbDataUrl && <img src={thumbDataUrl} alt="thumb" style={{width:120, height:'auto', borderRadius:12, border:'1px solid #1f2937'}}/>}
        <div style={{flex:1}} className="grid">
          <div className="card">
            <div className="row" style={{justifyContent:'space-between'}}>
              <strong>Code</strong>
              <span className={`badge ${badge(confCode)}`}>conf {(confCode*100|0)}%</span>
            </div>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="ABC123" style={{marginTop:8,fontSize:18,fontWeight:700,letterSpacing:1}}/>
            <div className="row" style={{justifyContent:'flex-end'}}>
              <button className="ghost" onClick={reOcrCode} disabled={busy}>Re-OCR code</button>
            </div>
          </div>
          <div className="card">
            <div className="row" style={{justifyContent:'space-between'}}>
              <strong>Address</strong>
              <span className={`badge ${badge(confAddr)}`}>conf {(confAddr*100|0)}%</span>
            </div>
            <textarea rows={5} value={address} onChange={e => setAddress(e.target.value)} placeholder={"123 Main St\nPrinceton, NJ 08540"} style={{marginTop:8}}/>
            <div className="row" style={{justifyContent:'flex-end'}}>
              <button className="ghost" onClick={reOcrAddr} disabled={busy}>Re-OCR address</button>
            </div>
          </div>
          <div className="row" style={{justifyContent:'space-between'}}>
            <span className="badge">Validate, then Save to table</span>
            <button className="primary" onClick={save} disabled={busy || !code || !address}>Save row</button>
          </div>
        </div>
      </div>
    </div>
  )
}
