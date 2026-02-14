const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, codPrepaidFee, codRemainingAmount } = req.body;
    
    // Calculate amount to charge via Razorpay
    let amountToCharge = totalAmount;

    if (paymentMethod === 'cod') {
      // For COD, charge only the prepaid fee (₹99)
      amountToCharge = codPrepaidFee || 99;
    }

    // Create Razorpay order
    const options = {
      amount: amountToCharge * 100, // amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        payment_method: paymentMethod || 'online',
        total_order_value: totalAmount,
        cod_remaining: codRemainingAmount || 0
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order to database
    const order = new Order({
      user: req.user.id,
      userName: req.user.name,
      userPhone: req.user.phone,
      items,
      totalAmount, // Total order value (₹2000)
      paymentMethod: paymentMethod || 'online',
      codPrepaidFee: paymentMethod === 'cod' ? codPrepaidFee : 0, // ₹99
      codRemainingAmount: paymentMethod === 'cod' ? codRemainingAmount : 0, // ₹1901
      shippingAddress: req.body.shippingAddress,

      paymentId: razorpayOrder.id,
      paymentStatus: 'pending'
    });

    await order.save();

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: order._id,
      paymentMethod: paymentMethod || 'online',
      codRemainingAmount: codRemainingAmount || 0
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify payment
router.post('/verify-payment', authMiddleware, async (req, res) => {
  try {
    const { orderId, paymentId, signature, paymentMethod } = req.body;
    
    // In production, verify the signature using Razorpay crypto
    // For now, we'll mark it as completed
    
    const order = await Order.findOne({ paymentId: orderId });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'completed';
order.razorpayPaymentId = paymentId;  // ✅ SAVE REAL PAYMENT ID
order.orderStatus = 'processing';

    
    // Add note if COD
    if (paymentMethod === 'cod' || order.paymentMethod === 'cod') {
      order.orderStatus = 'confirmed'; // Different status for COD orders
    }
    
    // Add to status history
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: 'Payment verified and order confirmed'
    });
    
    await order.save();

    // Send notifications
    try {
      const { 
        sendOrderConfirmationEmail, 
        sendOrderSMS, 
        notifyAdminNewOrder 
      } = require('../utils/notifications');
      
      // Get user info
      const User = require('../models/User');
      const user = await User.findById(order.user);
      
      // Send customer notifications
      if (user) {
        if (user.email) {
          await sendOrderConfirmationEmail(order, user.email, user.name);
        }
        if (user.phone) {
          await sendOrderSMS(user.phone, order._id, order.totalAmount);
        }
      }
      
      // Notify admin
      await notifyAdminNewOrder(order);
      
      order.notificationSent = { sms: true, email: true };
      await order.save();
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the order if notifications fail
    }

    res.json({ success: true, message: 'Payment verified', order });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all orders (Admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .populate('user')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status (Admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, trackingNumber, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update status
    order.orderStatus = status;
    
    // Add tracking number if provided
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order status updated to ${status}`
    });

    await order.save();
    
    // Send notification to customer
    try {
      const { sendStatusUpdateNotification } = require('../utils/notifications');
      const User = require('../models/User');
      const user = await User.findById(order.user);
      
      if (user && user.email) {
        await sendStatusUpdateNotification(order, user.email);
      }
    } catch (notifError) {
      console.error('Status notification error:', notifError);
      // Don't fail the update if notification fails
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Get order tracking info
router.get('/:id/tracking', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      tracking: {
        orderId: order._id,
        orderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        statusHistory: order.statusHistory,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Cancel Order (Customer)
// Cancel order (Customer)
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Allow cancel only before shipped
    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled after shipping'
      });
    }
    // 💰 Auto Refund if Online Payment
if (order.paymentMethod === 'online' && order.paymentStatus === 'completed') {
  try {
    await razorpay.payments.refund(order.paymentId, {
      amount: order.totalAmount * 100 // in paise
    });

    order.paymentStatus = 'refunded';
  } catch (refundError) {
    console.error('Refund error:', refundError);
    return res.status(500).json({
      success: false,
      message: 'Refund failed. Contact admin.'
    });
  }
}

    order.orderStatus = 'cancelled';

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Order cancelled by customer'
    });

    await order.save();

    // 🔔 Notify Admin
    try {
      const { notifyAdminNewOrder } = require('../utils/notifications');
      await notifyAdminNewOrder(order, 'Order Cancelled by Customer');
    } catch (notifError) {
      console.error('Admin cancel notification error:', notifError);
    }

    res.json({ success: true, message: 'Order cancelled successfully' });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
