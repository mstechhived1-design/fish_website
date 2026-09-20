import React, { useRef } from 'react';
import Navbar from './Navbar';
import UnderwaterScene from './UnderwaterScene';
import BrandContent from './BrandContent';

export default function HeroSection() {
  const brandRef = useRef(null);
  const navRef = useRef(null);

  const handleScrollProgress = (progress) => {
    // Smoothly dissolve hero branding text as user scrolls
    // Fully removed from the screen by progress = 0.14
    if (brandRef.current) {
      const fadeThreshold = 0.14;
      const fade = Math.min(1, Math.max(0, progress / fadeThreshold));
      const opacity = Math.max(0, 1 - fade);
      const translateY = -fade * 45; // gentle upward float as it dissolves
      const scale = 1 - fade * 0.06;

      brandRef.current.style.opacity = opacity;
      brandRef.current.style.transform = `translate3d(0px, ${translateY}px, 0px) scale(${scale})`;
      brandRef.current.style.visibility = opacity <= 0.005 ? 'hidden' : 'visible';
    }

    // Softly dim the top navbar slightly during deep dive
    if (navRef.current) {
      const navOpacity = Math.max(0.4, 1 - progress * 0.8);
      navRef.current.style.opacity = navOpacity;
    }
  };

  return (
    <section className="hero-track" id="hero">
      <div className="hero-viewport">
        {/* Photorealistic Underwater Ocean Engine */}
        <UnderwaterScene onScrollProgress={handleScrollProgress} />

        {/* Top Oceanic Navbar */}
        <div ref={navRef} style={{ width: '100%', zIndex: 30, display: 'flex', justifyContent: 'center' }}>
          <Navbar />
        </div>

        {/* Centered Hero Branding — Smoothly removes on scroll */}
        <div
          ref={brandRef}
          style={{
            width: '100%',
            flex: 1,
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            willChange: 'opacity, transform'
          }}
        >
          <BrandContent />
        </div>
      </div>
    </section>
  );
}
