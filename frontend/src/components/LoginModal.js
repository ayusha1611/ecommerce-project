import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ onClose }) => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('user');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validatePhone = (phone) => {
    return phone.length === 10 && /^\d+$/.test(phone);
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Admin login validation
    if (activeTab === 'admin') {
      if (!formData.name || !formData.password) {
        setError('Please enter username and password');
        setLoading(false);
        return;
      }
    }

    // User login validation
    if (activeTab === 'user') {
      if (!validatePhone(formData.phone)) {
        setError('Please enter a 10-digit phone number');
        setLoading(false);
        return;
      }

      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
    }

    const credentials = {
      ...formData,
      isAdmin: activeTab === 'admin'
    };

    const result = await login(credentials);

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 style={{ marginBottom: '20px' }}>Login</h2>

        <div className="login-tabs">
          <button
            className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('user');
              setFormData({ name: '', phone: '', email: '', password: '' });
              setError('');
            }}
          >
            User
          </button>
          <button
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admin');
              setFormData({ name: '', phone: '', email: '', password: '' });
              setError('');
            }}
          >
            Admin
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {activeTab === 'user' ? (
            // USER LOGIN FORM
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  maxLength="10"
                  placeholder="Enter 10-digit phone number"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>
            </>
          ) : (
            // ADMIN LOGIN FORM (Only Username & Password)
            <>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter admin username"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter admin password"
                />
                <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Default admin credentials: admin/admin123</p>
              </div>
            </>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        {activeTab === 'user' && (
          <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
            New user? Enter your name, phone and email to create an account
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
