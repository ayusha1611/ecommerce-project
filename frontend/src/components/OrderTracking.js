import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OrderTracking = ({ orderId, onBack }) => {
  const { token } = useAuth();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracking();
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}/tracking`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTracking(response.data.tracking);
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳',
      'confirmed': '✅',
      'processing': '📦',
      'shipped': '🚚',
      'out_for_delivery': '🏃',
      'delivered': '✅',
      'cancelled': '❌'
    };
    return icons[status] || '📦';
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading tracking information...</div>;
  }

  if (!tracking) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Order not found</div>;
  }

  const allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = allStatuses.indexOf(tracking.orderStatus);

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '0 20px' }}>
      {onBack && (
        <button onClick={onBack} style={{ 
          marginBottom: '20px', 
          padding: '10px 20px', 
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          color: '#2e3192',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          ← Back to Orders
        </button>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>Track Your Order</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
          <div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Order ID</p>
            <p style={{ fontSize: '18px', fontWeight: '600' }}>#{tracking.orderId.slice(-8)}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Order Date</p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>
              {new Date(tracking.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Current Status */}
        <div style={{ 
          backgroundColor: getStatusColor(tracking.orderStatus) + '20',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: `2px solid ${getStatusColor(tracking.orderStatus)}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '40px' }}>
              {getStatusIcon(tracking.orderStatus)}
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Current Status</p>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '600',
                color: getStatusColor(tracking.orderStatus),
                margin: 0
              }}>
                {getStatusLabel(tracking.orderStatus)}
              </h3>
            </div>
          </div>
        </div>

        {/* Tracking Number */}
        {tracking.trackingNumber && (
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '15px 20px', 
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Tracking Number</p>
            <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
              {tracking.trackingNumber}
            </p>
          </div>
        )}

        {/* Progress Timeline */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ fontSize: '18px', marginBottom: '20px' }}>Order Progress</h4>
          <div style={{ position: 'relative' }}>
            {allStatuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={status} style={{ position: 'relative', paddingLeft: '60px', marginBottom: '30px' }}>
                  {/* Connector Line */}
                  {index < allStatuses.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '19px',
                      top: '30px',
                      width: '2px',
                      height: '40px',
                      backgroundColor: isCompleted ? getStatusColor(status) : '#ddd'
                    }} />
                  )}
                  
                  {/* Status Circle */}
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted ? getStatusColor(status) : '#f0f0f0',
                    border: `3px solid ${isCompleted ? getStatusColor(status) : '#ddd'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  
                  {/* Status Info */}
                  <div>
                    <p style={{ 
                      fontSize: '16px', 
                      fontWeight: isCurrent ? '600' : 'normal',
                      color: isCompleted ? '#333' : '#999',
                      margin: '0 0 5px 0'
                    }}>
                      {getStatusLabel(status)}
                    </p>
                    {isCurrent && tracking.statusHistory && tracking.statusHistory.length > 0 && (
                      <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
                        {new Date(tracking.statusHistory[tracking.statusHistory.length - 1].timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status History */}
        {tracking.statusHistory && tracking.statusHistory.length > 0 && (
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>Order History</h4>
            <div style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '20px' }}>
              {tracking.statusHistory.slice().reverse().map((item, index) => (
                <div 
                  key={index} 
                  style={{ 
                    paddingBottom: '15px', 
                    marginBottom: '15px',
                    borderBottom: index < tracking.statusHistory.length - 1 ? '1px solid #ddd' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ 
                        fontSize: '16px', 
                        fontWeight: '600',
                        margin: '0 0 5px 0',
                        color: getStatusColor(item.status)
                      }}>
                        {getStatusIcon(item.status)} {getStatusLabel(item.status)}
                      </p>
                      {item.note && (
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                          {item.note}
                        </p>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
