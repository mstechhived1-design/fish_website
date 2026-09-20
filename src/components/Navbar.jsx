import React from 'react';

export default function Navbar({ style }) {
  return (
    <header className="hero-nav" style={style}>
      <a href="#top" className="nav-brand" aria-label="YNR Fishes Home">
        <div className="brand-icon-wrapper">
          <svg className="brand-icon-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.41 0 8 3.59 8 8 0 1.85-.63 3.55-1.69 4.9z" opacity="0.3"/>
            <path d="M2 12c4 4 10 2 14-2-4-4-10-2-14 2z M16 10l5-3-2 5 2 5-5-3z"/>
          </svg>
        </div>
        <span className="nav-brand-title">
          YNR <span>FISHES</span>
        </span>
      </a>

      <div className="nav-meta-group">
        <div className="nav-info-chip" title="Chemmumiahpet, Ravindra Nagar, Utukuru, Andhra Pradesh">
          <svg className="nav-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <span>Ravindra Nagar, Utukuru, AP</span>
        </div>

        <a href="tel:+919849313889" className="nav-contact-link" aria-label="Call YNR Fishes">
          <svg className="nav-chip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span>+91 98493 13889</span>
        </a>
      </div>
    </header>
  );
}
