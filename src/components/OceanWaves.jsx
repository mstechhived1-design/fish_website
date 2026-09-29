import React, { useEffect } from 'react';
import '../styles/ocean-waves.css';

export default function OceanWaves({ onScrollProgress }) {
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
    <div className="ocean-waves-container">
      <div className="sky-gradient" />
      
      {/* Dynamic SVG Waves */}
      <div className="waves-wrapper">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(61, 192, 204, 0.7)" />
            <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(14, 86, 114, 0.7)" />
            <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(114, 222, 229, 0.4)" />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#031424" /> {/* Matches var(--ocean-abyss) to blend with next section */}
          </g>
        </svg>
      </div>
    </div>
  );
}
