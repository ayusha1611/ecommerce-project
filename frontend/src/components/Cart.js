import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AddressForm from './AddressForm';

const Cart = ({ onBack }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal,
    getCartTotalWithDelivery,
    clearCart,
    getTotalQuantity,
    canCheckout,
    GLOBAL_MIN_QUANTITY,
    DELIVERY_FEE
  } = useCart();
  
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('cart'); // 'cart', 'address', 'payment'
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'online'

  const COD_ADVANCE_FEE = 99;
  const totalQuantity = getTotalQuantity();
  const canProceed = canCheckout();

  const getFinalTotal = () => {
    return getCartTotalWithDelivery(); // Subtotal + Delivery Fee
  };

  const getCODRemainingAmount = () => {
    return getFinalTotal() - COD_ADVANCE_FEE;
  };

  const getAmountToPay = () => {
    if (paymentMethod === 'cod') {
      return COD_ADVANCE_FEE; // Pay ₹99 advance for COD
    }
    return getFinalTotal(); // Pay full amount for Online
  };

  const handleProceedToAddress = () => {
    if (totalQuantity < GLOBAL_MIN_QUANTITY) {
      alert(`Minimum order quantity is ${GLOBAL_MIN_QUANTITY} pieces total. You have ${totalQuantity} pieces.`);
      return;
    }
    setStep('address');
  };

  const handleAddressSubmit = (address) => {
    setShippingAddress(address);
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!shippingAddress) {
      alert('Please enter delivery address');
      return;
    }

    console.log("Shipping Address Sent:", shippingAddress);

    setLoading(true);
    setMessage('');

    try {
      const items = cartItems.map(item => ({
        product: item._id,
        productName: item.name,
        productImage: item.image || item.images?.[0],
        quantity: item.quantity,
        price: item.price
      }));

      const totalAmount = getFinalTotal();

      const response = await axios.post(
        '/api/orders/create',
        { 
          items, 
          totalAmount,
          paymentMethod: paymentMethod,
          codPrepaidFee: paymentMethod === 'cod' ? COD_ADVANCE_FEE : 0,
          codRemainingAmount: paymentMethod === 'cod' ? getCODRemainingAmount() : 0,
          totalQuantity: totalQuantity,
          deliveryFee: DELIVERY_FEE,
          shippingAddress: shippingAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const { orderId, currency } = response.data;
        const amountToPay = getAmountToPay();

        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          const options = {
            key: 'rzp_test_SF9VWQA5JaZCjL', // Replace with your Razorpay key ID
            amount: amountToPay * 100, // Convert to paise
            currency: currency,
            name: 'Shikhar Garments',
            description: paymentMethod === 'cod' 
              ? `COD Advance Payment (₹${COD_ADVANCE_FEE})` 
              : `Order Payment`,
            order_id: orderId,
            handler: async function (response) {
              try {
                const verifyResponse = await axios.post(
                  '/api/orders/verify-payment',
                  {
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    paymentMethod: paymentMethod
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (verifyResponse.data.success) {
                  const successMsg = paymentMethod === 'cod'
                    ? `✅ Order Confirmed!\n\nOrder Details:\nSubtotal: ₹${getCartTotal()}\nDelivery Fee: ₹${DELIVERY_FEE}\nTotal: ₹${totalAmount}\n\nPayment:\nAdvance Paid: ₹${COD_ADVANCE_FEE}\nPay on Delivery: ₹${getCODRemainingAmount()}\n\nConfirmation sent to your email!`
                    : `✅ Order Confirmed!\n\nOrder Details:\nSubtotal: ₹${getCartTotal()}\nDelivery Fee: ₹${DELIVERY_FEE}\nTotal: ₹${totalAmount}\n\nPayment:\nFully Paid: ₹${totalAmount}\n\nConfirmation sent to your email!`;
                  
                  setMessage(successMsg);
                  clearCart();
                  
                  setTimeout(() => {
                    onBack();
                  }, 5000);
                }
              } catch (error) {
                setMessage('❌ Payment verification failed. Please contact support.');
              }
              setLoading(false);
            },
            prefill: {
              contact: localStorage.getItem('userPhone') || ''
            },
            theme: {
              color: '#2e3192'
            },
            modal: {
              ondismiss: function() {
                setLoading(false);
                setMessage('Payment cancelled');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        };
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage(error.response?.data?.message || '❌ Failed to create order');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page" style={{ padding: '20px', minHeight: '60vh' }}>
        <button 
          onClick={onBack} 
          style={{ 
            marginBottom: '20px', 
            padding: '12px 24px', 
            cursor: 'pointer',
            backgroundColor: '#2e3192',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          ← Continue Shopping
        </button>
        <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some products to get started!</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Remember: Minimum order is {GLOBAL_MIN_QUANTITY} pieces total
          </p>
        </div>
      </div>
    );
  }

  // STEP 1: CART VIEW
  if (step === 'cart') {
    return (
      <div className="cart-page" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={onBack} 
          style={{ 
            marginBottom: '20px', 
            padding: '12px 24px', 
            cursor: 'pointer',
            backgroundColor: '#2e3192',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          ← Continue Shopping
        </button>

        <h2 style={{ marginBottom: '10px' }}>Shopping Cart</h2>
        
        {/* Total Quantity Display */}
        <div style={{
          backgroundColor: totalQuantity >= GLOBAL_MIN_QUANTITY ? '#d4edda' : '#fff3cd',
          padding: '15px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `2px solid ${totalQuantity >= GLOBAL_MIN_QUANTITY ? '#28a745' : '#ffc107'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <strong style={{ fontSize: '18px' }}>
                {totalQuantity >= GLOBAL_MIN_QUANTITY ? '✅' : '⚠️'} Total Quantity: {totalQuantity} pieces
              </strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                {totalQuantity >= GLOBAL_MIN_QUANTITY 
                  ? `Great! You've met the minimum order requirement.`
                  : `Add ${GLOBAL_MIN_QUANTITY - totalQuantity} more pieces to proceed to checkout`
                }
              </p>
            </div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600',
              color: totalQuantity >= GLOBAL_MIN_QUANTITY ? '#28a745' : '#856404'
            }}>
              Minimum Required: {GLOBAL_MIN_QUANTITY} pieces
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="cart-items" style={{ marginBottom: '30px' }}>
          {cartItems.map((item) => (
            <div 
              key={item._id} 
              className="cart-item" 
              style={{ 
                display: 'flex', 
                gap: '20px', 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                marginBottom: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                flexWrap: 'wrap'
              }}
            >
              <img
                src={`http://localhost:5000${item.image || item.images?.[0]}`}
                alt={item.name}
                style={{ 
                  width: '120px', 
                  height: '120px', 
                  objectFit: 'cover', 
                  borderRadius: '8px',
                  flexShrink: 0
                }}
              />
              
              <div style={{ flex: '1', minWidth: '200px' }}>
                <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>{item.name}</h3>
                <div style={{ color: '#00a699', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                  ₹{item.price} per piece
                </div>
                
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  {item.quantity} pieces × ₹{item.price} = <strong>₹{item.quantity * item.price}</strong>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    style={{
                      padding: '8px 16px',
                      border: '2px solid #ddd',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                    min="1"
                    style={{
                      width: '80px',
                      padding: '8px',
                      fontSize: '16px',
                      textAlign: 'center',
                      border: '2px solid #ddd',
                      borderRadius: '5px',
                      fontWeight: 'bold'
                    }}
                  />
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    style={{
                      padding: '8px 16px',
                      border: '2px solid #ddd',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      borderRadius: '5px',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    +1
                  </button>
                </div>
                
                <button
                  onClick={() => removeFromCart(item._id)}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Remove from Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Order Summary</h3>
          
          <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '15px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Total Items:</span>
              <strong>{cartItems.length} products</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Total Quantity:</span>
              <strong>{totalQuantity} pieces</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Subtotal:</span>
              <strong>₹{getCartTotal()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Delivery Fee:</span>
              <strong>₹{DELIVERY_FEE}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Total:</span>
              <strong style={{ fontSize: '20px', color: '#00a699' }}>₹{getFinalTotal()}</strong>
            </div>
          </div>
          
          <button
            onClick={handleProceedToAddress}
            disabled={!canProceed || loading}
            style={{
              width: '100%',
              padding: '18px',
              backgroundColor: canProceed ? '#28a745' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: canProceed ? 'pointer' : 'not-allowed'
            }}
          >
            Proceed to Address
          </button>
          
          {!canProceed && (
            <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '5px', fontSize: '14px' }}>
              <p style={{ margin: '5px 0' }}>
                ⚠️ Add {GLOBAL_MIN_QUANTITY - totalQuantity} more pieces to reach minimum order quantity
              </p>
            </div>
          )}
        </div>

        {/* Mobile Responsive */}
        <style>{`
          @media (max-width: 768px) {
            .cart-item {
              flex-direction: column !important;
            }
            .cart-item img {
              width: 100% !important;
              max-width: 300px !important;
              margin: 0 auto !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // STEP 2: ADDRESS FORM
  if (step === 'address') {
    return (
      <div className="cart-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => setStep('cart')} 
          style={{ 
            marginBottom: '20px', 
            padding: '12px 24px', 
            cursor: 'pointer',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          ← Back to Cart
        </button>

        <h2 style={{ marginBottom: '20px' }}>Delivery Address</h2>

        <AddressForm 
          onSubmit={handleAddressSubmit}
          onCancel={() => setStep('cart')}
        />

        {/* Mobile Responsive */}
        <style>{`
          @media (max-width: 768px) {
            .cart-page {
              padding: 15px !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // STEP 3: PAYMENT METHOD & REVIEW
  if (step === 'payment') {
    return (
      <div className="cart-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <button 
          onClick={() => setStep('address')} 
          style={{ 
            marginBottom: '20px', 
            padding: '12px 24px', 
            cursor: 'pointer',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px'
          }}
        >
          ← Edit Address
        </button>

        <h2 style={{ marginBottom: '20px' }}>Review & Payment</h2>

        {message && (
          <div style={{
            padding: '15px',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '8px',
            marginBottom: '20px',
            whiteSpace: 'pre-line'
          }}>
            {message}
          </div>
        )}

        {/* Delivery Address */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Delivery Address</h3>
         <p style={{ lineHeight: '1.6', margin: 0 }}>
  <strong>{shippingAddress?.name}</strong><br />
  📞 {shippingAddress?.phone}<br />
  {shippingAddress?.fullAddress}<br />
  {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.pincode}<br />
  {shippingAddress?.country}
</p>

        </div>

        {/* Payment Method Selection */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Choose Payment Method</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* COD Option */}
            <label style={{
              display: 'flex',
              alignItems: 'start',
              padding: '15px',
              border: `2px solid ${paymentMethod === 'cod' ? '#28a745' : '#ddd'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: paymentMethod === 'cod' ? '#f0fff4' : 'white'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginTop: '3px' }}
              />
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '5px' }}>
                  💵 Cash on Delivery (COD)
                </strong>
                <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                  Pay ₹99 advance now, Pay ₹{getCODRemainingAmount()} on delivery
                </p>
                <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                  <div style={{ fontSize: '14px' }}>
                    <strong>Pay Now:</strong> ₹{COD_ADVANCE_FEE}
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    <strong>Pay on Delivery:</strong> ₹{getCODRemainingAmount()}
                  </div>
                </div>
              </div>
            </label>

            {/* Online Payment Option */}
            <label style={{
              display: 'flex',
              alignItems: 'start',
              padding: '15px',
              border: `2px solid ${paymentMethod === 'online' ? '#2e3192' : '#ddd'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: paymentMethod === 'online' ? '#f0f2ff' : 'white'
            }}>
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ marginTop: '3px' }}
              />
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '5px' }}>
                  💳 Pay Online
                </strong>
                <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
                  Pay full amount now, Nothing to pay on delivery
                </p>
                <div style={{ backgroundColor: '#e3f2fd', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                  <div style={{ fontSize: '14px' }}>
                    <strong>Pay Now:</strong> ₹{getFinalTotal()}
                  </div>
                  <div style={{ fontSize: '14px', marginTop: '5px' }}>
                    <strong>Pay on Delivery:</strong> ₹0
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Final Order Summary */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Order Summary</h3>
          
          <div style={{ fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal ({totalQuantity} pieces):</span>
              <span>₹{getCartTotal()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Delivery Fee:</span>
              <span>₹{DELIVERY_FEE}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #ddd', marginTop: '8px' }}>
              <strong>Total:</strong>
              <strong style={{ fontSize: '18px', color: '#00a699' }}>₹{getFinalTotal()}</strong>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          style={{
            width: '100%',
            padding: '18px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading 
            ? 'Processing...' 
            : paymentMethod === 'cod'
              ? `Pay ₹${COD_ADVANCE_FEE} Advance & Place Order`
              : `Pay ₹${getFinalTotal()} & Place Order`
          }
        </button>

        {/* Mobile Responsive */}
        <style>{`
          @media (max-width: 768px) {
            .cart-page {
              padding: 15px !important;
            }
            label {
              flex-direction: column !important;
            }
          }
        `}</style>
      </div>
    );
  }
};

export default Cart;
