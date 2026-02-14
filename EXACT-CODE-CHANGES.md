# EXACT CODE CHANGES REQUIRED

This document contains the EXACT code changes you need to make to implement all features.

## STEP 1: Update Product Form in AdminDashboard.js

### Find this section (around line 150-200):

```javascript
const [productForm, setProductForm] = useState({
  name: '',
  description: '',
  price: '',
  category: 'Men Shorts',
  subcategory: '',
  image: null
});
```

### REPLACE WITH:

```javascript
const [productForm, setProductForm] = useState({
  name: '',
  description: '',
  price: '',
  category: '',
  subcategory: '',
  quantity: 0,
  minOrderQuantity: 24,
  images: []
});

const [settings, setSettings] = useState({
  adminEmail: '',
  adminPhone: '',
  adminWhatsApp: '',
  smtpConfig: { host: '', port: 587, user: '', password: '' },
  minOrderQuantity: 24
});
```

## STEP 2: Add Settings Fetch Function

### Add this after other fetch functions:

```javascript
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
```

## STEP 3: Update useEffect to fetch settings

### Find:

```javascript
useEffect(() => {
  fetchData();
  fetchCategories();
}, [activeTab]);
```

### REPLACE WITH:

```javascript
useEffect(() => {
  fetchData();
  fetchCategories();
  if (activeTab === 'settings') {
    fetchSettings();
  }
}, [activeTab]);
```

## STEP 4: Update handleProductFormChange for Multiple Images

### Find the handleProductFormChange function and REPLACE WITH:

```javascript
const handleProductFormChange = (e) => {
  const { name, value, files } = e.target;
  
  if (name === 'images' && files) {
    // Handle multiple images
    setProductForm({ ...productForm, images: Array.from(files) });
  } else {
    setProductForm({ ...productForm, [name]: value });
  }
};
```

## STEP 5: Update handleAddProduct for Multiple Images

### Find handleAddProduct and REPLACE WITH:

```javascript
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
    
    // Append multiple images
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
```

## STEP 6: Add Quantity Update Function

### Add this new function:

```javascript
const handleUpdateQuantity = async (productId, newQuantity) => {
  try {
    const response = await axios.patch(
      `/api/products/${productId}/quantity`,
      { quantity: newQuantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      setMessage('Quantity updated successfully!');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    }
  } catch (error) {
    setMessage('Failed to update quantity');
    setTimeout(() => setMessage(''), 3000);
  }
};
```

## STEP 7: Add Settings Save Function

### Add this new function:

```javascript
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
```

## STEP 8: Update the Tabs Section

### Find the tabs section and REPLACE WITH:

```javascript
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
```

## STEP 9: Update Product Form HTML

### Find the product form and UPDATE the image input:

```javascript
<div className="form-group">
  <label>Images (Upload up to 5)</label>
  <input
    type="file"
    name="images"
    onChange={handleProductFormChange}
    accept="image/*"
    multiple
    required
  />
  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
    Select up to 5 images
  </p>
</div>

<div className="form-group">
  <label>Quantity (Stock)</label>
  <input
    type="number"
    name="quantity"
    value={productForm.quantity}
    onChange={handleProductFormChange}
    required
    min="0"
    placeholder="e.g., 100"
  />
</div>

<div className="form-group">
  <label>Minimum Order Quantity</label>
  <input
    type="number"
    name="minOrderQuantity"
    value={productForm.minOrderQuantity}
    onChange={handleProductFormChange}
    required
    min="1"
    placeholder="e.g., 24"
  />
  <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
    Customers must order at least this many pieces
  </p>
</div>
```

## STEP 10: Update Products Table

### Find the products table and ADD quantity and stock columns:

```javascript
<table>
  <thead>
    <tr>
      <th>Image</th>
      <th>Name</th>
      <th>Category</th>
      <th>Price</th>
      <th>Quantity</th>
      <th>Stock Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {products.map((product) => (
      <tr key={product._id}>
        <td>
          <img
            src={`http://localhost:5000${product.image || product.images[0]}`}
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
            value={product.quantity}
            onChange={(e) => handleUpdateQuantity(product._id, e.target.value)}
            style={{ width: '80px', padding: '5px' }}
            min="0"
          />
        </td>
        <td>
          {product.inStock ? (
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
              onClick={() => handleDeleteProduct(product._id)}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

## STEP 11: Add Settings Tab HTML

### Add this AFTER the Users tab section:

```javascript
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
        <h4 style={{ marginBottom: '15px', color: '#2e3192' }}>Email Settings (SMTP)</h4>
        
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
        </div>
      </section>

      <button 
        onClick={handleSaveSettings}
        style={{
          padding: '12px 40px',
          backgroundColor: '#2e3192',
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
```

## STEP 12: Update Order Status Dropdown

### Find the order status select and ADD new statuses:

```javascript
<select
  value={order.orderStatus}
  onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
  style={{ padding: '5px' }}
>
  <option value="pending">Pending</option>
  <option value="confirmed">Confirmed</option>
  <option value="processing">Processing</option>
  <option value="shipped">Shipped</option>
  <option value="out_for_delivery">Out for Delivery</option>
  <option value="delivered">Delivered</option>
  <option value="cancelled">Cancelled</option>
</select>
```

---

These are the EXACT code changes needed. Copy and paste each section into your AdminDashboard.js file at the specified locations.
