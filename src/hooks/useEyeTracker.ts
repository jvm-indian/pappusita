import { useEffect, useRef, useState } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";

export function useEyeTracker(videoRef: React.RefObject<HTMLVideoElement>) {
  const [gazeX, setGazeX] = useState(0.5);
  const [gazeY, setGazeY] = useState(0.5);
  const [isBlinking, setIsBlinking] = useState(false);
  const [confidence, setConfidence] = useState(0);

  const blinkCooldown = useRef(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      refineLandmarks: true,
      maxNumFaces: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      console.log("FaceMesh results:", results)
      if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
        setConfidence(0);
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];

      // IRIS (Python 474–478)
      const iris = landmarks.slice(474, 478);
      const irisCenter = iris[1];

      setGazeX(irisCenter.x);
      setGazeY(irisCenter.y);
      setConfidence(1);
      console.log(
        "Iris:", irisCenter?.x?.toFixed?.(3), irisCenter?.y?.toFixed?.(3),
        "BlinkDist:", ((landmarks[145]?.y ?? 0) - (landmarks[159]?.y ?? 0)).toFixed(4)
      );

      // BLINK DETECTION (145 & 159)
      const upper = landmarks[159].y;
      const lower = landmarks[145].y;
      const blinkDistance = lower - upper;
      if (blinkDistance < 0.02) {
        console.log("BLINK DETECTED");
      }
      if (blinkDistance < 0.012 && !blinkCooldown.current) {
        setIsBlinking(true);
        blinkCooldown.current = true;

        setTimeout(() => {
          blinkCooldown.current = false;
          setIsBlinking(false);
        }, 800);
      }
    });

    let rafId: number | null = null;
    let stream: MediaStream | null = null;

    const start = async () => {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const loop = async () => {
        if (videoRef.current) {
          await faceMesh.send({ image: videoRef.current });
        }
        rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    };

    start().catch(() => setConfidence(0));

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [videoRef]);

  return { gazeX, gazeY, isBlinking, confidence };
}
