import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { token, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0
  });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    quantity: 0,
    
    images: []
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    order: 0
  });

  const [settings, setSettings] = useState({
    adminEmail: '',
    adminPhone: '',
    adminWhatsApp: '',
    smtpConfig: {
      host: 'smtp.gmail.com',
      port: 587,
      user: '',
      password: ''
    },
    smsConfig: {
      apiKey: '',
      senderId: 'SHIKHR'
    },
    minOrderQuantity: 48
  });

  const [editingQuantity, setEditingQuantity] = useState({});
  const [orderTracking, setOrderTracking] = useState({});

  useEffect(() => {
    fetchData();
    fetchCategories();
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.reload();
    }
  };

  const fetchData = async () => {
    try {
      if (activeTab === 'products') {
        const response = await axios.get('/api/products');
        setProducts(response.data.products || []);
        setStats(prev => ({ ...prev, totalProducts: response.data.products?.length || 0 }));
      } else if (activeTab === 'orders') {
        const response = await axios.get('/api/orders/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(response.data.orders || []);
        setStats(prev => ({ ...prev, totalOrders: response.data.orders?.length || 0 }));
      } else if (activeTab === 'users') {
        const response = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data.users || []);
        setStats(prev => ({ ...prev, totalUsers: response.data.users?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'images' && files) {
      setProductForm({ ...productForm, images: Array.from(files) });
    } else {
      setProductForm({ ...productForm, [name]: value });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('category', productForm.category);
      formData.append('subcategory', productForm.subcategory);
      formData.append('quantity', productForm.quantity);
      formData.append('minOrderQuantity', productForm.minOrderQuantity);
      
      productForm.images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await axios.post('/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage('Product added successfully!');
        setShowAddProduct(false);
        setProductForm({ 
          name: '', 
          description: '', 
          price: '', 
          category: '', 
          subcategory: '', 
          quantity: 0,
          minOrderQuantity: 24,
          images: []
        });
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to add product');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      const response = await axios.patch(
        `/api/products/${productId}/quantity`,
        { quantity: parseInt(newQuantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessage('Quantity updated! Stock status refreshed.');
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to update quantity');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Product deleted successfully!');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete product');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    const trackingNumber = orderTracking[orderId] || '';
    const note = `Order status updated to ${status}`;

    try {
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status, trackingNumber, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Order status updated!');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update order');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCategoryFormChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/categories', categoryForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage('Category added successfully!');
        setShowAddCategory(false);
        setCategoryForm({ name: '', description: '', order: 0 });
        fetchCategories();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add category');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Category deleted successfully!');
      fetchCategories();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to delete category');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleToggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const category = categories.find(c => c._id === categoryId);
      await axios.put(
        `/api/categories/${categoryId}`,
        { ...category, isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Category status updated!');
      fetchCategories();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update category');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleInitializeCategories = async () => {
    try {
      const response = await axios.post('/api/categories/initialize', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(response.data.message);
      fetchCategories();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to initialize categories');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await axios.put('/api/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Failed to save settings');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const exportOrdersToCSV = () => {
    // CSV Headers
    const headers = [
  'Order ID',
  'Order Date',
  'Customer Name',
  'Customer Phone',
  'Full Address',
  'City',
  'State',
  'Pincode',
  'Country',
  'COD Amount',
  'Order Value',
  'Advance Paid',
  'Total Quantity',
  'Payment Method',
  'Order Status',
  'Tracking Number',
  'Pickup Address'
  ];
  
    // CSV Rows
    const rows = orders.map(order => [
  order._id.slice(-8),
  new Date(order.createdAt).toLocaleDateString(),
  order.userName,
  order.userPhone,
  order.shippingAddress?.fullAddress || '',
  order.shippingAddress?.city || '',
  order.shippingAddress?.state || '',
  order.shippingAddress?.pincode || '',
  order.shippingAddress?.country || '',
  order.codRemainingAmount || 0,
  order.totalAmount,
  order.codPrepaidFee || 0,
  order.items.reduce((sum, item) => sum + item.quantity, 0),
  order.paymentMethod === 'cod' ? 'COD' : 'Online',
  order.orderStatus,
  order.trackingNumber || '-',
  'Katihar, Bihar, India'
 ]);


    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage('Orders exported to CSV successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Admin Dashboard</h2>
            <p>Manage your products, orders, and settings</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#666', fontSize: '16px' }}>
              Welcome, <strong>{user?.name}</strong>
            </span>
            <button 
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              Logout & Return to Home
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
          color: message.includes('success') ? '#155724' : '#721c24',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-card">
          <h3>{stats.totalProducts}</h3>
          <p>Total Products</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalOrders}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="login-tabs" style={{ marginBottom: '30px' }}>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
{/* Products Tab */}
{activeTab === 'products' && (
  <div className="dashboard-section">

    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '20px' 
    }}>
      <h3>Products</h3>
      <button 
        className="add-product-btn" 
        onClick={() => setShowAddProduct(!showAddProduct)}
      >
        {showAddProduct ? 'Cancel' : '+ Add Product'}
      </button>
    </div>

    {showAddProduct && (
  <form
  onSubmit={handleAddProduct}
  style={{
    marginBottom: '30px',
    padding: '30px',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px'
  }}
>
  {/* Row 1 */}
  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
    <input
      type="text"
      name="name"
      placeholder="Product Name"
      value={productForm.name}
      onChange={handleProductFormChange}
      required
      style={{ flex: 1, padding: '10px' }}
    />

    <textarea
      name="description"
      placeholder="Description"
      value={productForm.description}
      onChange={handleProductFormChange}
      required
      style={{ flex: 1, padding: '10px' }}
    />

    <input
      type="number"
      name="price"
      placeholder="Price"
      value={productForm.price}
      onChange={handleProductFormChange}
      required
      style={{ width: '150px', padding: '10px' }}
    />
  </div>

  {/* Row 2 */}
  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
    <select
      name="category"
      value={productForm.category}
      onChange={handleProductFormChange}
      required
      style={{ flex: 1, padding: '10px' }}
    >
      <option value="">Select Category</option>
      {categories.map(cat => (
        <option key={cat._id} value={cat.name}>
          {cat.name}
        </option>
      ))}
    </select>

    <input
      type="number"
      name="quantity"
      placeholder="Quantity"
      value={productForm.quantity}
      onChange={handleProductFormChange}
      required
      style={{ width: '150px', padding: '10px' }}
    />

    <input
      type="number"
      name="minOrderQuantity"
      placeholder="Min Order"
      value={productForm.minOrderQuantity}
      onChange={handleProductFormChange}
      style={{ width: '150px', padding: '10px' }}
    />
  </div>

  {/* Row 3 */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <input
      type="file"
      name="images"
      multiple
      onChange={handleProductFormChange}
      required
    />

    <button
      type="submit"
      style={{
        padding: '10px 25px',
        backgroundColor: '#00a699',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        fontWeight: '600',
        cursor: 'pointer'
      }}
    >
      Add Product
    </button>
  </div>
</form>

)}


    <div className="product-list">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Min Order</th>
              <th>Stock Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img
                   src={`${process.env.REACT_APP_API_URL}${product.image || product.images?.[0]}`}

                    alt={product.name}
                    className="product-thumbnail"
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>
                  <input
                    type="number"
                    value={
                      editingQuantity[product._id] !== undefined
                        ? editingQuantity[product._id]
                        : product.quantity
                    }
                    onChange={(e) =>
                      setEditingQuantity({
                        ...editingQuantity,
                        [product._id]: e.target.value
                      })
                    }
                    onBlur={() => {
                      if (editingQuantity[product._id] !== undefined) {
                        handleUpdateQuantity(
                          product._id,
                          editingQuantity[product._id]
                        );
                      }
                    }}
                    style={{
                      width: '70px',
                      padding: '5px',
                      textAlign: 'center'
                    }}
                    min="0"
                  />
                </td>
                <td>{product.minOrderQuantity || 24}</td>
                <td>
                  {product.inStock &&
                  product.quantity >= (product.minOrderQuantity || 24) ? (
                    <span style={{ color: '#28a745', fontWeight: '600' }}>
                      ✅ In Stock
                    </span>
                  ) : (
                    <span style={{ color: '#dc3545', fontWeight: '600' }}>
                      ⚠️ Out of Stock
                    </span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDeleteProduct(product._id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> {/* table-wrapper */}
    </div>   {/* product-list */}

  </div>    
)}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Manage Categories</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="add-product-btn" 
                onClick={handleInitializeCategories}
                style={{ backgroundColor: '#ff9800' }}
              >
                Initialize Default Categories
              </button>
              <button className="add-product-btn" onClick={() => setShowAddCategory(!showAddCategory)}>
                {showAddCategory ? 'Cancel' : '+ Add Category'}
              </button>
            </div>
          </div>

          {showAddCategory && (
            <form onSubmit={handleAddCategory} style={{ marginBottom: '30px', padding: '25px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  required
                  placeholder="e.g., Women Wear, Sports Wear"
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryFormChange}
                  rows="2"
                  placeholder="Category description..."
                />
              </div>
              <div className="form-group">
                <label>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={categoryForm.order}
                  onChange={handleCategoryFormChange}
                  min="0"
                  placeholder="0"
                />
                <p style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                  Lower numbers appear first
                </p>
              </div>
              <button type="submit" className="submit-btn">Add Category</button>
            </form>
          )}

          <div className="product-list">
            <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const productCount = products.filter(p => p.category === category.name).length;
                  return (
                    <tr key={category._id}>
                      <td>{category.order}</td>
                      <td style={{ fontWeight: '600' }}>{category.name}</td>
                      <td>{category.description || '-'}</td>
                      <td>
                        <button
                          onClick={() => handleToggleCategoryStatus(category._id, category.isActive)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: category.isActive ? '#d4edda' : '#f8d7da',
                            color: category.isActive ? '#155724' : '#721c24'
                          }}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>{productCount}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteCategory(category._id)}
                            disabled={productCount > 0}
                            style={{ opacity: productCount > 0 ? 0.5 : 1 }}
                            title={productCount > 0 ? 'Cannot delete category with products' : 'Delete category'}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div> {/* table-wrapper */}

            {categories.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                <p>No categories yet. Click "Initialize Default Categories" to add default categories or add your own.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>Orders</h3>
            <button
              onClick={exportOrdersToCSV}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              📥 Export to CSV (Shipment Ready)
            </button>
          </div>
          <div className="order-list">
            <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Delivery Address</th>

                  <th>Items</th>
                  <th>Total Qty</th>
                  <th>Payment Method</th>
                  <th>Total</th>
                  <th>COD Balance</th>
                  <th>Status</th>
                  <th>Tracking No.</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-8)}</td>
                    <td>{order.userName}</td>
                    <td>{order.userPhone}</td>
                    <td style={{ maxWidth: '250px', fontSize: '13px', lineHeight: '1.4' }}>
  {order.shippingAddress && (
    <>
      <strong>{order.shippingAddress.fullAddress}</strong><br />
      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
      {order.shippingAddress.country}
    </>
  )}
 </td>

                    <td>{order.items.length}</td>
                    <td style={{ fontWeight: '600', color: '#00a699' }}>
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} pcs
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: order.paymentMethod === 'cod' ? '#fff3cd' : '#cce5ff',
                        color: order.paymentMethod === 'cod' ? '#856404' : '#004085'
                      }}>
                        {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                      </span>
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td>
                      {order.paymentMethod === 'cod' ? (
                        <span style={{ color: '#ff6b6b', fontWeight: '600' }}>
                          ₹{order.codRemainingAmount || 0}
                        </span>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </td>
                   <td>
  {order.paymentStatus === 'refunded' ? (
    <span style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600'
    }}>
      Refunded
    </span>
  ) : (
    <span className={`status-badge status-${order.orderStatus}`}>
      {order.orderStatus}
    </span>
  )}
 </td>

                    <td>
                      <input
                        type="text"
                        value={orderTracking[order._id] || order.trackingNumber || ''}
                        onChange={(e) => setOrderTracking({...orderTracking, [order._id]: e.target.value})}
                        placeholder="Tracking #"
                        style={{ width: '100px', padding: '5px' }}
                      />
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        style={{ padding: '5px' }}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                     
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div> {/* table-wrapper */}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="dashboard-section">
          <h3>Users</h3>
          <div className="order-list">
              <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Admin</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="dashboard-section">
          <h3>Admin Settings</h3>
          
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '800px' }}>
            
            {/* Contact Information */}
            <section style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#2e3192' }}>Contact Information</h4>
              
              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                  placeholder="admin@shikhargarments.com"
                />
              </div>
              
              <div className="form-group">
                <label>Admin Phone Number</label>
                <input
                  type="tel"
                  value={settings.adminPhone}
                  onChange={(e) => setSettings({...settings, adminPhone: e.target.value})}
                  placeholder="08044464872"
                />
              </div>
              
              <div className="form-group">
                <label>WhatsApp Number (with country code)</label>
                <input
                  type="tel"
                  value={settings.adminWhatsApp}
                  onChange={(e) => setSettings({...settings, adminWhatsApp: e.target.value})}
                  placeholder="918044464872"
                />
              </div>
            </section>

            {/* Email Configuration */}
            <section style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#b49b0d97' }}>Email Settings (SMTP)</h4>
              
              <div className="form-group">
                <label>SMTP Host</label>
                <input
                  value={settings.smtpConfig.host}
                  onChange={(e) => setSettings({
                    ...settings, 
                    smtpConfig: {...settings.smtpConfig, host: e.target.value}
                  })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              
              <div className="form-group">
                <label>SMTP Port</label>
                <input
                  type="number"
                  value={settings.smtpConfig.port}
                  onChange={(e) => setSettings({
                    ...settings, 
                    smtpConfig: {...settings.smtpConfig, port: e.target.value}
                  })}
                  placeholder="587"
                />
              </div>
              <div className="form-group">
                <label>Email Username</label>
                <input
                  type="email"
                  value={settings.smtpConfig.user}
                  onChange={(e) => setSettings({
                    ...settings, 
                    smtpConfig: {...settings.smtpConfig, user: e.target.value}
                  })}
                  placeholder="your-email@gmail.com"
                />
              </div>
              
              <div className="form-group">
                <label>Email Password</label>
                <input
                  type="password"
                  value={settings.smtpConfig.password}
                  onChange={(e) => setSettings({
                    ...settings, 
                    smtpConfig: {...settings.smtpConfig, password: e.target.value}
                  })}
                  placeholder="Your app password"
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  For Gmail, use App Password (not your regular password)
                </p>
              </div>
            </section>

            {/* SMS Configuration */}
            <section style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#b49b0d97' }}>SMS Settings</h4>
              
              <div className="form-group">
                <label>SMS API Key</label>
                <input
                  type="text"
                  value={settings.smsConfig.apiKey}
                  onChange={(e) => setSettings({
                    ...settings,
                    smsConfig: {...settings.smsConfig, apiKey: e.target.value}
                  })}
                  placeholder="Your SMS API Key"
                />
              </div>
              
              <div className="form-group">
                <label>Sender ID</label>
                <input
                  type="text"
                  value={settings.smsConfig.senderId}
                  onChange={(e) => setSettings({
                    ...settings,
                    smsConfig: {...settings.smsConfig, senderId: e.target.value}
                  })}
                  placeholder="SHIKHR"
                />
              </div>
            </section>

            {/* Business Rules */}
            <section style={{ marginBottom: '30px' }}>
              <h4 style={{ marginBottom: '15px', color: '#2e3192' }}>Business Rules</h4>
              
              <div className="form-group">
                <label>Default Minimum Order Quantity (pieces)</label>
                <input
                  type="number"
                  value={settings.minOrderQuantity}
                  onChange={(e) => setSettings({...settings, minOrderQuantity: e.target.value})}
                  min="1"
                  placeholder="24"
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Default minimum order quantity for all products
                </p>
              </div>
            </section>

            <button 
              onClick={handleSaveSettings}
              style={{
                padding: '12px 40px',
                backgroundColor: '#b49b0d97',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>

  );
};

export default AdminDashboard;