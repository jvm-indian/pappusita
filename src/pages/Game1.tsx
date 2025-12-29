import { useRef } from "react";
import { useEyeTracker } from "../hooks/useEyeTracker";

export default function Game1() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { gazeX, gazeY, isBlinking, confidence } = useEyeTracker(videoRef);

  const cursorX = gazeX * 800;
  const cursorY = gazeY * 500;

  return (
    <div className="relative w-[800px] h-[500px] bg-black overflow-hidden mx-auto mt-8 rounded-xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-40 opacity-70 border"
      />

      {/* GAZE CURSOR */}
      <div
        className="absolute w-6 h-6 bg-green-400 rounded-full"
        style={{ left: cursorX, top: cursorY }}
      />

      {/* BLINK FEEDBACK */}
      {isBlinking && (
        <div className="absolute top-2 left-2 text-white">
          BLINK!
        </div>
      )}

      {/* CONFIDENCE */}
      <div className="absolute bottom-2 left-2 text-xs text-white">
        Tracking: {(confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}
