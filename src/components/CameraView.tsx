import React, { useEffect, useRef, useState } from 'react'

type Props = {
  onCapture: (blob: Blob, thumbDataUrl: string) => void
}

export default function CameraView({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [streamErr, setStreamErr] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let stream: MediaStream
    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
      } catch (e: any) {
        setStreamErr(e?.message || 'Camera unavailable')
      }
    }
    init()
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [])

  function capture() {
    const video = videoRef.current!
    const canvas = document.createElement('canvas')
    // capture at video size
    const w = video.videoWidth, h = video.videoHeight
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, w, h)
    canvas.toBlob(async (blob) => {
      if (!blob) return
      // create thumbnail
      const thumb = document.createElement('canvas')
      const scale = 320 / Math.max(w, h)
      thumb.width = Math.round(w * scale); thumb.height = Math.round(h * scale)
      const tctx = thumb.getContext('2d')!
      tctx.drawImage(video, 0, 0, w, h, 0, 0, thumb.width, thumb.height)
      const thumbUrl = thumb.toDataURL('image/jpeg', 0.7)
      onCapture(blob, thumbUrl)
    }, 'image/jpeg', 0.9)
  }

  function fileFallback(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0]
    if (!f) return
    const img = new Image()
    const url = URL.createObjectURL(f)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const w = img.width, h = img.height
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      canvas.toBlob(b => {
        if (!b) return
        const t = document.createElement('canvas')
        const scale = 320 / Math.max(w, h)
        t.width = Math.round(w * scale); t.height = Math.round(h * scale)
        t.getContext('2d')!.drawImage(img, 0, 0, w, h, 0, 0, t.width, t.height)
        onCapture(b, t.toDataURL('image/jpeg', 0.7))
        URL.revokeObjectURL(url)
      }, 'image/jpeg', 0.9)
    }
    img.src = url
  }

  return (
    <div className="card capture">
      {ready ? <video ref={videoRef} playsInline muted /> : <div style={{padding:16}}>Initializing camera…</div>}
      {streamErr && (
        <div style={{padding:16}}>
          <p>Camera error: {streamErr}</p>
          <input type="file" accept="image/*" capture="environment" onChange={fileFallback}/>
        </div>
      )}
      <div className="footer row" style={{justifyContent:'space-between'}}>
        <input type="file" accept="image/*" capture="environment" onChange={fileFallback} className="ghost"/>
        <button className="primary" onClick={capture} disabled={!ready}>Snap</button>
      </div>
    </div>
  )
}
