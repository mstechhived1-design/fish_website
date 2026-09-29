import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/products.css';

export default function ProductsSection() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedWeight, setSelectedWeight] = useState(1); // multiplier
  const [selectedCut, setSelectedCut] = useState('Curry Cut');
  
  const { addToCart } = useCart();

  const freshWaterCategories = [
    { title: 'Rohu', price: 220, description: 'Fresh, high-quality Rohu fish.', taste: 'Mild, sweet, non-fishy.', details: 'Excellent for curries and deep frying. Rich in protein and Omega 3.', linkText: 'View Details', imgUrl: '/images/rohu.jpg', delay: '0s', badge: 'Bestseller', type: 'Fresh Water' },
    { title: 'Katla', price: 250, description: 'Fresh, high-quality Katla fish.', taste: 'Soft, slightly sweet, rich texture.', details: 'A very popular South Asian delicacy, great for thick gravies.', linkText: 'View Details', imgUrl: '/images/katla.jpg', delay: '0.1s', type: 'Fresh Water' },
    { title: 'Valaga', price: 350, description: 'Fresh Valaga (freshwater catfish).', taste: 'Meaty and buttery.', details: 'A prized freshwater catfish with fewer bones, perfect for spicy preparations.', linkText: 'View Details', imgUrl: '/images/valaga.jpg', delay: '0.2s', badge: 'Premium', type: 'Fresh Water' },
    { title: 'Korramane', price: 450, description: 'Fresh Korramane (Murrel/Snakehead).', taste: 'Firm and slightly earthy.', details: 'Highly sought after for its medicinal properties and unique flavor.', linkText: 'View Details', imgUrl: '/images/korramane.jpg', delay: '0.3s', type: 'Fresh Water' },
    { title: 'Gelabi', price: 180, description: 'Fresh Gelabi (Tilapia) fish.', taste: 'Mild, flaky, and lean.', details: 'Very versatile, absorbs marinades well, ideal for grilling or pan-searing.', linkText: 'View Details', imgUrl: '/images/gelabi.jpg', delay: '0.4s', type: 'Fresh Water' },
    { title: 'Rupchand', price: 200, description: 'Fresh Rupchand fish.', taste: 'Delicate, sweet, and similar to Pomfret.', details: 'Popular for its single bone structure, great for whole fry.', linkText: 'View Details', imgUrl: '/images/rupchand.jpg', delay: '0.5s', badge: 'Fresh Catch', type: 'Fresh Water' },
    { title: 'Gella (Small Size)', price: 150, description: 'Fresh small size Gella fish.', taste: 'Rich and flavorful.', details: 'Perfect for crispy frying and traditional tangy pulusu.', linkText: 'View Details', imgUrl: '/images/gella_small.jpg', delay: '0.6s', type: 'Fresh Water' },
    { title: 'Gella Cut', price: 160, description: 'Fresh Gella fish cleanly cut into pieces.', taste: 'Rich and flavorful.', details: 'Conveniently cut pieces ready for everyday cooking.', linkText: 'View Details', imgUrl: '/images/gella_cut.jpg', delay: '0.7s', type: 'Fresh Water' },
    { title: 'Panikas', price: 280, description: 'Fresh Panikas (Pangasius/Basa).', taste: 'Mild, sweet, and melt-in-the-mouth texture.', details: 'Boneless fillets that are extremely popular in modern recipes.', linkText: 'View Details', imgUrl: '/images/panikas.jpg', delay: '0.8s', badge: 'Boneless', type: 'Fresh Water' },
    { title: 'Kontemukku', price: 300, description: 'Fresh Kontemukku fish.', taste: 'Distinctive and rich.', details: 'A local favorite, typically slow-cooked for maximum flavor.', linkText: 'View Details', imgUrl: '/images/sea_fish.jpg', delay: '0.9s', type: 'Fresh Water' },
    { title: 'Prawns (Big & Small)', price: 600, description: 'Fresh prawns available in different sizes.', taste: 'Sweet, plump, and juicy.', details: 'Essential for any seafood feast. Grills, fries, and curries perfectly.', linkText: 'View Details', imgUrl: '/images/prawns.jpg', delay: '1.0s', badge: 'High Demand', type: 'Fresh Water' },
    { title: 'Crabs', price: 450, description: 'Fresh crabs sourced according to market availability.', taste: 'Sweet, tender, and succulent meat.', details: 'Highly prized for thick, flavorful coastal crab curries.', linkText: 'View Details', imgUrl: '/images/crabs.jpg', delay: '1.1s', type: 'Fresh Water' },
    { title: 'Chukka Gelabi', price: 190, description: 'Fresh Chukka Gelabi (spotted tilapia).', taste: 'Mild and flaky with a hint of sweetness.', details: 'A beautiful spotted variety, excellent for baking or frying.', linkText: 'View Details', imgUrl: '/images/gelabi.jpg', delay: '1.2s', type: 'Fresh Water' }
  ];

  const seaWaterCategories = [
    { title: 'White Pomfret', price: 800, description: 'Premium White Pomfret.', taste: 'Delicate, sweet, and buttery.', details: 'A highly sought-after sea fish, perfect for frying and grilling.', linkText: 'View Details', imgUrl: '/images/rupchand.jpg', delay: '0s', badge: 'Premium', type: 'Sea Water' },
    { title: 'Black Pomfret', price: 650, description: 'Fresh Black Pomfret.', taste: 'Rich and flavorful.', details: 'Excellent for deep frying and traditional curries.', linkText: 'View Details', imgUrl: '/images/sea_fish_1790409145549.jpg', delay: '0.1s', type: 'Sea Water' },
    { title: 'Vanjaram', price: 900, description: 'Fresh Vanjaram (Seer Fish).', taste: 'Meaty, rich, and firm.', details: 'The king of sea fish, highly prized for steaks and fries.', linkText: 'View Details', imgUrl: '/images/fish_cutting_1790409198223.jpg', delay: '0.2s', badge: 'Bestseller', type: 'Sea Water' },
    { title: 'Tuna', price: 500, description: 'Fresh whole Tuna.', taste: 'Meaty, rich, and robust.', details: 'Great for steaks, baking, and thick curries.', linkText: 'View Details', imgUrl: '/images/valaga.jpg', delay: '0.3s', type: 'Sea Water' },
    { title: 'Yellow Fin Tuna', price: 750, description: 'Premium Yellow Fin Tuna.', taste: 'Mild, firm, and slightly sweet.', details: 'Excellent for high-quality steaks and searing.', linkText: 'View Details', imgUrl: '/images/korramane.jpg', delay: '0.4s', badge: 'Fresh Catch', type: 'Sea Water' },
    { title: 'Black Tuna', price: 450, description: 'Fresh Black Tuna.', taste: 'Distinctively rich and firm.', details: 'Ideal for slow cooking and intense flavorful curries.', linkText: 'View Details', imgUrl: '/images/freshwater_fish.jpg', delay: '0.5s', type: 'Sea Water' },
    { title: 'Shankara', price: 550, description: 'Fresh Shankara (Red Snapper).', taste: 'Sweet, nutty, and lean.', details: 'A delicious coastal favorite for crispy fry and pulusu.', linkText: 'View Details', imgUrl: '/images/fish_market_1790409183949.jpg', delay: '0.6s', type: 'Sea Water' },
    { title: 'Ila', price: 400, description: 'Fresh Ila fish.', taste: 'Soft and subtly sweet.', details: 'Great for mild, soothing curries.', linkText: 'View Details', imgUrl: '/images/gella_small.jpg', delay: '0.7s', type: 'Sea Water' },
    { title: 'Sea Prawns', price: 700, description: 'Wild-caught Sea Prawns.', taste: 'Slightly briny and sweet.', details: 'Perfect for coastal curries and rich seafood dishes.', linkText: 'View Details', imgUrl: '/images/prawns_1790409158351.jpg', delay: '0.8s', badge: 'Popular', type: 'Sea Water' },
    { title: 'Tiger Prawns', price: 1200, description: 'Large, premium Tiger Prawns.', taste: 'Bold, sweet, and firm.', details: 'Excellent for grilling, roasting, and premium dishes.', linkText: 'View Details', imgUrl: '/images/prawns.jpg', delay: '0.9s', badge: 'Premium', type: 'Sea Water' },
    { title: 'Gold Fish', price: 600, description: 'Fresh Gold/Emperor Snapper.', taste: 'Mild and delicate.', details: 'Highly sought after for premium frying and baking.', linkText: 'View Details', imgUrl: '/images/gelabi.jpg', delay: '1.0s', type: 'Sea Water' }
  ];

  const allProducts = [...freshWaterCategories, ...seaWaterCategories];
  const filteredProducts = activeTab === 'All' 
    ? allProducts 
    : allProducts.filter(p => p.type === activeTab);

  const tabs = ['All', 'Fresh Water', 'Sea Water'];
  
  const cutOptions = ['Whole', 'Curry Cut', 'Cleaned', 'Boneless Fillet'];
  const weightOptions = [
    { label: '500g', value: 0.5 },
    { label: '1kg', value: 1 },
    { label: '2kg', value: 2 }
  ];

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setSelectedWeight(1);
    setSelectedCut('Curry Cut');
  };

  const handleAddToCart = (product, isFromModal = false) => {
    const finalProduct = {
      ...product,
      title: isFromModal ? `${product.title} (${selectedCut})` : product.title,
      price: product.price, // Base price is per kg
      imgUrl: product.imgUrl
    };
    
    addToCart(finalProduct, isFromModal ? selectedWeight : 1);
    if (isFromModal) setSelectedProduct(null);
  };

  return (
    <section className="products-section" id="products">
      <div className="products-container">
        
        {/* Enterprise Delivery Banner */}
        <div style={{
          background: 'rgba(3, 20, 36, 0.6)', border: '1px solid rgba(61, 192, 204, 0.3)', borderRadius: '12px',
          padding: '1rem 2rem', display: 'inline-flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem',
          backdropFilter: 'blur(10px)', color: '#fff'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3dc0cc" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.8rem', color: '#8aa4b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivering To</span>
            <div style={{ fontWeight: 'bold', color: '#3dc0cc' }}>Chemmumiahpet & Nearby Areas (516004)</div>
          </div>
        </div>

        <h2 className="section-heading" style={{ marginBottom: '1.5rem' }}>Premium Catch</h2>
        
        {/* Modern Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'linear-gradient(135deg, rgba(61, 192, 204, 0.9), rgba(14, 86, 114, 0.95))' : 'rgba(3, 20, 36, 0.4)',
                color: activeTab === tab ? '#fff' : '#8aa4b8',
                border: `1px solid ${activeTab === tab ? 'rgba(114, 222, 229, 0.5)' : 'rgba(61, 192, 204, 0.15)'}`,
                padding: '0.75rem 2rem', borderRadius: '999px', fontSize: '1rem', fontWeight: 'bold',
                cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: activeTab === tab ? '0 4px 15px rgba(19, 119, 143, 0.4)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="products-grid">
          {filteredProducts.map((category, index) => (
            <div 
              key={`${category.title}-${index}`} 
              className="product-card" 
              style={{ animationDelay: category.delay }}
            >
              <div className="product-card-inner">
                <div className="product-card-bg" aria-hidden="true" />
                
                <div className="product-img-wrapper" style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => handleOpenModal(category)}>
                  {/* Enterprise Badge */}
                  {category.badge && (
                    <div style={{
                      position: 'absolute', top: '10px', left: '10px', zIndex: 2, background: 'linear-gradient(135deg, #F5C144, #f9a826)',
                      color: '#010A14', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.3rem 0.8rem', borderRadius: '20px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                      {category.badge}
                    </div>
                  )}
                  
                  <img 
                    src={category.imgUrl} 
                    alt={category.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} 
                    className="product-img"
                  />
                  
                  {/* Quick Add Overlay */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(1, 10, 20, 0.9), transparent)',
                    padding: '1.5rem 1rem 0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
                  }}>
                    <span style={{ color: '#fff', fontSize: '0.85rem' }}>Gross Wt. 1000g</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="product-title">{category.title}</h3>
                  <span style={{ color: '#F5C144', fontWeight: 'bold', fontSize: '1.2rem' }}>₹{category.price} <span style={{fontSize: '0.8rem', color: '#8aa4b8'}}>/kg</span></span>
                </div>
                
                <p className="product-description">{category.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <button className="product-link" onClick={() => handleOpenModal(category)}>
                    Options <span className="arrow">&rarr;</span>
                  </button>
                  <button 
                    onClick={() => handleAddToCart(category, false)}
                    style={{
                      background: 'rgba(61, 192, 204, 0.2)', color: '#3dc0cc', border: '1px solid rgba(61, 192, 204, 0.4)',
                      padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(61, 192, 204, 0.4)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(61, 192, 204, 0.2)' }}
                  >
                    <span>+</span> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="light-rays-overlay" aria-hidden="true" />

      {/* Advanced E-commerce Product Details Modal */}
      {selectedProduct && (
        <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>
            
            <div className="modal-img-wrapper" style={{ height: '300px', position: 'relative' }}>
              <button className="modal-close-btn" style={{ top: '20px', right: '20px' }} onClick={() => setSelectedProduct(null)}>&times;</button>
              {selectedProduct.badge && (
                <div style={{
                  position: 'absolute', top: '20px', left: '20px', zIndex: 2, background: 'linear-gradient(135deg, #F5C144, #f9a826)',
                  color: '#010A14', fontSize: '0.85rem', fontWeight: 'bold', padding: '0.4rem 1rem', borderRadius: '20px', textTransform: 'uppercase'
                }}>
                  {selectedProduct.badge}
                </div>
              )}
              <img src={selectedProduct.imgUrl} alt={selectedProduct.title} className="modal-img" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50%', background: 'linear-gradient(to top, var(--ocean-deep), transparent)' }} />
            </div>
            
            <div className="modal-content" style={{ paddingTop: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', marginTop: '-20px', position: 'relative', zIndex: 3 }}>
                <h3 className="modal-title" style={{ fontSize: '2.4rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{selectedProduct.title}</h3>
              </div>
              
              <div style={{ color: '#F5C144', fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                ₹{selectedProduct.price * selectedWeight} <span style={{fontSize: '1rem', color: '#8aa4b8', fontWeight: 'normal'}}>for {selectedWeight >= 1 ? `${selectedWeight}kg` : `${selectedWeight * 1000}g`}</span>
              </div>
              
              <p className="modal-desc" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>{selectedProduct.description}</p>
              
              {/* Product Preferences Options */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>Select Cut Type:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {cutOptions.map(cut => (
                    <button 
                      key={cut}
                      onClick={() => setSelectedCut(cut)}
                      style={{
                        background: selectedCut === cut ? 'rgba(61, 192, 204, 0.2)' : 'transparent',
                        color: selectedCut === cut ? '#3dc0cc' : '#8aa4b8',
                        border: `1px solid ${selectedCut === cut ? '#3dc0cc' : 'rgba(255,255,255,0.1)'}`,
                        padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {cut}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#fff', marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>Select Quantity:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {weightOptions.map(wt => (
                    <button 
                      key={wt.label}
                      onClick={() => setSelectedWeight(wt.value)}
                      style={{
                        background: selectedWeight === wt.value ? 'rgba(245, 193, 68, 0.15)' : 'transparent',
                        color: selectedWeight === wt.value ? '#F5C144' : '#8aa4b8',
                        border: `1px solid ${selectedWeight === wt.value ? '#F5C144' : 'rgba(255,255,255,0.1)'}`,
                        padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      {wt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  onClick={() => handleAddToCart(selectedProduct, true)}
                  style={{
                    flex: 1, padding: '1.2rem', background: 'linear-gradient(135deg, rgba(61, 192, 204, 0.9), rgba(14, 86, 114, 0.95))',
                    color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', border: '1px solid rgba(114, 222, 229, 0.5)', borderRadius: '12px',
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(19, 119, 143, 0.4)', transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Add to Cart - ₹{selectedProduct.price * selectedWeight}
                </button>
              </div>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8aa4b8', fontSize: '0.85rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  100% Quality Checked
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8aa4b8', fontSize: '0.85rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  Chemical Free
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
