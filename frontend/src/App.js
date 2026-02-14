import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import ContactUs from './components/ContactUs';
import PhotosPage from './components/PhotosPage';
import OrderHistory from './components/OrderHistory';

function AppContent() {
  const { isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // If admin logs in, show admin dashboard
    if (isAdmin) {
      setCurrentPage('admin');
    }
  }, [isAdmin]);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setSelectedProduct(null);
    window.scrollTo(0, 0);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentPage('product-details');
    window.scrollTo(0, 0);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setCurrentPage('home');
  };

  return (
    <div className="App">
      {!isAdmin && (
        <Header onNavigate={handleNavigation} currentPage={currentPage} />
      )}

      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <>
          {currentPage === 'home' && (
            <HomePage onProductClick={handleProductClick} />
          )}

          {currentPage === 'products' && (
            <ProductsPage onProductClick={handleProductClick} />
          )}

          {currentPage === 'product-details' && selectedProduct && (
            <ProductDetails
              product={selectedProduct}
              onBack={handleBackToProducts}
            />
          )}

          {currentPage === 'cart' && (
            <Cart onBack={() => handleNavigation('home')} />
          )}

          {currentPage === 'contact' && (
            <ContactUs />
          )}

          {currentPage === 'photos' && (
            <PhotosPage onProductClick={handleProductClick} />
          )}

          {currentPage === 'orders' && (
            <OrderHistory onBack={() => handleNavigation('home')} />
          )}
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
