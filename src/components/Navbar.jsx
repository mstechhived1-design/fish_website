import React from 'react';

export default function Navbar({ style }) {
  return (
    <header className="hero-nav" style={style}>
      <a href="#top" className="nav-brand" aria-label="YNR Fishes Home">
        <div className="brand-icon-wrapper">
          <img 
            src="/assets/ynr_logo.png" 
            alt="YNR Fishes Logo" 
            className="brand-logo-img"
          />
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
