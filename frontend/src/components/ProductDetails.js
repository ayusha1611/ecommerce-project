import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const ProductDetails = ({ product, onBack }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || product.image);

  useEffect(() => {
    fetchReviews();
    setSelectedImage(product.images?.[0] || product.image);
  }, [product._id]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/api/reviews/product/${product._id}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleQuantityChange = (newQty) => {
    if (newQty < 1) {
      alert('Minimum quantity is 1 piece');
      return;
    }
    
    if (newQty > product.quantity) {
      alert(`Only ${product.quantity} pieces available`);
      return;
    }
    
    setQuantity(newQty);
  };

  const handleAddToCart = () => {
    if (!product.inStock || product.quantity < 1) {
      alert('This product is currently out of stock');
      return;
    }
    
    if (quantity < 1) {
      alert('Minimum quantity is 1 piece');
      return;
    }

    if (quantity > product.quantity) {
      alert(`Only ${product.quantity} pieces available`);
      return;
    }

    addToCart(product, quantity);
    alert(`Added ${quantity} pieces to cart!`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to submit a review');
      return;
    }

    try {
      await axios.post(
        '/api/reviews',
        {
          productId: product._id,
          rating: newReview.rating,
          comment: newReview.comment
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      alert('Review submitted successfully!');
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      alert('Failed to submit review');
    }
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const isInStock = product.inStock && product.quantity > 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
      <button onClick={onBack} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        border: 'none',
        background: 'none',
        color: '#2e3192',
        fontSize: '16px',
        cursor: 'pointer',
        marginBottom: '20px',
        fontWeight: '600'
      }}>
        <FaArrowLeft /> Back to Products
      </button>

     <div
  className="product-details-grid"
  style={{ display: 'grid', gap: '40px', marginBottom: '40px' }}
>

        {/* Product Images */}
        <div>
          {/* Main Image */}
          <div style={{ 
            width: '100%', 
            height: '500px', 
            backgroundColor: '#f5f5f5',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src={`http://localhost:5000${selectedImage}`}
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Image Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${Math.min(product.images.length, 5)}, 1fr)`, 
              gap: '10px' 
            }}>
              {product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '100%',
                    height: '100px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '5px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === img ? '3px solid #b49b0d97' : '2px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img
                    src={`http://localhost:5000${img}`}
                    alt={`${product.name} ${index + 1}`}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  style={{ color: star <= averageRating ? '#ffa500' : '#ddd', fontSize: '18px' }}
                />
              ))}
              <span style={{ marginLeft: '8px', color: '#666' }}>
                ({reviews.length} reviews)
              </span>
            </div>
          </div>

          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#00a699', 
            marginBottom: '20px' 
          }}>
            ₹{product.price}
            <span style={{ fontSize: '16px', color: '#666', fontWeight: 'normal' }}> per piece</span>
          </div>

          {/* STOCK STATUS */}
          <div style={{ 
            padding: '20px', 
            backgroundColor: isInStock ? '#d4edda' : '#f8d7da',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `2px solid ${isInStock ? '#28a745' : '#dc3545'}`
          }}>
            {isInStock ? (
              <div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#28a745',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✅ In Stock
                </div>
                <p style={{ color: '#155724', margin: '5px 0', fontSize: '15px' }}>
                  <strong>{product.quantity}</strong> pieces available
                </p>
              </div>
            ) : (
              <div>
                <div style={{ 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  color: '#dc3545',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚠️ Out of Stock
                </div>
                <p style={{ color: '#721c24', fontSize: '15px' }}>
                  This product is currently unavailable.
                </p>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Description</h3>
            <p style={{ color: '#666', lineHeight: '1.8' }}>{product.description}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              <strong>Category:</strong> {product.category}
            </p>
            {product.subcategory && (
              <p style={{ fontSize: '14px', color: '#666' }}>
                <strong>Subcategory:</strong> {product.subcategory}
              </p>
            )}
          </div>

          {/* Quantity Selector */}
          {isInStock && (
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '10px' 
              }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  style={{
                    padding: '12px 20px',
                    fontSize: '20px',
                    border: '2px solid #ddd',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                  }}
                >
                  -1
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  min={1}
                  step={1}
                  style={{
                    width: '100px',
                    padding: '12px',
                    fontSize: '18px',
                    textAlign: 'center',
                    border: '2px solid #ddd',
                    borderRadius: '5px',
                    fontWeight: 'bold'
                  }}
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity + 1 > product.quantity}
                  style={{
                    padding: '12px 20px',
                    fontSize: '20px',
                    border: '2px solid #ddd',
                    backgroundColor: quantity + 1 > product.quantity ? '#f5f5f5' : 'white',
                    cursor: quantity + 1 > product.quantity ? 'not-allowed' : 'pointer',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    opacity: quantity + 1 > product.quantity ? 0.5 : 1
                  }}
                >
                  +1
                </button>
              </div>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                Available: {product.quantity} pieces
              </p>
            </div>
          )}

          {/* Total Price */}
          {isInStock && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#f9f9f9', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '600' }}>Total Price:</span>
                <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#00a699' }}>
                  ₹{(product.price * quantity).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                {quantity} pieces × ₹{product.price} per piece
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            style={{
              width: '100%',
              padding: '18px',
              backgroundColor: isInStock ? '#b49b0d97' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: isInStock ? 'pointer' : 'not-allowed',
              marginBottom: '15px'
            }}
          >
            {isInStock ? `Add ${quantity} Pieces to Cart` : 'Currently Out of Stock'}
          </button>

          {!isInStock && (
            <button
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: 'white',
                color: '#b49b0d97',
                border: '2px solid #b49b0d97',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Notify Me When Available
            </button>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: '50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Customer Reviews</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#00a699',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '30px' 
          }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Rating</label>
              <select
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
              >
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Poor</option>
                <option value="1">1 Star - Terrible</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Comment</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows="4"
                style={{ width: '100%', padding: '10px', marginTop: '5px' }}
                required
              />
            </div>
            <button type="submit" style={{
              padding: '10px 30px',
              backgroundColor: '#b49b0d97',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Submit Review
            </button>
          </form>
        )}

        <div>
          {reviews.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
              No reviews yet. Be the first to review this product!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review._id} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '15px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong>{review.userName}</strong>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        style={{ color: star <= review.rating ? '#ffa500' : '#ddd' }}
                      />
                    ))}
                  </div>
                </div>
                <p style={{ color: '#666' }}>{review.comment}</p>
                <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
