# Shikhar Garments E-Commerce Website

A full-stack e-commerce website built with React and Node.js, inspired by IndiaMART design. Features include user authentication, product management, shopping cart, payment integration, and admin dashboard.

## Features

### User Features
- **Login System**: Users can login with name and phone number
- **Product Browsing**: View products in carousel and grid layouts
- **Product Details**: View detailed product information with images
- **Shopping Cart**: Add products to cart, update quantities
- **Payment Integration**: Razorpay payment gateway integration
- **Reviews & Ratings**: Users can rate and review products
- **Responsive Design**: Works on desktop and mobile devices

### Admin Features
- **Admin Dashboard**: Separate admin interface
- **Product Management**: Add, edit, and delete products
- **Order Management**: View and update order statuses
- **User Management**: View registered users
- **Statistics**: Dashboard with key metrics

## Tech Stack

### Frontend
- React 18
- React Context API (State Management)
- Axios (API calls)
- React Icons
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- Multer (File uploads)
- Razorpay (Payment gateway)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Razorpay account (for payment integration)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created) and update the following:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shikhar-garments
JWT_SECRET=your-secret-key-change-this-in-production
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

4. Start MongoDB:
```bash
# If using local MongoDB
mongod
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Default Admin Credentials

- **Username**: admin
- **Password**: admin123

## Project Structure

```
ecommerce-project/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── models/
│   │   ├── User.js            # User model
│   │   ├── Product.js         # Product model
│   │   ├── Order.js           # Order model
│   │   └── Review.js          # Review model
│   ├── routes/
│   │   ├── auth.js            # Authentication routes
│   │   ├── products.js        # Product routes
│   │   ├── orders.js          # Order routes
│   │   ├── reviews.js         # Review routes
│   │   └── users.js           # User routes
│   ├── uploads/               # Product images directory
│   ├── .env                   # Environment variables
│   ├── server.js              # Main server file
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Header.js           # Header component
    │   │   ├── LoginModal.js       # Login modal
    │   │   ├── HomePage.js         # Home page
    │   │   ├── ProductsPage.js     # Products listing
    │   │   ├── ProductDetails.js   # Product details page
    │   │   ├── Cart.js             # Shopping cart
    │   │   └── AdminDashboard.js   # Admin dashboard
    │   ├── context/
    │   │   ├── AuthContext.js      # Authentication context
    │   │   └── CartContext.js      # Cart context
    │   ├── App.js              # Main app component
    │   ├── App.css             # Main styles
    │   ├── index.js            # Entry point
    │   └── index.css
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User/Admin login
- `GET /api/auth/verify` - Verify JWT token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Add product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders/create` - Create order
- `POST /api/orders/verify-payment` - Verify payment
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/all` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Add review
- `GET /api/reviews/rating/:productId` - Get average rating

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/stats` - Get user statistics (Admin only)

## Usage

### For Users

1. **Browse Products**: Visit the homepage to see featured products
2. **View Details**: Click on any product to see full details
3. **Login**: Click login button and enter name and phone number
4. **Add to Cart**: Click "Add to Cart" on product details page
5. **Checkout**: Go to cart and click "Pay Now"
6. **Payment**: Complete payment via Razorpay
7. **Review**: After purchase, leave a review and rating

### For Admin

1. **Login**: Click login and select "Admin" tab
2. **Enter credentials**: admin / admin123
3. **Add Products**: Click "Add Product" button
4. **Manage Orders**: Switch to Orders tab to view and update order statuses
5. **View Users**: Switch to Users tab to see registered users

## Payment Integration

This project uses Razorpay for payment processing. To enable payments:

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your API keys from the dashboard
3. Update `.env` file with your keys
4. Update Razorpay key in `frontend/src/components/Cart.js` (line 42)

## Design Features

- **IndiaMART-inspired UI**: Professional business directory design
- **Color Scheme**: 
  - Primary: #2e3192 (Deep Blue)
  - Secondary: #00a699 (Teal)
  - Background: #f5f5f5 (Light Gray)
- **Responsive Layout**: Mobile-first design
- **Product Cards**: Image-focused with hover effects
- **Professional Forms**: Clean input fields and buttons

## Future Enhancements

- Email notifications
- Order tracking
- Wishlist functionality
- Product search and filters
- Multiple product images
- Inventory management
- Discount codes
- Customer dashboard
- WhatsApp integration
- Social media sharing

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
kill -9 $(lsof -t -i:5000)

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)
```

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## License

This project is open source and available under the MIT License.

## Contact

For support or queries:
- Phone: 08044464872
- Location: Katihar, Bihar
- GST: 10BRJPB9017P1ZQ

## Screenshots

The design closely follows the IndiaMART interface with:
- Professional header with company information
- Product carousel on homepage
- Detailed product pages with reviews
- Shopping cart with quantity controls
- Admin dashboard for management

---

Built with ❤️ for Shikhar Garments
