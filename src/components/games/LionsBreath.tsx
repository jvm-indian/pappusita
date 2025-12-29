import React, { useEffect, useRef, useState } from 'react';

const LionsBreath: React.FC = () => {
  // --- REFS ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // --- STATE ---
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'WON'>('START');
  
  // Mutable Game Data (Performance optimized)
  const gameData = useRef({
    orbY: 0,              // Vertical Position
    velocity: 0,          // Speed
    targetY: 0,           // Where the Safe Zone is
    zoneHeight: 150,      // Size of Safe Zone
    timeInZone: 0,        // Score Timer
    requiredTime: 10,     // Win Condition (Seconds)
    micVolume: 0,         // Current Volume
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    width: 0,
    height: 0
  });

  // --- CONFIGURATION ---
  const CONFIG = {
    gravity: 0.1,             // Very gentle downward pull
    liftMultiplier: 0.15,     // How much breath lifts the orb
    friction: 0.96,           // Air resistance (makes it floaty)
    micThreshold: 15,         // Noise gate
    zoneColor: 'rgba(167, 243, 208, 0.15)', // Sage Green glow
    orbColor: '#fbbf24',      // Vedic Gold
    particleCount: 3          // Particles per frame on exhale
  };

  // 1. INITIALIZE & RESIZE HANDLER
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        
        // Reset Position to middle on resize
        gameData.current.width = window.innerWidth;
        gameData.current.height = window.innerHeight;
        gameData.current.orbY = window.innerHeight - 100; // Start near bottom
        gameData.current.targetY = (window.innerHeight / 2) - 100; // Center-ish
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial setup

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. AUDIO SETUP
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256; // 128 data points
      analyserRef.current.smoothingTimeConstant = 0.8; // Smooths out jittery audio
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      // Reset Game
      gameData.current.timeInZone = 0;
      gameData.current.velocity = 0;
      gameData.current.orbY = window.innerHeight - 100;
      
      setGameState('PLAYING');
      requestRef.current = requestAnimationFrame(gameLoop);

    } catch (err) {
      console.error(err);
      alert("Please allow microphone access to enter the Digital Ashram.");
    }
  };

  // 3. MAIN GAME LOOP
  const gameLoop = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // A. Audio Input
    let vol = 0;
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      // Average volume calculation
      const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
      vol = sum / dataArrayRef.current.length;
    }
    gameData.current.micVolume = vol;

    // B. Physics (The "Float" Logic)
    // Gravity always pulls down
    gameData.current.velocity += CONFIG.gravity;

    // Breath pushes UP (Logarithmic lift for control)
    if (vol > CONFIG.micThreshold) {
      const lift = Math.log(vol) * CONFIG.liftMultiplier; 
      gameData.current.velocity -= lift;
      
      // Add "Breath Particles"
      spawnParticles(gameData.current.orbY);
    }

    // Friction/Air Resistance
    gameData.current.velocity *= CONFIG.friction;

    // Update Position
    gameData.current.orbY += gameData.current.velocity;

    // Boundaries (Floor/Ceiling)
    if (gameData.current.orbY > gameData.current.height - 50) {
      gameData.current.orbY = gameData.current.height - 50;
      gameData.current.velocity = 0;
    }
    if (gameData.current.orbY < 50) {
      gameData.current.orbY = 50;
      gameData.current.velocity = 0;
    }

    // C. Win Logic (The Safe Zone)
    const inZone = 
      gameData.current.orbY > gameData.current.targetY && 
      gameData.current.orbY < (gameData.current.targetY + gameData.current.zoneHeight);

    if (inZone) {
      gameData.current.timeInZone += 1/60; // Add frame time
    } else {
      // Optional: Gently decay score if they panic? No, let's be kind.
      // gameData.current.timeInZone = Math.max(0, gameData.current.timeInZone - 0.05);
    }

    if (gameData.current.timeInZone >= gameData.current.requiredTime) {
      setGameState('WON');
      return; // Stop loop
    }

    // D. Render Frame
    draw(ctx, inZone);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // 4. PARTICLE SYSTEM (Visuals)
  const spawnParticles = (y: number) => {
    const x = gameData.current.width / 2;
    for(let i=0; i < CONFIG.particleCount; i++) {
      gameData.current.particles.push({
        x: x + (Math.random() * 40 - 20),
        y: y + 20,
        vx: (Math.random() * 2 - 1),
        vy: (Math.random() * 2), // Fall down
        life: 1.0,
        color: `rgba(255, 255, 255, ${Math.random() * 0.5})`
      });
    }
  };

  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = gameData.current.particles.length - 1; i >= 0; i--) {
      const p = gameData.current.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;

      if (p.life <= 0) {
        gameData.current.particles.splice(i, 1);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // 5. RENDERER
  const draw = (ctx: CanvasRenderingContext2D, inZone: boolean) => {
    const w = gameData.current.width;
    const h = gameData.current.height;

    // Background Gradient (Deep Calming Blue/Green)
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#0f172a'); // Dark Slate
    gradient.addColorStop(1, '#064e3b'); // Deep Emerald
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Draw Safe Zone (Glowing Band)
    const zoneY = gameData.current.targetY;
    const zoneH = gameData.current.zoneHeight;
    
    // Zone Glow
    const zoneGrad = ctx.createLinearGradient(0, zoneY, 0, zoneY + zoneH);
    zoneGrad.addColorStop(0, 'rgba(52, 211, 153, 0.0)');
    zoneGrad.addColorStop(0.5, inZone ? 'rgba(52, 211, 153, 0.4)' : 'rgba(52, 211, 153, 0.1)');
    zoneGrad.addColorStop(1, 'rgba(52, 211, 153, 0.0)');
    ctx.fillStyle = zoneGrad;
    ctx.fillRect(0, zoneY, w, zoneH);

    // Zone Borders (Subtle lines)
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
    ctx.beginPath();
    ctx.moveTo(0, zoneY); ctx.lineTo(w, zoneY);
    ctx.moveTo(0, zoneY + zoneH); ctx.lineTo(w, zoneY + zoneH);
    ctx.stroke();

    // Helper Text in Zone
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '16px serif';
    ctx.textAlign = 'center';
    ctx.fillText("H O V E R   H E R E", w/2, zoneY + zoneH/2 + 5);

    // Draw Player Orb
    const orbY = gameData.current.orbY;
    const centerX = w / 2;

    // Orb Glow
    const glow = ctx.createRadialGradient(centerX, orbY, 5, centerX, orbY, 40);
    glow.addColorStop(0, '#FCD34D'); // Bright Gold
    glow.addColorStop(1, 'rgba(252, 211, 77, 0)'); // Fade out
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(centerX, orbY, 40, 0, Math.PI * 2);
    ctx.fill();

    // Orb Core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(centerX, orbY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Particles
    updateAndDrawParticles(ctx);

    // Progress Bar (Circular or Top Line)
    const progress = Math.min(gameData.current.timeInZone / gameData.current.requiredTime, 1);
    ctx.fillStyle = '#34D399';
    ctx.fillRect(0, 0, w * progress, 8); // Top progress bar
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 overflow-hidden">
      {/* THE CANVAS LAYER */}
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* UI LAYER: START SCREEN */}
      {gameState === 'START' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white z-10">
          <h1 className="text-4xl font-serif text-gold-400 mb-2">The Lion's Breath</h1>
          <p className="text-gray-300 mb-8 max-w-md text-center">
            Exhale slowly and steadily to float the golden light. 
            Keep it in the green zone to calm your mind.
          </p>
          <button 
            onClick={startAudio}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105"
          >
            Begin Therapy
          </button>
        </div>
      )}

      {/* UI LAYER: WIN SCREEN */}
      {gameState === 'WON' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/90 backdrop-blur-md text-white z-10">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 animate-pulse">
            <span className="text-4xl">🕉️</span>
          </div>
          <h2 className="text-3xl font-serif mb-2">Inner Peace Achieved</h2>
          <p className="text-emerald-100 mb-8">Your Vagus Nerve is now activated.</p>
          <button 
            onClick={() => {
              setGameState('START');
              // Logic to save score/Karma points goes here
            }}
            className="px-8 py-3 border border-white/30 hover:bg-white/10 rounded-full transition"
          >
            Practice Again
          </button>
        </div>
      )}

      {/* UI LAYER: HUD */}
      {gameState === 'PLAYING' && (
        <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">
          MIC INPUT: {Math.round(gameData.current.micVolume)}
        </div>
      )}
    </div>
  );
};

export default LionsBreath;
