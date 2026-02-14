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
          <p>
            Shikhar Garments - Retailer of men shorts, men lower & other products in Katihar, Bihar.
          </p>

          <div className="company-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FaStore />
              </div>
              <h3>Nature of Business</h3>
              <p>Retailer</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaFileAlt />
              </div>
              <h3>Legal Status of Firm</h3>
              <p>Proprietorship</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaCalendarAlt />
              </div>
              <h3>Annual Turnover</h3>
              <p>0 - 40 L</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <FaFileAlt />
              </div>
              <h3>GST Registration Date</h3>
              <p>01-07-2017</p>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>GST Number</h3>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e3192' }}>
              10BRJPB9017P1ZQ
            </p>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>About Our Company</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#666', textAlign: 'left', maxWidth: '900px', margin: '0 auto' }}>
              Established in 2017, Shikhar Garments has been serving quality garments to customers across Katihar, Bihar. 
              We specialize in men's shorts, lowers, kids wear, and other apparel products. Our commitment to quality and 
              customer satisfaction has made us a trusted name in the region. We offer a wide range of products including 
              cotton boxers, regular stripe shorts, apple cut running shorts, half pants, jogger pants, and much more. 
              With 8 years of experience in the garment retail industry, we understand our customers' needs and strive 
              to provide the best products at competitive prices.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
