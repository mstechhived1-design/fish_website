import React, { useRef, useEffect } from 'react';
import { PhotorealisticMarineEngine } from '../utils/photorealisticMarineEngine';

export default function UnderwaterScene({ onScrollProgress }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const animIdRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new PhotorealisticMarineEngine(canvas);
    engineRef.current = engine;

    const handleResize = () => {
      engine.resize(window.innerWidth, window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let isActive = true;
    const loop = (currentTime) => {
      if (!isActive) return;
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      engine.update(dt);
      engine.render();

      if (onScrollProgress) {
        onScrollProgress(engine.smoothScroll);
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    // =========================================================================
    // NATIVE SCROLL INTERACTIVITY
    // Directly binds the 3D fish animation to the actual page scroll position.
    // This guarantees the animation is exactly 100% complete when the section ends.
    // =========================================================================
    const handleScroll = () => {
      const heroTrack = document.getElementById('hero');
      if (heroTrack) {
        // The total scrollable distance to get past the hero section
        const scrollRange = heroTrack.offsetHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        
        let progress = 0;
        if (scrollRange > 0) {
          progress = currentScroll / scrollRange;
        }
        
        // Clamp between 0 and 1
        const clampedProgress = Math.max(0, Math.min(1, progress));
        engine.setScrollProgress(clampedProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Trigger once on mount to set initial state
    handleScroll();

    return () => {
      isActive = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <div className="ocean-vignette" aria-hidden="true" />
      <div className="surface-light-bar" aria-hidden="true" />
    </div>
  );
}
