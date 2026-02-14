import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const GLOBAL_MIN_QUANTITY = 48; // TOTAL minimum across all products
  const DELIVERY_FEE = 150; // Delivery fee

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const getTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const addToCart = (product, quantity = 1) => {
    // Only validate stock availability, no per-product minimum
    if (!product.inStock || product.quantity < 1) {
      alert(`${product.name} is currently out of stock`);
      return false;
    }

    // Check if quantity exceeds available stock
    if (quantity > product.quantity) {
      alert(`Only ${product.quantity} pieces available for ${product.name}`);
      return false;
    }

    setCartItems(prev => {
      const existingItem = prev.find(item => item._id === product._id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.quantity) {
          alert(`Cannot add more. Only ${product.quantity} pieces available`);
          return prev;
        }
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      return [...prev, { ...product, quantity }];
    });
    
    return true;
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = cartItems.find(item => item._id === productId);
    
    if (newQuantity < 1) {
      if (window.confirm('Remove this item from cart?')) {
        removeFromCart(productId);
      }
      return;
    }

    if (newQuantity > product.quantity) {
      alert(`Only ${product.quantity} pieces available`);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartTotalWithDelivery = () => {
    return getCartTotal() + DELIVERY_FEE;
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const canCheckout = () => {
    const totalQty = getTotalQuantity();
    return totalQty >= GLOBAL_MIN_QUANTITY;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartTotalWithDelivery,
    getCartCount,
    getTotalQuantity,
    canCheckout,
    GLOBAL_MIN_QUANTITY,
    DELIVERY_FEE
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
