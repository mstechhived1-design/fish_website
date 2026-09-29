import React, { useEffect } from 'react';
import '../styles/animated-ocean-hero.css';

export default function AnimatedOceanHero({ onScrollProgress }) {
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
    <div className="animated-ocean-container">
      {/* Abstract shifting fluid gradient mimicking deep ocean currents */}
      <div className="fluid-gradient sphere-1" />
      <div className="fluid-gradient sphere-2" />
      <div className="fluid-gradient sphere-3" />
      <div className="fluid-gradient sphere-4" />
      
      {/* Glassmorphism overlay to smooth the gradients */}
      <div className="ocean-glass-overlay" />
    </div>
  );
}
