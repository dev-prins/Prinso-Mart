const express = require('express');
const router = express.Router();

const Order = require('../config/models/Order');
const { authenticateToken } = require('../middleware/authMiddleware');

// Create Order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      user: req.user.id,
    });

    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({
      message: 'Order creation failed',
      error: err.message,
    });
  }
});

// Get My Orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching orders',
      error: err.message,
    });
  }
});

// Update Order Status
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: 'Order not found',
      });
    }

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({
      message: 'Update failed',
      error: err.message,
    });
  }
});

module.exports = router;
