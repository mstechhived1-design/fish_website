import React from 'react';
import '../styles/products.css';

export default function ProductsSection() {
  const categories = [
    {
      title: 'Freshwater Fish',
      description: 'Rohu, Katla, Rupchand and other freshwater varieties.',
      linkText: 'View Freshwater Fish',
      imgUrl: '/images/freshwater_fish_1790409128786.jpg',
      delay: '0s'
    },
    {
      title: 'Sea Fish',
      description: 'White Pomfret, Black Pomfret, Vanjaram, Tuna and more.',
      linkText: 'View Sea Fish',
      imgUrl: '/images/sea_fish_1790409145549.jpg',
      delay: '0.15s'
    },
    {
      title: 'Prawns',
      description: 'Fresh prawns available in different sizes depending on daily availability.',
      linkText: 'View Prawns',
      imgUrl: '/images/prawns_1790409158351.jpg',
      delay: '0.3s'
    },
    {
      title: 'Crabs',
      description: 'Fresh crabs sourced according to market availability.',
      linkText: 'View Crabs',
      imgUrl: '/images/crabs_1790409170925.jpg',
      delay: '0.45s'
    }
  ];

  return (
    <section className="products-section" id="products">
      <div className="products-container">
        <h2 className="section-heading">Our Products</h2>
        
        <div className="products-grid">
          {categories.map((category, index) => (
            <div 
              key={index} 
              className="product-card" 
              style={{ animationDelay: category.delay }}
            >
              <div className="product-card-inner">
                <div className="product-card-bg" aria-hidden="true" />
                
                <div className="product-img-wrapper" style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <img 
                    src={category.imgUrl} 
                    alt={category.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                    className="product-img"
                  />
                </div>

                <h3 className="product-title">{category.title}</h3>
                <p className="product-description">{category.description}</p>
                <button className="product-link">
                  {category.linkText} <span className="arrow">&rarr;</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dynamic light rays for underwater depth */}
      <div className="light-rays-overlay" aria-hidden="true" />
    </section>
  );
}
