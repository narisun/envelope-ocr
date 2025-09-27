import React, { useEffect, useRef, useState, useCallback } from 'react'

type Props = {
  onCapture: (blob: Blob, thumbDataUrl: string) => void
}

function isSafariIOS() {
  const ua = navigator.userAgent
  return /iP(ad|hone|od)/.test(ua) || (ua.includes('Safari') && !ua.includes('Chrome') && /Mac/.test(navigator.platform) && 'ontouchend' in document)
}

export default function CameraView({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setReady(false)
  }, [])

  const startStream = useCallback(async () => {
    setErr(null)
    setReady(false)
    try {
      const constraintsPrimary: MediaStreamConstraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      }
      const constraintsFallback: MediaStreamConstraints = { video: true, audio: false }

      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraintsPrimary)
      } catch {
        stream = await navigator.mediaDevices.getUserMedia(constraintsFallback)
      }
      streamRef.current = stream

      const video = videoRef.current!
      video.setAttribute('playsinline', 'true')
      video.setAttribute('autoplay', 'true')
      video.muted = true
      video.srcObject = stream

      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          video.removeEventListener('loadedmetadata', onLoaded)
          resolve()
        }
        video.addEventListener('loadedmetadata', onLoaded)
      })

      await video.play()

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        await new Promise(r => setTimeout(r, 150))
      }
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        video.srcObject = null
        video.srcObject = stream
        await video.play()
      }

      setReady(true)
    } catch (e: any) {
      setErr(e?.message || 'Camera unavailable')
      stopStream()
    }
  }, [stopStream])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible' && started) {
        const alive = !!streamRef.current?.getTracks().some(t => t.readyState === 'live')
        if (!alive) startStream()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      stopStream()
    }
  }, [started, startStream, stopStream])

  const handleStartClick = async () => {
    setStarted(true)
    await startStream()
  }

  function capture() {
    const video = videoRef.current!
    if (!ready) return
    const w = video.videoWidth, h = video.videoHeight
    const canvas = document.createElement('canvas')
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, w, h)
    canvas.toBlob((blob) => {
      if (!blob) return
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
      {!started ? (
        <div style={{padding:16}}>
          <p><strong>Enable camera</strong></p>
          <p>Tap the button below to start the camera. On iOS PWAs, a user tap is required.</p>
          <div className="row">
            <button className="primary" onClick={handleStartClick}>Enable Camera</button>
            <input type="file" accept="image/*" capture="environment" onChange={fileFallback} className="ghost"/>
          </div>
        </div>
      ) : (
        <>
          <video ref={videoRef} playsInline muted autoPlay />
          {!ready && <div style={{padding:16}}>Initializing camera…</div>}
          {err && (
            <div style={{padding:16}}>
              <p>Camera error: {err}</p>
              <input type="file" accept="image/*" capture="environment" onChange={fileFallback}/>
            </div>
          )}
          <div className="footer row" style={{justifyContent:'space-between'}}>
            <input type="file" accept="image/*" capture="environment" onChange={fileFallback} className="ghost"/>
            <button className="primary" onClick={capture} disabled={!ready}>Snap</button>
          </div>
        </>
      )}
    </div>
  )
}