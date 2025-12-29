import { useEffect, useRef } from 'react'

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
      } catch (err) {
        console.error('Camera error', err)
      }
    }
    start()
    return () => {
      const s = videoRef.current?.srcObject as MediaStream | undefined
      s?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const captureFrame = () => {
    const video = videoRef.current
    if (!video) return null
    const w = video.videoWidth || 640
    const h = video.videoHeight || 480
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, w, h)
    return canvas.toDataURL('image/jpeg')
  }

  return { videoRef, captureFrame }
}
