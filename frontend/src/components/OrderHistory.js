import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import OrderTracking from './OrderTracking';

const OrderHistory = ({ onBack }) => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
const [cancelOrderId, setCancelOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'confirmed': '#28a745',
      'processing': '#17a2b8',
      'shipped': '#007bff',
      'out_for_delivery': '#ff9800',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

 const handleCancel = async () => {
  if (!cancelOrderId) return;

  try {
    const response = await axios.put(
      `/api/orders/${cancelOrderId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      fetchOrders();
      setCancelOrderId(null);
    }
  } catch (error) {
    console.error("Cancel error:", error);
  }
};


  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return labels[status] || status;
  };

  if (showTracking && selectedOrder) {
    return (
      <OrderTracking
        orderId={selectedOrder._id}
        onBack={() => {
          setShowTracking(false);
          setSelectedOrder(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            marginBottom: '20px',
            padding: '12px 24px',
            backgroundColor: '#2e3192',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Back to Home
        </button>
      )}

      <h2 style={{ marginBottom: '20px' }}>My Orders</h2>

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
          <h3>No orders yet</h3>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Start shopping to see your orders here!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Order Header */}
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '15px 20px',
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div>
                  <strong>Order #{order._id.slice(-8)}</strong>
                  <p style={{ fontSize: '13px', color: '#666', margin: '5px 0 0 0' }}>
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: getStatusColor(order.orderStatus) + '20',
                  color: getStatusColor(order.orderStatus),
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  {getStatusLabel(order.orderStatus)}
                </div>
              </div>

              {/* Order Content */}
              <div style={{ padding: '20px' }}>
                {/* Items */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '15px', fontSize: '16px' }}>Items ({order.items.length})</h4>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '10px',
                        paddingBottom: '10px',
                        borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none'
                      }}
                    >
                      <img
                        src={`http://localhost:5000${item.productImage}`}
                        alt={item.productName}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '5px'
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', marginBottom: '5px' }}>{item.productName}</p>
                        <p style={{ fontSize: '14px', color: '#666' }}>
                          Qty: {item.quantity} × ₹{item.price} = ₹{item.quantity * item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Address */}
                {order.shippingAddress && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px'
                  }}>
                    <h4 style={{ marginBottom: '10px', fontSize: '16px' }}>Delivery Address</h4>
                    <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      {order.shippingAddress.fullAddress}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                )}

                {/* Tracking Number */}
                {order.trackingNumber && (
                  <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#e8f5e9',
                    borderRadius: '5px',
                    border: '1px solid #c8e6c9'
                  }}>
                    <h4 style={{ marginBottom: '5px', fontSize: '16px', color: '#2e7d32' }}>
                      Tracking Number
                    </h4>
                    <p style={{ fontSize: '18px', fontWeight: '600', color: '#1b5e20', margin: 0 }}>
                      {order.trackingNumber}
                    </p>
                  </div>
                )}

                {/* Order Summary */}
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '5px',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Subtotal:</span>
                    <span>₹{order.totalAmount - (order.deliveryFee || 150)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Delivery Fee:</span>
                    <span>₹{order.deliveryFee || 150}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingTop: '8px', borderTop: '1px solid #dee2e6' }}>
                    <strong>Total:</strong>
                    <strong style={{ color: '#00a699' }}>₹{order.totalAmount}</strong>
                  </div>

                  {order.paymentMethod === 'cod' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #dee2e6' }}>
                        <span style={{ color: '#28a745' }}>Advance Paid:</span>
                        <span style={{ color: '#28a745', fontWeight: '600' }}>₹{order.codPrepaidFee}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Pay on Delivery:</span>
                        <span style={{ fontWeight: '600' }}>₹{order.codRemainingAmount}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowTracking(true);
                    }}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '12px 20px',
                      backgroundColor: '#2e3192',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    📍 Track Order
                  </button>
                  <button
                    onClick={() => {
                      // Open WhatsApp support
                      const message = `Hi, I need help with Order #${order._id.slice(-8)}`;
                      window.open(`https://wa.me/918044464872?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '12px 20px',
                      backgroundColor: '#25d366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    💬 Contact Support
                  </button>
                  {['pending', 'confirmed', 'processing'].includes(order.orderStatus) && (
      <button
  onClick={() => setCancelOrderId(order._id)}
  style={{
    flex: 1,
    minWidth: '150px',
    padding: '12px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  }}
>
  ❌ Cancel Order
</button>

)}

                </div>
              </div>
            </div>
          ))}
        </div>
      )}

{cancelOrderId && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '400px',
      textAlign: 'center'
    }}>
      <h3>Cancel Order?</h3>
      <p style={{ margin: '15px 0', color: '#666' }}>
        Are you sure you want to cancel this order?
      </p>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setCancelOrderId(null)}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          No
        </button>

        <button
          onClick={handleCancel}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          h2 {
            font-size: 24px;
          }
          button {
            width: 100% !important;
            min-width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
};

export default OrderHistory;
