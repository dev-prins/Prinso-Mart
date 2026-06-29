const express = require('express');
const router = express.Router();
const Order = require('./config/models/Order'); 
const { authenticateToken } = require('./middleware/authMiddleware');

// 1. नया ऑर्डर बनाने के लिए
router.post('/', authenticateToken, async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            user: req.user.id
        });
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: "Order creation failed", error: err.message });
    }
});

// 2. यूजर के अपने ऑर्डर देखने के लिए
router.get('/my-orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
});

// 3. ऑर्डर स्टेटस अपडेट करने के लिए
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});

module.exports = router;
