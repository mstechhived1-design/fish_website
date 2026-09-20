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
    // SCROLLING INTERACTIVITY (Mouse wheel, trackpad, touch swipe, mouse drag)
    // Directly drives the fish swimming kinematics without scrolling page downward
    // =========================================================================
    const handleWheel = (e) => {
      e.preventDefault();
      engine.addScrollDelta(e.deltaY);
    };

    let touchStartY = 0;
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length === 1) {
        const currentY = e.touches[0].clientY;
        const deltaY = (touchStartY - currentY) * 2.2;
        touchStartY = currentY;
        engine.addScrollDelta(deltaY);
      }
    };

    let isDragging = false;
    let dragStartY = 0;
    const handleMouseDown = (e) => {
      // Only left mouse button
      if (e.button === 0) {
        isDragging = true;
        dragStartY = e.clientY;
      }
    };
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaY = (dragStartY - e.clientY) * 2.0;
      dragStartY = e.clientY;
      engine.addScrollDelta(deltaY);
    };
    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        engine.addScrollDelta(120);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        engine.addScrollDelta(-120);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isActive = false;
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
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
