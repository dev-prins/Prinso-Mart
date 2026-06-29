const express = require('express');
const router = express.Router();

const Product = require('../config/models/Product');
const { authenticateToken } = require('../middleware/authMiddleware');

// Product Active / Inactive Toggle
router.patch('/toggle-product/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: 'Status updated successfully',
      isActive: product.isActive
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

module.exports = router;
