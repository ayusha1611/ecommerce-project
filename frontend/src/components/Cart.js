import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AddressForm from './AddressForm';
import MockPaymentModal from "./MockPaymentModal";
import SuccessAnimation from "./SuccessAnimation";

const Cart = ({ onBack }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal,
    getCartTotalWithDelivery,
    clearCart,
    getTotalQuantity,
    DELIVERY_FEE
  } = useCart();
  
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('cart');
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showPayment, setShowPayment] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const COD_ADVANCE_FEE = 99;
  const totalQuantity = getTotalQuantity();
  const qtyBtn = {
  width: '38px',
  height: '38px',
  borderRadius: '10px',
  border: '1px solid #f0dada',
  background: '#fff3f3',
  fontSize: '18px',
  fontWeight: '600',
  cursor: 'pointer'
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '10px',
  fontSize: '16px',
  color: '#555'
};


  const getFinalTotal = () => getCartTotalWithDelivery();
  const getCODRemainingAmount = () => getFinalTotal() - COD_ADVANCE_FEE;

  const handleProceedToAddress = () => {
    if (totalQuantity < 1) {
      alert("Add at least 1 product to continue.");
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
          paymentMethod,
          codPrepaidFee: paymentMethod === 'cod' ? COD_ADVANCE_FEE : 0,
          codRemainingAmount: paymentMethod === 'cod' ? getCODRemainingAmount() : 0,
          totalQuantity,
          deliveryFee: DELIVERY_FEE,
          shippingAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {

        if (paymentMethod === 'cod') {
          setMessage(
            `✅ Order Confirmed!\n\n` +
            `Total: ₹${totalAmount}\n\n` +
            `Advance Paid: ₹${COD_ADVANCE_FEE}\n` +
            `Pay on Delivery: ₹${getCODRemainingAmount()}`
          );

          clearCart();
          setLoading(false);
          setTimeout(() => onBack(), 4000);

        } else {
          setLoading(false);
          setShowPayment(response.data.orderId);
        }
      }

    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || '❌ Failed to create order');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Your cart is empty 🛒</h3>
      </div>
    );
  }

  // ================= CART VIEW =================
 if (step === 'cart') {
  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '900px',
      margin: '0 auto',
      background: '#faf7f8'
    }}>
      
      <h2 style={{
        fontSize: '30px',
        fontWeight: '600',
        marginBottom: '30px',
        color: '#5a4b4b',
        letterSpacing: '1px'
      }}>
        🛍 Your Beauty Cart
      </h2>

      {cartItems.map((item) => (
        <div
          key={item._id}
          style={{
            display: 'flex',
            gap: '25px',
            padding: '25px',
            borderRadius: '20px',
            background: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            marginBottom: '25px',
            alignItems: 'center'
          }}
        >
          <img
            src={`${process.env.REACT_APP_API_URL}${item.image || item.images?.[0]}`}
            alt={item.name}
            style={{
              width: '140px',
              height: '140px',
              objectFit: 'cover',
              borderRadius: '18px'
            }}
          />

          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#444'
            }}>
              {item.name}
            </h3>

            <p style={{
              color: '#b49b0d97',
              fontSize: '16px',
              margin: '8px 0 18px'
            }}>
              ₹{item.price} per piece
            </p>

            {/* Quantity */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '15px'
            }}>
              <button
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                style={qtyBtn}
              >−</button>

              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item._id, parseInt(e.target.value) || 1)
                }
                min="1"
                style={{
                  width: '60px',
                  textAlign: 'center',
                  padding: '8px',
                  borderRadius: '10px',
                  border: '1px solid #f0dada',
                  fontWeight: '600',
                  background: '#fff8f8'
                }}
              />

              <button
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                style={qtyBtn}
              >+</button>
            </div>

            <button
              onClick={() => removeFromCart(item._id)}
              style={{
                background: '#b49b0d97',
                color: 'white',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}

      {/* Order Summary */}
      <div style={{
        background: '#ffffff',
        padding: '30px',
        borderRadius: '25px',
        boxShadow: '0 15px 40px rgba(0,0,0,0.06)'
      }}>
        <h3 style={{
          fontSize: '22px',
          marginBottom: '20px',
          color: '#5a4b4b'
        }}>
          Order Summary
        </h3>

        <div style={rowStyle}>
          <span>Subtotal</span>
          <span>₹{getCartTotal()}</span>
        </div>

        <div style={rowStyle}>
          <span>Delivery Fee</span>
          <span>₹{DELIVERY_FEE}</span>
        </div>

        <div style={{
          ...rowStyle,
          fontSize: '20px',
          fontWeight: '600',
          marginTop: '15px',
          borderTop: '1px solid #f0e6e6',
          paddingTop: '15px'
        }}>
          <span>Total</span>
          <span style={{ color: '#b49b0d97' }}>
            ₹{getFinalTotal()}
          </span>
        </div>

        <button
          onClick={handleProceedToAddress}
          style={{
            width: '100%',
            marginTop: '25px',
            padding: '16px',
            borderRadius: '18px',
            border: 'none',
            background: 'linear-gradient(45deg, #b49b0d97, hsla(51, 59%, 22%, 0.59))',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(198,123,140,0.3)'
          }}
        >
          Proceed to Address 💖
        </button>
      </div>
    </div>
  );
}


  // ================= ADDRESS =================
  if (step === 'address') {
    return (
      <AddressForm
        onSubmit={handleAddressSubmit}
        onCancel={() => setStep('cart')}
      />
    );
  }

  // ================= PAYMENT =================
 
 if (step === 'payment') {
  return (
    <div style={{ 
      padding: '30px', 
      maxWidth: '600px', 
      margin: '40px auto',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 15px 40px rgba(0,0,0,0.08)'
    }}>

      <h2 style={{
        fontSize: '26px',
        marginBottom: '25px',
        fontWeight: '600',
        color: '#2d2d2d'
      }}>
        Choose Payment Method
      </h2>

      {/* Payment Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        {/* COD Card */}
        <div
          onClick={() => setPaymentMethod('cod')}
          style={{
            padding: '18px',
            borderRadius: '14px',
            border: paymentMethod === 'cod' 
              ? '2px solid  #b49b0d97' 
              : '1px solid white',
            background: paymentMethod === 'cod' 
              ? 'white' 
              : 'white',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          <label style={{ cursor: 'pointer', fontWeight: '500' }}>
            <input
              type="radio"
              value="cod"
              checked={paymentMethod === 'cod'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            Cash on Delivery
          </label>
        </div>

        {/* Online Card */}
        <div
          onClick={() => setPaymentMethod('online')}
          style={{
            padding: '18px',
            borderRadius: '14px',
            border: paymentMethod === 'online' 
              ? '2px solid  #b49b0d97' 
              : '1px solid white',
            background: paymentMethod === 'online' 
              ? 'white' 
              : 'white',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          <label style={{ cursor: 'pointer', fontWeight: '500' }}>
            <input
              type="radio"
              value="online"
              checked={paymentMethod === 'online'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            Pay Online
          </label>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          marginTop: '30px',
          borderRadius: '14px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #b49b0d97, hsla(51, 59%, 22%, 0.59))',
          color: 'white',
          cursor: 'pointer',
          transition: '0.3s',
          boxShadow: '0 8px 20px rgba(210,139,139,0.4)'
        }}
      >
        {loading ? "Processing..." : "Place Order"}
      </button>

        {showPayment && (
          <MockPaymentModal
            orderId={showPayment}
            amount={getFinalTotal()}
            onSuccess={(paymentId) => {
              const msg =
                `Transaction ID: ${paymentId}\n\n` +
                `Total Paid: ₹${getFinalTotal()}`;

              setSuccessMessage(msg);
              setShowSuccess(true);
              setShowPayment(null);
              clearCart();

              setTimeout(() => {
                setShowSuccess(false);
                onBack();
              }, 3000);
            }}
            onClose={() => setShowPayment(null)}
          />
        )}

        {showSuccess && (
          <SuccessAnimation message={successMessage} />
        )}
      </div>
    );
  }
};

export default Cart;
