import React, { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, Result } from '@zxing/browser'

type Props = { onQrDetected: (content: string) => void }

export default function QRCapture({ onQrDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader()
    return () => { try { controlsRef.current?.stop() } catch {} }
  }, [])

  async function startScan() {
    setErr(null); setScanning(true)
    const reader = readerRef.current!
    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices()
      const preferred = devices.find(d => /back|rear|environment/i.test(d.label))?.deviceId
      controlsRef.current = await reader.decodeFromVideoDevice(
        preferred ?? null,
        videoRef.current!,
        (result: Result | undefined, _err, controls) => {
          if (result) {
            onQrDetected(result.getText())
            controls.stop()
            setScanning(false)
          }
        }
      )
    } catch (e:any) {
      setErr(e?.message || 'QR scan failed')
      setScanning(false)
    }
  }

  function stopScan() {
    try { controlsRef.current?.stop() } catch {}
    setScanning(false)
  }

  return (
    <div className="card">
      <div className="row" style={{justifyContent:'space-between'}}>
        <strong>Step 2: Scan QR Code</strong>
        {!scanning
          ? <button className="primary" onClick={startScan}>Start scanning</button>
          : <button className="ghost" onClick={stopScan}>Stop</button>}
      </div>
      <video ref={videoRef} style={{width:'100%', borderRadius:12, marginTop:12}} playsInline muted />
      {err && <p style={{color:'#fca5a5'}}>{err}</p>}
      <p className="badge">Tip: center the QR; hold steady.</p>
    </div>
  )
}
