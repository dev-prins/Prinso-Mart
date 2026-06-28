const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // आपका Order model
const { authenticateToken } = require('../middleware/authMiddleware'); // आपका auth middleware

// 1. नया ऑर्डर बनाने के लिए (Create Order)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { items, deliveryAddress, totalAmount, paymentMethod } = req.body;
        
        const newOrder = new Order({
            user: req.user.id, // लॉगिन यूज़र की ID
            items,
            deliveryAddress,
            totalAmount,
            paymentMethod,
            status: 'pending' // डिफ़ॉल्ट स्टेटस
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(500).json({ message: "Order creation failed", error: err.message });
    }
});

// 2. लॉगिन यूज़र के अपने ऑर्डर्स देखने के लिए (User Specific Orders)
router.get('/my-orders', authenticateToken, async (req, res) => {
    try {
        // यह सिर्फ उसी यूज़र का डेटा लाएगा जिसका टोकन है
        const orders = await Order.find({ user: req.user.id })
                                  .sort({ createdAt: -1 }); // लेटेस्ट ऑर्डर सबसे ऊपर
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
});

// 3. ऑर्डर स्टेटस अपडेट करने के लिए (Admin Use Only)
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        // यहाँ आप अपना 'Admin Check' लगा सकते हैं
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message });
    }
});

module.exports = router;
