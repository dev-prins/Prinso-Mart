const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // सही पाथ (दो डॉट)
const { authenticateToken } = require('../middleware/authMiddleware'); // सही पाथ

// 1. GET my orders (सिर्फ लॉगिन यूज़र के लिए)
router.get('/myorders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }) // req.user.id मिडिलवेयर से आता है
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET all orders (एडमिन के लिए)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name phone email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. POST create order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const order = await Order.create({ ...req.body, user: req.user.id });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. PUT update/cancel status
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
