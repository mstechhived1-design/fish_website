import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    
    let message = "Hello YNR Fishes! I would like to place an order:%0A%0A";
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.title}* - Qty: ${item.quantity} (₹${item.price}/kg) = ₹${item.quantity * item.price}%0A`;
    });
    
    message += `%0A*Total Estimated Value: ₹${cartTotal}*%0A%0APlease let me know the availability and payment details.`;
    
    window.open(`https://wa.me/919849313889?text=${message}`, '_blank');
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050
        }}
        onClick={() => setIsCartOpen(false)}
      />
      
      <div style={{
        position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '400px', height: '100%',
        backgroundColor: '#010A14', borderLeft: '1px solid rgba(61, 192, 204, 0.3)',
        zIndex: 1060, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        animation: 'slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        <div style={{
          padding: '1.5rem', borderBottom: '1px solid rgba(61, 192, 204, 0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: 0, fontFamily: 'var(--font-display)' }}>Your Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer' }}
          >&times;</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ color: '#8aa4b8', textAlign: 'center', marginTop: '3rem' }}>
              Your cart is currently empty.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {cartItems.map((item) => (
                <div key={item.title} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <img 
                    src={item.imgUrl} 
                    alt={item.title} 
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ color: '#fff', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{item.title}</h4>
                    <div style={{ color: '#3dc0cc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>₹{item.price} / kg</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button 
                        onClick={() => updateQuantity(item.title, item.quantity - 1)}
                        style={{ background: '#0e5672', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}
                      >-</button>
                      <span style={{ color: '#fff', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.title, item.quantity + 1)}
                        style={{ background: '#0e5672', border: 'none', color: '#fff', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer' }}
                      >+</button>
                      
                      <button 
                        onClick={() => removeFromCart(item.title)}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff4e50', cursor: 'pointer', fontSize: '0.85rem' }}
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(61, 192, 204, 0.2)', backgroundColor: 'rgba(3, 20, 36, 0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            <span>Total Value</span>
            <span>₹{cartTotal}</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            style={{
              width: '100%', padding: '1rem',
              background: cartItems.length === 0 ? '#555' : 'linear-gradient(135deg, #25D366, #128C7E)',
              color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', borderRadius: '8px',
              cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
              boxShadow: cartItems.length === 0 ? 'none' : '0 4px 15px rgba(37, 211, 102, 0.3)'
            }}
          >
            Checkout via WhatsApp
          </button>
        </div>
      </div>
      <style>
        {`
          @keyframes slideInRight {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}
      </style>
    </>
  );
}
