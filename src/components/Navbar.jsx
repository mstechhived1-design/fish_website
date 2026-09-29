import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar({ style }) {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <header className="hero-nav" style={style}>
      <Link to="/" className="nav-brand" aria-label="YNR Fishes Home">
        <div className="brand-icon-wrapper">
          <img 
            src="/assets/ynr_logo_hd.jpg" 
            alt="YNR Fishes Logo" 
            className="brand-logo-img"
          />
        </div>
      </Link>

      <div className="nav-meta-group">
        <Link to="/about" className="nav-info-chip">
          <span>About Us</span>
        </Link>
        <Link to="/services" className="nav-contact-link">
          <span>Our Services</span>
        </Link>
        <Link to="/products" className="nav-contact-link" style={{ marginLeft: '10px' }}>
          <span>Products</span>
        </Link>
        <Link to="/gallery" className="nav-info-chip" style={{ marginLeft: '10px' }}>
          <span>Gallery</span>
        </Link>
        <Link to="/contact" className="nav-info-chip" style={{ marginLeft: '10px' }}>
          <span>Contact</span>
        </Link>
        
        {/* Cart Icon */}
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', marginLeft: '15px', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: '-8px', right: '-8px', background: '#F5C144', color: '#010A14',
              borderRadius: '50%', padding: '2px 6px', fontSize: '0.75rem', fontWeight: 'bold'
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
