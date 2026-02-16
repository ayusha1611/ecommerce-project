import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStore, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';

const HomePage = ({ onProductClick }) => {
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
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div>
      {/* Product Carousel */}
      <div className="product-carousel">
        <h2 style={{ fontSize: '28px', marginBottom: '20px', color: '#333' }}>
          Our Products
        </h2>
        <div className="carousel-container">
          {products.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => onProductClick(product)}
            >
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <p className="product-name">{product.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <section className="about-section" id="about-section">
        <div className="about-container">
          <h2>About Us</h2>
         

          <div className="company-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FaStore />
              </div>
              
              <p>Fashion Forward</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaFileAlt />
              </div>
              <p>Trendy makeup products</p>
             
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <h3>Fastest Delivery</h3>
              <p>3-4 days</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaFileAlt />
              </div>
              <p>Approved by Customers</p>
              
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '15px', color: '#b49b0d97' }}>LemOn — Where Fashion Meets Confidence</h3>
      
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>About Our Company</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#666', textAlign: 'left', maxWidth: '900px', margin: '0 auto' }}>
             Established with a vision to inspire confidence and self-expression, LemOn is your ultimate destination for fashion, beauty, and lifestyle essentials.

We curate trendy apparel, premium makeup products, stylish accessories, and everyday must-haves designed for modern lifestyles. From chic outfits and comfortable daily wear to high-quality beauty essentials and statement accessories, LemOn offers thoughtfully selected collections for men, women, and kids.

Our mission is simple — to blend quality, affordability, and the latest trends into one seamless shopping experience. At LemOn, style meets convenience, and confidence begins with what you wear.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
