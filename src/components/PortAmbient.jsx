import React, { useEffect, useMemo } from 'react';
import '../styles/port-ambient.css';

export default function PortAmbient({ onScrollProgress }) {
  // Generate random seagulls
  const seagulls = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      top: Math.random() * 30 + 10, // 10% to 40% height
      delay: Math.random() * 20,
      duration: Math.random() * 15 + 20, // 20s to 35s
      scale: Math.random() * 0.5 + 0.5
    }));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroTrack = document.getElementById('hero');
      if (heroTrack) {
        const scrollRange = heroTrack.offsetHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        
        let progress = 0;
        if (scrollRange > 0) {
          progress = currentScroll / scrollRange;
        }
        
        const clampedProgress = Math.max(0, Math.min(1, progress));
        if (onScrollProgress) {
          onScrollProgress(clampedProgress);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onScrollProgress]);

  return (
    <div className="port-ambient-container">
      {/* Background Image of Sea Port */}
      <div className="port-background" />
      <div className="port-overlay" />
      
      {/* Lighthouse Sweeping Beam */}
      <div className="lighthouse-beam" />
      
      {/* Cargo Ship Sailing */}
      <div className="cargo-ship">
        <div className="ship-containers" />
        <div className="ship-cabin" />
      </div>

      {/* Atmospheric Mist on Water */}
      <div className="port-mist" />

      {/* Flying Seagulls */}
      {seagulls.map((gull) => (
        <div 
          key={gull.id} 
          className="seagull"
          style={{
            top: `${gull.top}%`,
            animationDelay: `${gull.delay}s`,
            animationDuration: `${gull.duration}s`,
            transform: `scale(${gull.scale})`
          }}
        />
      ))}
    </div>
  );
}
