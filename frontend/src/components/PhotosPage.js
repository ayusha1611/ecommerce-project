import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PhotosPage = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading photos...</div>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '30px auto', padding: '0 20px' }}>
      <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#b49b0d97' }}>
        Photos
      </h2>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
        Browse our product gallery
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => onProductClick(product)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            <img
              src={`${process.env.REACT_APP_API_URL}${product.image}`}
              alt={product.name}
              style={{
                width: '100%',
                height: '350px',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
              padding: '30px 15px 15px',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                {product.name}
              </h3>
              <p style={{ fontSize: '16px', margin: '5px 0 0 0', color: '#00a699' }}>
                ₹{product.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📷</div>
          <h3>No photos available</h3>
          <p>Check back later for product photos!</p>
        </div>
      )}
    </div>
  );
};

export default PhotosPage;
