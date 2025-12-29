import axios from 'axios'

const endpoint = process.env.VISION_ENDPOINT as string
const key = process.env.VISION_KEY as string

export default async function (context: any, req: any) {
  try {
    const imageBase64: string = req.body?.imageBase64
    if (!imageBase64) {
      context.res = { status: 400, body: { error: 'Missing imageBase64' } }
      return
    }

    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64')

    const url = `${endpoint}/face/v1.0/detect?returnFaceLandmarks=true&returnFaceAttributes=headPose`
    const visionRes = await axios.post(url, imageBuffer, {
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/octet-stream'
      }
    })

    const face = visionRes.data?.[0]
    if (!face) {
      context.res = { body: { facePresent: false } }
      return
    }

    const lm = face.faceLandmarks
    const left = lm?.eyeLeft
    const right = lm?.eyeRight

    // naive eyesOpen estimation using eyelid distance if available
    const leftOpen = (lm?.eyeLeftTop && lm?.eyeLeftBottom)
      ? distance(lm.eyeLeftTop, lm.eyeLeftBottom) > 2
      : true
    const rightOpen = (lm?.eyeRightTop && lm?.eyeRightBottom)
      ? distance(lm.eyeRightTop, lm.eyeRightBottom) > 2
      : true

    context.res = {
      body: {
        facePresent: true,
        eyeLeft: left ? { x: left.x, y: left.y } : undefined,
        eyeRight: right ? { x: right.x, y: right.y } : undefined,
        eyesOpen: Boolean(leftOpen && rightOpen)
      }
    }
  } catch (err: any) {
    context.log('analyzeFrame error', err?.message)
    context.res = { status: 500, body: { error: 'Vision error' } }
  }
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}
