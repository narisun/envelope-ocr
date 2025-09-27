import React, { useState } from 'react'
import AddressCapture from './components/AddressCapture'
import QRCapture from './components/QRCapture'
import TableView from './components/TableView'
import { useApp } from './lib/store'

function uuid() { return crypto.randomUUID?.() || Math.random().toString(36).slice(2) }

export default function App() {
  const addRow = useApp(s => s.addRow)
  const [addr, setAddr] = useState<null | {
    name: string
    addressRaw: string
    street?: string
    city?: string
    state?: string
    zip?: string
    confAddr: number
  }>(null)
  const [qr, setQr] = useState<string>('')

  function onAddressDone(a: any) {
    setAddr(a)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function onQrDetected(content: string) {
    setQr(content)
  }
  function saveRow() {
    if (!addr) return
    addRow({
      id: uuid(),
      scannedAt: new Date().toISOString(),
      code: qr,
      addressRaw: addr.addressRaw,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      confCode: 1,
      confAddr: addr.confAddr,
      imageThumb: undefined
    })
    alert('Saved mapping (Name+Address+QR)')
    setAddr(null); setQr('')
  }

  return (
    <div className="container grid" style={{gap:16}}>
      <header className="row" style={{justifyContent:'space-between'}}>
        <h1>📦 Envelope OCR</h1>
        <a href="." className="badge">PWA – works offline</a>
      </header>

      {!addr && <AddressCapture onAddressDone={onAddressDone} />}
      {addr && (
        <div className="grid" style={{gap:16}}>
          <div className="card grid" style={{gap:8}}>
            <strong>Address ready</strong>
            <div><span className="badge">Name</span><div>{addr.name}</div></div>
            <div><span className="badge">Address</span><pre style={{whiteSpace:'pre-wrap'}}>{addr.addressRaw}</pre></div>
          </div>
          <QRCapture onQrDetected={onQrDetected} />
          <div className="card grid" style={{gap:8}}>
            <label>QR content (editable)</label>
            <input value={qr} onChange={e=>setQr(e.target.value)} placeholder="QR code content"/>
            <div className="row" style={{justifyContent:'flex-end'}}>
              <button className="primary" onClick={saveRow} disabled={!qr}>Save mapping</button>
            </div>
          </div>
        </div>
      )}

      <TableView />

      <footer style={{opacity:0.7}}>
        <p>Privacy: address OCR & QR reading happen in your browser. Data auto-deletes after 24 hours.</p>
      </footer>
    </div>
  )
}