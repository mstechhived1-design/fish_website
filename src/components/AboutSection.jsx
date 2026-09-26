import React from 'react';
import '../styles/about.css';

export default function AboutSection() {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <h2 className="section-heading">About YNR Fishes</h2>
        
        <div className="about-content">
          <p className="about-text highlight">
            <strong>YNR Fishes</strong> is a fish and seafood market located in Chemmumiahpet, Ravindra Nagar, Utukuru, Andhra Pradesh. With <strong>30+ years of experience</strong>, YNR Fishes serves customers with a variety of freshwater fish, sea fish, prawns and crabs.
          </p>
          
          <p className="about-text">
            The market also provides fish cleaning and cutting services, with retail and bulk/wholesale requirements accommodated based on availability.
          </p>
        </div>
      </div>
      
      {/* Decorative underwater elements */}
      <div className="about-decorations" aria-hidden="true">
        <div className="decor-bubble b1"></div>
        <div className="decor-bubble b2"></div>
        <div className="decor-bubble b3"></div>
      </div>
    </section>
  );
}
