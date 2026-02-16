import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaShoppingCart, FaUser, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoginModal from './LoginModal';

const Header = ({ onNavigate, currentPage }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartCount } = useCart();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const WHATSAPP_NUMBER = '89552563252'; // Format: country code + number (no +, spaces, or hyphens)
  const PHONE_NUMBER = '8985498524';

  const handleCartClick = () => {
    if (isAuthenticated) {
      onNavigate('cart');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hello! I am interested in your products.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleAboutClick = () => {
    onNavigate('home');
    setTimeout(() => {
      const aboutSection = document.getElementById('about-section');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="header-top">
            <div className="logo-section">
              <div className="logo">LemOn</div>
              <div className="company-info" >
                <h1>LemOn</h1>
                <div className="company-details" style={{ color: 'white' }}>
                <p>Where Inner Beauty Meets Confidence</p>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="contact-btn" onClick={() => window.location.href = `tel:${PHONE_NUMBER}`}>
                <FaPhone /> Call {PHONE_NUMBER}
              </button>
              <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
                <FaWhatsapp /> WhatsApp
              </button>
              <button className="cart-btn" onClick={handleCartClick}>
                <FaShoppingCart /> Cart ({getCartCount()})
              </button>
              {isAuthenticated ? (
                <div className="user-menu">
                  <span style={{ color: 'white', marginRight: '10px' }}>
                    Hi, {user?.name}
                  </span>
                  <button className="logout-btn" onClick={logout}>
                    Logout
                  </button>
                </div>
              ) : (
                <button className="user-btn" onClick={() => setShowLoginModal(true)}>
                  <FaUser /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <nav className="navigation">
        <div className="nav-container">
          <button
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate('home')}
          >
            Home
          </button>
          <button
            className={`nav-link ${currentPage === 'products' ? 'active' : ''}`}
            onClick={() => onNavigate('products')}
          >
            Products & Services
          </button>
          <button 
            className="nav-link"
            onClick={handleAboutClick}
          >
            About Us
          </button>
          <button 
            className={`nav-link ${currentPage === 'photos' ? 'active' : ''}`}
            onClick={() => onNavigate('photos')}
          >
            Photos
          </button>
          {isAuthenticated && (
            <button 
              className={`nav-link ${currentPage === 'orders' ? 'active' : ''}`}
              onClick={() => onNavigate('orders')}
              style={{ backgroundColor: '#28a745' }}
            >
              📦 My Orders
            </button>
          )}
          <button 
            className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
            onClick={() => onNavigate('contact')}
          >
            Contact Us
          </button>
        </div>
      </nav>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
};

export default Header;
