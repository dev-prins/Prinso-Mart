const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/authMiddleware');

// 1. प्रोडक्ट को Active/Inactive करना
router.patch('/toggle-product/:id', authenticateToken, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.isActive = !product.isActive; // Toggle (true से false)
        await product.save();
        res.json({ message: "Status updated", isActive: product.isActive });
    } catch (err) {
        res.status(500).json({ message: "Error updating status" });
    }
});

module.exports = router;

