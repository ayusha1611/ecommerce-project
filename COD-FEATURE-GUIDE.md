# COD (Cash on Delivery) Feature Guide

## Overview

The COD feature allows customers to pay a small prepaid fee (₹99) online to activate Cash on Delivery option. The remaining amount is collected upon delivery.

---

## How COD Works

### Customer Experience:

1. **Add products to cart** as usual
2. **Go to cart** and click checkout
3. **Select payment method:**
   - **Pay Full Amount Online**: Pay complete order value via Razorpay
   - **Cash on Delivery (COD)**: Pay ₹99 now (part of total) + rest on delivery

4. **For COD orders:**
   - Customer pays ₹99 via Razorpay (UPI/Card/Netbanking)
   - Order is confirmed
   - Remaining amount is paid when order is delivered

### Example:
- **Cart Total**: ₹2000
- **Pay Now (Prepaid)**: ₹99
- **Pay on Delivery**: ₹1901 (₹2000 - ₹99)
- **Total Order Value**: ₹2000 (No extra charges!)

### Key Point:
✅ The ₹99 is **part of** the ₹2000, not added on top!
✅ No extra COD charges
✅ Total remains ₹2000

---

## Admin Dashboard - COD Orders

### Viewing COD Orders:

1. Login as admin
2. Go to "Orders" tab
3. Orders with "COD" badge show:
   - Payment Method: COD (yellow badge)
   - Total: Full order value (₹2000)
   - COD Balance: Amount to collect on delivery (₹1901)
   - Status: Can be updated

### COD Order Example in Admin:
```
Total Order: ₹2000
Prepaid: ₹99 (already collected)
COD Balance: ₹1901 (collect on delivery)
```

### COD Order Statuses:

- **Confirmed**: COD activated, awaiting shipment
- **Processing**: Order being prepared
- **Shipped**: Out for delivery
- **Delivered**: Customer paid COD amount, order complete
- **Cancelled**: Order cancelled

---

## Technical Implementation

### Frontend Changes:

**Cart.js**
- Added payment method radio buttons
- Shows COD fee breakdown
- Calculates amounts dynamically
- Updates Razorpay description for COD

**AdminDashboard.js**
- Added Payment Method column
- Added COD Balance column
- Shows "Confirmed" status for COD orders
- Displays COD info with color coding

### Backend Changes:

**Order Model** (models/Order.js)
- Added `paymentMethod` field (online/cod)
- Added `codPrepaidFee` field (₹99)
- Added `codRemainingAmount` field

**Order Routes** (routes/orders.js)
- Modified order creation to handle COD
- Charges only ₹99 for COD orders
- Stores remaining amount in database
- Updated payment verification

---

## Configuration

### COD Fee Amount:

To change the COD activation fee, edit `Cart.js`:

```javascript
const COD_PREPAID_FEE = 99; // Change this value
```

Default: ₹99

### Payment Method Display:

The cart shows two options:
1. **Pay Full Amount Online** - Complete payment
2. **Cash on Delivery** - Pay ₹99 + rest on delivery

---

## Database Schema

### Order Document:

```javascript
{
  user: ObjectId,
  userName: "John Doe",
  userPhone: "9876543210",
  items: [...],
  totalAmount: 2000,           // Total order value
  paymentMethod: "cod",        // "online" or "cod"
  codPrepaidFee: 99,          // Amount paid online for COD
  codRemainingAmount: 1901,   // Amount to collect on delivery (2000 - 99)
  paymentId: "order_xxx",
  paymentStatus: "completed",
  orderStatus: "confirmed",
  createdAt: Date
}
```

**Important:** For COD orders, `totalAmount` = `codPrepaidFee` + `codRemainingAmount`

---

## User Flow Diagram

```
Customer Cart → Select Payment Method
    ↓
    ├─→ Online Payment
    │   ├─→ Pay Full ₹2099
    │   └─→ Order Confirmed
    │
    └─→ Cash on Delivery
        ├─→ Pay ₹99 activation fee
        ├─→ Razorpay payment gateway
        ├─→ Order Confirmed
        └─→ Pay ₹1901 on delivery
```

---

## Admin Flow

```
Admin Dashboard → Orders Tab
    ↓
View Order Details
    ├─→ Payment Method: COD
    ├─→ Total: ₹2099
    ├─→ COD Balance: ₹1901
    └─→ Status: Update as needed
```

---

## Benefits of COD Feature

### For Customers:
- ✅ Pay only ₹99 to activate COD
- ✅ Inspect product before full payment
- ✅ More trust and confidence
- ✅ Flexible payment options

### For Business:
- ✅ Reduces order cancellations
- ✅ Collects ₹99 upfront (commitment fee)
- ✅ Covers partial COD handling costs
- ✅ Increases conversions
- ✅ Competitive advantage

---

## Testing COD Feature

### Test as User:

1. Add products to cart
2. Click "Cart"
3. Select "Cash on Delivery (COD)"
4. Notice:
   - Cart subtotal shown
   - ₹99 COD activation fee added
   - Total order value displayed
   - Amount to pay now: ₹99
5. Click "Pay ₹99 & Activate COD"
6. Complete Razorpay payment (use test mode)
7. See success message

### Test as Admin:

1. Login as admin
2. Go to Orders tab
3. See COD order with:
   - Yellow "COD" badge
   - Total order value
   - COD balance amount
4. Update order status
5. Mark as "Delivered" when customer pays on delivery

---

## Payment Gateway Integration

### Razorpay Configuration:

For COD orders, Razorpay charges only ₹99:

```javascript
{
  amount: 9900,  // ₹99 in paise (part of ₹2000 total)
  currency: 'INR',
  description: 'COD Prepaid Fee (₹99)',
  notes: {
    payment_method: 'cod',
    total_order_value: 2000,
    cod_remaining: 1901
  }
}
```

For online orders, full amount is charged:

```javascript
{
  amount: 200000,  // ₹2000 in paise
  currency: 'INR',
  description: 'Order Payment',
  notes: {
    payment_method: 'online'
  }
}
```

---

## Important Notes

1. **No Extra Charges**: The ₹99 is part of the total, not added on top
   - Cart Total: ₹2000
   - Pay Now: ₹99
   - Pay on Delivery: ₹1901
   - **Total Paid**: ₹2000 (99 + 1901)

2. **COD Prepaid is Non-Refundable**: The ₹99 prepaid is not refunded if order is cancelled (commitment fee)

3. **Delivery Personnel**: Must collect exactly ₹1901 on delivery (for ₹2000 order)

4. **Order Confirmation**: Both payment methods send confirmation after payment

5. **Admin Dashboard**: Shows total (₹2000) and COD balance (₹1901) separately

---

## Customization Options

### Change COD Fee:
Edit `frontend/src/components/Cart.js`:
```javascript
const COD_PREPAID_FEE = 99; // Change to any amount
```

### Disable COD for Specific Products:
Add condition in Cart.js:
```javascript
if (cartItems.some(item => item.noCOD)) {
  // Hide COD option
}
```

### Minimum Order for COD:
Add validation:
```javascript
if (paymentMethod === 'cod' && getCartTotal() < 500) {
  alert('COD available for orders above ₹500');
  return;
}
```

---

## Troubleshooting

### COD option not showing:
- Check Cart.js has been updated
- Verify paymentMethod state exists
- Check radio buttons are rendering

### Wrong amount being charged:
- Verify `getAmountToPay()` function
- Check Razorpay amount calculation (multiply by 100)
- Ensure `paymentMethod` is passed to backend

### Admin not seeing COD info:
- Check Order model has new fields
- Verify AdminDashboard.js has updated table
- Restart backend after model changes

### Order status issues:
- COD orders should start with "confirmed" status
- Update status through admin dropdown
- "Delivered" status indicates COD amount collected

---

## Support

For issues with COD feature:
1. Check backend logs for errors
2. Verify MongoDB has latest schema
3. Test with Razorpay test mode
4. Contact support with order ID

---

## Future Enhancements

Possible improvements:
- 📱 SMS notification for COD orders
- 📊 COD collection tracking
- 💰 Variable COD fees based on location
- 🚚 Delivery partner integration
- 📧 Email with COD amount details
- 🎯 COD eligibility based on customer history

---

**Happy Selling! 🎉**
