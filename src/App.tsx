import React, { useState } from 'react'
import CameraView from './components/CameraView'
import ReviewCard from './components/ReviewCard'
import TableView from './components/TableView'
import { useApp } from './lib/store'

function uuid() {
  return crypto.randomUUID?.() || Math.random().toString(36).slice(2)
}

export default function App() {
  const addRow = useApp(s => s.addRow)
  const [lastBlob, setLastBlob] = useState<Blob | null>(null)
  const [thumb, setThumb] = useState<string>('')

  function onCapture(blob: Blob, thumbUrl: string) {
    setLastBlob(blob)
    setThumb(thumbUrl)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function onSave(row: any) {
    addRow({
      id: uuid(),
      scannedAt: new Date().toISOString(),
      code: row.code,
      addressRaw: row.addressRaw,
      street: row.street,
      city: row.city,
      state: row.state,
      zip: row.zip,
      confCode: row.confCode,
      confAddr: row.confAddr,
      imageThumb: thumb
    })
    alert('Saved to table')
    setLastBlob(null)
  }

  return (
    <div className="container grid" style={{gap:16}}>
      <header className="row" style={{justifyContent:'space-between'}}>
        <h1>📦 Envelope OCR</h1>
        <a href="." className="badge">PWA – works offline</a>
      </header>

      <CameraView onCapture={onCapture} />

      {lastBlob && (
        <ReviewCard blob={lastBlob} thumbDataUrl={thumb} onSave={onSave} />
      )}

      <TableView />

      <footer style={{opacity:0.7}}>
        <p>Privacy: photos are processed in your browser. Data is kept locally and **auto-deleted after 24 hours**.</p>
      </footer>
    </div>
  )
}
