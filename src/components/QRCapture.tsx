import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'

type Props = {
  onQrDetected: (content: string) => void
}

export default function QRCapture({ onQrDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader
    return () => {
      try { codeReaderRef.current?.reset() } catch {}
    }
  }, [])

  async function startScan() {
    setErr(null)
    setScanning(true)
    const reader = codeReaderRef.current!
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices()
      const preferred = devices.find(d => /back|rear|environment/i.test(d.label))?.deviceId || undefined
      const result = await reader.decodeOnceFromVideoDevice(preferred, videoRef.current!)
      onQrDetected(result.getText())
      reader.reset()
      setScanning(false)
    } catch (e: any) {
      setErr(e?.message || 'QR scan failed')
      setScanning(false)
    }
  }

  function stopScan() {
    try { codeReaderRef.current?.reset() } catch {}
    setScanning(false)
  }

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <strong>Step 2: Scan QR Code</strong>
        {!scanning ? <button className="primary" onClick={startScan}>Start scanning</button> : <button className="ghost" onClick={stopScan}>Stop</button>}
      </div>
      <video ref={videoRef} style={{width:'100%', borderRadius:12, marginTop:12}} playsInline muted />
      {err && <p style={{color:'#fca5a5'}}>{err}</p>}
      <p className="badge">Tip: center the QR; hold steady.</p>
    </div>
  )
}