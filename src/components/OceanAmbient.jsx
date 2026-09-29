import React, { useMemo, useEffect } from 'react';
import '../styles/ocean-ambient.css';

export default function OceanAmbient({ onScrollProgress }) {
  // Generate random floating bubbles for a dynamic feel
  const bubbles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 12 + 4, // 4px to 16px
      left: Math.random() * 100, // 0% to 100%
      duration: Math.random() * 15 + 8, // 8s to 23s
      delay: Math.random() * 15, // 0s to 15s
      drift: Math.random() * 100 - 50 // -50px to 50px horizontal drift
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
    <div className="ocean-ambient-container">
      {/* Deep water background gradient */}
      <div className="water-depth" />
      
      {/* Shimmering surface caustics */}
      <div className="caustics" />
      
      {/* Gentle god rays from above */}
      <div className="sun-rays" />
      
      {/* Interactive floating bubbles */}
      {bubbles.map(b => (
        <div 
          key={b.id} 
          className="bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            '--drift': `${b.drift}px`
          }}
        />
      ))}
    </div>
  );
}
