import React from 'react';

export default function BrandContent({ style }) {
  return (
    <div className="brand-content-wrapper" style={style}>
      <div className="brand-ambient-glow" aria-hidden="true" />

      {/* Lineage Badge */}
      <div className="brand-badge">
        <span className="badge-dot" />
        <span>30+ Years of Experience</span>
      </div>

      {/* Main Brand Title */}
      <h1 className="brand-title">
        <span className="brand-title-accent">YNR</span> FISHES
      </h1>

      {/* Tagline */}
      <div className="brand-tagline-container">
        <div className="tagline-line" aria-hidden="true" />
        <h2 className="brand-tagline">NATURE'S SUPER FOOD</h2>
        <div className="tagline-line line-right" aria-hidden="true" />
      </div>

      {/* Supporting lineage description */}
      <p className="brand-subtext">
        Fresh Fish &amp; Seafood from a Trusted Local Fish Market
      </p>

    </div>
  );
}
